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

**Key Points:**
- **Next.js 16.1.6** App Router for pages and routing
- **Static generation (SSG)** for all pages in Phase 1 (Home, Projects, About, Blog)
- **Content from local JSON files** (Phase 1) → PostgreSQL Database (Phase 4)
- **No server logic** in Phase 1 (API routes added in Phase 4 for comments, likes, views)
- **Vercel** handles deployment, caching, CDN, and serverless functions
- **TypeScript strict mode** for type safety
- **Tailwind CSS v4.2.1** with Base UI components (not Radix)

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
  category: 'personal' | 'company' | 'freelance'  // NEW: Project classification
  categoryLabel?: string        // NEW: Display label (e.g., "Company")
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
  category: string              // "Frontend", "Backend", "Tools"
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

### Vercel Deployment
```
Push to main branch
    ↓
GitHub webhook → Vercel
    ↓
Vercel pulls code
    ↓
pnpm install
pnpm build
    ↓
Static pages uploaded to CDN
    ↓
Serverless functions deployed
    ↓
Live at custom domain
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

## Security & Privacy

### Phase 1
- No user data collection
- No authentication
- Static content only
- HTTPS enforced (Vercel automatic)

### Phase 4
- Add authentication if needed
- Database access control
- Input validation (user-generated content)
- Content Security Policy headers

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

### Phase 3 (SEO & Polish) — UPCOMING
- Add static sitemaps
- Meta tag management (next-seo or manual)
- Dark mode with CSS variables (client-side toggle)
- Performance budgets in CI

### Phase 4 (CMS & Database)
```
Add new layers:
├── API Routes (/app/api/)
├── Database (PostgreSQL)
├── Drizzle ORM
├── Server Actions (mutations)
└── Authentication (optional)

Data flow changes:
  Components → Server Actions → Database
  Database → API Routes → Components
```

## Summary

- **Phase 1:** Static Next.js app, JSON content, SSG pages, Vercel CDN
- **Data flow:** JSON files → Components → Pages → Browser
- **No server logic yet** (added Phase 4)
- **Focus:** Simple, performant, content-driven portfolio
- **Routing:** Simple pages (/, /projects, /about, /blog)
- **Components:** Reusable, single-file, max 200 LOC
