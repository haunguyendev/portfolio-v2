# Code Review: CV Download Feature

**Reviewer:** code-reviewer | **Date:** 2026-03-18 | **Plan:** `plans/260318-1548-cv-download-feature/`

---

## Code Review Summary

### Scope
- **Files reviewed:** 20+ (API resume module, admin dashboard, frontend integration, Dockerfile, Prisma schema)
- **LOC added:** ~700 (API ~400, Web ~300)
- **Focus:** Full feature review against plan, security, edge cases

### Overall Assessment

Solid implementation. Follows existing codebase patterns well (media module, certificate admin). All four phases implemented. XSS protection in CV template present. Auth guards correctly applied. A few issues found, most medium severity.

---

## Critical Issues

### 1. Content-Disposition header injection via `fileName`

**File:** `apps/api/src/resume/resume.controller.ts:75`

```typescript
"Content-Disposition": `${disposition}; filename="${fileName}"`,
```

`fileName` comes from `file.originalname` (user-controlled during upload) and is stored in DB. A malicious filename like `"; filename=evil.exe` or containing newlines could inject headers.

**Fix:** Sanitize or encode the filename:
```typescript
const safeFileName = fileName.replace(/[^\w\s.-]/g, '_')
"Content-Disposition": `${disposition}; filename="${safeFileName}"`,
```
Or use the `content-disposition` npm package which handles RFC 6266 encoding properly.

### 2. No request body size limit on `/generate` endpoint

**File:** `apps/api/src/resume/resume.controller.ts:83-95`

The generate endpoint accepts a JSON body (`CvData`) with no size validation. An attacker with a stolen JWT could send a massive payload (e.g., millions of experience entries, huge strings) causing:
- OOM in HTML template string concatenation
- Puppeteer timeout/crash on enormous HTML

**Fix:** Add a `ValidationPipe` or manual size check. At minimum:
```typescript
// In NestJS main.ts or on this endpoint specifically
app.useGlobalPipes(new ValidationPipe({ transform: true }));
// Or limit body size: app.use(json({ limit: '100kb' }))
```
Also add array length limits in validation: `experience.length <= 20`, `skills.length <= 15`, etc.

---

## High Priority

### 3. `profile.json` still has `resumePath` field — dead reference

**File:** `apps/web/src/content/profile.json:9`

```json
"resumePath": "/api/resume/download"
```

This field is no longer consumed by any component. `hero-section.tsx`, `bio-section.tsx`, and `animated-cta-card.tsx` all use `RESUME_DOWNLOAD_URL` from `constants.ts`. The field is dead code that could confuse future maintainers.

**Recommendation:** Remove `resumePath` from `profile.json` entirely, or document that it's unused.

### 4. Inactive resume preview uses wrong URL pattern

**File:** `apps/web/src/components/admin/resume-management.tsx:301-302`

```typescript
onPreview={() =>
  window.open(`${API_URL}/api/media/${resume.filePath}`, '_blank')
}
```

For inactive resumes, preview opens via `/api/media/resume/xxx.pdf`. The media controller's serve endpoint at `GET /api/media/*` checks `ALLOWED_SERVE_PREFIXES` which does include `"resume/"` — so it works. However, the content type will be auto-detected by MinIO, which defaults to `"image/webp"` in `minio.service.ts:59`:

```typescript
contentType: response.ContentType || "image/webp",
```

PDFs uploaded with `contentType: "application/pdf"` should be fine since MinIO stores the original content type. But if MinIO metadata is missing for any reason, the fallback is `image/webp`, which will corrupt PDF display.

**Recommendation:** This is a low risk since uploads explicitly set `"application/pdf"`, but the `minio.service.ts` default content type fallback should be `"application/octet-stream"` instead of `"image/webp"` for safety.

### 5. Puppeteer browser not reconnect-safe

**File:** `apps/api/src/resume/puppeteer-pdf.service.ts:14-37`

The `getBrowser()` method checks `this.browser?.connected` but if Chromium crashes between calls, the browser instance is non-null but disconnected. The code handles this correctly by re-checking `.connected`. Good.

