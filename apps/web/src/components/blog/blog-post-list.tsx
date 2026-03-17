import { Newspaper } from 'lucide-react'
import { BlogPostCard } from './blog-post-card'
import type { Blog } from '@/lib/content'

interface BlogPostListProps {
  posts: Blog[]
}

export function BlogPostList({ posts }: BlogPostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 px-6 py-16 text-center">
        <Newspaper className="mb-4 size-10 text-muted-foreground/50" />
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          No posts found
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          No blog posts match your current filters. Try adjusting your search.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogPostCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
