export const revalidate = 60

import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProjectsSection } from '@/components/home/featured-projects-section'
import { AboutPreviewSection } from '@/components/home/about-preview-section'
import { LatestBlogSection } from '@/components/home/latest-blog-section'
import { LatestDiarySection } from '@/components/home/latest-diary-section'
import { ContactSection } from '@/components/home/contact-section'
import { PersonJsonLd } from '@/components/seo/json-ld'
import { apiGetBlogs, apiGetDiaries } from '@/lib/api-client'
import { getBlogs, getDiaries } from '@/lib/content'

export default async function HomePage() {
  const blogs = await apiGetBlogs()
  const diaries = await apiGetDiaries()

  const hasBlogs = blogs.length > 0 || getBlogs().length > 0
  const hasDiaries = diaries.length > 0 || getDiaries().length > 0

  return (
    <>
      <PersonJsonLd />
      <HeroSection />
      <FeaturedProjectsSection />
      <AboutPreviewSection />
      {hasBlogs ? <LatestBlogSection /> : null}
      {hasDiaries ? <LatestDiarySection /> : null}
      <ContactSection />
    </>
  )
}
