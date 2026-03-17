import { Injectable, BadRequestException } from "@nestjs/common";
import * as sharp from "sharp";
import { MEDIA_CONFIG } from "./media.constants";

/** Formats sharp can detect via magic bytes that we accept */
const ALLOWED_SHARP_FORMATS = ["jpeg", "png", "gif", "webp"];

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}

@Injectable()
export class ImageProcessingService {
  /**
   * Validate file content via magic bytes (not just MIME header).
   * Prevents disguised file uploads (e.g. .exe renamed to .jpg).
   */
  async validateContent(inputBuffer: Buffer): Promise<void> {
    const metadata = await sharp(inputBuffer).metadata();
    if (!metadata.format || !ALLOWED_SHARP_FORMATS.includes(metadata.format)) {
      throw new BadRequestException(
        `Invalid image content: detected format "${metadata.format || "unknown"}"`,
      );
    }
  }

  /**
   * Process an uploaded image: resize to max width + convert to WebP.
   * Also generates a smaller thumbnail.
   * sharp auto-strips EXIF metadata (location, camera info).
   * Uses .clone() to avoid decoding the pipeline twice.
   */
  async process(
    inputBuffer: Buffer,
  ): Promise<{ main: ProcessedImage; thumbnail: ProcessedImage }> {
    const pipeline = sharp(inputBuffer);

    const [mainResult, thumbnailResult] = await Promise.all([
      pipeline
        .clone()
        .resize({ width: MEDIA_CONFIG.mainMaxWidth, withoutEnlargement: true })
        .webp({ quality: MEDIA_CONFIG.mainQuality })
        .toBuffer({ resolveWithObject: true }),
      pipeline
        .clone()
        .resize({ width: MEDIA_CONFIG.thumbWidth })
        .webp({ quality: MEDIA_CONFIG.thumbQuality })
        .toBuffer({ resolveWithObject: true }),
    ]);

    return {
      main: {
        buffer: mainResult.data,
        width: mainResult.info.width,
        height: mainResult.info.height,
        size: mainResult.info.size,
      },
      thumbnail: {
        buffer: thumbnailResult.data,
        width: thumbnailResult.info.width,
        height: thumbnailResult.info.height,
        size: thumbnailResult.info.size,
      },
    };
  }
}
