import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { uploadImage, getMediaUrl } from './image-upload-service'
import { toast } from 'sonner'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

function isImageFile(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type)
}

/**
 * TipTap extension that handles drag & drop + clipboard paste image upload.
 * Uploads to MinIO via API and inserts the resulting URL as an image node.
 */
export const ImageUploadExtension = Extension.create({
  name: 'imageUpload',

  addProseMirrorPlugins() {
    const editor = this.editor

    return [
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          // Handle drag & drop images
          handleDrop(view, event, _slice, moved) {
            if (moved || !event.dataTransfer?.files.length) return false

            const file = event.dataTransfer.files[0]
            if (!file || !isImageFile(file)) return false

            event.preventDefault()

            // Get drop position
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })

            processImageUpload(file, (url) => {
              if (coordinates) {
                editor
                  .chain()
                  .focus()
                  .setImage({ src: url })
                  .run()
              }
            })

            return true
          },

          // Handle paste images from clipboard
          handlePaste(_view, event) {
            const items = event.clipboardData?.items
            if (!items) return false

            for (const item of Array.from(items)) {
              if (item.type.startsWith('image/')) {
                const file = item.getAsFile()
                if (!file) continue

                event.preventDefault()

                processImageUpload(file, (url) => {
                  editor
                    .chain()
                    .focus()
                    .setImage({ src: url })
                    .run()
                })

                return true
              }
            }
            return false
          },
        },
      }),
    ]
  },
})

/** Upload image file and invoke callback with the resulting URL */
async function processImageUpload(
  file: File,
  onSuccess: (url: string) => void,
): Promise<void> {
  if (file.size > MAX_FILE_SIZE) {
    toast.error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB`)
    return
  }

  toast.info('Uploading image…')

  try {
    const result = await uploadImage(file, 'posts/content')
    onSuccess(getMediaUrl(result.url))
    toast.success('Image uploaded')
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Image upload failed')
  }
}
