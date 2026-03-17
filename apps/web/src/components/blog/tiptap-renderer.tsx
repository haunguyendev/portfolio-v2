import React from 'react'

// TipTap JSON node types
interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: TiptapMark[]
  text?: string
}

interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

function applyMarks(text: string, marks: TiptapMark[]): React.ReactNode {
  let node: React.ReactNode = text
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        node = <strong>{node}</strong>
        break
      case 'italic':
        node = <em>{node}</em>
        break
      case 'code':
        node = <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{node}</code>
        break
      case 'link':
        node = (
          <a
            href={mark.attrs?.href as string}
            target={mark.attrs?.target as string | undefined}
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-muted-foreground"
          >
            {node}
          </a>
        )
        break
      case 'strike':
        node = <s>{node}</s>
        break
    }
  }
  return node
}

function renderInline(nodes: TiptapNode[]): React.ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === 'text') {
      const text = node.text ?? ''
      if (node.marks && node.marks.length > 0) {
        return <React.Fragment key={i}>{applyMarks(text, node.marks)}</React.Fragment>
      }
      return text
    }
    if (node.type === 'hardBreak') return <br key={i} />
    return null
  })
}

function renderNode(node: TiptapNode, key: number): React.ReactNode {
  const children = node.content ? renderNodes(node.content) : null
  const inlineChildren = node.content ? renderInline(node.content) : null

  switch (node.type) {
    case 'doc':
      return <React.Fragment key={key}>{children}</React.Fragment>

    case 'paragraph':
      if (!node.content || node.content.length === 0) return <p key={key} className="mb-4" />
      return <p key={key} className="mb-4 leading-7">{inlineChildren}</p>

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2
      const cls = level === 1
        ? 'mb-4 mt-8 text-2xl font-bold'
        : level === 2
          ? 'mb-3 mt-8 text-xl font-bold'
          : level === 3
            ? 'mb-2 mt-6 text-lg font-semibold'
            : 'mb-2 mt-4 text-base font-semibold'
      return React.createElement(`h${level}`, { key, className: cls }, inlineChildren)
    }

    case 'bulletList':
      return <ul key={key} className="mb-4 list-disc pl-6 space-y-1">{children}</ul>

    case 'orderedList':
      return <ol key={key} className="mb-4 list-decimal pl-6 space-y-1">{children}</ol>

    case 'listItem':
      return <li key={key} className="leading-7">{inlineChildren ?? children}</li>

    case 'blockquote':
      return (
        <blockquote key={key} className="mb-4 border-l-4 border-border pl-4 italic text-muted-foreground">
          {children}
        </blockquote>
      )

    case 'codeBlock': {
      const lang = node.attrs?.language as string | undefined
      const code = node.content?.map((n) => n.text ?? '').join('') ?? ''
      return (
        <pre key={key} className="mb-4 overflow-x-auto rounded-lg bg-muted p-4">
          <code className={`font-mono text-sm${lang ? ` language-${lang}` : ''}`}>{code}</code>
        </pre>
      )
    }

    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={key}
          src={node.attrs?.src as string}
          alt={node.attrs?.alt as string | undefined}
          title={node.attrs?.title as string | undefined}
          className="mb-4 max-w-full rounded-lg"
        />
      )

    case 'horizontalRule':
      return <hr key={key} className="my-8 border-border" />

    case 'hardBreak':
      return <br key={key} />

    default:
      // Fallback: render inline children if any
      if (node.content) return <React.Fragment key={key}>{children}</React.Fragment>
      return null
  }
}

function renderNodes(nodes: TiptapNode[]): React.ReactNode[] {
  return nodes.map((node, i) => renderNode(node, i))
}

interface TiptapRendererProps {
  content: unknown
  className?: string
}

export function TiptapRenderer({ content, className }: TiptapRendererProps) {
  if (!content || typeof content !== 'object') {
    return <div className={className}><p className="text-muted-foreground">No content</p></div>
  }

  const doc = content as TiptapNode

  return (
    <div className={className ?? 'prose prose-sm dark:prose-invert max-w-none'}>
      {doc.type === 'doc' && doc.content ? renderNodes(doc.content) : renderNode(doc, 0)}
    </div>
  )
}
