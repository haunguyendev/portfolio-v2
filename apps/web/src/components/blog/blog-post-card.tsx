import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Blog } from '@/lib/content'

interface BlogPostCardProps {
  post: Blog
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
          {/* Title */}
          <h3 className="line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-muted-foreground">
            {post.title}
          </h3>

          {/* Description */}
          <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Meta: date + reading time */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {post.readingTime} min read
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