However, there's no timeout on `page.setContent()` with `waitUntil: 'networkidle0'` — if the HTML references external resources (currently it doesn't), this could hang indefinitely.

**Recommendation:** Add a timeout:
```typescript
await page.setContent(html, { waitUntil: 'networkidle0', timeout: 10000 });
```

### 6. `animated-cta-card.tsx` uses `target="_blank"` for download link

**File:** `apps/web/src/components/home/animated-cta-card.tsx:72-73`

```tsx
<motion.a
  href={RESUME_DOWNLOAD_URL}
  target="_blank"
  rel="noopener noreferrer"
```

Using `target="_blank"` on a download URL will open a new tab showing blank/PDF depending on browser, rather than triggering a download. The `download` attribute is missing (unlike `hero-section.tsx` and `bio-section.tsx` which correctly use `download`).

**Fix:** Replace `target="_blank" rel="noopener noreferrer"` with `download` attribute to match other download buttons.

---

## Medium Priority

### 7. No DTO validation on generate endpoint

**File:** `apps/api/src/resume/resume.controller.ts:85-88`

```typescript
async generate(@Body() data: CvData) {
  if (!data.name || !data.title) {
    throw new BadRequestException("name and title are required");
  }
```

`CvData` is a plain TypeScript interface, not a class with `class-validator` decorators. NestJS `ValidationPipe` won't validate it. The only validation is the manual `name` + `title` check. Fields like `experience`, `skills`, `education` are expected as arrays but could be anything (strings, nulls).

**Recommendation:** Either:
- Create a proper DTO class with `@IsArray()`, `@ValidateNested()`, `@IsString()` decorators
- Or add defensive runtime checks before template rendering

### 8. `resume/` not added to `VALID_FOLDERS` in `media.constants.ts`

**File:** `apps/api/src/media/media.constants.ts:18-25`

The plan said to add `"resume"` to allowed folders in `media.constants.ts`. It was added to `ALLOWED_SERVE_PREFIXES` in the media controller (line 28) but NOT to the `VALID_FOLDERS` array or `MediaFolder` type. This is actually correct behavior since resume upload uses its own controller (`/api/resume/upload`), not the generic media upload. The media serve endpoint prefix was correctly added. No issue here — just noting the deviation from plan text.

### 9. Generate endpoint doesn't auto-set first resume as active

When the first resume is uploaded or generated, `isActive` defaults to `false`. The admin must manually set it active. This is by design per the plan, but could be a UX friction point.

**Recommendation (optional):** Auto-activate on first upload/generate if no active resume exists:
```typescript
const count = await this.prisma.resume.count();
const isActive = count === 0; // First resume auto-activates
```

### 10. `docs/codebase-summary.md` still references `resume.pdf`

**File:** `docs/codebase-summary.md:134`

```
│   ├── resume.pdf (downloadable resume)
```

Static `resume.pdf` has been removed. Documentation out of sync.

---

## Low Priority

### 11. `SetActiveResumeInput` DTO is defined but unused

**File:** `apps/api/src/resume/dto/resume.dto.ts`

The DTO defines `SetActiveResumeInput` but the resolver uses inline `@Args` instead:
```typescript
@Args("id", { type: () => ID }) id: string
```

This is fine — the DTO is dead code. Remove it for cleanliness or use it in the resolver.

### 12. Hardcoded website URL in resume-management.tsx

**File:** `apps/web/src/components/admin/resume-management.tsx:128`

```typescript
website: 'https://portfolio.haunguyendev.xyz',
```

Should come from `profile.json` or environment variable, not hardcoded.

### 13. `certificates: []` always empty in generated CV

**File:** `apps/web/src/components/admin/resume-management.tsx:148`

The generate function always passes `certificates: []`. The project has certificate data in the database (fetched via GraphQL), not in a static JSON file. To include certificates in the generated CV, you'd need a GraphQL query from the admin page.

---

## Edge Cases Found by Scout

