import type { Metadata } from 'next'
import { BioSection } from '@/components/about/bio-section'
import { SkillsSection } from '@/components/about/skills-section'
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
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-8 md:mb-12">
          About
        </h1>

        <BioSection />
        <SkillsSection />
        <Timeline />
      </div>
    </div>
  )
}
