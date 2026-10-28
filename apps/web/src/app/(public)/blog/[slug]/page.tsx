import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TiptapRenderer } from '@/components/blog/tiptap-renderer'
import { ShareButtons } from '@/components/shared/share-buttons'
import { ArticleJsonLd } from '@/components/seo/json-ld'
import { apiGetBlogs, apiGetBlogBySlug } from '@/lib/api-client'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 60

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await apiGetBlogs()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await apiGetBlogBySlug(slug)
  if (!post) return { title: 'Post Not Found' }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      ...(post.coverImage && { images: [post.coverImage] }),
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await apiGetBlogBySlug(slug)
  if (!post) notFound()

  const postUrl = `${SITE_URL}/blog/${post.slug}`

  return (
    <div className="section-spacing">
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        datePublished={post.date}
        dateModified={post.updated}
        url={postUrl}
        image={post.coverImage}
      />
      <div className="container-main">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Blog
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
          {/* Main content */}
          <article>
            {/* Header */}
            <header className="mb-8">
              <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                {post.title}
              </h1>
              {post.description && (
                <p className="mb-4 text-lg text-muted-foreground">
                  {post.description}
                </p>
              )}

              {/* Meta */}
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-4" />
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-4" />
                  {post.readingTime} min read
                </span>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {post.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Share */}
              <ShareButtons title={post.title} url={postUrl} />
            </header>

            {/* TipTap content */}
            <TiptapRenderer content={post.content} className="prose prose-neutral dark:prose-invert max-w-none" />
          </article>

          {/* Sidebar placeholder (no TOC for API-driven content) */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </div>
  )
}
