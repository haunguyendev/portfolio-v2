# Phase 6: About Page

## Context Links
- [System Architecture — About Page Layout](../../docs/system-architecture.md)
- [Design Guidelines — Badges, Spacing, Typography](../../docs/design-guidelines.md)
- [Phase 3: Content Data](./phase-03-content-data-and-types.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | HIGH |
| Status | Complete |
| Effort | ~3h |
| Depends On | Phase 2 (layout), Phase 3 (content/types) |
| Description | Build About page with 3 sections: Bio (full biography), Skills (badges grouped by category), Experience Timeline (vertical timeline with work history) |

## Key Insights

- All server components — no interactivity needed on About page
- Skills badges reuse shadcn `<Badge>` component with `variant="secondary"`
- Timeline is a custom component — vertical line with dots and content cards
- Bio section can include a photo or remain text-only (text-only recommended for Phase 1, photo already on hero)
- Data sourced from `skills.json` and `experience.json` via content helpers

## Requirements

### Functional
- **BioSection:** Full biography (3-4 paragraphs), possibly with a smaller photo
- **SkillsSection:** Skills grouped by category (Frontend, Backend, Tools, etc.), each skill as a badge
- **Timeline:** Vertical timeline showing work experience entries, each with company, role, duration, description, highlights

### Non-Functional
- All server components
- Semantic HTML: `<section>`, `<h1>`, `<h2>`, lists
- Accessible: proper heading hierarchy, list semantics for highlights
- Page metadata: `title: "About | Kane Nguyen"`

## Related Code Files

### Files to Create
| File | Component | Type |
|------|-----------|------|
| `src/components/about/bio-section.tsx` | BioSection | Server |
| `src/components/about/skills-section.tsx` | SkillsSection | Server |
| `src/components/about/timeline.tsx` | Timeline | Server |
| `src/components/about/timeline-item.tsx` | TimelineItem | Server |
| `src/app/about/page.tsx` | AboutPage | Server |

## Architecture

```
AboutPage (page.tsx)
├── Page header (h1)
├── BioSection
│   └── Biography paragraphs
├── SkillsSection
│   └── SkillGroup × 3-4
│       └── Badge × N per group
└── Timeline
    └── TimelineItem × 2-3
        ├── Company + Role + Duration
        ├── Description
        └── Highlights list
```

## Implementation Steps

### Step 1: BioSection Component

`src/components/about/bio-section.tsx`:

```tsx
export function BioSection() {
  return (
    <section className="mb-12 md:mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
        About Me
      </h2>
      <div className="max-w-3xl space-y-4">
        <p className="text-base text-zinc-600 leading-relaxed">
          Hi, I'm Kane Nguyen — a Software Engineer based in [location].
          I'm passionate about building modern web applications that are
          both functional and beautiful. With a focus on frontend and
          full-stack development, I enjoy working with React, Next.js,
          TypeScript, and Node.js.
        </p>
        <p className="text-base text-zinc-600 leading-relaxed">
          I graduated with a degree in Computer Science and have been
          working professionally as a software engineer for the past year.
          My experience spans from building user-facing features to
          designing backend APIs and database architectures.
        </p>
        <p className="text-base text-zinc-600 leading-relaxed">
          Outside of work, I enjoy learning new technologies, contributing
          to open source, and writing about my development journey. I
          believe in writing clean, maintainable code and building products
          that make a real difference.
        </p>
      </div>
    </section>
  )
}
```

**Notes:**
- Bio text is hardcoded (not from JSON) since it's free-form narrative
- `max-w-3xl` constrains width for readability (~48rem / 768px)
- `space-y-4` adds 16px between paragraphs
- Replace placeholder text with Kane's actual bio during implementation

### Step 2: SkillsSection Component

`src/components/about/skills-section.tsx`:

```tsx
import { Badge } from '@/components/ui/badge'
import { getSkills } from '@/lib/content'

export function SkillsSection() {
  const skills = getSkills()

  return (
    <section className="mb-12 md:mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
        Skills
      </h2>
      <div className="space-y-6">
        {skills.map((group) => (
          <div key={group.category}>
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

**Design Details:**
- Category heading: small, uppercase, zinc-500, tracking-wider (label style)
- Badges: shadcn `<Badge variant="secondary">` — zinc-100 bg, zinc-700 text, rounded-full
- `flex-wrap gap-2` — wraps badges naturally on smaller screens
- Each category separated by `space-y-6` (24px)

### Step 3: TimelineItem Component

`src/components/about/timeline-item.tsx`:

```tsx
import type { Experience } from '@/types'

interface TimelineItemProps {
  experience: Experience
  isLast?: boolean
}

export function TimelineItem({ experience, isLast = false }: TimelineItemProps) {
  return (
    <div className="relative pl-8 pb-8">
      {/* Timeline line */}
      {!isLast && (
        <div
          className="absolute left-[7px] top-3 bottom-0 w-px bg-zinc-200"
          aria-hidden="true"
        />
      )}

      {/* Timeline dot */}
      <div
        className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-zinc-300 bg-white"
        aria-hidden="true"
      />

      {/* Content */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
          <h3 className="text-lg font-semibold text-zinc-900">
            {experience.role}
          </h3>
          <span className="text-sm text-zinc-500">
            {experience.duration}
          </span>
        </div>
        <p className="text-sm font-medium text-zinc-600 mb-2">
          {experience.company}
        </p>
        <p className="text-sm text-zinc-500 leading-relaxed mb-3">
          {experience.description}
        </p>

        {/* Highlights */}
        {experience.highlights.length > 0 && (
          <ul className="space-y-1.5">
            {experience.highlights.map((highlight, index) => (
              <li
                key={index}
                className="text-sm text-zinc-500 leading-relaxed flex items-start"
              >
                <span className="mr-2 mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0" />
                {highlight}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

**Design Details:**
- Vertical line: `w-px bg-zinc-200` positioned absolutely on left
- Dot: 16px circle, white fill, zinc-300 border
- Content offset: `pl-8` (32px) to clear the dot
- Role as primary heading, company as secondary, duration on right (desktop) or below (mobile)
- Highlights as bullet list with small zinc-400 dots
- `isLast` prop hides the connecting line for the last entry

### Step 4: Timeline Component

`src/components/about/timeline.tsx`:

```tsx
import { getExperience } from '@/lib/content'
import { TimelineItem } from '@/components/about/timeline-item'

export function Timeline() {
  const experience = getExperience()

  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
        Experience
      </h2>
      <div>
        {experience.map((exp, index) => (
          <TimelineItem
            key={`${exp.company}-${exp.role}`}
            experience={exp}
            isLast={index === experience.length - 1}
          />
        ))}
      </div>
    </section>
  )
}
```

### Step 5: Compose About Page

`src/app/about/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { BioSection } from '@/components/about/bio-section'
import { SkillsSection } from '@/components/about/skills-section'
import { Timeline } from '@/components/about/timeline'

export const metadata: Metadata = {
  title: 'About',
  description: "Learn about Kane Nguyen's background, skills, and experience.",
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
```

**Notes:**
- Page-level h1, then sections have h2 headings (proper hierarchy)
- All server components, no client code
- Metadata uses layout template: renders as "About | Kane Nguyen"

## Todo List

- [x] 6.1 Create `src/components/about/bio-section.tsx` (biography paragraphs)
- [x] 6.2 Create `src/components/about/skills-section.tsx` (grouped badges from skills.json)
- [x] 6.3 Create `src/components/about/timeline-item.tsx` (single experience entry with dot/line)
- [x] 6.4 Create `src/components/about/timeline.tsx` (timeline container, maps experience.json)
- [x] 6.5 Create `src/app/about/page.tsx` (compose sections)
- [x] 6.6 Test: bio text renders with proper spacing and max-width
- [x] 6.7 Test: skills badges grouped by category, all badges from skills.json present
- [x] 6.8 Test: timeline renders with vertical line, dots, all experience entries
- [x] 6.9 Test: last timeline item has no connecting line below
- [x] 6.10 Test: responsive — badges wrap on mobile, timeline stacks properly
- [x] 6.11 Test: heading hierarchy (h1 > h2 > h3) is correct
- [x] 6.12 Verify page title "About | Kane Nguyen" in browser tab
- [x] 6.13 Verify `pnpm build` succeeds

## Success Criteria

- Bio section: 3+ paragraphs, readable line width, proper spacing
- Skills: all categories from skills.json, each with badges
- Timeline: vertical line with dots, experience entries with role/company/duration/highlights
- Responsive: badges wrap, timeline readable on mobile
- Heading hierarchy: h1 (page) → h2 (sections) → h3 (timeline role)
- Page metadata correct

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Timeline line alignment off on mobile | Low | Test at 375px; use `pl-8` with absolute positioned line |
| Too many skills badges overflow | Low | `flex-wrap` handles this; consider limiting categories if excessive |
| Bio text too long for mobile | Low | `max-w-3xl` + responsive font sizes keep it readable |

## Next Steps

After About page verified, proceed to **Phase 7 (Blog Placeholder + Error Pages)**.
