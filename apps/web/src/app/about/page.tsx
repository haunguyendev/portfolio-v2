import type { Metadata } from 'next'
import { AnimatedPageTitle } from '@/components/ui/animated-page-title'
import { BioSection } from '@/components/about/bio-section'
import { GitHubStatsSection } from '@/components/about/github-stats-section'
import { SkillsSection } from '@/components/about/skills-section'
import { CertificatesSection } from '@/components/about/certificates-section'
import { Timeline } from '@/components/about/timeline'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn more about Kane Nguyen — a Software Engineer with experience building modern web applications.',
}

export default function AboutPage() {
  return (
    <div className="section-spacing">
      <div className="container-main">
        <AnimatedPageTitle className="text-3xl md:text-4xl font-bold text-foreground mb-8 md:mb-12">
          About
        </AnimatedPageTitle>

        <BioSection />
        <GitHubStatsSection />
        <SkillsSection />
        <CertificatesSection />
        <Timeline />
      </div>
    </div>
  )
}
