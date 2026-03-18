# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Vercel CDN                       │
│              (Static assets, JS bundles)             │
└────────────────────┬────────────────────────────────┘
                     │
┌─────────────────────┴────────────────────────────────┐
│          Next.js Server (Vercel Serverless)         │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐   │
│  │ App Router   │  │ Static Gen   │  │ Render │   │
│  │ (Pages)      │  │ (SSG)        │  │ (SSR)  │   │
│  └──────────────┘  └──────────────┘  └────────┘   │
└─────────────────────┬────────────────────────────────┘
                      │
      ┌───────────────┼───────────────┐
      │               │               │
┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼──────┐
│ JSON Data │  │ Public    │  │ External   │
│ Files     │  │ Assets    │  │ APIs       │
│           │  │ (Images)  │  │ (Phase 4)  │
└───────────┘  └───────────┘  └────────────┘
```

**Key Points (Phase 1-3):**
- **Next.js 15** App Router for pages and routing
- **Static generation (SSG)** for all pages
- **Content from local JSON files + MDX** (Phase 1-2)
- **Vercel** handles deployment, caching, CDN, and serverless functions

## Production Architecture (Current — Phase 4B)

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub                                  │
│  Push to main → GitHub Actions                              │
│  ├── Build web Docker image (Next.js standalone)            │
│  ├── Build api Docker image (NestJS)                        │
│  ├── Push to GHCR (ghcr.io/haunguyendev/portfolio-v2)      │
│  └── SSH via Cloudflare Tunnel → deploy                     │
└─────────────────────────┬───────────────────────────────────┘
                          │ SSH (deploy.haunguyendev.xyz)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           Ubuntu Server (Proxmox VM 101)                     │
│           LAN: 192.168.1.123                                 │
│                                                              │
│  ┌────────────────── Docker Network ──────────────────┐     │
│  │                                                     │     │
│  │  ┌─────────┐    ┌─────────┐    ┌──────────────┐   │     │
│  │  │  web    │───►│  api    │───►│  PostgreSQL  │   │     │
│  │  │ :3000   │    │ :3001   │    │  :5432       │   │     │
│  │  │ Next.js │    │ NestJS  │    │  16-alpine   │   │     │
│  │  │standalone│   │ GraphQL │    └──────────────┘   │     │
│  │  └─────────┘    │ Prisma  │                        │     │
│  │                  │ JWT     │    ┌──────────────┐   │     │
│  │                  │ Sharp   │───►│    MinIO     │   │     │
│  │                  │ Puppeteer   │  :9000/:9001 │   │     │
│  │                  └─────────┘    │  S3-compat   │   │     │
│  │                                  └──────────────┘   │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌──────────┐   ┌──────────────┐                            │
│  │Portainer │   │ cloudflared  │ ← Tunnel to Cloudflare     │
│  │  :9443   │   │  (systemd)   │                            │
│  └──────────┘   └──────────────┘                            │
└──────────────────────────────────────────────────────────────┘
                          │
                    Cloudflare Tunnel
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                 Cloudflare DNS                               │
│  portfolio.haunguyendev.xyz     → web (:3000)               │
│  portfolio-api.haunguyendev.xyz → api (:3001)               │
│  deploy.haunguyendev.xyz        → SSH (:22)                 │
│  portfolio-portainer.haunguyendev.xyz → Portainer (:9443)   │
└─────────────────────────────────────────────────────────────┘
```

