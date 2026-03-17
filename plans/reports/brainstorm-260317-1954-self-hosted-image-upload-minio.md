---
type: brainstorm
date: 2026-03-17
slug: self-hosted-image-upload-minio
status: agreed
branch: feat/phase-4a-cms
---

# Brainstorm: Self-hosted Image Upload with MinIO

## Problem Statement

Portfolio CMS (Phase 4A) has no image upload capability. All image fields (`coverImage`, `image`, `ogImage`) accept URL strings only. Blog posts and projects require manually hosting images elsewhere and pasting URLs. Need self-hosted upload solution for:
- Blog post cover images
- Inline images in TipTap editor (drag & drop + paste)
- Project thumbnails/screenshots

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage backend | **MinIO** (S3-compatible) | Self-hosted, zero cost, Docker Compose, S3 API compatible |
| Upload flow | **API Proxy** (Client → NestJS → MinIO) | Simple, centralized, full server control, easy debug |
| Image processing | **Server-side (sharp)** | Resize, WebP convert, thumbnail generation on upload |
| File naming | **UUID-based** | No collision, clean URLs, original name saved in DB |
| Image serving | **NestJS proxy endpoint** | MinIO stays private, cache headers control, Next.js Image compatible |
| TipTap UX | **Drag & drop + clipboard paste** | Auto-upload to MinIO, seamless editor experience |
| Budget | **Zero cost** | All self-hosted, no external services |
| Scale | **100-1000 images** | Personal blog, medium volume |
| Scope | **Blog + Project images** | Cover, inline content, project thumbnails |

## Final Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD (Next.js)                                   │
│                                                              │
│  ┌─────────────┐  ┌──────────────────────┐                  │
│  │ Cover Image │  │ TipTap Editor        │                  │
│  │ Dropzone    │  │ (drag/drop + paste)  │                  │
│  └──────┬──────┘  └──────────┬───────────┘                  │
│         │                    │                               │
│         └────────┬───────────┘                               │
│                  │ POST /api/upload (multipart/form-data)    │
└──────────────────┼───────────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────────┐
│  NestJS API (Upload Controller)                              │
│                                                              │
│  1. Multer middleware → parse multipart                      │
│  2. Validate: type (jpg/png/gif/webp), size (≤10MB)         │
│  3. sharp: resize (max 1920px width) + convert WebP         │
│  4. sharp: generate thumbnail (400px width)                  │
│  5. Upload processed files → MinIO                           │
│  6. Save Media record → PostgreSQL                           │
│  7. Return { url, thumbnailUrl, id }                        │
│                                                              │
│  GET /api/media/:key → Stream from MinIO with cache headers │
└──────────────────┬──────────────┬────────────────────────────┘
                   │              │
          ┌────────▼────┐  ┌─────▼──────┐
          │  MinIO      │  │ PostgreSQL │
          │  (Docker)   │  │ (Docker)   │
          │             │  │            │
          │  Bucket:    │  │ Media tbl: │
          │  portfolio- │  │ - id       │
          │  media/     │  │ - filename │
          │  ├─posts/   │  │ - url      │
          │  │ ├─cover/ │  │ - thumbUrl │
          │  │ └─content/│ │ - mimeType │
          │  ├─projects/│  │ - size     │
          │  └─thumbs/  │  │ - folder   │
          └─────────────┘  │ - alt      │
                           └────────────┘
```

## MinIO Docker Compose Addition

```yaml
# Added to existing docker-compose.yml
minio:
  image: minio/minio:latest
  ports:
    - "9000:9000"    # API (internal only in prod)
    - "9001:9001"    # Console (dev only)
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  volumes:
    - minio_data:/data
  command: server /data --console-address ":9001"
```

## Bucket Structure

```
portfolio-media/
├── posts/
│   ├── cover/          # Blog cover images
│   │   └── {uuid}.webp
│   └── content/        # Inline TipTap images
│       └── {uuid}.webp
├── projects/           # Project thumbnails/screenshots
│   └── {uuid}.webp
└── thumbnails/         # Auto-generated thumbnails (400px)
    └── {uuid}-thumb.webp
```

## Sharp Processing Pipeline

```
Input (any format: jpg, png, gif, webp)
  │
  ├─► Main image: resize(1920px max width) → webp(quality: 80) → MinIO
  │
  └─► Thumbnail: resize(400px width) → webp(quality: 70) → MinIO /thumbnails/
