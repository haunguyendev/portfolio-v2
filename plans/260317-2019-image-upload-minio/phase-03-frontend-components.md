---
phase: 3
title: Frontend — Dropzone + TipTap Image Upload
status: completed
priority: P1
effort: 3-4h
blockedBy: [phase-02]
---

# Phase 3: Frontend Components

## Context

- [Phase 2: Backend API](phase-02-backend-api.md) — Upload/serve endpoints must be ready
- TipTap editor: `/apps/web/src/components/admin/tiptap-editor-inner.tsx`
- Post form: `/apps/web/src/components/admin/post-form.tsx`
- Project form: `/apps/web/src/components/admin/project-form.tsx`
- GraphQL client: `/apps/web/src/lib/graphql-client.ts`

## Overview

Create reusable Dropzone component for cover/project images and custom TipTap extension for drag & drop + paste image upload. Both call `POST /api/upload` and return MinIO URLs.

## Components to Build

```
apps/web/src/components/admin/
├── image-dropzone.tsx        — Reusable dropzone (cover image, project image)
├── image-upload-service.ts   — Shared upload function (fetch POST /api/upload)
└── tiptap-image-upload.ts    — TipTap extension for drag/drop/paste upload
```

## Related Code Files

### Create
- `apps/web/src/components/admin/image-dropzone.tsx` — Dropzone UI component
- `apps/web/src/lib/image-upload-service.ts` — Upload API call helper
- `apps/web/src/lib/tiptap-image-upload.ts` — Custom TipTap image upload extension

### Modify
- `apps/web/src/components/admin/tiptap-editor-inner.tsx` — Replace prompt() with upload extension
- `apps/web/src/components/admin/post-form.tsx` — Replace URL input with Dropzone
- `apps/web/src/components/admin/project-form.tsx` — Replace URL input with Dropzone

## Implementation Steps

### 1. Create upload service helper

Shared function used by both Dropzone and TipTap extension.

```typescript
// libs/image-upload-service.ts
export type MediaFolder = 'posts/cover' | 'posts/content' | 'projects';

export interface UploadResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

export async function uploadImage(
  file: File,
  folder: MediaFolder,
  alt?: string,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (alt) formData.append('alt', alt);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${apiUrl}/api/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include', // Send session cookie for JWT
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Upload failed: ${res.status}`);
  }

  return res.json();
}
```

### 2. Create ImageDropzone component

Reusable for cover image (post form) and image (project form).

```
┌─────────────────────────────────────┐
│  [No image state]                   │
│  ╔═══════════════════════════════╗  │
│  ║  🖼️ Drop image or click       ║  │
│  ║  Max 10MB · JPG/PNG/GIF/WebP ║  │
│  ╚═══════════════════════════════╝  │
│  [Or enter URL] _____________ [✓]  │
│                                     │
│  [Has image state]                  │
│  ┌───────────────────────────────┐  │
│  │  [Preview image]          [✖] │  │
│  │  Alt: [_________________] [✓] │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

Props interface:

```typescript
interface ImageDropzoneProps {
  value: string | null;           // Current image URL (or null)
  onChange: (url: string | null) => void;  // URL changed callback
  folder: MediaFolder;            // Target folder in MinIO
  alt?: string;                   // Current alt text
  onAltChange?: (alt: string) => void;    // Alt text changed
  label?: string;                 // Field label ("Cover Image")
  className?: string;
}
```

Key behaviors:
- **Drop zone**: `onDragOver`, `onDrop` → extract file → validate → upload
- **Click to browse**: Hidden `<input type="file">` triggered on click
- **URL fallback**: Text input + confirm button, sets URL directly (no upload)
- **Preview**: Show uploaded image with remove (✖) button
- **Alt text**: Input field below preview
- **Progress**: Show upload progress (percentage or spinner)
- **Error**: Toast notification on failure (via sonner)
- **Validation**: Client-side check for file type + size before upload

### 3. Create TipTap image upload extension

Custom extension that intercepts drag/drop and paste events in TipTap editor.

