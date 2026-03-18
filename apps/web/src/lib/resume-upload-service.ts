export interface ResumeUploadResult {
  id: string;
  type: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/** Upload a PDF resume to the API. Fetches session token for auth automatically. */
export async function uploadResume(file: File): Promise<ResumeUploadResult> {
  // Client-side validation
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`,
    );
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const res = await fetch(`${apiUrl}/api/resume/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "Upload failed" }));
    throw new Error(error.message || `Upload failed: ${res.status}`);
  }

  return res.json();
}
