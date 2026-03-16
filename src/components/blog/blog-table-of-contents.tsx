'use client'

import { useState, useEffect } from 'react'
import { List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

export function BlogTableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Extract headings from DOM after render
  useEffect(() => {
    const elements = document.querySelectorAll(
      '.prose h2[id], .prose h3[id]',
    )
    const items: TocItem[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent || '',
      level: el.tagName === 'H2' ? 2 : 3,
    }))
    setHeadings(items)
  }, [])

  // Track active heading via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav
      className="hidden lg:block"
      aria-label="Table of contents"
    >
      <div className="sticky top-24">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <List className="size-4" />
          On this page
        </h4>
        <ul className="space-y-1 text-sm">
          {headings.map(({ id, text, level }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document
                    .getElementById(id)
                    ?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={cn(
                  'block rounded px-2 py-1 transition-colors hover:text-foreground',
                  level === 3 && 'pl-4',
                  activeId === id
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
