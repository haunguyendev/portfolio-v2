'use client'

// Skills section reusing TechStackTabs from home + soft skills badges
import dynamic from 'next/dynamic'
import { Badge } from '@/components/ui/badge'

const TechStackTabs = dynamic(
  () => import('@/components/home/tech-stack-tabs').then(m => ({ default: m.TechStackTabs })),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted" /> }
)

const SOFT_SKILLS = [
  'Communication',
  'English (B2)',
  'Teamwork',
  'Problem Solving',
  'Agile/Scrum',
  'Technical Writing',
  'Time Management',
  'Self-learning',
]

export function SkillsSection() {
  return (
    <section className="mb-12 md:mb-16">
      <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">
        Skills
      </h2>

      {/* Tech stack with tabbed icons — same as home preview */}
      <div className="rounded-xl border border-border bg-background p-4 md:p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Tech Stack
        </h3>
        <TechStackTabs />
      </div>

      {/* Soft skills */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Soft Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {SOFT_SKILLS.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="px-3 py-1.5 text-sm"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
