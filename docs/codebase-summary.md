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

**Layout Components** (`layout/`):
- `header.tsx` (client) — Sticky header with logo, nav, theme toggle, command menu
- `logo.tsx` — SVG logo link to home (switches logo-light/logo-dark)
- `navigation.tsx` (client) — Desktop nav with active state detection (Home, Projects, About, Diary, Blog)
- `mobile-nav.tsx` (client) — Hamburger menu overlay (mobile-only) with Escape key handler
- `theme-toggle.tsx` (client) — Light/dark/system theme switcher via Dropdown
- `theme-provider.tsx` — Next-themes wrapper
- `command-menu.tsx` (client, lazy) — ⌘K command palette (lazy-loaded for performance)
- `footer.tsx` — Multi-column footer with nav, socials, copyright

**Home Components** (`home/`):
- `hero-section.tsx` — Split layout: TypewriterHeading + RotatingText (left), personal photo (right)
- `featured-projects-section.tsx` — 3-col grid of featured projects with category badges
- `about-preview-section.tsx` — Bento grid: bio, stats, TechStackTabs (lazy)
- `tech-stack-tabs.tsx` (client, lazy) — 5 tech category tabs with icons, Framer Motion, lazy-loaded
- `animated-cta-card.tsx` (client) — Gradient orbs, particles, resume download (Framer Motion)
- `contact-section.tsx` — 2-col: AnimatedCtaCard + contact methods (email, social links)
- `latest-blog-section.tsx` — Blog placeholder ("Coming soon")

**Projects Components** (`projects/`):
- `project-card.tsx` — Project item: image, title, desc, category badge, tech badges, links, role, impact
- `project-grid.tsx` — Responsive 3-col grid or empty state
- `project-filter.tsx` (client) — Tech tag filtering buttons with type="button" attributes

**About Components** (`about/`):
- `bio-section.tsx` — Profile photo + bio + socials (GitHub, LinkedIn, Twitter) + resume button
- `github-stats-section.tsx` (client) — Live GitHub API fetch: repos count, followers, contribution graph
- `life-source-code.tsx` (client) — Animated terminal showing code + lifestyle philosophy (char-by-char typing, infinite loop)
- `skills-section.tsx` (client) — TechStackTabs (lazy) + soft skills badges
- `timeline.tsx` — Experience timeline container
- `timeline-item.tsx` — Single timeline entry (dot, connector, role/highlights)

**UI Primitives** (`ui/`):
- `button.tsx` — CVA variants (default, outline, secondary, ghost, destructive, link) + sizes
- `card.tsx` — Composable: Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter
- `badge.tsx` — Tech tag variants (default, secondary, destructive, outline, ghost, link)
- `dialog.tsx` — Full compound dialog component (Dialog, Trigger, Overlay, etc.)
- `dropdown-menu.tsx` — Menu compound component from @base-ui/react
- `typewriter-heading.tsx` (client) — Custom typewriter effect with Framer Motion cursor (hydration-safe)
- `rotating-text.tsx` (client) — Custom rotating text with Framer Motion (hydration-safe)
- `animated-page-title.tsx` (client) — Page title animation (fade + slide-up transition) on route change

### `/src/content`
Static data files (JSON initially, MDX in Phase 2+).

**projects.json** — 6 projects (3 featured, categorized) with extended metadata:
```typescript
// Each project includes:
id, title, description, longDescription, image, technologies[], featured, category,
categoryLabel, links{github?, demo?, blog?}, role, teamSize, impact, startDate, endDate

// Categories: "personal", "company", "freelance"
// Example:
// - 2 Company projects (Promete Technology: CRM Platform, Inventory System)
// - 2 Freelance projects (Restaurant Website, Dental Clinic Booking)
// - 2 Personal projects (Portfolio v2, Weather Dashboard)
```

**skills.json** — Skills grouped by 5 categories:
```typescript
[
  { category: "Frontend", items: [...] },
  { category: "Backend", items: [...] },
  { category: "Tools & DevOps", items: [...] },
  { category: "Database", items: [...] },
  { category: "Cloud & Services", items: [...] }
]

// Expanded from ~12 to 20+ technologies
// New additions: MySQL, SQL Server, Cloudflare, macOS, etc.
```

**experience.json** — Work experience timeline (3 entries):
```typescript
[
  // 1. Promete Technology — Fullstack Developer (2024-Present)
  // 2. FPT Software — Backend Intern .NET, Team Lead of 10 (2022-2024)
  // 3. FPT University — CS Student (2020-2024)
  { company, role, duration, description, highlights[], teamSize? }
]
```

**blog/** — MDX blog posts (Phase 2)

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

## Dependencies Overview (Phase 1)

### Production
- `next@16.1.6`: App Router, SSG, optimized deployment
- `react@19.2.3`: UI library with latest features
- `typescript@^5.4`: Strict type checking
- `tailwindcss@4.2.1`: Utility-first CSS with tree-shaking
- `@base-ui/react`: Accessible UI components (dropdown-menu, button patterns)
- `tailwind-merge`: Merge Tailwind classes without conflicts
- `class-variance-authority`: CVA for component variants
- `clsx`: Conditional class names
- `lucide-react`: Icon library for UI elements
- `react-icons`: Additional icon sets (optional)
- `framer-motion@11+`: Animations for TypewriterHeading, RotatingText, TechStackTabs, LifeSourceCode
- `cmdk`: Command palette UI (⌘K, lazy-loaded)
- `next-themes`: Theme switching (light/dark/system)
- (No external animation libraries beyond Framer Motion)

### Development
- `@types/node`, `@types/react`: Type definitions
- `postcss`: CSS processor for Tailwind
- `eslint`: Code linting (extends next/core-web-vitals)
- `prettier`: Code formatting (2-space, 80-char limit)
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

## Phase 2 Additions (Starting)

Blog system + Diary content management:

- `/src/content/blog/`: Directory for `.mdx` files with frontmatter (title, date, tags, description)
- `/src/content/diary/`: Directory for `.mdx` files for journal/personal posts
- `src/lib/mdx-utils.ts`: Markdown parsing utilities, frontmatter extraction
- `src/components/blog/`: Blog-specific components (BlogPostCard, BlogPostList, RelatedPosts, etc.)
- `src/app/blog/[slug]/page.tsx`: Dynamic blog detail route (ISR)
- `src/app/diary/[slug]/page.tsx`: Dynamic diary detail route (ISR)
- Update blog/diary list pages to display actual posts
- Reading time calculation utilities
- Tests for blog/diary logic

## Phase 3 Additions (SEO & Polish)

- `/tests/unit/`: Vitest unit tests
- `/tests/e2e/`: Playwright e2e tests
- `src/hooks/`: Custom React hooks (useScrollY, useTheme, etc.)
- `/public/robots.txt`: SEO robot instructions
- `/public/sitemap.xml`: SEO sitemap (generated programmatically)
- Dark mode refinements (CSS variables, theme transitions)
- Performance monitoring (Lighthouse CI, Core Web Vitals)

## Phase 4 Additions

- `src/app/api/`: API routes (comments, views, etc.)
- `src/db/`: Database schemas and queries (Drizzle ORM)
- `src/actions/`: Server actions for mutations
- Migration files and DB setup scripts
