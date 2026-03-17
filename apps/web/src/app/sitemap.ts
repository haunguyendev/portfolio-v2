import type { MetadataRoute } from 'next'
import { apiGetBlogs, apiGetDiaries } from '@/lib/api-client'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, diaryEntries] = await Promise.all([apiGetBlogs(), apiGetDiaries()])

  const blogs = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated || post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const diaries = diaryEntries.map((entry) => ({
    url: `${SITE_URL}/diary/${entry.slug}`,
    lastModified: entry.date,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/projects`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/diary`, changeFrequency: 'weekly', priority: 0.6 },
    ...blogs,
    ...diaries,
  ]
}
