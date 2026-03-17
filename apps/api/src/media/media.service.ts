import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { MinioService } from "./minio.service";
import { ImageProcessingService } from "./image-processing.service";
import { MEDIA_CONFIG, VALID_FOLDERS, type MediaFolder } from "./media.constants";
import { Readable } from "stream";

export interface UploadResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly imageProcessing: ImageProcessingService,
  ) {}

  /** Upload, process, store image and create DB record */
  async upload(
    file: Express.Multer.File,
    folder: MediaFolder,
    alt?: string,
  ): Promise<UploadResult> {
    // Validate folder
    if (!VALID_FOLDERS.includes(folder)) {
      throw new BadRequestException(
        `Invalid folder. Must be one of: ${VALID_FOLDERS.join(", ")}`,
      );
    }

    // Validate MIME type
    if (
      !MEDIA_CONFIG.allowedMimeTypes.includes(
        file.mimetype as (typeof MEDIA_CONFIG.allowedMimeTypes)[number],
      )
    ) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed: ${MEDIA_CONFIG.allowedMimeTypes.join(", ")}`,
      );
    }

    // Validate actual file content via magic bytes (not just MIME header)
    await this.imageProcessing.validateContent(file.buffer);

    // Process image with sharp (resize + WebP + thumbnail)
    const { main, thumbnail } = await this.imageProcessing.process(file.buffer);

    // Generate UUID-based keys
    const uuid = randomUUID();
    const mainKey = `${folder}/${uuid}.webp`;
    const thumbKey = `thumbnails/${uuid}-thumb.webp`;

    // Upload to MinIO (main + thumbnail in parallel)
    await Promise.all([
      this.minio.upload(mainKey, main.buffer, "image/webp"),
      this.minio.upload(thumbKey, thumbnail.buffer, "image/webp"),
    ]);

    // Build serve URLs (relative to API base)
    const url = `/api/media/${mainKey}`;
    const thumbnailUrl = `/api/media/${thumbKey}`;

    // Create database record
    const media = await this.prisma.media.create({
      data: {
        filename: file.originalname,
        url,
        thumbnailUrl,
        mimeType: "image/webp",
        size: main.size,
        alt: alt || null,
        folder,
        width: main.width,
        height: main.height,
      },
    });

    this.logger.log(
      `Uploaded ${file.originalname} → ${mainKey} (${main.width}x${main.height}, ${main.size}B)`,
    );

    return {
      id: media.id,
      url,
      thumbnailUrl,
      width: main.width,
      height: main.height,
      size: main.size,
      mimeType: "image/webp",
    };
  }

  /** Delete image from MinIO and database */
  async delete(id: string): Promise<{ deleted: boolean }> {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media ${id} not found`);
    }

    // Extract MinIO keys from URLs: "/api/media/posts/cover/xxx.webp" → "posts/cover/xxx.webp"
    const mainKey = media.url.replace("/api/media/", "");
    const thumbKey = media.thumbnailUrl
      ? media.thumbnailUrl.replace("/api/media/", "")
      : null;

    // Delete from MinIO (ignore errors if file already gone)
    const deletePromises = [
      this.minio.deleteObject(mainKey).catch(() => {}),
    ];
    if (thumbKey) {
      deletePromises.push(
        this.minio.deleteObject(thumbKey).catch(() => {}),
      );
    }
    await Promise.all(deletePromises);

    // Delete database record
    await this.prisma.media.delete({ where: { id } });

    this.logger.log(`Deleted media ${id} (${mainKey})`);
    return { deleted: true };
  }

  /** Get image stream from MinIO for serving */
  async getStream(
    key: string,
  ): Promise<{ stream: Readable; contentType: string; size: number; etag: string }> {
    try {
      return await this.minio.getObject(key);
    } catch {
      throw new NotFoundException(`Image not found: ${key}`);
    }
  }

  /** Get object metadata for conditional requests (ETag) */
  async getMetadata(
    key: string,
  ): Promise<{ etag: string; size: number; contentType: string }> {
    try {
      return await this.minio.headObject(key);
    } catch {
      throw new NotFoundException(`Image not found: ${key}`);
    }
  }
}
