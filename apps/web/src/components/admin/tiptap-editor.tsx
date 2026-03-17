'use client'

import dynamic from 'next/dynamic'

// Lazy-loaded to avoid Turbopack resolution issues with pnpm workspaces
const TiptapEditorInner = dynamic(() => import('./tiptap-editor-inner'), {
  ssr: false,
  loading: () => (
    <div className="min-h-64 rounded-xl ring-1 ring-border bg-muted/20 p-4 text-sm text-muted-foreground animate-pulse">
      Loading editor…
    </div>
  ),
})

interface TiptapEditorProps {
  content?: Record<string, unknown>
  onChange?: (content: Record<string, unknown>) => void
  placeholder?: string
  className?: string
}

export function TiptapEditor(props: TiptapEditorProps) {
  return <TiptapEditorInner {...props} />
}
