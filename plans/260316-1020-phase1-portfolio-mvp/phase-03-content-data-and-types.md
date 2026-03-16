# Phase 3: Content Data & Types

## Context Links
- [System Architecture — Content Schema](../../docs/system-architecture.md)
- [Code Standards — Type Definitions](../../docs/code-standards.md)
- [Codebase Summary — Data Files](../../docs/codebase-summary.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | HIGH |
| Status | Pending |
| Effort | ~2h |
| Depends On | Phase 1 (setup) |
| Description | Define TypeScript interfaces for Project, SkillGroup, Experience. Create JSON data files with sample content. Build content utility functions. |

## Key Insights

- Types defined in `src/types/` for shared use across components
- JSON files in `src/content/` are imported directly (no API calls in Phase 1)
- `resolveJsonModule: true` in tsconfig enables direct JSON imports with type checking
- Content utility functions provide typed access and filtering helpers
- Sample data should be realistic (not lorem ipsum) — Kane's actual projects preferred

## Requirements

### Functional
- TypeScript interfaces for Project, SkillGroup, Experience
- `projects.json` with 4-6 projects (3-4 marked `featured: true`)
- `skills.json` with 3-4 categories (Frontend, Backend, Tools, etc.)
- `experience.json` with 2-3 work experience entries
- Utility functions: `getFeaturedProjects()`, `getAllTechnologies()`, `getProjects()`

### Non-Functional
- All JSON data matches TypeScript interfaces exactly
- JSON files validate against types at build time
- No `any` types — all typed explicitly

## Related Code Files

### Files to Create
| File | Purpose |
|------|---------|
| `src/types/project.ts` | Project interface |
| `src/types/skill.ts` | SkillGroup interface |
| `src/types/experience.ts` | Experience interface |
| `src/types/index.ts` | Barrel export for all types |
| `src/content/projects.json` | Project data (4-6 entries) |
| `src/content/skills.json` | Skills by category |
| `src/content/experience.json` | Work history |
| `src/lib/content.ts` | Content helper functions |

## Implementation Steps

### Step 1: Define TypeScript Interfaces

`src/types/project.ts`:

```typescript
export interface ProjectLink {
  github?: string
  demo?: string
  blog?: string
}

export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  image: string
  technologies: string[]
  featured: boolean
  links: ProjectLink
}
```

`src/types/skill.ts`:

```typescript
export interface SkillGroup {
  category: string
  items: string[]
}
```

`src/types/experience.ts`:

```typescript
export interface Experience {
  company: string
  role: string
  duration: string
  description: string
  highlights: string[]
}
```

`src/types/index.ts`:

```typescript
export type { Project, ProjectLink } from './project'
export type { SkillGroup } from './skill'
export type { Experience } from './experience'
```

### Step 2: Create Projects Data

`src/content/projects.json`:

```json
[
  {
    "id": "portfolio-v2",
    "title": "Portfolio v2",
    "description": "Personal portfolio built with Next.js 15, TypeScript, and Tailwind CSS.",
    "longDescription": "A modern, responsive portfolio website showcasing projects, skills, and experience. Built with Next.js 15 App Router, TypeScript, Tailwind CSS, and shadcn/ui. Features static content management via JSON, editorial minimalist design, and Vercel deployment.",
    "image": "/images/projects/portfolio-v2.png",
    "technologies": ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
    "featured": true,
    "links": {
      "github": "https://github.com/kanenguyen/portfolio-v2",
      "demo": "https://kanenguyen.dev"
    }
  },
  {
    "id": "project-2",
    "title": "Task Management App",
    "description": "Full-stack task management application with real-time updates.",
    "longDescription": "A collaborative task management tool built with React and Node.js. Features include real-time updates via WebSocket, drag-and-drop task reordering, team collaboration, and project-based organization.",
    "image": "/images/projects/task-app.png",
    "technologies": ["React", "Node.js", "PostgreSQL", "WebSocket"],
    "featured": true,
    "links": {
      "github": "https://github.com/kanenguyen/task-app",
      "demo": "https://task-app.example.com"
    }
  },
  {
    "id": "project-3",
    "title": "E-Commerce API",
    "description": "RESTful API for an e-commerce platform with authentication and payments.",
    "longDescription": "Backend API service for an e-commerce platform. Implements user authentication with JWT, product catalog management, shopping cart, Stripe payment integration, and order tracking. Built with Express.js and PostgreSQL.",
    "image": "/images/projects/ecommerce-api.png",
    "technologies": ["Node.js", "Express", "PostgreSQL", "Stripe"],
    "featured": true,
    "links": {
      "github": "https://github.com/kanenguyen/ecommerce-api"
    }
  },
  {
    "id": "project-4",
    "title": "Weather Dashboard",
    "description": "Interactive weather dashboard with location search and 7-day forecasts.",
    "longDescription": "A responsive weather dashboard that displays current conditions, hourly forecasts, and 7-day outlooks. Features location search, geolocation support, and data visualization with charts. Consumes OpenWeatherMap API.",
    "image": "/images/projects/weather-dashboard.png",
    "technologies": ["React", "TypeScript", "Chart.js", "OpenWeatherMap API"],
    "featured": false,
    "links": {
      "github": "https://github.com/kanenguyen/weather-dashboard",
      "demo": "https://weather.example.com"
    }
  },
  {
    "id": "project-5",
    "title": "CLI Productivity Tool",
    "description": "Command-line tool for managing development workflows and shortcuts.",
    "longDescription": "A developer productivity CLI built with Node.js. Automates common development tasks like project scaffolding, git workflows, deployment scripts, and environment setup. Distributed via npm.",
    "image": "/images/projects/cli-tool.png",
    "technologies": ["Node.js", "TypeScript", "Commander.js"],
    "featured": false,
    "links": {
      "github": "https://github.com/kanenguyen/cli-tool"
    }
  }
]
```

> **NOTE:** Replace with Kane's actual projects during implementation. These are realistic placeholders.

### Step 3: Create Skills Data

`src/content/skills.json`:

```json
[
  {
    "category": "Frontend",
    "items": ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML/CSS"]
  },
  {
    "category": "Backend",
    "items": ["Node.js", "Express", "PostgreSQL", "REST APIs", "Python"]
  },
  {
    "category": "Tools & DevOps",
    "items": ["Git", "GitHub", "Docker", "Vercel", "VS Code", "Linux"]
  },
  {
    "category": "Other",
    "items": ["Agile/Scrum", "CI/CD", "Testing", "Technical Writing"]
  }
]
```

### Step 4: Create Experience Data

`src/content/experience.json`:

```json
[
  {
    "company": "Company Name",
    "role": "Software Engineer",
    "duration": "Mar 2025 - Present",
    "description": "Full-stack development for web applications serving thousands of users.",
    "highlights": [
      "Built and maintained React-based frontend features improving user engagement by 20%",
      "Developed RESTful APIs with Node.js and PostgreSQL for core business logic",
      "Collaborated with cross-functional teams using Agile methodology",
      "Implemented automated testing pipelines reducing production bugs by 30%"
    ]
  },
  {
    "company": "University / Bootcamp",
    "role": "Computer Science Student",
    "duration": "2021 - 2024",
    "description": "Bachelor's degree in Computer Science with focus on software engineering.",
    "highlights": [
      "Graduated with honors",
      "Completed capstone project: full-stack web application",
      "Relevant coursework: Data Structures, Algorithms, Web Development, Databases"
    ]
  }
]
```

> **NOTE:** Replace with Kane's actual experience during implementation.

### Step 5: Content Utility Functions

`src/lib/content.ts`:

```typescript
import type { Project, SkillGroup, Experience } from '@/types'
import projectsData from '@/content/projects.json'
import skillsData from '@/content/skills.json'
import experienceData from '@/content/experience.json'

// Type assertions — JSON imports are typed via resolveJsonModule
const projects = projectsData as Project[]
const skills = skillsData as SkillGroup[]
const experience = experienceData as Experience[]

/** Get all projects */
export function getProjects(): Project[] {
  return projects
}

/** Get featured projects (for home page) */
export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured)
}

/** Get unique technology tags across all projects (sorted) */
export function getAllTechnologies(): string[] {
  const techs = new Set<string>()
  projects.forEach((p) => p.technologies.forEach((t) => techs.add(t)))
  return Array.from(techs).sort()
}

/** Get projects filtered by technology */
export function getProjectsByTechnology(tech: string): Project[] {
  return projects.filter((p) =>
    p.technologies.some((t) => t.toLowerCase() === tech.toLowerCase()),
  )
}

/** Get all skill groups */
export function getSkills(): SkillGroup[] {
  return skills
}

/** Get all experience entries */
export function getExperience(): Experience[] {
  return experience
}
```

## Todo List

- [ ] 3.1 Create `src/types/project.ts` with Project and ProjectLink interfaces
- [ ] 3.2 Create `src/types/skill.ts` with SkillGroup interface
- [ ] 3.3 Create `src/types/experience.ts` with Experience interface
- [ ] 3.4 Create `src/types/index.ts` barrel export
- [ ] 3.5 Create `src/content/projects.json` with 4-6 projects
- [ ] 3.6 Create `src/content/skills.json` with skill categories
- [ ] 3.7 Create `src/content/experience.json` with work history
- [ ] 3.8 Create `src/lib/content.ts` with helper functions
- [ ] 3.9 Verify JSON imports compile without errors (`pnpm tsc --noEmit`)
- [ ] 3.10 Add placeholder project images to `public/images/projects/`
- [ ] 3.11 Add placeholder hero image to `public/images/hero/`

## Success Criteria

- All TypeScript interfaces match the content schema in system-architecture.md
- JSON files validate at build time (no type mismatches)
- `getProjects()`, `getFeaturedProjects()`, `getAllTechnologies()` return correct data
- `pnpm tsc --noEmit` passes
- Placeholder images exist in `/public/images/` (can be empty/generic for now)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| JSON import types not inferred correctly | Low | Use explicit type assertions in content.ts |
| Placeholder content looks unprofessional | Medium | Replace with real data ASAP; use realistic sample data |
| Missing images cause broken UI | Medium | Use fallback/placeholder images; handle missing images gracefully |

## Next Steps

After content and types defined, proceed to **Phase 4 (Home Page)**, **Phase 5 (Projects Page)**, and **Phase 6 (About Page)** — these can run in parallel.
