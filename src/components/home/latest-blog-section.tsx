import Link from 'next/link'
import { ArrowRight, Newspaper } from 'lucide-react'
import { getBlogs } from '@/lib/content'
import { BlogPostCard } from '@/components/blog/blog-post-card'

export function LatestBlogSection() {
  const posts = getBlogs().slice(0, 3)

  return (
    <section className="section-spacing bg-muted dark:bg-background">
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

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 px-6 py-16 text-center">
            <Newspaper className="mb-4 size-10 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Coming Soon
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              I&apos;m working on blog posts about software engineering, web
              development, and tech insights. Stay tuned!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
