export const revalidate = 60

import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProjectsSection } from '@/components/home/featured-projects-section'
import { AboutPreviewSection } from '@/components/home/about-preview-section'
import { LatestBlogSection } from '@/components/home/latest-blog-section'
import { LatestDiarySection } from '@/components/home/latest-diary-section'
import { ContactSection } from '@/components/home/contact-section'
import { PersonJsonLd } from '@/components/seo/json-ld'

export default function HomePage() {
  return (
    <>
      <PersonJsonLd />
      <HeroSection />
      <FeaturedProjectsSection />
      <AboutPreviewSection />
      <LatestBlogSection />
      <LatestDiarySection />
      <ContactSection />
    </>
  )
}
