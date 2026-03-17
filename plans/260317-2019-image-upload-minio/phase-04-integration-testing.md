---
phase: 4
title: Integration + Testing
status: completed
priority: P1
effort: 1-2h
blockedBy: [phase-03]
---

# Phase 4: Integration + Testing

## Context

- [Phase 2: Backend API](phase-02-backend-api.md) — Endpoints ready
- [Phase 3: Frontend Components](phase-03-frontend-components.md) — UI components ready
- Public blog pages fetch from GraphQL → render `<img src="/api/media/...">`

## Overview

Wire everything together: verify end-to-end upload flow, public page rendering with uploaded images, cache headers, build verification. Fix any integration issues.

## Implementation Steps

### 1. Verify full upload → serve → display flow

Manual test checklist (admin dashboard):

```
1. POST create flow:
   a. Go to /admin/posts/new
   b. Drop image on cover Dropzone → verify preview + URL populated
   c. Type some content in TipTap editor
   d. Drag image into editor → verify placeholder → real image
   e. Paste image from clipboard → verify auto-upload
   f. Click image toolbar button → file picker → verify insert
   g. Save post as draft → verify content JSON has /api/media/* URLs
   h. Publish post

2. GET serve flow:
   a. Visit /blog/{slug} (public page)
   b. Verify cover image loads from /api/media/posts/cover/xxx.webp
   c. Verify inline images load from /api/media/posts/content/xxx.webp
   d. Open DevTools Network → verify:
      - Content-Type: image/webp
      - Cache-Control: public, max-age=31536000, immutable
      - ETag present
   e. Reload page → verify 304 Not Modified (cached)

3. Project flow:
   a. Go to /admin/projects → edit a project
   b. Upload image via Dropzone → verify preview
   c. Save → visit /projects → verify image displays

4. Delete flow:
   a. Edit post → remove cover image (click ✖)
   b. Verify Dropzone resets to empty state
   c. Save post → verify coverImage is null
```

### 2. Verify Next.js Image compatibility (if using next/image)

If public pages use `<Image>` component for cover images, add API domain to `next.config`:

```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '3001',
      pathname: '/api/media/**',
    },
  ],
},
```

For production, update hostname to actual API domain.

### 3. Build verification

```bash
# From monorepo root
pnpm typecheck          # Zero TypeScript errors
pnpm build              # Build all apps
pnpm lint               # No lint errors

# API specific
cd apps/api && pnpm build

# Web specific
cd apps/web && pnpm build
```

### 4. Edge case testing

| Scenario | Expected |
|----------|----------|
| Upload >10MB file | 413 error, toast "File too large" |
| Upload non-image (.pdf, .txt) | 400 error, toast "Invalid file type" |
| Upload while not logged in | 401 error, redirect to login |
| MinIO down during upload | 500 error, toast "Upload failed" |
| Network error during upload | Timeout, toast "Network error" |
| Paste text (not image) in TipTap | Normal paste behavior, no upload triggered |
| Drag non-image file into TipTap | Ignored, no upload triggered |
| Enter invalid URL in Dropzone | URL set as-is (no validation — external URLs are valid) |
| Remove cover image + save | coverImage = null in DB |
| Edit post with existing cover | Dropzone shows current image preview |

### 5. CORS verification

Verify upload works from Next.js (port 3000) to NestJS (port 3001):
- `credentials: 'include'` in fetch
- API CORS allows `http://localhost:3000` with `credentials: true`
- Session cookie sent with upload request

### 6. Public page image rendering

Verify blog/diary detail pages render images from content JSON:

```
TipTap content JSON:
{
  "type": "image",
  "attrs": {
    "src": "/api/media/posts/content/xyz.webp",
    "alt": "Dashboard screenshot"
  }
}

Rendered HTML:
<img src="http://localhost:3001/api/media/posts/content/xyz.webp" alt="Dashboard screenshot" />
```

Ensure the API base URL is prepended to relative paths when rendering on public pages.

## Todo

- [ ] Manual test: cover image upload + preview + save + display on public page
- [ ] Manual test: TipTap drag & drop image → upload → display
- [ ] Manual test: TipTap paste image → upload → display
- [ ] Manual test: TipTap image button → file picker → upload
- [ ] Manual test: project image upload + display
- [ ] Verify cache headers in browser DevTools (Cache-Control, ETag, 304)
- [ ] Verify CORS + credentials on cross-origin upload
- [ ] Test edge cases (oversized, wrong type, unauthenticated)
- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm build` — successful build
- [ ] Update next.config if using next/image for cover images

## Success Criteria

- Full round-trip: upload → MinIO → serve → browser display works
- Cache headers correct (immutable, ETag, 304 on reload)
- All edge cases handled with proper error messages
- Build passes with zero TypeScript errors
- CORS works for cross-origin upload with credentials
- Public pages display uploaded images correctly

## Post-Implementation

After all phases pass:
- [ ] Update docs (system-architecture.md, project-roadmap.md) if requested
- [ ] Commit with conventional message: `feat: add self-hosted image upload with MinIO`