**Production Stack:**
- **Turborepo monorepo** — apps/web, apps/api, packages/prisma, packages/shared
- **Next.js frontend** (Docker, standalone) — ISR revalidation, image uploads
- **NestJS GraphQL API** (Docker) — Code-first schema, 5+ resolvers, JWT mutations
- **NestJS Media Service** — Upload, serve, delete with sharp processing
- **NestJS Resume Module** — CV upload, PDF generation via Puppeteer, active resume management
- **MinIO S3-compatible storage** (Docker) — Self-hosted image + resume PDF storage
- **Puppeteer PDF generation** — HTML → PDF conversion for resume templates
- **sharp image processing** — Resize 1920px max, WebP q80 + thumbnail 400px q70
- **PostgreSQL 16** (Docker) — With healthcheck, persistent volume
- **Prisma ORM** — Auto-migrated via entrypoint script
- **Better Auth + GitHub OAuth** — Secure admin authentication via GitHub (haunguyendev account only)
- **Admin dashboard** (/admin/*) — CRUD pages with TipTap editor + image dropzone + resume management
- **Chromium** — Headless browser for Puppeteer PDF rendering (Alpine image)
- **Cloudflare Tunnel** — Expose services without public IP/port forwarding
- **GitHub Actions CI/CD** — Build → GHCR → SSH deploy
- **Release Please** — Automated versioning and changelog
- **Portainer CE** — Container monitoring UI

## Data Flow (Phase 1-2 Final)

```
┌──────────────────────────────────────────────────────────────┐
│              Content Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │projects.json │  │ skills.json  │  │ experience.json  │  │
│  │ (static)     │  │ (static)     │  │ (static)         │  │
│  │ +category    │  │              │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     Velite MDX Processing (Phase 2)                  │   │
│  │  ┌─────────────────┐  ┌─────────────────────────┐    │   │
│  │  │ content/blog/   │  │ content/diary/         │    │   │
│  │  │ *.mdx files     │  │ *.mdx files            │    │   │
│  │  │ (frontmatter    │  │ (date, mood, etc.)     │    │   │
│  │  │  + markdown)    │  │                        │    │   │
│  │  └────────┬────────┘  └────────┬───────────────┘    │   │
│  │           │                    │                    │   │
│  │  Rehype plugins:  Remark plugins: remark-gfm       │   │
│  │  - rehype-slug   (auto heading IDs)                │   │
│  │  - pretty-code   (syntax highlighting)             │   │
│  │  - autolink      (anchor links)                     │   │
│  │           │                    │                    │   │
│  │           └────────┬───────────┘                    │   │
│  │                    │                                │   │
│  │  Output: .velite/index compiled MDX data            │   │
│  │  { blogs: Blog[], diaries: Diary[] }                │   │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                         │
└───────────────────┼─────────────────────────────────────────┘
          ┌─────────┴─────────────────────────┐
          │                                   │
          ├──→ GitHub API (haunguyendev)      │
          │    - Repos                        │
          │    - Followers                    │
          │    - Contribution Graph           │
          │                                   │
┌─────────▼────────────────────────┬──────────▼─────────────────┐
│         Component Layer                                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Blog Components (Phase 2)                                │ │
│  │ - BlogPostCard, BlogPostList, BlogTagFilter             │ │
│  │ - BlogTableOfContents, MdxContent, MdxComponents        │ │
│  │ Diary Components (Phase 2)                               │ │
│  │ - DiaryEntryCard, DiaryEntryList, DiaryMoodFilter       │ │
│  │ - DiaryMoodBadge                                         │ │
│  │ Shared Components (Phase 2)                              │ │
│  │ - ShareButtons, ReadingTime, DateFormatter              │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │ ProjectCard          │  │ SkillBadge           │           │
│  │ ProjectGrid          │  │ TimelineItem         │           │
│  │ ProjectFilter        │  │ BiographySection     │           │
│  │ CategoryBadge        │  │ GitHubStatsSection   │           │
│  └──────────────────────┘  └──────────────────────┘           │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │ HeroSection          │  │ FeaturedProjectsGrid │           │
│  │ TypewriterHeading    │  │ LifeSourceCode       │           │
│  │ RotatingText         │  │ AnimatedPageTitle    │           │
│  │ TechStackTabs        │  │ CommandMenu (lazy)   │           │
│  │ AnimatedCtaCard      │  │ ThemeToggle          │           │
│  │ ContactSection       │  │ LatestBlogSection    │           │
│  │                      │  │ LatestDiarySection   │           │
│  │                      │  │ Footer               │           │
│  └──────────────────────┘  └──────────────────────┘           │
└─────────────────────┬──────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│         Page Layer (Next.js Routes)                         │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │ page.tsx (Home)      │  │ projects/page.tsx    │         │
│  │ about/page.tsx       │  │ blog/page.tsx        │         │
│  │ diary/page.tsx       │  │ blog/[slug]/page.tsx │         │
│  │ layout.tsx (root)    │  │ diary/[slug]/page.tsx│         │
│  │ feed.xml/route.ts    │  │ (RSS feed)           │         │
│  └──────────────────────┘  └──────────────────────┘         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│         Browser / User                                      │
│  Rendered HTML + CSS + JavaScript (lazy-loaded components) │
└─────────────────────────────────────────────────────────────┘
```

**Flow:**
1. **Phase 1 Data:** JSON files + GitHub API fetch static/dynamic data
2. **Phase 2 Data:** Velite processes MDX → compiles to .velite/ → runtime imports
3. Components import and render data (both static JSON and compiled MDX)
4. Pages compose components to display content
5. Next.js SSG pre-renders static pages at build time
6. Client-side hydration for interactive components
7. Browser receives optimized HTML + CSS + minimal JS
8. Lazy-loaded components (CommandMenu, TechStackTabs) load on demand

## Page Routes & Components

### Home Page (`src/app/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│   Header (sticky, lazy CommandMenu) │
├─────────────────────────────────────┤
│       Hero Section (split)          │
│  Typewriter + RotatingText | Photo  │
├─────────────────────────────────────┤
│  Featured Projects (3-col grid)     │
│  [ProjectCard] [ProjectCard] [Card] │
├─────────────────────────────────────┤
│ About Preview (bento + TechTabs)    │
│  [Bio] [Stats] [TechStackTabs]      │
├─────────────────────────────────────┤
│   Latest Blog (placeholder)         │
├─────────────────────────────────────┤
│  Contact Section (2-col)            │
│  [AnimatedCtaCard] [Contact Info]   │
├─────────────────────────────────────┤
│        Footer (multi-col)           │
└─────────────────────────────────────┘
```

**Components Used (Server + Client):**
- `Header` (client) — Sticky, with lazy-loaded CommandMenu
- `HeroSection` (server) — TypewriterHeading (client) + RotatingText (client) + photo
- `FeaturedProjectsSection` (server) — ProjectGrid with featured=true
- `AboutPreviewSection` (client) — Bento layout, lazy TechStackTabs
- `LatestBlogSection` (server) — Placeholder
- `ContactSection` (server) — AnimatedCtaCard (client) + socials
- `Footer` (server)

### Projects Page (`src/app/projects/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│        Header / Navigation          │
├─────────────────────────────────────┤
│    Page Title + Description         │
├─────────────────────────────────────┤
│    Filter Controls                  │
│  [Tech Filter] [Sort Options]       │
├─────────────────────────────────────┤
│    Projects Grid                    │
│  [Card] [Card] [Card]               │
│  [Card] [Card] [Card]               │
├─────────────────────────────────────┤
│        Footer                       │
└─────────────────────────────────────┘
```

**Components Used:**
- `Header`
- `ProjectFilter`: Filter by technology
- `ProjectGrid`: Grid of project cards
- `ProjectCard`: Individual project item (title, tech, links)
- `TechBadge`: Technology tag
- `Footer`

### About Page (`src/app/about/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│        Header / Navigation          │
├─────────────────────────────────────┤
│   Page Title                        │
├─────────────────────────────────────┤
│   Bio Section                       │
│   [Longer biography text]           │
├─────────────────────────────────────┤
│   Skills Section                    │
│   [Skill Category] [Badges] [etc]   │
├─────────────────────────────────────┤
│   Experience Timeline               │
│   [Timeline Item]                   │
│   [Timeline Item]                   │
│   [Timeline Item]                   │
├─────────────────────────────────────┤
│        Footer                       │
└─────────────────────────────────────┘
```

**Components Used:**
- `Header`
- `BioSection`: Full biography
- `SkillsSection`: Skills grouped by category
- `SkillBadge`: Individual skill badge
- `Timeline`: Experience timeline container
- `TimelineItem`: Individual timeline entry
- `Footer`

### Blog Page (`src/app/blog/page.tsx`)

**Phase 1 Status:** Placeholder page ("Coming soon")

**Phase 2 Status:** Fully implemented with Velite integration

```
┌─────────────────────────────────────┐
│        Header / Navigation          │
├─────────────────────────────────────┤
│    Page Title + Description         │
├─────────────────────────────────────┤
│    Tag Filter (client-side)         │
│  [All] [Tag1] [Tag2] [Tag3]         │
├─────────────────────────────────────┤
│    Blog Post List                   │
│  [Post Card] [Post Card]            │
│  [Post Card] [Post Card]            │
│  (sorted by date, newest first)     │
├─────────────────────────────────────┤
│        Footer                       │
└─────────────────────────────────────┘
```

**Blog Detail Page (`src/app/blog/[slug]/page.tsx`):**
```
┌─────────────────────────────────────┐
│        Header / Navigation          │
├─────────────────────────────────────┤
│    Page Title (h1)                  │
│    Meta: Date | Reading time        │
│    Tags (as badges)                 │
├─────────────────────────────────────┤
│    Table of Contents (TOC)          │
│    [generated from h2/h3 headings]  │
├─────────────────────────────────────┤
│    MDX Content                      │
│    (syntax-highlighted code blocks) │
│    (headings with anchor links)     │
│    (GitHub-flavored markdown)       │
├─────────────────────────────────────┤
│    Share Buttons (Twitter, LinkedIn)│
│    [Copy Link]                      │
├─────────────────────────────────────┤
│        Footer                       │
└─────────────────────────────────────┘
```

### Diary Page (`src/app/diary/page.tsx`)

**Phase 2 Status:** Fully implemented with mood filtering

```
┌─────────────────────────────────────┐
│        Header / Navigation          │
├─────────────────────────────────────┤
│    Page Title + Description         │
├─────────────────────────────────────┤
│    Mood Filter (client-side)        │
│  [All] [Happy] [Sad] [etc]          │
├─────────────────────────────────────┤
│    Diary Entry List                 │
│  [Entry Card] [Entry Card]          │
│  [Entry Card] [Entry Card]          │
│  (sorted by date, newest first)     │
├─────────────────────────────────────┤
│        Footer                       │
└─────────────────────────────────────┘
```

**Diary Detail Page (`src/app/diary/[slug]/page.tsx`):**
```
┌─────────────────────────────────────┐
│        Header / Navigation          │
├─────────────────────────────────────┤
│    Page Title (h1)                  │
│    Meta: Date | Reading time        │
│    Mood Badge (emoji + color)       │
├─────────────────────────────────────┤
│    MDX Content                      │
│    (syntax-highlighted code blocks) │
│    (headings with anchor links)     │
│    (GitHub-flavored markdown)       │
├─────────────────────────────────────┤
│    Share Buttons                    │
│    [Copy Link]                      │
├─────────────────────────────────────┤
│        Footer                       │
└─────────────────────────────────────┘
```

### RSS Feed (`src/app/feed.xml/route.ts`)

**Phase 2 Status:** Implemented at `/feed.xml`

- Generates RSS feed from published blog posts
- Includes title, description, date, link for each post
- Updated on rebuild (static generation)

## Component Hierarchy (Phase 1 Final)

```
RootLayout
├── Header
│   ├── Logo
│   ├── Navigation (desktop)
│   │   ├── Home (Link)
│   │   ├── Projects (Link)
│   │   ├── About (Link)
│   │   ├── Blog (Link)
│   │   └── Diary (Link)
│   ├── ThemeToggle (light/dark/system)
│   ├── CommandMenu (lazy-loaded, ⌘K)
│   └── MobileNav (hamburger, mobile-only)
├── PageContent (varies per page)
│   ├── HomePage
│   │   ├── AnimatedPageTitle
│   │   ├── HeroSection
│   │   │   ├── TypewriterHeading
│   │   │   ├── RotatingText
│   │   │   └── PersonalPhoto
│   │   ├── FeaturedProjectsSection
│   │   │   └── ProjectGrid
│   │   │       └── ProjectCard (×featured projects)
│   │   │           └── CategoryBadge
│   │   ├── AboutPreviewSection
│   │   │   ├── BioTeaser
│   │   │   ├── StatsSection
│   │   │   └── TechStackTabs (lazy)
│   │   ├── ContactSection
│   │   │   ├── AnimatedCtaCard
│   │   │   └── ContactMethods
│   │   └── LatestBlogSection (placeholder)
│   ├── ProjectsPage
│   │   ├── AnimatedPageTitle
│   │   ├── ProjectFilter
│   │   └── ProjectGrid
│   │       └── ProjectCard (×all projects)
│   │           ├── ProjectImage
│   │           ├── CategoryBadge
│   │           └── TechBadges
│   ├── AboutPage
│   │   ├── AnimatedPageTitle
│   │   ├── BioSection
│   │   │   ├── ProfilePhoto
│   │   │   ├── BioText
│   │   │   ├── SocialLinks
│   │   │   └── ResumeButton
│   │   ├── GitHubStatsSection
│   │   │   ├── ReposCount
│   │   │   ├── FollowersCount
│   │   │   └── ContributionGraph
│   │   ├── SkillsSection
│   │   │   └── TechStackTabs (lazy)
│   │   ├── LifeSourceCode
│   │   │   └── AnimatedTerminal (char-by-char typing)
│   │   └── Timeline
│   │       └── TimelineItem (×experiences)
│   ├── DiaryPage
│   │   └── "Coming soon" placeholder
│   └── BlogPage
│       └── "Coming soon" placeholder
└── Footer
    ├── SocialLinks
    ├── NavLinks
    └── Copyright
```

## Content Schema (Phase 1 Final)

### Profile (`src/content/profile.json`)
```typescript
interface Profile {
  name: string                  // Display name (e.g., "Kane Nguyen")
  fullName: string              // Legal name
  title: string                 // Primary job title
  location: string              // Current location
  timezone: string              // Timezone (e.g., "GMT+7")
  avatar: string                // Avatar image path
  heroPhoto: string             // Hero section photo path
  resumePath: string            // Path to resume PDF
  titles: string[]              // Job title variants for rotating text
  bio: {
    hero: string                // Short bio for hero section
    aboutPreview: string[]       // About page preview snippets
    full: string                // Full biography (About page)
    contact: string             // Contact section callout
  }
  stats: Array<{
    value: string               // e.g., "1yr", "9"
    label: string               // e.g., "Shipping Production Code"
  }>
  contact: {
    email: string               // Email address
    phone: string               // Phone number
    zaloId: string              // Zalo contact ID
  }
  social: {
    github: string              // GitHub profile URL
    linkedin: string            // LinkedIn profile URL
    facebook: string            // Facebook profile URL
    email: string               // Email mailto URL
    zalo: string                // Zalo message URL
  }
}
```

### Projects (`src/content/projects.json`)
```typescript
interface Project {
  id: string                    // e.g., "project-1"
  title: string                 // Project name
  description: string           // Short summary (50-100 chars)
  longDescription: string       // Full description (for detail page)
  image: string                 // URL or /public path
  technologies: string[]        // ["React", "TypeScript", "Tailwind", ...]
  featured: boolean             // Show on home page?
  category: 'personal' | 'company' | 'freelance'  // Project classification
  categoryLabel?: string        // Display label (e.g., "Company")
  links: {
    github?: string             // GitHub repo URL
    demo?: string               // Live demo URL
    blog?: string               // Related blog post (Phase 2)
  }
  role?: string                 // Role in project
  teamSize?: number             // Team size
  impact?: string               // Business/user impact
  startDate?: string            // YYYY-MM
  endDate?: string              // YYYY-MM or "Present"
}
```

### Skills (`src/content/skills.json`)
```typescript
interface SkillGroup {
  category: string              // "Frontend", "Backend", "Tools", "Soft Skills"
  items: string[]               // ["React", "TypeScript", "Next.js"]
}
```

### Experience (`src/content/experience.json`)
```typescript
interface Experience {
  company: string               // Company name
  role: string                  // Job title
  duration: string              // "Jan 2024 - Present"
  description: string           // Role summary
  highlights: string[]          // Key achievements
}
```

## Routing Map (Phase 1-2 Complete)

| Route | Component | Source | SSG? | Status |
|-------|-----------|--------|------|--------|
| `/` | `page.tsx` (home) | Components + projects.json + GitHub API + latest blog/diary | Yes | ✓ Complete |
| `/projects` | `projects/page.tsx` + client filter | Projects list with category filtering | Yes | ✓ Complete |
| `/about` | `about/page.tsx` | Components + experience.json, skills.json, GitHub API | Yes | ✓ Complete |
| `/blog` | `blog/page.tsx` + client filter | Blog list from Velite (.velite/blogs) with tag filtering | Yes | ✓ Complete |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | Dynamic route for blog posts (Velite-compiled MDX) | Yes | ✓ Complete |
| `/diary` | `diary/page.tsx` + client filter | Diary list from Velite (.velite/diaries) with mood filtering | Yes | ✓ Complete |
| `/diary/[slug]` | `diary/[slug]/page.tsx` | Dynamic route for diary entries (Velite-compiled MDX) | Yes | ✓ Complete |
| `/feed.xml` | `feed.xml/route.ts` | RSS feed (blog posts only) | Yes | ✓ Complete |
| `404` | `not-found.tsx` | Built-in Next.js | Yes | ✓ Complete |
| `Error` | `error.tsx` | Built-in Next.js | Client-side | ✓ Complete |

**New in Phase 2:**
- Velite MDX integration for blog + diary
- Dynamic routes for blog/diary detail pages
- Tag filtering for blog, mood filtering for diary
- RSS feed endpoint
- Latest blog/diary sections on homepage

## Build & Deployment

### Build Process (Next.js)
```
Development Mode (pnpm dev)
├── Next.js dev server runs on http://localhost:3000
├── Hot Module Replacement (HMR) for fast updates
├── No optimizations applied
└── Full source maps for debugging

Production Build (pnpm build)
├── Compile TypeScript
├── Tree-shake unused Tailwind CSS
├── Minify JavaScript & CSS
├── Optimize images
├── Generate static pages (SSG)
├── Create .next/ output directory
└── Ready for Vercel deployment

Production Server (pnpm start)
├── Serve optimized assets from .next/
├── Use Node.js server (local testing)
└── Vercel replaces with serverless functions
```

### Docker Self-Hosted Deployment
```
Push to main branch
    ↓
GitHub Actions triggered
    ↓
Build Docker images (multi-stage, cached)
    ↓
Push to GHCR (ghcr.io)
    ↓
SSH via Cloudflare Tunnel
    ↓
docker compose pull + up -d
    ↓
Entrypoint: prisma generate → migrate → seed → start
    ↓
Live at portfolio.haunguyendev.xyz
```

## State Management (Phase 1)

**No global state library needed.**

- Component state: `useState` (filter toggles, form inputs)
- Shared state: Props drilling or React Context (Phase 3 for theme)
- Data fetching: JSON imports (static)

**Phase 4+ may add:**
- Zustand or Redux for complex state
- TanStack Query for server state

## Performance Considerations

### Optimizations Applied
- **Code Splitting:** Each page loads only necessary JS
- **Image Optimization:** Next.js `<Image>` component with lazy loading
- **CSS Purging:** Tailwind removes unused styles at build time
- **Static Generation:** Pages pre-rendered, served from CDN
- **Minification:** Automatic for JS/CSS/HTML
- **Caching:** Vercel caches static assets, browser caches with HTTP headers

### Monitoring (Phase 3+)
- Lighthouse audits in CI
- Vercel Analytics (performance metrics)
- Umami Analytics (visitor tracking)

## SEO & Metadata (Phase 3 Complete)

### Sitemap Generation
- **File:** `src/app/sitemap.ts` (programmatic MetadataRoute)
- **Routes included:** Home, /projects, /about, /blog, /diary, all blog posts, all diary entries
- **Priorities:** Home (1.0), Projects (0.9), About (0.8), Blog/Diary pages (0.8/0.6), Posts (0.7), Entries (0.5)
- **Update frequency:** Weekly (home), Monthly (pages), Weekly (lists)
- **Generated at:** `/sitemap.xml` (Next.js auto-routes)

### Robots Configuration
- **File:** `src/app/robots.ts` (MetadataRoute)
- **Rules:** Allow all (`userAgent: '*', allow: '/'`)
- **Sitemap reference:** Points to `/sitemap.xml`

### JSON-LD Schema Markup
**Components:** `src/components/seo/json-ld.tsx`

**PersonJsonLd** (on homepage):
- Type: Person
- Name: Kane Nguyen
- Job Title: Software Engineer
- URL: Site URL
- Social profiles: GitHub, LinkedIn, Facebook

**ArticleJsonLd** (on blog/diary detail pages):
- Type: Article
- Properties: headline, description, datePublished, dateModified, url, image
- Author: Person (Kane Nguyen)

### Metadata in Layout
**File:** `src/app/layout.tsx`
- metadataBase: `SITE_URL`
- title: Default + per-page override
- description: Site tagline + per-page override
- **Open Graph:**
  - og:title, og:description, og:image
  - og:type: website (homepage), article (posts)
  - og:url: canonical URL
- **Twitter Card:**
  - twitter:card: summary_large_image
  - twitter:title, twitter:description, twitter:image
- **Additional:**
  - canonical: Self-referential
  - RSS feed: `/feed.xml`
  - robots: index, follow
  - language: en-US

### Open Graph Images
- **Default:** `/public/images/og-default.png` (1200x630px)
- **Generated from:** Fallback for all pages
- **Per-post:** Can override with post `image` field

## Dark Mode Implementation (Phase 3 Complete)

### Theme Provider Configuration
**File:** `src/components/layout/theme-provider.tsx`
- Uses `next-themes` for theme management
- Theme options: `light`, `dark`, `system`
- System preference detection: Enabled (`enableSystem: true`)
- Persists user preference to localStorage

### Dark Mode Styling Strategy
**CSS Variable Base:** Tailwind dark mode via `darkMode: 'class'`

**Semantic Colors:**
- Light: White background (#ffffff), Zinc 900 foreground (#18181b)
- Dark: Background token (#09090b), Zinc 50 foreground (#fafafa)

### Section Background Uniformity
**Dark mode sections use unified background (`dark:bg-background`):**
- Featured projects section
- Latest blog section
- Latest diary section
- Footer

This creates a cohesive visual experience in dark mode by eliminating gray bands and using the main background color throughout.

### Component-Specific Dark Mode Adjustments
| Component | Dark Mode Style |
|-----------|-----------------|
| Diary blockquotes | `dark:border-l-orange-600 dark:bg-orange-950/30` |
| Blog blockquotes | Standard prose styling with dark mode support |
| Error boundary | `dark:bg-red-950/50` for error context |

### User Experience
- Theme toggle in header (light/dark/system icons)
- System preference auto-detected on first visit
- Smooth color transitions between modes
- All text maintains 4.5:1 contrast in both modes

## Security & Privacy

### Phase 1-3
- No user data collection (static content)
- No authentication
- Static content only
- HTTPS enforced (Vercel automatic)
- XSS protection in JSON-LD (escaped `<` to prevent injection)

### Phase 4A-4B
- **Admin Authentication:** GitHub OAuth via Better Auth (socialProviders.github)
- **Access Control:** Whitelist enforcement via databaseHooks.user.create.before + databaseHooks.session.create.before
- **Authorized Users:** haunt150603@gmail.com (haunguyendev) only
- **Database Access:** JWT tokens for GraphQL mutations (API layer)
- **Input Validation:** TipTap editor + image upload validation
- **Content Security Policy:** Headers configured per environment

## Error Handling

### Client-Side
- `error.tsx`: Catches errors in page/layout
- `not-found.tsx`: Handles 404s
- Manual try-catch in async operations (Phase 4)

### Server-Side (Phase 4)
- API route error handling
- Database query error handling
- Graceful degradation (return fallback data)

## Architecture Changes (Phase 2 Complete)

### Phase 2 (Blog + Diary) — COMPLETE
- [x] Added Velite for MDX processing
- [x] Created `/content/blog/` and `/content/diary/` for MDX files
- [x] Implemented blog + diary components
- [x] Added dynamic routes for detail pages
- [x] Integrated latest blog/diary sections on homepage
- [x] RSS feed endpoint

### Phase 3 (SEO & Polish) — COMPLETE
- [x] Programmatic sitemap.xml generation
- [x] Robots.txt configuration
- [x] JSON-LD schema markup (Person, Article)
- [x] Enhanced metadata (OG, Twitter, RSS)
- [x] Dark mode with system theme preference
- [x] Performance optimization and code cleanup

### Phase 4A (Custom CMS Backend) — COMPLETE
- [x] Turborepo monorepo (apps/web, apps/api, packages/prisma, packages/shared)
- [x] NestJS 11 GraphQL API (code-first schema, 5+ resolvers)
- [x] PostgreSQL + Prisma ORM (10+ entity tables)
- [x] Better Auth + JWT Guard (secure admin authentication)
- [x] Admin dashboard (/admin/*) with CRUD pages and TipTap editor
- [x] Content migration script (JSON/MDX → Database)
- [x] Public API (queries) + Protected API (mutations)
- [x] ISR revalidation on content updates

**Data flow changes:**
```
Frontend → GraphQL Queries → API Resolvers → Prisma → Database
Admin → GraphQL Mutations (JWT protected) → Services → Database
ISR Revalidation ← On-demand invalidation from admin
```

### Phase 4B (CI/CD & Self-Hosted Deploy) — COMPLETE
- [x] Docker multi-stage builds (web + api)
- [x] docker-compose.prod.yml (full production stack)
- [x] GitHub Actions CI/CD (build → GHCR → SSH deploy)
- [x] Cloudflare Tunnel (SSH, web, api, portainer subdomains)
- [x] Release Please bot (automated versioning + changelog)
- [x] Production seed script (admin user + categories + tags)
- [x] Entrypoint script (migrate → seed → start)
- [x] Portainer CE for container monitoring

### Phase 6 (CV Download Feature) — COMPLETE
- [x] Resume module (upload, generate, setActive, delete)
- [x] Puppeteer integration for PDF generation from HTML template
- [x] MinIO storage for resume files
- [x] Admin dashboard for CV management
- [x] Public endpoint for CV download without auth
- [x] Chromium installation in API Docker image
- [x] XSS prevention in generated PDF output

**Data flow changes:**
```
Admin uploads PDF or clicks generate
  → POST /api/resume/upload or POST /api/resume/generate
  → NestJS service (Puppeteer for generate)
  → MinIO storage for PDF file
  → Prisma resume record (type, isActive)
Public user clicks download
  → GET /api/resume/download
  → Returns active resume from MinIO
  → Browser forces download via Content-Disposition header
```

### Phase 7 (Advanced Features) — PLANNED
- [ ] Comments system with moderation
- [ ] Likes and page view counters
- [ ] Analytics tracking (referrers, devices)
- [ ] User registration (optional)
- [ ] Email notifications

## Summary

- **Phase 1:** Static Next.js app, JSON content, SSG pages, Vercel CDN
- **Data flow:** JSON files → Components → Pages → Browser
- **No server logic yet** (added Phase 4)
- **Focus:** Simple, performant, content-driven portfolio
- **Routing:** Simple pages (/, /projects, /about, /blog)
- **Components:** Reusable, single-file, max 200 LOC
