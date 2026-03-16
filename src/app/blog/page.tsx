import type { Metadata } from 'next'
import { PenLine } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog',
  description: "Kane Nguyen's technical blog — coming soon.",
}

export default function BlogPage() {
  return (
    <div className="section-spacing">
      <div className="container-main">
        <div className="flex flex-col items-center justify-center py-16 text-center md:py-24">
          <div className="mb-6 rounded-full bg-zinc-100 p-4">
            <PenLine className="h-8 w-8 text-zinc-400" />
          </div>

          <h1 className="mb-3 text-3xl font-bold text-zinc-900 md:text-4xl">
            Blog
          </h1>

          <p className="mb-2 max-w-md text-base text-zinc-500">
            Coming soon! I&apos;m working on sharing my thoughts on web
            development, software engineering, and the tools I use every day.
          </p>
          <p className="text-sm text-zinc-400">
            Stay tuned for articles and tutorials.
          </p>
        </div>
      </div>
    </div>
  )
}
