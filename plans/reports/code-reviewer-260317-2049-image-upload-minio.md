# Code Review: Image Upload (MinIO Self-Hosted)

**Date:** 2026-03-17
**Scope:** Backend media module (6 files), frontend upload (3 files), modified forms (4 files), docker-compose, Prisma schema
**LOC reviewed:** ~750
**Focus:** New feature - multipart image upload through NestJS to MinIO, with sharp processing and TipTap/Dropzone frontend integration

---

## Overall Assessment

Solid implementation with clean service separation (MinIO client / image processing / orchestrator). Auth is properly guarded, file validation exists at multiple layers, and the caching strategy is well-designed. However, there are **two critical security issues** and several high-priority items that need attention before production.

---

## Critical Issues

### 1. PATH TRAVERSAL in serve endpoint (SECURITY)

**File:** `apps/api/src/media/media.controller.ts:98`

```typescript
const key = fullPath.replace(/^\/api\/media\//, "");
```

The `key` is extracted directly from the URL path with no sanitization. An attacker can request:
```
GET /api/media/../../etc/passwd
GET /api/media/../.env
GET /api/media/..%2F..%2Fetc%2Fpasswd
```

While MinIO's S3 API may reject `../` keys, URL-encoded variants and edge cases could bypass this. The serve endpoint is **public** (no auth guard) so this is exploitable by anyone.

**Fix:**
```typescript
const key = fullPath.replace(/^\/api\/media\//, "");

// Sanitize: reject path traversal attempts
if (!key || key.includes('..') || key.startsWith('/')) {
  return res.status(400).json({ message: "Invalid image key" });
}

// Optionally whitelist allowed prefixes
const allowedPrefixes = ['posts/', 'projects/', 'thumbnails/'];
if (!allowedPrefixes.some(p => key.startsWith(p))) {
  return res.status(400).json({ message: "Invalid image path" });
}
```

### 2. No magic byte validation - MIME type spoofing (SECURITY)

**File:** `apps/api/src/media/media.controller.ts:51-52` and `media.service.ts:48-56`

MIME type validation relies solely on `file.mimetype`, which is set from the `Content-Type` header of the multipart part -- fully controlled by the client. An attacker could upload a malicious SVG (XSS vector) or HTML file with `Content-Type: image/jpeg`.

While sharp will reject non-image files during processing (mitigating most payloads), the error will be an unhandled sharp exception rather than a clean validation error.

**Fix:** Add magic byte validation before processing:
```typescript
// In image-processing.service.ts, before sharp processing:
const metadata = await sharp(inputBuffer).metadata();
const allowedFormats = ['jpeg', 'png', 'gif', 'webp'];
if (!metadata.format || !allowedFormats.includes(metadata.format)) {
  throw new BadRequestException(`Invalid image format: ${metadata.format}`);
}
```

This is cheap (reads only the header) and authoritative -- sharp reads actual file bytes, not client-supplied MIME.

---

## High Priority

### 3. Animated GIF silently converted to static WebP

**File:** `apps/api/src/media/image-processing.service.ts:22-24`

GIF is listed as an allowed MIME type, but `sharp().webp()` will only keep the first frame. Users uploading animated GIFs will get a broken result with no warning.

**Options:**
- (A) Remove `image/gif` from allowed types
- (B) Detect animated GIFs and use `.gif()` output instead of `.webp()`:
```typescript
const meta = await sharp(inputBuffer).metadata();
if (meta.format === 'gif' && (meta.pages ?? 0) > 1) {
  // Animated: resize but keep GIF format
  return sharp(inputBuffer, { animated: true }).resize(...).gif().toBuffer(...);
}
```

### 4. No role check on upload/delete - any authenticated user can upload

**File:** `apps/api/src/media/media.controller.ts:27, 84`

`RestAuthGuard` validates the session but does not check `user.role`. Currently all users default to `ADMIN` (schema), but if `USER` role accounts are created, they could upload/delete any media.

**Fix:** Add a `RolesGuard` or inline check:
```typescript
@UseGuards(RestAuthGuard)
async upload(@Req() req: Request, ...) {
  if ((req.user as any).role !== 'ADMIN') {
    throw new ForbiddenException('Admin only');
  }
  ...
}
```

### 5. DB record created after MinIO upload -- no cleanup on DB failure

**File:** `apps/api/src/media/media.service.ts:67-89`

If `prisma.media.create()` fails after MinIO upload succeeds, orphaned files remain in MinIO with no DB record to reference them (unreachable for cleanup/deletion).

