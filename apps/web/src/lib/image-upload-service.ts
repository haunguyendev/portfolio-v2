export type MediaFolder = "posts/cover" | "posts/content" | "projects";

export interface UploadResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

/** Upload an image to the API. Fetches session token for auth automatically. */
export async function uploadImage(
  file: File,
  folder: MediaFolder,
  alt?: string,
): Promise<UploadResult> {
  // Client-side validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Allowed: JPG, PNG, GIF, WebP`,
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`);
  }

  // Get session token for Bearer auth
  const sessionRes = await fetch("/api/auth/get-session", {
    credentials: "include",
  });
  if (!sessionRes.ok) {
    throw new Error("Not authenticated");
  }
  const sessionData = await sessionRes.json();
  const token = sessionData?.session?.token;
  if (!token) {
    throw new Error("No session token");
  }

  // Build multipart form
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  if (alt) formData.append("alt", alt);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const res = await fetch(`${apiUrl}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(error.message || `Upload failed: ${res.status}`);
  }

  return res.json();
}

/** Build a URL for an API media path — kept relative so Next.js rewrites proxy to API */
export function getMediaUrl(path: string): string {
  if (!path) return "";
  // Full URLs returned as-is
  if (path.startsWith("http")) return path;
  // Relative /api/media/* paths stay relative — Next.js rewrites handle proxying
  return path;
}
