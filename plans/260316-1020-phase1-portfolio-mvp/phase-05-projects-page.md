# Phase 5: Projects Page

## Context Links
- [System Architecture — Projects Page Layout](../../docs/system-architecture.md)
- [Design Guidelines — Cards, Badges, Grid](../../docs/design-guidelines.md)
- [Phase 3: Content Data](./phase-03-content-data-and-types.md)
- [Phase 4: Home Page](./phase-04-home-page.md) — ProjectCard built here

## Overview

| Field | Value |
|-------|-------|
| Priority | HIGH |
| Status | Pending |
| Effort | ~3h |
| Depends On | Phase 2 (layout), Phase 3 (content/types), Phase 4 (ProjectCard) |
| Description | Full project listing page with tech tag filtering. Reuses ProjectCard from Phase 4. Adds ProjectGrid container and ProjectFilter (client component for tag toggle). |

## Key Insights

- `ProjectCard` already built in Phase 4 — reuse directly
- `ProjectFilter` needs `'use client'` for interactive tag toggling (useState)
- `ProjectGrid` is a simple server wrapper — just maps projects to cards
- Filter works by extracting unique tech tags from all projects, user clicks to filter
- URL-based filtering (query params) is overkill for Phase 1 — local state is sufficient
- "All" option should be default (show all projects)

## Requirements

### Functional
- Page title "Projects" + description text
- Filter bar showing unique tech tags as clickable badges
- "All" filter option (default, shows everything)
- Project grid displaying all/filtered projects
- Responsive grid: 1 col mobile → 2 col tablet → 3 col desktop

### Non-Functional
- ProjectFilter is client component (`'use client'`)
- ProjectGrid/ProjectCard are server-compatible (but rendered within client boundary)
- Semantic HTML: `<section>`, `<h1>`
- Page metadata: `title: "Projects | Kane Nguyen"`

## Related Code Files

### Files to Create
| File | Component | Type |
|------|-----------|------|
| `src/components/projects/project-grid.tsx` | ProjectGrid | Server |
| `src/components/projects/project-filter.tsx` | ProjectFilter | Client |
| `src/app/projects/page.tsx` | ProjectsPage | Server/Client hybrid |

### Files Reused (from Phase 4)
| File | Component |
|------|-----------|
| `src/components/projects/project-card.tsx` | ProjectCard |

## Architecture

```
ProjectsPage (page.tsx)
├── Page header (h1 + description)
└── ProjectsPageContent (client component)
    ├── ProjectFilter
    │   └── Badge × N (one per unique tech tag + "All")
    └── ProjectGrid
        └── ProjectCard × N (filtered)
```

**Why a client wrapper?** The filter state must be shared between `ProjectFilter` (sets state) and `ProjectGrid` (reads state). Simplest approach: wrap both in a single client component that owns the state.

## Implementation Steps

### Step 1: ProjectGrid Component

`src/components/projects/project-grid.tsx`:

```tsx
import { ProjectCard } from '@/components/projects/project-card'
import type { Project } from '@/types'

interface ProjectGridProps {
  projects: Project[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">No projects found matching this filter.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

**Notes:**
- Accepts `projects` as prop — filtering logic lives in parent
- Empty state handled with friendly message
- Same grid layout as FeaturedProjectsSection

### Step 2: ProjectFilter Component

`src/components/projects/project-filter.tsx`:

```tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProjectFilterProps {
  technologies: string[]
  selectedTech: string | null
  onFilterChange: (tech: string | null) => void
}

export function ProjectFilter({
  technologies,
  selectedTech,
  onFilterChange,
}: ProjectFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* "All" option */}
      <button
        onClick={() => onFilterChange(null)}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
      >
        <Badge
          variant={selectedTech === null ? 'default' : 'secondary'}
          className={cn(
            'cursor-pointer transition-colors',
            selectedTech === null
              ? 'bg-zinc-900 text-white hover:bg-zinc-800'
              : 'hover:bg-zinc-200'
          )}
        >
          All
        </Badge>
      </button>

      {/* Tech tag options */}
      {technologies.map((tech) => (
        <button
          key={tech}
          onClick={() => onFilterChange(tech)}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
        >
          <Badge
            variant={selectedTech === tech ? 'default' : 'secondary'}
            className={cn(
              'cursor-pointer transition-colors',
              selectedTech === tech
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'hover:bg-zinc-200'
            )}
          >
            {tech}
          </Badge>
        </button>
      ))}
    </div>
  )
}
```

**Design Details:**
- Badge-style filter buttons: active = zinc-900 bg (dark), inactive = zinc-100 bg (light)
- `rounded-full` on both button and Badge
- Focus ring for keyboard accessibility
- `null` selectedTech = "All" selected
- Uses `cn()` for conditional class merging

### Step 3: Projects Page (Client Wrapper Pattern)

`src/app/projects/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { ProjectsPageContent } from './projects-page-content'
import { getProjects, getAllTechnologies } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore my projects — web applications, APIs, tools, and more.',
}

