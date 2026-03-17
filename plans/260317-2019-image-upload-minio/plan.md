---
title: Self-hosted Image Upload with MinIO
status: completed
priority: P1
effort: 8-12h
branch: feat/phase-4a-cms
brainstorm: plans/reports/brainstorm-260317-1954-self-hosted-image-upload-minio.md
blocks: []
blockedBy: []
---

# Self-hosted Image Upload with MinIO

## Overview

Add self-hosted image upload to portfolio CMS using MinIO (S3-compatible). Enables blog cover images, inline TipTap editor images (drag/drop/paste), and project thumbnails — all processed server-side with sharp and served via NestJS proxy with immutable caching.

## Architecture

```
Client (Admin Dashboard)
  │  POST /api/upload (multipart)
  ▼
NestJS API
  │  Multer → Validate → sharp (resize+WebP) → MinIO
  ▼
MinIO (Docker)                PostgreSQL
  portfolio-media/            Media table
  ├─ posts/cover/             ├─ id, filename
  ├─ posts/content/           ├─ url, thumbnailUrl
  ├─ projects/                ├─ mimeType, size
  └─ thumbnails/              └─ alt, folder, width, height

Serve: GET /api/media/:key → NestJS stream from MinIO
  Cache-Control: public, max-age=31536000, immutable
```

## Phases

| # | Phase | Effort | Status | File |
|---|-------|--------|--------|------|
| 1 | Infrastructure (MinIO + Prisma) | 1-2h | Completed | [phase-01](phase-01-infrastructure.md) |
| 2 | Backend (Upload + Serve + Delete) | 3-4h | Completed | [phase-02](phase-02-backend-api.md) |
| 3 | Frontend (Dropzone + TipTap) | 3-4h | Completed | [phase-03](phase-03-frontend-components.md) |
| 4 | Integration + Testing | 1-2h | Completed | [phase-04](phase-04-integration-testing.md) |

## Key Decisions

- **Storage**: MinIO in Docker Compose (zero cost, S3-compatible)
- **Upload flow**: API Proxy (Client → NestJS → sharp → MinIO)
- **Processing**: sharp resize 1920px max + WebP q80 + thumbnail 400px q70
- **Naming**: UUID-based (no collision, immutable cache safe)
- **Serving**: NestJS proxy endpoint (MinIO stays private)
- **TipTap UX**: Drag & drop + clipboard paste + upload button
- **Cover UX**: Dropzone component with preview + alt text + URL fallback
- **Orphans**: Ignore (YAGNI, ~200MB max at scale)

## Dependencies

- MinIO Docker image (`minio/minio:latest`)
- `@aws-sdk/client-s3` — S3-compatible client for MinIO
- `sharp` — Server-side image processing
- `multer` + `@types/multer` — Multipart form parsing

## Success Criteria

- [ ] MinIO running in Docker Compose
- [ ] Upload endpoint: multipart → validate → sharp → MinIO → DB
- [ ] Serve endpoint: stream from MinIO with immutable cache
- [ ] Delete endpoint: remove from MinIO + DB
- [ ] TipTap: drag/drop/paste auto-upload
- [ ] Post form: cover image Dropzone + alt text
- [ ] Project form: image Dropzone + alt text
- [ ] All uploads JWT-protected
- [ ] Build passes with zero errors
