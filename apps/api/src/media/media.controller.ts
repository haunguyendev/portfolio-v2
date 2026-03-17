import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import { RestAuthGuard } from "../auth/rest-auth.guard";
import { MediaService } from "./media.service";
import { MEDIA_CONFIG, type MediaFolder } from "./media.constants";

/** Allowed MinIO key prefixes for the public serve endpoint */
const ALLOWED_SERVE_PREFIXES = [
  "posts/cover/",
  "posts/content/",
  "projects/",
  "thumbnails/",
];

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /** POST /api/upload — Upload image (JWT protected) */
  @Post("upload")
  @UseGuards(RestAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MEDIA_CONFIG.maxFileSize },
      storage: {
        // Use memory storage (buffer) — no temp files on disk
        _handleFile(_req: unknown, file: Express.Multer.File, cb: (error: Error | null, info?: Partial<Express.Multer.File>) => void) {
          const chunks: Buffer[] = [];
          file.stream.on("data", (chunk: Buffer) => chunks.push(chunk));
          file.stream.on("end", () => {
            const buffer = Buffer.concat(chunks);
            cb(null, { buffer, size: buffer.length });
          });
          file.stream.on("error", cb);
        },
        _removeFile(_req: unknown, _file: Express.Multer.File, cb: (error: Error | null) => void) {
          cb(null);
        },
      },
      fileFilter: (
        _req: unknown,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (
          MEDIA_CONFIG.allowedMimeTypes.includes(
            file.mimetype as (typeof MEDIA_CONFIG.allowedMimeTypes)[number],
          )
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Invalid file type: ${file.mimetype}. Allowed: ${MEDIA_CONFIG.allowedMimeTypes.join(", ")}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body("folder") folder: MediaFolder,
    @Body("alt") alt?: string,
  ) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }
    if (!folder) {
      throw new BadRequestException("Folder is required");
    }
    return this.mediaService.upload(file, folder, alt);
  }

  /** DELETE /api/media/:id — Delete image (JWT protected) */
  @Delete("media/:id")
  @UseGuards(RestAuthGuard)
  async delete(@Param("id") id: string) {
    return this.mediaService.delete(id);
  }

  /**
   * GET /api/media/* — Serve image from MinIO (public, cached).
   * Supports ETag conditional requests (304 Not Modified).
   * Cache-Control: immutable for 1 year (UUID naming = content-addressable).
   */
  @Get("media/*")
  async serve(@Req() req: Request, @Res() res: Response) {
    // Extract the wildcard path: /api/media/posts/cover/abc.webp → posts/cover/abc.webp
    const fullPath = req.path;
    const key = fullPath.replace(/^\/api\/media\//, "");

    // Security: reject path traversal and restrict to allowed prefixes
    if (
      !key ||
      key.includes("..") ||
      !ALLOWED_SERVE_PREFIXES.some((prefix) => key.startsWith(prefix))
    ) {
      return res.status(400).json({ message: "Invalid image key" });
    }

    // Check ETag for conditional requests (304 Not Modified)
    const clientEtag = req.headers["if-none-match"];
    if (clientEtag) {
      try {
        const metadata = await this.mediaService.getMetadata(key);
        if (clientEtag === metadata.etag) {
          return res.status(304).end();
        }
      } catch {
        // Fall through to full response (or 404)
      }
    }

    // Stream full response from MinIO
    const { stream, contentType, size, etag } =
      await this.mediaService.getStream(key);

    res.set({
      "Content-Type": contentType,
      "Content-Length": String(size),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
    });

    stream.pipe(res);
  }
}
