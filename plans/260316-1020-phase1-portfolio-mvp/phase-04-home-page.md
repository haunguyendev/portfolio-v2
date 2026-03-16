# Phase 4: Home Page

## Context Links
- [System Architecture — Home Page Layout](../../docs/system-architecture.md)
- [Design Guidelines — Hero Layout](../../docs/design-guidelines.md)
- [Phase 2: Layout Components](./phase-02-layout-components.md)
- [Phase 3: Content Data](./phase-03-content-data-and-types.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | HIGH |
| Status | Pending |
| Effort | ~4h |
| Depends On | Phase 2 (layout), Phase 3 (content/types) |
| Description | Build the home page with 3 sections: Split Hero (text left, photo right), Featured Projects grid (3-4 cards), About Preview (short bio + CTA to About page) |

## Key Insights

- Hero is the most visually impactful section — split layout with gradient text accent
- Featured projects reuse `ProjectCard` from Phase 5; build a simplified version here or build Phase 5 first
- About preview is a short teaser to drive traffic to the About page
- All sections are server components — no client-side interactivity on home page
- Mobile: all sections stack vertically (single column)

## Requirements

### Functional
- **HeroSection:** H1 with name/title, subtitle paragraph, CTA buttons (View Projects, About Me), personal photo on right
- **FeaturedProjectsSection:** Section title "Featured Projects", grid of 3-4 ProjectCards (from `featured: true` in projects.json), "View All Projects" link
- **AboutPreviewSection:** Brief bio text (2-3 sentences), "Learn More" button linking to /about

### Non-Functional
- All server components (no `'use client'`)
- Responsive: mobile stacks vertically, desktop uses grid
- Images use Next.js `<Image>` with `priority` for hero photo
- Section spacing: `py-12 md:py-16` between sections

## Related Code Files

### Files to Create
| File | Component | Type |
|------|-----------|------|
| `src/components/home/hero-section.tsx` | HeroSection | Server |
| `src/components/home/featured-projects-section.tsx` | FeaturedProjectsSection | Server |
| `src/components/home/about-preview-section.tsx` | AboutPreviewSection | Server |
| `src/components/projects/project-card.tsx` | ProjectCard | Server (shared) |
| `src/app/page.tsx` | HomePage | Server |

### Files to Modify
- `src/app/page.tsx` — replace scaffolded page with composed sections

## Architecture

```
HomePage (page.tsx)
├── HeroSection
│   ├── Left column: h1, subtitle, CTA buttons
│   └── Right column: personal photo (Image)
├── FeaturedProjectsSection
│   ├── Section heading + "View All" link
│   └── ProjectGrid (3-4 ProjectCards)
│       └── ProjectCard × 3-4
└── AboutPreviewSection
    ├── Brief bio text
    └── "Learn More" button → /about
```

## Implementation Steps

### Step 1: HeroSection Component

`src/components/home/hero-section.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="section-spacing">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text content — left */}
          <div className="order-2 md:order-1">
            <p className="text-sm font-medium text-zinc-500 mb-2">
              Hi, I'm
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
              Kane{' '}
              <span className="gradient-text">Nguyen</span>
            </h1>
            <p className="text-xl text-zinc-600 mb-2">
              Software Engineer
            </p>
            <p className="text-base text-zinc-500 leading-relaxed mb-8 max-w-lg">
              I build modern web applications with a focus on clean code,
              great user experiences, and scalable architecture.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/projects">
                  View Projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">
                  About Me
                </Link>
              </Button>
            </div>
          </div>

          {/* Photo — right */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <Image
                src="/images/hero/kane-photo.jpg"
                alt="Kane Nguyen's portrait"
                fill
                className="rounded-2xl object-cover shadow-xl"
                priority
                sizes="(max-width: 768px) 256px, (max-width: 1024px) 320px, 384px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Design Details:**
- Split grid: `grid-cols-1 md:grid-cols-2`
- Mobile: photo on top (order-1), text below (order-2)
- Desktop: text left (order-1), photo right (order-2)
- Gradient text on last name: `.gradient-text` class from globals.css
- Photo: `rounded-2xl shadow-xl`, 1:1 aspect, responsive sizes
- `priority` on Image — above the fold, load immediately
- CTA buttons: Primary (View Projects) + Outline (About Me) using shadcn Button

### Step 2: ProjectCard Component (Shared)

`src/components/projects/project-card.tsx`:

This component is shared between Home and Projects pages. Build it here; Projects page reuses it.

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Github } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="group bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Project image */}
      <div className="relative aspect-video bg-zinc-100">
        <Image
          src={project.image}
          alt={`${project.title} screenshot`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Card content */}
      <div className="p-4 md:p-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-zinc-500 leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Tech badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center gap-3">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              aria-label={`${project.title} GitHub repository`}
            >
              <Github className="h-4 w-4 mr-1" />
              Code
            </a>
          )}
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              aria-label={`${project.title} live demo`}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Demo
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Design Details:**
- Card: white bg, zinc-200 border, rounded-lg, shadow-sm, hover:shadow-md
- Image: 16:9 aspect ratio (`aspect-video`), `object-cover`
- Tech badges: shadcn `<Badge variant="secondary">` (zinc-100 bg)
- Links: GitHub icon + "Code", ExternalLink icon + "Demo"
- `group` + `group-hover:` on title for card-level hover effect

### Step 3: FeaturedProjectsSection Component

`src/components/home/featured-projects-section.tsx`:

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProjectCard } from '@/components/projects/project-card'
import { getFeaturedProjects } from '@/lib/content'

export function FeaturedProjectsSection() {
  const projects = getFeaturedProjects()

  return (
    <section className="section-spacing bg-zinc-50">
      <div className="container-main">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">
            Featured Projects
          </h2>
          <Link
            href="/projects"
            className="hidden sm:inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Mobile "View All" link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/projects"
            className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            View All Projects
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
```

**Design Details:**
- Background: `bg-zinc-50` for visual separation from hero
- Grid: 1 col mobile → 2 col tablet → 3 col desktop
- "View All" link: hidden on mobile (shown at bottom), visible on desktop (in header)
- Uses `getFeaturedProjects()` from content helpers

### Step 4: AboutPreviewSection Component

`src/components/home/about-preview-section.tsx`:

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AboutPreviewSection() {
  return (
    <section className="section-spacing">
      <div className="container-main">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
            About Me
          </h2>
          <p className="text-base text-zinc-600 leading-relaxed mb-4">
            I'm a Software Engineer with a passion for building clean,
            user-friendly web applications. With experience in full-stack
            development using React, Next.js, Node.js, and PostgreSQL, I
            enjoy turning complex problems into simple, elegant solutions.
          </p>
          <p className="text-base text-zinc-600 leading-relaxed mb-6">
            When I'm not coding, you can find me exploring new technologies,
            contributing to open source, or writing about my development journey.
          </p>
          <Button variant="outline" asChild>
            <Link href="/about">
              Learn More About Me
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
```

**Notes:**
- `max-w-2xl` — constrains text width for readability
- Content is hardcoded here (not from JSON) since it's a short teaser
- CTA links to /about page

### Step 5: Compose Home Page

`src/app/page.tsx`:

```tsx
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
```

Clean composition — each section is self-contained.

## Todo List

- [ ] 4.1 Create `src/components/projects/project-card.tsx` (shared component)
- [ ] 4.2 Create `src/components/home/hero-section.tsx` (split layout, gradient text, CTA buttons)
- [ ] 4.3 Create `src/components/home/featured-projects-section.tsx` (grid of featured ProjectCards)
- [ ] 4.4 Create `src/components/home/about-preview-section.tsx` (bio teaser + CTA)
- [ ] 4.5 Replace `src/app/page.tsx` with composed sections
- [ ] 4.6 Add placeholder hero image to `public/images/hero/kane-photo.jpg`
- [ ] 4.7 Test hero: gradient text renders, photo displays, CTA buttons link correctly
- [ ] 4.8 Test featured projects: 3 cards render from JSON data
- [ ] 4.9 Test about preview: text displays, CTA links to /about
- [ ] 4.10 Test responsive: mobile stacks hero vertically, grid goes single-column
- [ ] 4.11 Test with missing project images — should show zinc-100 fallback bg
- [ ] 4.12 Verify `pnpm build` succeeds

## Success Criteria

- Hero displays: name with gradient, subtitle, bio text, 2 CTA buttons, personal photo
- Featured section: 3-4 project cards from `featured: true` projects
- About preview: short bio + "Learn More" button
- Mobile: hero stacks (photo top, text bottom), project grid single-column
- Tablet: hero side-by-side, project grid 2-column
- Desktop: hero side-by-side, project grid 3-column
- All links navigate correctly
- Images optimized with Next.js `<Image>`
- No layout shift (CLS < 0.1)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Hero photo missing causes broken layout | Medium | Use placeholder with alt text; bg-zinc-100 on container |
| Project images missing | Medium | `aspect-video bg-zinc-100` provides fallback background |
| Featured projects < 3 | Low | Grid handles 1-2 cards gracefully due to responsive columns |
| Gradient text not clipping properly | Low | Test `.gradient-text` class; `-webkit-background-clip: text` is well supported |

## Next Steps

After home page verified, ensure **Phase 5 (Projects Page)** and **Phase 6 (About Page)** are built. ProjectCard is already created in this phase for reuse.
