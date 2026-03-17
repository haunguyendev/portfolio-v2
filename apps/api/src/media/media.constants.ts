/** Configuration for image upload and processing */
export const MEDIA_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ] as const,
  /** Max width for main image (maintains aspect ratio) */
  mainMaxWidth: 1920,
  mainQuality: 80,
  /** Width for auto-generated thumbnails */
  thumbWidth: 400,
  thumbQuality: 70,
} as const;

export type MediaFolder = "posts/cover" | "posts/content" | "projects";

export const VALID_FOLDERS: MediaFolder[] = [
  "posts/cover",
  "posts/content",
  "projects",
];
