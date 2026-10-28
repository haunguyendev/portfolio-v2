import type { Metadata } from 'next'
import { AnimatedPageTitle } from '@/components/ui/animated-page-title'
import { BlogPageContent } from './blog-page-content'
import { apiGetBlogs, apiGetAllBlogTags } from '@/lib/api-client'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog',
  description:
    "Kane Nguyen's blog — thoughts on web development, software engineering, and the tools I use.",
}

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([apiGetBlogs(), apiGetAllBlogTags()])

  return (
    <div className="section-spacing">
      <div className="container-main">
        <AnimatedPageTitle className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
          Blog
        </AnimatedPageTitle>
        <p className="mb-8 max-w-2xl text-base text-muted-foreground">
          Thoughts on web development, software engineering, and the tools I
          use every day.
        </p>
        <BlogPageContent posts={posts} allTags={tags} />
      </div>
    </div>
  )
}