**Fix:** Wrap in a try-catch with compensating MinIO delete:
```typescript
try {
  const media = await this.prisma.media.create({ data: { ... } });
  return { ... };
} catch (err) {
  // Compensating: clean up MinIO files
  await Promise.all([
    this.minio.deleteObject(mainKey).catch(() => {}),
    this.minio.deleteObject(thumbKey).catch(() => {}),
  ]);
  throw err;
}
```

### 6. sharp processes entire buffer in memory twice

**File:** `apps/api/src/media/image-processing.service.ts:22-30`

`sharp(inputBuffer)` is called twice with the full buffer (once for main, once for thumbnail). For a 10MB upload, this means ~30MB+ peak memory (original + main output + thumb output).

**Fix:** Use sharp's `clone()` to share the decoded pixel pipeline:
```typescript
const pipeline = sharp(inputBuffer).rotate(); // auto-orient EXIF
const main = await pipeline.clone().resize({ width: MEDIA_CONFIG.mainMaxWidth, ... }).webp(...).toBuffer({ resolveWithObject: true });
const thumbnail = await pipeline.clone().resize({ width: MEDIA_CONFIG.thumbWidth }).webp(...).toBuffer({ resolveWithObject: true });
```

---

## Medium Priority

### 7. `minio-init` hardcodes credentials, ignores env vars

**File:** `docker-compose.yml:38`

```yaml
mc alias set local http://minio:9000 minioadmin minioadmin;
```

The `minio` service uses `${MINIO_ROOT_USER:-minioadmin}` but `minio-init` always uses literal `minioadmin`. If custom credentials are set via env, init will fail.

**Fix:**
```yaml
entrypoint: >
  /bin/sh -c "
  sleep 3;
  mc alias set local http://minio:9000 $${MINIO_ROOT_USER:-minioadmin} $${MINIO_ROOT_PASSWORD:-minioadmin};
  mc mb local/portfolio-media --ignore-existing;
  exit 0;
  "
environment:
  MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
  MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
```

### 8. MinIO credentials hardcoded as fallbacks in code

**File:** `apps/api/src/media/minio.service.ts:29`

```typescript
accessKeyId: process.env.MINIO_ROOT_USER || "minioadmin",
secretAccessKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
```

Using `|| "minioadmin"` as a fallback means the service silently connects with default creds if env vars are missing. In production this could lead to silent misconfiguration.

**Recommendation:** In non-dev environments, throw an error if credentials are not set. For now at minimum, log a warning when using default credentials.

### 9. `onModuleInit` logs "Connected" without verifying connectivity

**File:** `apps/api/src/media/minio.service.ts:34`

`this.logger.log("Connected to MinIO...")` runs after constructing the S3Client, not after a health check. The client constructor does not connect. If MinIO is down, the error will only surface on first upload request.

**Fix:** Add a lightweight health check:
```typescript
async onModuleInit() {
  // ... existing client setup ...
  try {
    await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    this.logger.log(`Connected to MinIO, bucket "${this.bucket}" verified`);
  } catch (err) {
    this.logger.error(`MinIO connectivity check failed: ${err.message}`);
  }
}
```

### 10. Duplicate `MediaFolder` type and constants between frontend/backend

**Files:** `apps/api/src/media/media.constants.ts:18` and `apps/web/src/lib/image-upload-service.ts:1`

Both define `MediaFolder = "posts/cover" | "posts/content" | "projects"` and both define `MAX_FILE_SIZE = 10 * 1024 * 1024` and `ALLOWED_TYPES`. If one changes without the other, validation mismatches occur.

**Recommendation:** Consider a shared `packages/shared/media.constants.ts` or at minimum add a code comment cross-referencing the other location.

### 11. `tiptap-image-upload.ts` has looser MIME check than backend

**File:** `apps/web/src/lib/tiptap-image-upload.ts:9`

```typescript
function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}
```

This accepts `image/svg+xml`, `image/tiff`, `image/bmp`, etc. which the backend will reject. The user gets a confusing error instead of immediate client-side feedback.

**Fix:** Use the same allowlist:
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
function isImageFile(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type);
}
```

### 12. TipTap image URL uses relative path `/api/media/...` in content JSON

**File:** `apps/web/src/lib/tiptap-image-upload.ts:99` and `apps/api/src/media/media.service.ts:73`

The stored URL is relative to the API (`/api/media/posts/content/uuid.webp`). When the post content is rendered on the public-facing frontend, the `<img src="/api/media/...">` will 404 because it points to the Next.js server, not the NestJS API.

This is the biggest functional issue. Either:
- (A) Store full URLs (`http://api-host/api/media/...`) -- but breaks on domain change
- (B) At render time, transform `/api/media/...` paths through `getMediaUrl()` -- requires a custom TipTap renderer
- (C) Use `next.config.ts` `rewrites` to proxy `/api/media/*` to the NestJS API

