import Link from 'next/link'
import { ArrowRight, Newspaper } from 'lucide-react'

export function LatestBlogSection() {
  return (
    <section className="section-spacing bg-muted">
      <div className="container-main">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Latest Blog
          </h2>
          <Link
            href="/blog"
            className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Coming soon placeholder */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 px-6 py-16 text-center">
          <Newspaper className="mb-4 size-10 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Coming Soon
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            I&apos;m working on blog posts about software engineering,
            web development, and tech insights. Stay tuned!
          </p>
        </div>
      </div>
    </section>
  )
}
