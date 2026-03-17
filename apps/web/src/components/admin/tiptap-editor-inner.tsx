'use client'

/* eslint-disable react-hooks/refs -- TipTap's useEditor returns a mutable editor instance (standard pattern) */

import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight'
import {
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Code, ImageIcon, Link2, Quote, Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ImageUploadExtension } from '@/lib/tiptap-image-upload'
import { uploadImage, getMediaUrl } from '@/lib/image-upload-service'
import { toast } from 'sonner'

interface TiptapEditorInnerProps {
  content?: Record<string, unknown>
  onChange?: (content: Record<string, unknown>) => void
  placeholder?: string
  className?: string
}

export default function TiptapEditorInner({ content, onChange, placeholder, className }: TiptapEditorInnerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
      ImageUploadExtension,
    ],
    content,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON() as Record<string, unknown>)
    },
  })

  if (!editor) return null

  function addImage() {
    // Open file picker — upload on select
    fileInputRef.current?.click()
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // Reset so same file can be re-selected
    try {
      toast.info('Uploading image…')
      const result = await uploadImage(file, 'posts/content')
      editor?.chain().focus().setImage({ src: getMediaUrl(result.url) }).run()
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  function addLink() {
    const url = window.prompt('URL')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), activeKey: 'bold' as const, title: 'Bold' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), activeKey: 'italic' as const, title: 'Italic' },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), activeKey: 'heading' as const, activeAttrs: { level: 2 }, title: 'H2' },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), activeKey: 'heading' as const, activeAttrs: { level: 3 }, title: 'H3' },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), activeKey: 'bulletList' as const, title: 'Bullet list' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), activeKey: 'orderedList' as const, title: 'Ordered list' },
    { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), activeKey: 'codeBlock' as const, title: 'Code block' },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), activeKey: 'blockquote' as const, title: 'Blockquote' },
    { icon: ImageIcon, action: addImage, activeKey: null, title: 'Image' },
    { icon: Link2, action: addLink, activeKey: 'link' as const, title: 'Link' },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), activeKey: null, title: 'Divider' },
  ]

  return (
    <div className={cn('rounded-xl ring-1 ring-border overflow-hidden', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
      <div className="flex flex-wrap gap-0.5 border-b border-border bg-muted/40 p-1.5">
        {tools.map(({ icon: Icon, action, activeKey, activeAttrs, title }) => (
          <Button
            key={title}
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={action}
            title={title}
            className={cn(activeKey && editor.isActive(activeKey, activeAttrs) && 'bg-primary text-primary-foreground hover:bg-primary/90')}
          >
            <Icon />
          </Button>
        ))}
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none min-h-64 p-4 [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  )
}
