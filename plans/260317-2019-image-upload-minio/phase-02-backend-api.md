---
phase: 2
title: Backend — Upload, Serve, Delete API
status: completed
priority: P1
effort: 3-4h
blockedBy: [phase-01]
---

# Phase 2: Backend API

## Context

- [Phase 1: Infrastructure](phase-01-infrastructure.md) — MinIO + Prisma must be ready
- NestJS API: `/apps/api/src/` (port 3001, global prefix `/api`)
- Auth Guard: `JwtAuthGuard` (session-token strategy via passport-custom)
- Existing modules: Posts, Projects, Categories, Tags, Series, Auth, Prisma

## Overview

Create NestJS MediaModule with: MinIO service (S3 client), image processing service (sharp), upload controller (Multer), serve endpoint (stream + cache), delete endpoint. All wired with JWT auth guard.

## Architecture

```
MediaModule
├── minio.service.ts        — S3 client wrapper (upload, get, delete, stat)
├── image-processing.service.ts — sharp resize + WebP + thumbnail
├── media.service.ts        — Orchestrator (process → store → DB record)
├── media.controller.ts     — REST endpoints (upload, serve, delete)
└── media.module.ts         — Module registration
```

Why REST not GraphQL: File upload via multipart/form-data is native REST. GraphQL file upload (graphql-upload) adds complexity for no benefit. Serve endpoint must be plain HTTP GET for browser `<img src>`.

## Related Code Files

### Create (all in `apps/api/src/media/`)
- `media.module.ts` — NestJS module
- `media.controller.ts` — REST endpoints
- `media.service.ts` — Business logic orchestrator
- `minio.service.ts` — MinIO/S3 client wrapper
- `image-processing.service.ts` — sharp processing
- `media.constants.ts` — Config constants (max size, allowed types, paths)

### Modify
- `apps/api/src/app.module.ts` — Register MediaModule
- `apps/api/package.json` — Add dependencies

## Implementation Steps

### 1. Install dependencies

```bash
cd apps/api
pnpm add @aws-sdk/client-s3 sharp multer
pnpm add -D @types/multer @types/sharp
```

### 2. Create media constants

```typescript
// media.constants.ts
export const MEDIA_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  mainMaxWidth: 1920,
  mainQuality: 80,
  thumbWidth: 400,
  thumbQuality: 70,
  bucket: process.env.MINIO_BUCKET || 'portfolio-media',
} as const;

export type MediaFolder = 'posts/cover' | 'posts/content' | 'projects';
```

### 3. Create MinIO service

```typescript
// minio.service.ts
@Injectable()
export class MinioService {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET || 'portfolio-media';
    this.client = new S3Client({
      endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
      region: 'us-east-1', // MinIO requires a region, any value works
      credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER || 'minioadmin',
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<void>
  async getObject(key: string): Promise<{ stream: Readable, metadata: HeadObjectOutput }>
  async deleteObject(key: string): Promise<void>
  async headObject(key: string): Promise<HeadObjectOutput>
}
```

### 4. Create image processing service

```typescript
// image-processing.service.ts
@Injectable()
export class ImageProcessingService {
  async process(buffer: Buffer): Promise<{
    main: { buffer: Buffer; width: number; height: number; size: number };
    thumbnail: { buffer: Buffer; width: number; height: number; size: number };
  }> {
    const main = await sharp(buffer)
      .resize({ width: MEDIA_CONFIG.mainMaxWidth, withoutEnlargement: true })
      .webp({ quality: MEDIA_CONFIG.mainQuality })
      .toBuffer({ resolveWithObject: true });

    const thumbnail = await sharp(buffer)
      .resize({ width: MEDIA_CONFIG.thumbWidth })
      .webp({ quality: MEDIA_CONFIG.thumbQuality })
      .toBuffer({ resolveWithObject: true });

    return {
      main: { buffer: main.data, width: main.info.width, height: main.info.height, size: main.info.size },
      thumbnail: { buffer: thumbnail.data, width: thumbnail.info.width, height: thumbnail.info.height, size: thumbnail.info.size },
    };
  }
}
```

### 5. Create media service (orchestrator)

```typescript
// media.service.ts
@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
    private imageProcessing: ImageProcessingService,
  ) {}

  async upload(file: Express.Multer.File, folder: MediaFolder, alt?: string) {
    // 1. Validate MIME type
    // 2. Process with sharp (main + thumbnail)
    // 3. Generate UUID key
    // 4. Upload main to MinIO: {folder}/{uuid}.webp
    // 5. Upload thumbnail to MinIO: thumbnails/{uuid}-thumb.webp
    // 6. Create Media record in DB
    // 7. Return { id, url, thumbnailUrl, width, height }
  }

  async delete(id: string) {
    // 1. Find Media record
    // 2. Delete main from MinIO
    // 3. Delete thumbnail from MinIO
    // 4. Delete DB record
  }

  async getStream(key: string) {
    // 1. Get object from MinIO
    // 2. Return stream + metadata (for headers)
  }
}
```