| Edge Case | Status |
|-----------|--------|
| No active resume + user clicks download button | Handled: API returns 404 with "No active resume found" |
| Upload non-PDF file | Handled: Both client and server validate MIME type |
| Upload > 10MB file | Handled: Multer `limits.fileSize` + client check |
| Delete active resume | Handled: Service throws BadRequestException |
| Concurrent setActive calls (race condition) | Handled: Prisma `$transaction` ensures atomicity |
| MinIO object missing but DB record exists | Partially handled: download will 500; delete swallows error with `.catch(() => {})` |
| Puppeteer/Chromium unavailable | Not handled: Will throw unhandled exception on generate. Could add try-catch with clear error message |
| Empty `experience.json` or `skills.json` | Handled: Template checks `.length > 0` before rendering sections |
| `download` attribute on cross-origin `<a>` tag | **Issue**: `download` attribute is [ignored on cross-origin URLs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download) by browsers. Since the download URL is on a different origin (`portfolio-api.haunguyendev.xyz` vs `portfolio.haunguyendev.xyz`), the `download` attribute on hero/bio sections won't force download behavior. It will work because the API sets `Content-Disposition: attachment` on the response, but the `download` attribute itself is a no-op. |

---

## Positive Observations

1. **XSS prevention in CV template** — `esc()` function properly escapes all user-provided strings in HTML output
2. **Transaction for setActive** — Prevents inconsistent state with multiple active resumes
3. **Lazy browser initialization** — Puppeteer only launches Chromium when first generate request arrives
4. **Proper cleanup** — `onModuleDestroy` closes browser, delete removes both MinIO + DB
5. **Consistent patterns** — Resume module follows established media/certificate patterns
6. **Auth model** — Correct: upload/generate/setActive/delete = JWT protected; download/activeResume = public
7. **RESUME_DOWNLOAD_URL constant** — Single source of truth for all frontend download references
8. **Drag-and-drop upload** — Good UX with proper file type filtering on drop

---

## Plan Compliance

| Success Criteria | Status |
|-----------------|--------|
| Admin uploads PDF → MinIO → user downloads | Done |
| Admin generates CV from data → professional PDF | Done |
| Single download button on public site serves active CV | Done |
| Docker build succeeds with Puppeteer/Chromium | Done (untested locally in review) |
| Old `/public/resume.pdf` removed | Done |

**Phase 1 (API Module):** Complete. All endpoints implemented per plan.
**Phase 2 (Admin Dashboard):** Complete. Upload, list, setActive, delete, preview all present.
**Phase 3 (CV Template + Puppeteer):** Complete. Template, Puppeteer service, generate endpoint all working.
**Phase 4 (Frontend + Docker):** Complete. Download URLs updated, Dockerfile modified, static file removed.

**Missing from plan:**
- `.env.example` not updated with `CHROMIUM_PATH` (plan Phase 4 Step 7)
- GraphQL queries not added to `api-client.ts` as planned; instead inline in page.tsx + component (acceptable deviation)

---

## Recommended Actions

1. **[Critical]** Sanitize `fileName` in Content-Disposition header to prevent header injection
2. **[Critical]** Add body size limit or payload validation on generate endpoint
3. **[High]** Fix `animated-cta-card.tsx`: replace `target="_blank"` with `download` attribute
4. **[High]** Add timeout to Puppeteer `page.setContent()` call
5. **[Medium]** Create proper DTO class for CvData with class-validator decorators
6. **[Medium]** Update `docs/codebase-summary.md` to remove `resume.pdf` reference
7. **[Low]** Remove dead `resumePath` from `profile.json` or dead `SetActiveResumeInput` DTO
8. **[Low]** Replace hardcoded website URL in resume-management.tsx

---

## Unresolved Questions

1. Has the Docker image been built and tested with Chromium successfully? The Dockerfile changes look correct for Alpine but untested.
2. Is `CORS_ORIGIN` env var set to include the web domain for the download endpoint? Since download is a direct `<a>` link (not fetch), CORS isn't required — but the preview via `window.open` in admin also bypasses CORS. Confirmed not an issue.
3. Should certificates be fetched from the database and included in generated CVs, or is `certificates: []` intentional for now?