export default function ProjectsPage() {
  const projects = getProjects()
  const technologies = getAllTechnologies()

  return (
    <div className="section-spacing">
      <div className="container-main">
        {/* Page header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3">
            Projects
          </h1>
          <p className="text-base text-zinc-500 max-w-2xl">
            A collection of projects I've built — from full-stack web apps to
            developer tools. Each project reflects my passion for clean code
            and thoughtful design.
          </p>
        </div>

        {/* Filter + Grid (interactive) */}
        <ProjectsPageContent
          projects={projects}
          technologies={technologies}
        />
      </div>
    </div>
  )
}
```

Create the client wrapper:

`src/app/projects/projects-page-content.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { ProjectFilter } from '@/components/projects/project-filter'
import { ProjectGrid } from '@/components/projects/project-grid'
import type { Project } from '@/types'

interface ProjectsPageContentProps {
  projects: Project[]
  technologies: string[]
}

export function ProjectsPageContent({
  projects,
  technologies,
}: ProjectsPageContentProps) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null)

  const filteredProjects = selectedTech
    ? projects.filter((p) =>
        p.technologies.some(
          (t) => t.toLowerCase() === selectedTech.toLowerCase(),
        ),
      )
    : projects

  return (
    <>
      {/* Filter bar */}
      <div className="mb-8">
        <ProjectFilter
          technologies={technologies}
          selectedTech={selectedTech}
          onFilterChange={setSelectedTech}
        />
      </div>

      {/* Project grid */}
      <ProjectGrid projects={filteredProjects} />
    </>
  )
}
```

**Pattern explained:**
- `page.tsx` is a server component — fetches data, renders metadata
- `ProjectsPageContent` is a client component — owns filter state
- Data passed as props (server → client serialization boundary)
- Filtering done client-side (no API calls, instant response)

## Todo List

- [ ] 5.1 Create `src/components/projects/project-grid.tsx` (grid layout + empty state)
- [ ] 5.2 Create `src/components/projects/project-filter.tsx` (tech tag badges, click to filter)
- [ ] 5.3 Create `src/app/projects/projects-page-content.tsx` (client wrapper with filter state)
- [ ] 5.4 Create `src/app/projects/page.tsx` (server page, metadata, data fetching)
- [ ] 5.5 Test: all projects display in grid by default
- [ ] 5.6 Test: clicking a tech tag filters projects to only those with that tech
- [ ] 5.7 Test: clicking "All" resets filter and shows all projects
- [ ] 5.8 Test: empty state message shows when filter has no matches
- [ ] 5.9 Test: responsive grid — 1 col mobile, 2 col tablet, 3 col desktop
- [ ] 5.10 Test: keyboard accessibility — tab to filter badges, Enter to select
- [ ] 5.11 Verify page title "Projects | Kane Nguyen" in browser tab
- [ ] 5.12 Verify `pnpm build` succeeds

## Success Criteria

- All projects from `projects.json` display in responsive grid
- Filter badges show all unique technologies
- Clicking a badge filters instantly (client-side)
- "All" badge is selected by default with dark styling
- Empty state message shown when no matches
- Page metadata renders correctly
- Keyboard accessible (tab + enter on filter badges)
- Grid responsive across breakpoints

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Many tech tags overflow filter bar | Low | `flex-wrap` handles wrapping naturally |
| Serialization issue at server/client boundary | Low | Projects are plain objects (no functions, dates), serialize fine |
| Filter case sensitivity mismatch | Low | Compare lowercase in filter logic |

## Next Steps

After Projects page verified, ensure **Phase 6 (About Page)** is built. Then proceed to **Phase 7 (Blog + Error Pages)**.
