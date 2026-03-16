import type { ComponentPropsWithoutRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

// Custom anchor: external links get icon + noopener
function MdxLink({
  href = '',
  children,
  ...props
}: ComponentPropsWithoutRef<'a'>) {
  const isExternal = href.startsWith('http')

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5"
        {...props}
      >
        {children}
        <ExternalLink className="ml-0.5 inline size-3.5" />
      </a>
    )
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

// Responsive image wrapper using Next.js Image
function MdxImage({ src, alt, ...props }: ComponentPropsWithoutRef<'img'>) {
  if (!src || typeof src !== 'string') return null

  return (
    <figure className="my-6">
      <Image
        src={src}
        alt={alt || ''}
        width={800}
        height={450}
        className="rounded-lg"
        sizes="(max-width: 768px) 100vw, 800px"
        {...(props as Record<string, unknown>)}
      />
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {alt}
        </figcaption>
      )}
    </figure>
  )
}

// Styled blockquote
function MdxBlockquote({
  children,
  ...props
}: ComponentPropsWithoutRef<'blockquote'>) {
  return (
    <blockquote
      className="border-l-4 border-l-muted-foreground/30 bg-muted/50 py-1 pl-4 italic"
      {...props}
    >
      {children}
    </blockquote>
  )
}

// Responsive table wrapper
function MdxTable({
  children,
  ...props
}: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border">
      <table className="w-full" {...props}>
        {children}
      </table>
    </div>
  )
}

// Pre block wrapper for code (rehype-pretty-code handles styling)
function MdxPre({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  return (
    <pre
      className="overflow-x-auto rounded-lg border bg-[#0d1117] p-4 text-sm"
      {...props}
    >
      {children}
    </pre>
  )
}

export const mdxComponents = {
  a: MdxLink,
  img: MdxImage,
  blockquote: MdxBlockquote,
  table: MdxTable,
  pre: MdxPre,
}
