---
phase: 1
title: Infrastructure — MinIO Docker + Prisma Schema
status: completed
priority: P1
effort: 1-2h
---

# Phase 1: Infrastructure

## Context

- [Brainstorm Report](../reports/brainstorm-260317-1954-self-hosted-image-upload-minio.md)
- [Plan Overview](plan.md)
- Docker Compose: `/docker-compose.yml` (currently only PostgreSQL)
- Prisma Schema: `/packages/prisma/schema.prisma` (Media model exists but incomplete)

## Overview

Set up MinIO as Docker Compose service and update Prisma Media model with required fields for image upload system.

## Key Insights

- Media model already exists in Prisma with basic fields (id, filename, url, mimeType, size, alt, folder)
- Need to add: `thumbnailUrl`, `width`, `height` fields
- MinIO runs alongside PostgreSQL in same Docker Compose
- Environment variables needed for MinIO connection config

## Requirements

### Functional
- MinIO service running in Docker Compose
- MinIO bucket `portfolio-media` auto-created on startup
- Updated Media model with all required fields
- Environment variables for MinIO credentials

### Non-functional
- MinIO data persisted via Docker volume
- MinIO console accessible at :9001 (dev only)
- MinIO API at :9000 (internal, not exposed in prod)

## Related Code Files

### Modify
- `/docker-compose.yml` — Add MinIO service + volume
- `/packages/prisma/schema.prisma` — Update Media model
- `/.env.example` — Add MinIO env vars
- `/.env` — Add MinIO env vars (local)

### Create
- None (all modifications to existing files)

## Implementation Steps

### 1. Add MinIO to Docker Compose

Add MinIO service to existing `docker-compose.yml`:

```yaml
minio:
  image: minio/minio:latest
  container_name: portfolio_minio
  ports:
    - "9000:9000"
    - "9001:9001"
  environment:
    MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
    MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
  volumes:
    - minio_data:/data
  command: server /data --console-address ":9001"
  restart: unless-stopped
```

Add `minio_data` to volumes section.

### 2. Add MinIO init container (bucket creation)

Add a one-shot service to create the `portfolio-media` bucket:

```yaml
minio-init:
  image: minio/mc:latest
  depends_on:
    - minio
  entrypoint: >
    /bin/sh -c "
    sleep 3;
    mc alias set local http://minio:9000 minioadmin minioadmin;
    mc mb local/portfolio-media --ignore-existing;
    exit 0;
    "
```

### 3. Update Prisma Media model

Current → Updated:

```prisma
model Media {
  id           String   @id @default(cuid())
  filename     String   // Original filename
  url          String   // Serve URL: /api/media/posts/cover/xxx.webp
  thumbnailUrl String?  // Thumbnail URL: /api/media/thumbnails/xxx-thumb.webp
  mimeType     String   // image/webp (after processing)
  size         Int      // File size in bytes (processed)
  alt          String?  // Alt text for SEO/accessibility
  folder       String   // posts/cover, posts/content, projects
  width        Int?     // Image width in px
  height       Int?     // Image height in px
  createdAt    DateTime @default(now())
}
```

Changes: Add `thumbnailUrl`, `width`, `height`. Make `folder` non-optional.

### 4. Run Prisma migration

```bash
cd packages/prisma
pnpm prisma migrate dev --name add-media-image-fields
```

### 5. Add environment variables

Add to `.env.example` and `.env`:

```env
# MinIO (S3-compatible storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET=portfolio-media
MINIO_USE_SSL=false
```

### 6. Verify MinIO

```bash
docker compose up -d minio minio-init
# Visit http://localhost:9001 → MinIO Console
# Login: minioadmin / minioadmin
# Verify bucket "portfolio-media" exists
```

## Todo

- [ ] Add MinIO + minio-init services to docker-compose.yml
- [ ] Add minio_data volume to docker-compose.yml
- [ ] Update Media model in schema.prisma (thumbnailUrl, width, height)
- [ ] Run Prisma migration
- [ ] Add MinIO env vars to .env.example and .env
- [ ] docker compose up — verify MinIO console + bucket

## Success Criteria

- `docker compose up` starts PostgreSQL + MinIO without errors
- MinIO console accessible at http://localhost:9001
- Bucket `portfolio-media` auto-created
- `pnpm prisma migrate dev` succeeds
- Media model has all required fields

## Risks

| Risk | Mitigation |
|------|------------|
| Port 9000 conflict | Check `lsof -i :9000` before starting |
| MinIO init race condition | `sleep 3` in init + `--ignore-existing` flag |