```typescript
// lib/tiptap-image-upload.ts
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { uploadImage } from './image-upload-service';

export const ImageUploadExtension = Extension.create({
  name: 'imageUpload',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          // Handle drag & drop
          handleDrop(view, event, slice, moved) {
            if (moved || !event.dataTransfer?.files.length) return false;
            const file = event.dataTransfer.files[0];
            if (!file.type.startsWith('image/')) return false;

            // 1. Insert placeholder at drop position
            // 2. Upload file
            // 3. Replace placeholder with real image node
            handleImageUpload(view, file, event);
            return true;
          },

          // Handle paste from clipboard
          handlePaste(view, event) {
            const items = event.clipboardData?.items;
            if (!items) return false;

            for (const item of items) {
              if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (!file) continue;

                handleImageUpload(view, file);
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});

async function handleImageUpload(view, file, event?) {
  // 1. Validate file (type, size)
  // 2. Create placeholder node (loading state) at cursor/drop position
  // 3. Call uploadImage(file, 'posts/content')
  // 4. On success: replace placeholder with <img src={result.url} alt="">
  // 5. On error: remove placeholder, show toast
}
```

Placeholder approach: Insert a temporary paragraph with loading text or use TipTap's built-in image node with a blob URL, then replace `src` after upload completes.

### 4. Update TipTap editor

Modify `tiptap-editor-inner.tsx`:

```diff
 import { ImageUploadExtension } from '@/lib/tiptap-image-upload';

 const editor = useEditor({
   extensions: [
     StarterKit,
     CodeBlockLowlight.configure({ lowlight }),
-    Image,
+    Image.configure({ allowBase64: false }),
+    ImageUploadExtension,
     Link.configure({ openOnClick: false }),
     Placeholder.configure({ placeholder }),
   ],
 });

- const addImage = () => {
-   const url = window.prompt('Image URL');
-   if (url) editor?.chain().focus().setImage({ src: url }).run();
- };
+ const addImage = () => {
+   // Open file picker
+   const input = document.createElement('input');
+   input.type = 'file';
+   input.accept = 'image/jpeg,image/png,image/gif,image/webp';
+   input.onchange = async (e) => {
+     const file = (e.target as HTMLInputElement).files?.[0];
+     if (!file) return;
+     try {
+       const result = await uploadImage(file, 'posts/content');
+       editor?.chain().focus().setImage({ src: result.url }).run();
+     } catch (err) {
+       toast.error('Image upload failed');
+     }
+   };
+   input.click();
+ };
```

Also add a "URL" button option next to image button for external URLs.

### 5. Update post form — Replace cover image URL input with Dropzone

```diff
- <Label>Cover Image URL</Label>
- <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
+ <ImageDropzone
+   value={coverImage}
+   onChange={setCoverImage}
+   folder="posts/cover"
+   alt={coverImageAlt}
+   onAltChange={setCoverImageAlt}
+   label="Cover Image"
+ />
```

Note: May need to add `coverImageAlt` state if not already present. The alt text gets stored with the Media record on upload but also useful to keep in the form for the Post's display.

### 6. Update project form — Replace image URL input with Dropzone

```diff
- <Label>Image URL</Label>
- <Input value={image} onChange={(e) => setImage(e.target.value)} />
+ <ImageDropzone
+   value={image}
+   onChange={setImage}
+   folder="projects"
+   label="Project Image"
+ />
```

## Todo

- [ ] Create `apps/web/src/lib/image-upload-service.ts`
- [ ] Create `apps/web/src/components/admin/image-dropzone.tsx`
- [ ] Create `apps/web/src/lib/tiptap-image-upload.ts`
- [ ] Update `tiptap-editor-inner.tsx` — add ImageUploadExtension + file picker button
- [ ] Update `post-form.tsx` — replace cover URL input with ImageDropzone
- [ ] Update `project-form.tsx` — replace image URL input with ImageDropzone
- [ ] Test drag & drop image into TipTap editor
- [ ] Test paste image from clipboard into TipTap editor
- [ ] Test Dropzone upload + preview + remove + alt text
- [ ] Test URL fallback input in Dropzone

## Success Criteria

- Dropzone: drag file → upload → preview shown with remove button
- Dropzone: click → file picker → upload → preview
- Dropzone: enter URL → set directly (no upload)
- Dropzone: alt text input saves and propagates
- TipTap: drag image onto editor → placeholder → uploaded image appears
- TipTap: paste image from clipboard → auto-upload → image in content
- TipTap: click image toolbar button → file picker → upload → insert
- Error states show toast notifications
- All uploads send credentials for JWT auth
- Build passes: `pnpm typecheck && pnpm build`

## Risks

| Risk | Mitigation |
|------|------------|
| TipTap ProseMirror plugin API changes | Pin @tiptap versions, test with current 2.27.2 |
| CORS on upload request | API already has CORS for localhost:3000, verify credentials:include works |
| Large file slows browser | Client-side size check (10MB) before upload attempt |
| Placeholder flicker in TipTap | Use blob URL for instant preview, replace with real URL after upload |
