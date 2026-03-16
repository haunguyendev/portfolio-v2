# Codebase Summary

## Project Structure

```
porfolio_v2/
├── .gitignore
├── .env.local (not committed)
├── .env.example
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── postcss.config.mjs
├── vitest.config.ts (Phase 3)
├── playwright.config.ts (Phase 3)
│
├── .next/ (generated)
├── node_modules/
│
├── docs/
│   ├── project-overview-pdr.md
│   ├── codebase-summary.md (this file)
│   ├── code-standards.md
│   ├── system-architecture.md
│   ├── design-guidelines.md
│   ├── deployment-guide.md
│   └── project-roadmap.md
│
├── src/
│   ├── app/
│   │   ├── layout.tsx (root layout, header + footer)
│   │   ├── page.tsx (home page)
│   │   ├── globals.css (global styles, Tailwind directives)
│   │   ├── favicon.ico
│   │   ├── not-found.tsx (404 error page)
│   │   ├── error.tsx (error boundary)
│   │   ├── projects/
│   │   │   ├── page.tsx (projects list page)
│   │   │   └── projects-page-content.tsx (client wrapper with filter state)
│   │   ├── about/
│   │   │   └── page.tsx (about page)
│   │   └── blog/
│   │       └── page.tsx (blog placeholder — "coming soon")
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx (sticky header with logo, nav, mobile-nav)
│   │   │   ├── footer.tsx (social links, copyright)
│   │   │   ├── navigation.tsx (desktop nav with active state)
│   │   │   └── mobile-nav.tsx (hamburger menu, client component)
│   │   ├── home/
│   │   │   ├── hero-section.tsx (split hero: text left, photo right)
│   │   │   ├── featured-projects-section.tsx (featured projects grid)
│   │   │   └── about-preview-section.tsx (bio teaser + CTA)
│   │   ├── projects/
│   │   │   ├── project-card.tsx (project item: title, tech, links)
│   │   │   ├── project-grid.tsx (responsive grid layout)
│   │   │   └── project-filter.tsx (tech tag filters, client component)
│   │   ├── about/
│   │   │   ├── bio-section.tsx (2-column hero: profile photo, bio, social links, resume download CTA)
│   │   │   ├── skills-section.tsx (grouped skill badges)
│   │   │   ├── timeline.tsx (experience timeline container)
│   │   │   └── timeline-item.tsx (single timeline entry)
│   │   └── ui/ (Base UI components via shadcn/ui)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── badge.tsx
│   │
│   ├── content/
│   │   ├── projects.json (project data — seed)
│   │   ├── skills.json (skills categories — seed)
│   │   ├── experience.json (timeline — seed)
│   │   └── blog/ (future — Phase 2)
│   │       └── [slug].mdx
│   │
│   ├── lib/
│   │   ├── utils.ts (cn() for Tailwind class merging, clsx + tailwind-merge)
│   │   ├── constants.ts (site constants: nav links, social links, URLs)
│   │   └── content.ts (content helper functions: getProjects, getFeaturedProjects, etc.)
│   │
│   ├── types/
│   │   ├── project.ts (Project, ProjectLink interfaces)
│   │   ├── experience.ts (Experience interface)
│   │   ├── skill.ts (SkillGroup interface)
│   │   └── index.ts (barrel export of all types)
│   │
│
├── public/
│   ├── favicon.ico
│   ├── og-image.png
│   ├── resume.pdf (downloadable resume)
│   ├── images/
│   │   ├── hero/
│   │   │   └── kane-photo.jpg
│   │   ├── projects/
│   │   │   └── [project images]
│   │   └── icons/
│   │       └── [tech icons — optional]
│   └── robots.txt (Phase 3)
│
└── tests/ (Phase 3)
    ├── unit/
    │   └── lib.test.ts
    └── e2e/
        └── navigation.spec.ts
```

## Key Directories

### `/src/app`
Next.js App Router pages and layouts. Each page file exports default React component.

- `layout.tsx`: Root layout (wraps all pages, contains header + footer)
- `page.tsx`: Home page
- `projects/page.tsx`: Projects list page
- `about/page.tsx`: About page with bio, skills, timeline
- `blog/page.tsx`: Blog placeholder (Phase 2 will expand this)

### `/src/components`
Reusable React components organized by feature/domain.

- `layout/`: Header, footer, navigation (shared across all pages)
- `home/`: Hero, featured projects, about preview (home page specific)
- `projects/`: Project card, grid, filter, tech badge (projects page + home usage)
- `about/`: Bio, skills, timeline (about page specific)
- `common/`: Shared utilities (section title, gradient text, external link)
- `ui/`: shadcn/ui component library (button, card, badge, input, etc.)

### `/src/content`
Static data files (JSON initially, MDX in Phase 2+).

