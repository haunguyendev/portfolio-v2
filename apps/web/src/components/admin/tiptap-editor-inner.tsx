'use client'

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

interface TiptapEditorInnerProps {
  content?: Record<string, unknown>
  onChange?: (content: Record<string, unknown>) => void
  placeholder?: string
  className?: string
}

export default function TiptapEditorInner({ content, onChange, placeholder, className }: TiptapEditorInnerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
    ],
    content,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON() as Record<string, unknown>)
    },
  })

  if (!editor) return null

  function addImage() {
    const url = window.prompt('Image URL')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }

  function addLink() {
    const url = window.prompt('URL')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: 'H2' },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), title: 'H3' },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Bullet list' },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Ordered list' },
    { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock'), title: 'Code block' },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: 'Blockquote' },
    { icon: ImageIcon, action: addImage, active: false, title: 'Image' },
    { icon: Link2, action: addLink, active: editor.isActive('link'), title: 'Link' },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false, title: 'Divider' },
  ]

  return (
    <div className={cn('rounded-xl ring-1 ring-border overflow-hidden', className)}>
      <div className="flex flex-wrap gap-0.5 border-b border-border bg-muted/40 p-1.5">
        {tools.map(({ icon: Icon, action, active, title }) => (
          <Button
            key={title}
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={action}
            title={title}
            className={cn(active && 'bg-primary text-primary-foreground hover:bg-primary/90')}
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