Option (C) is simplest and keeps URLs portable.

---

## Low Priority

### 13. No loading/placeholder state during TipTap drag-drop upload

The drag-drop handler in `tiptap-image-upload.ts` uploads asynchronously but shows only a toast. The user doesn't see where the image will land until upload completes. Consider inserting a placeholder node at the drop position.

### 14. `handleDrop` ignores drop position

**File:** `apps/web/src/lib/tiptap-image-upload.ts:41-48`

`coordinates` is computed from drop position but the `setImage` call doesn't use it -- image is inserted at current cursor, not drop point.

```typescript
if (coordinates) {
  editor.chain().focus()
    .insertContentAt(coordinates.pos, { type: 'image', attrs: { src: url } })
    .run()
}
```

### 15. `ImageDropzone` URL input has no SSRF validation

**File:** `apps/web/src/components/admin/image-dropzone.tsx:67-73`

The "enter URL" fallback accepts any URL and sets it directly. While this is admin-only and frontend-side, there is no URL validation (could set `javascript:`, `data:`, or internal IPs).

**Minimal fix:**
```typescript
function handleUrlSubmit() {
  const url = urlInput.trim();
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    onChange(url);
    // ...
  }
}
```

---

## Edge Cases Found by Scouting

| Edge Case | Impact | Status |
|-----------|--------|--------|
| Path traversal via `/api/media/../` | Critical | **NOT HANDLED** |
| Concurrent uploads of same filename | Safe -- UUID keys prevent collision | OK |
| MinIO down during upload | Sharp error caught, but no user-friendly message from MinIO | Partial |
| 10MB file hitting both multer and sharp memory | ~30MB peak per request, could DoS with parallel uploads | See #6 |
| GIF animation loss | Silent data loss | See #3 |
| Relative image URLs in rendered blog posts | Images 404 on frontend | See #12 |
| Browser refresh during upload | No abort controller, upload completes in background | Acceptable |
| Delete media still referenced by post content | Orphaned `<img>` tags in TipTap JSON content | Not handled -- low risk for admin tool |

---

## Positive Observations

- Clean service separation: MinIO client / processing / orchestration follows Single Responsibility
- Parallel uploads for main + thumbnail
- EXIF stripping by sharp (privacy protection) noted in comments
- Immutable cache headers with UUID-based keys -- excellent caching strategy
- Client-side pre-validation (size + type) provides immediate feedback
- File input reset after select (allows re-uploading same file)
- Multer memory storage avoids temp file cleanup concerns
- Delete method handles already-deleted MinIO objects gracefully
- ETag support for conditional 304 responses -- saves bandwidth

---

## Recommended Actions (Priority Order)

1. **[CRITICAL]** Add path traversal protection in serve endpoint
2. **[CRITICAL]** Add magic byte validation via `sharp.metadata()` before processing
3. **[HIGH]** Fix relative image URLs for public rendering (add Next.js rewrite or use full URLs)
4. **[HIGH]** Add compensating MinIO delete on DB failure
5. **[HIGH]** Use `sharp.clone()` for memory efficiency
6. **[HIGH]** Add admin role check on upload/delete endpoints
7. **[MEDIUM]** Fix animated GIF handling (remove from allowed types or preserve animation)
8. **[MEDIUM]** Fix minio-init credential handling in docker-compose
9. **[MEDIUM]** Align TipTap MIME check with backend allowlist
10. **[MEDIUM]** Add MinIO connectivity health check on startup

---

## Metrics

- **Type Coverage:** High -- TypeScript types used throughout, interfaces for service contracts
- **Test Coverage:** Not assessed (no test files in scope)
- **Linting Issues:** 0 (clean TypeScript, consistent formatting)
- **Security Issues:** 2 critical, 1 high, 1 low

---

## Unresolved Questions

1. How are blog post images rendered on the public frontend? If using standard TipTap HTML renderer, the relative `/api/media/...` paths will 404. Need to confirm rendering pipeline.
2. Is there a plan for image cleanup (garbage collection) for orphaned MinIO objects?
3. Should `image/gif` remain in allowed types given the animation loss issue?
4. Is there rate limiting planned for the upload endpoint? Currently unbounded.