```

## API Endpoints (New)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/upload` | JWT | Upload image (multipart), returns URL |
| GET | `/api/media/:key(*)` | Public | Serve image from MinIO (cached) |
| DELETE | `/api/media/:id` | JWT | Delete image from MinIO + DB |
| GET | `/api/media` | JWT | List media (admin gallery, optional) |

## TipTap Integration

Replace current `window.prompt('Image URL')` with:
- **Drag & drop**: `@tiptap/extension-image` + custom drop handler → auto-upload → insert node
- **Clipboard paste**: Intercept paste event → detect image blob → upload → insert
- **Upload button**: File picker dialog → upload → insert
- **URL input**: Keep existing URL option for external images

## Media Model (Already exists in Prisma, needs update)

```prisma
model Media {
  id           String   @id @default(cuid())
  filename     String   // Original filename
  url          String   // Full serve URL (/api/media/posts/cover/xxx.webp)
  thumbnailUrl String?  // Thumbnail URL
  mimeType     String   // image/webp (after processing)
  size         Int      // File size in bytes (processed)
  alt          String?  // Alt text for accessibility
  folder       String   // posts/cover, posts/content, projects
  width        Int?     // Image dimensions (for layout)
  height       Int?
  createdAt    DateTime @default(now())
}
```

## New Dependencies

| Package | Purpose | Where |
|---------|---------|-------|
| `@aws-sdk/client-s3` | MinIO/S3 client | apps/api |
| `sharp` | Image processing | apps/api |
| `multer` + `@types/multer` | File upload parsing | apps/api |

## Security Considerations

- **File type validation**: Check MIME type + magic bytes (not just extension)
- **Size limit**: 10MB max per upload
- **Auth required**: JWT guard on upload/delete endpoints
- **No direct MinIO access**: Only NestJS proxy serves files
- **EXIF strip**: sharp auto-strips metadata (location, camera info)
- **Rate limiting**: Optional, 20 uploads/minute per session

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| MinIO disk full | Images stop uploading | Monitor disk usage, set alerts, cleanup old unused media |
| Large image upload timeout | Bad UX | Client-side size check before upload, progress indicator |
| sharp memory spike | API crash on concurrent uploads | Limit concurrent processing (queue or semaphore) |
| MinIO data loss | All images gone | Regular backup of minio_data volume |
| API serving bottleneck | Slow image loading | Cache-Control headers (1yr), browser caching, CDN later |

## Migration Path (Future)

If outgrow MinIO self-hosted:
- **S3-compatible**: Code works with AWS S3, Cloudflare R2, Backblaze B2 — just change endpoint URL
- **CDN layer**: Add Cloudflare in front of serve endpoint
- Zero code changes needed for migration (S3 API standard)

## Success Criteria

- [ ] MinIO running in Docker Compose alongside PostgreSQL
- [ ] Upload endpoint accepts multipart, processes with sharp, stores in MinIO
- [ ] Serve endpoint streams images with proper cache headers
- [ ] TipTap editor supports drag & drop + paste image upload
- [ ] Cover image upload works in post form and project form
- [ ] Media records saved in PostgreSQL with metadata
- [ ] Delete removes from both MinIO and database
- [ ] All uploads auth-protected (JWT)
- [ ] Images served as WebP with proper dimensions

## Evaluated Alternatives

### Why not Cloudinary/Vercel Blob/Uploadthing?
- Cost at scale, vendor lock-in, data not self-owned
- Overkill for personal portfolio

### Why not local filesystem (public/ folder)?
- Not persistent in containerized deployments
- No backup/migration story
- Can't scale horizontally

### Why not presigned URL upload?
- 3-step flow more complex, CORS config needed
- Overkill for <10MB images on personal blog
- API proxy simpler for this scale

## Resolved Questions

| Question | Decision |
|----------|----------|
| Media gallery UI? | **No** — upload mới mỗi lần, YAGNI. Thêm gallery sau nếu cần |
| Alt text input? | **Both** — cover image form + TipTap editor đều có alt text (SEO + a11y) |
| Backup strategy? | **Manual** — `docker cp` khi cần, đủ cho personal blog scale |

## Unresolved Questions

None.
