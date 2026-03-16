import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProjectsSection } from '@/components/home/featured-projects-section'
import { AboutPreviewSection } from '@/components/home/about-preview-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProjectsSection />
      <AboutPreviewSection />
    </>
  )
}