- `projects.json`: Array of project objects with title, description, tech, links
- `skills.json`: Skills grouped by category (Frontend, Backend, Tools)
- `experience.json`: Work experience timeline
- `blog/`: MDX blog posts (Phase 2)

### `/src/lib`
Utility functions and constants.

- `utils.ts`: Helper functions (cn() for Tailwind class merging via clsx)
- `constants.ts`: Site constants (nav links, URLs, social links)
- `types.ts`: Alternative location for shared types

### `/src/types`
TypeScript type definitions (can also co-locate with components).

- `project.ts`: Project shape
- `experience.ts`: Experience/timeline shape
- `skill.ts`: Skill shape
- `blog.ts`: Blog post shape (Phase 2)

### `/src/styles`
Global CSS and theme configuration.

- `globals.css`: Tailwind @apply directives, global HTML styles
- `theme.css`: CSS variables for custom gradients (optional)

### `/public`
Static assets (images, icons, manifests).

- `images/hero/`: Personal photo for home hero
- `images/projects/`: Project screenshots/demos
- `og-image.png`: Default OG image for social sharing
- `robots.txt`: SEO (Phase 3)

## File Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Components | kebab-case.tsx | project-card.tsx, hero-section.tsx |
| Utilities | kebab-case.ts | api-client.ts, string-utils.ts |
| Types | kebab-case.ts | project.ts, experience.ts |
| Content | kebab-case.json/.mdx | projects.json, getting-started.mdx |
| CSS | kebab-case.css | globals.css, theme.css |
| Pages | page.tsx | (not renamed, Next.js convention) |
| Layouts | layout.tsx | (not renamed, Next.js convention) |

## Component File Organization

**One component per file.** If a component has related smaller components, keep them in the same file or create a `{name}-parts` file:

```
project-card.tsx
// Exports: ProjectCard (default or named export)

project-details.tsx
// Exports: ProjectDetails, ProjectDetailsHeader, ProjectDetailsFooter
// OR create project-details-parts.tsx
```

## Data Files Organization

**JSON data files in `/src/content` are the single source of truth** for content. Components import and render this data.

Example: `/src/content/projects.json`
```json
[
  {
    "id": "project-1",
    "title": "Project Name",
    "description": "Short description",
    "longDescription": "Longer description for detail page",
    "image": "/images/projects/project-1.png",
    "technologies": ["Next.js", "TypeScript", "Tailwind CSS"],
    "featured": true,
    "links": {
      "github": "https://github.com/...",
      "demo": "https://..."
    }
  }
]
```

Components fetch/import and display this data:

```typescript
// src/components/projects/project-grid.tsx
import projects from '@/content/projects.json'

export function ProjectGrid() {
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript compiler settings, path aliases (@/) |
| `tailwind.config.ts` | Tailwind CSS customization (colors, fonts, spacing) |
| `next.config.ts` | Next.js build settings (images, redirects, etc.) |
| `postcss.config.mjs` | PostCSS plugins (Tailwind requires this) |
| `vitest.config.ts` | Vitest settings (Phase 3) |
| `playwright.config.ts` | Playwright e2e test settings (Phase 3) |
| `.env.example` | Template for environment variables |
| `.gitignore` | Files to exclude from git |

## Dependencies Overview (Initial)

### Production
- `next@15`: Framework
- `react@19`: UI library
- `typescript@5`: Type checking
- `tailwindcss@4`: Styling
- `shadcn-ui`: Component library (installed via CLI)
- `lucide-react`: Icons
- `clsx` / `tailwind-merge`: Class name utilities

### Development
- `@types/node`, `@types/react`: Type definitions
- `postcss`: CSS processing
- `eslint`, `prettier`: Linting/formatting
- `vitest`: Unit testing (Phase 3)
- `@playwright/test`: E2E testing (Phase 3)

## Import Path Aliases

In `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage: `import { utils } from '@/lib/utils'` (instead of `../../../lib/utils`)

## Build Output

- `.next/`: Next.js build output (gitignored)
- `dist/`: Not used (Next.js doesn't output to dist/)
- Static exports go to `.next/static/` (optimized by Next.js)

## Phase 2 Additions

When blog system is added:

- `/src/content/blog/`: Directory for `.mdx` files
- `src/lib/mdx-utils.ts`: Markdown parsing utilities
- `src/components/blog/`: Blog-specific components (post card, TOC, etc.)
- Tests for blog logic

## Phase 3 Additions

- `/tests/unit/`: Vitest unit tests
- `/tests/e2e/`: Playwright e2e tests
- `src/hooks/`: Custom React hooks
- `/public/robots.txt`: SEO robot instructions
- `/public/sitemap.xml`: SEO sitemap (generated)

## Phase 4 Additions

- `src/app/api/`: API routes (comments, views, etc.)
- `src/db/`: Database schemas and queries (Drizzle ORM)
- `src/actions/`: Server actions for mutations
- Migration files and DB setup scripts