### 6. Create media controller

```typescript
// media.controller.ts
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  // POST /api/upload — Upload image (JWT protected)
  @Post('/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: MEDIA_CONFIG.maxFileSize },
    fileFilter: (req, file, cb) => {
      if (MEDIA_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Invalid file type'), false);
      }
    },
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: MediaFolder,
    @Body('alt') alt?: string,
  ) {
    return this.mediaService.upload(file, folder, alt);
  }

  // GET /api/media/* — Serve image (public, cached)
  @Get('*')
  async serve(@Param() params: string[], @Req() req: Request, @Res() res: Response) {
    const key = params[0]; // wildcard capture
    // ETag conditional check
    // Stream from MinIO
    // Set Cache-Control: public, max-age=31536000, immutable
  }

  // DELETE /api/media/:id — Delete image (JWT protected)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.mediaService.delete(id);
  }
}
```

### 7. Register MediaModule

```typescript
// media.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [MediaController],
  providers: [MediaService, MinioService, ImageProcessingService],
  exports: [MediaService],
})
export class MediaModule {}
```

Add `MediaModule` to `app.module.ts` imports.

### 8. Handle route conflict with GraphQL

NestJS global prefix is `/api`. GraphQL is at `/api/graphql`. Media controller at `/api/media/*`.

The serve endpoint `GET /api/media/*` uses wildcard — ensure it doesn't conflict with `POST /api/upload` or `DELETE /api/media/:id`. Order matters:
- `DELETE /api/media/:id` — specific route, matches first
- `GET /api/media/*` — wildcard, fallback

Upload endpoint is on `/api/upload` (separate path) to avoid wildcard collision.

## API Specification

### POST /api/upload

```
Auth: JWT (session token)
Content-Type: multipart/form-data
Body:
  - file: binary (required, max 10MB, jpg/png/gif/webp)
  - folder: string (required, "posts/cover" | "posts/content" | "projects")
  - alt: string (optional, alt text)

Response 201:
{
  "id": "clxxx...",
  "url": "/api/media/posts/cover/a1b2c3d4.webp",
  "thumbnailUrl": "/api/media/thumbnails/a1b2c3d4-thumb.webp",
  "width": 1920,
  "height": 1080,
  "size": 85432,
  "mimeType": "image/webp"
}

Errors:
  400 — Invalid file type or missing folder
  401 — Unauthorized (no/invalid JWT)
  413 — File too large (>10MB)
```

### GET /api/media/:key(*)

```
Auth: None (public)
Response 200: Binary stream with headers
  Content-Type: image/webp
  Cache-Control: public, max-age=31536000, immutable
  ETag: "hash"
  Content-Length: 85432

Response 304: Not Modified (if ETag matches If-None-Match)
Response 404: Image not found in MinIO
```

### DELETE /api/media/:id

```
Auth: JWT (session token)
Response 200: { "deleted": true }
Response 404: Media record not found
Response 401: Unauthorized
```

## Todo

- [ ] Install @aws-sdk/client-s3, sharp, multer, @types/multer
- [ ] Create `apps/api/src/media/` directory
- [ ] Implement media.constants.ts
- [ ] Implement minio.service.ts (S3Client wrapper)
- [ ] Implement image-processing.service.ts (sharp pipeline)
- [ ] Implement media.service.ts (orchestrator: validate → process → store → DB)
- [ ] Implement media.controller.ts (upload, serve, delete endpoints)
- [ ] Implement media.module.ts
- [ ] Register MediaModule in app.module.ts
- [ ] Verify `POST /api/upload` works with curl/Postman
- [ ] Verify `GET /api/media/*` streams with correct cache headers
- [ ] Verify `DELETE /api/media/:id` removes from MinIO + DB

## Success Criteria

- Upload endpoint accepts multipart, processes with sharp, stores in MinIO, returns URL
- Serve endpoint streams binary with `Cache-Control: immutable` and ETag support
- Delete removes file from MinIO and record from PostgreSQL
- All mutating endpoints require JWT authentication
- Invalid file type returns 400, oversized file returns 413
- Build passes: `pnpm typecheck && pnpm build`

## Security

- MIME type validation (check against allowlist, not just extension)
- File size limit enforced by Multer (10MB)
- JWT guard on upload + delete
- sharp strips EXIF metadata automatically
- MinIO not exposed publicly (only NestJS proxy)

## Risks

| Risk | Mitigation |
|------|------------|
| sharp binary compatibility | sharp handles native builds via prebuild; test in Docker too |
| Memory spike on large images | Multer fileSize limit + sharp streaming mode |
| S3Client region requirement | Set `us-east-1` (MinIO ignores it but requires it) |
| Wildcard route conflict | Separate upload path (`/api/upload`) from serve path (`/api/media/*`) |
