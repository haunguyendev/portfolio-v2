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

## Data Flow (Phase 1)

```
┌──────────────────────────────────────────────────────┐
│              Content Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │projects.json │  │ skills.json  │  │experience  │ │
│  │              │  │              │  │ .json      │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───┘ │
└─────────┼──────────────────┼────────────────────┼────┘
          │                  │                    │
┌─────────▼──────────────────▼────────────────────▼────┐
│         Component Layer                              │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │ ProjectCard          │  │ SkillBadge           │ │
│  │ ProjectGrid          │  │ TimelineItem         │ │
│  │ ProjectFilter        │  │ BiographySection     │ │
│  └──────────────────────┘  └──────────────────────┘ │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │ HeroSection          │  │ FeaturedProjectsGrid │ │
│  │ NavigationHeader     │  │ Footer               │ │
│  └──────────────────────┘  └──────────────────────┘ │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│         Page Layer (Next.js Routes)                 │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │ page.tsx (Home)      │  │ projects/page.tsx    │ │
│  │ about/page.tsx       │  │ blog/page.tsx        │ │
│  └──────────────────────┘  └──────────────────────┘ │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│         Browser / User                              │
│  Rendered HTML + CSS + JavaScript                   │
└─────────────────────────────────────────────────────┘
```

**Flow:**
1. JSON files in `/src/content/` contain static data
2. Components import and render this data
3. Pages compose components to display content
4. Next.js SSG pre-renders static pages at build time
5. Browser receives optimized HTML + CSS + minimal JS

## Page Routes & Components

### Home Page (`src/app/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│        Header / Navigation          │
├─────────────────────────────────────┤
│         Hero Section                │
│  [Photo] [Intro Text]               │
├─────────────────────────────────────┤
│    Featured Projects Section        │
│  [Project Card] [Project Card]      │
├─────────────────────────────────────┤
│   About Preview / CTA               │
│  [Short bio + link to About]        │
├─────────────────────────────────────┤
│        Footer                       │
└─────────────────────────────────────┘
```

**Components Used:**
- `Header`: Navigation + branding
- `HeroSection`: Personal photo + introduction
- `FeaturedProjectsSection`: Top 3-4 projects
- `AboutPreviewSection`: Bio snippet + link
- `Footer`: Contact, social links

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

**Phase 2 Changes:**
```
┌─────────────────────────────────────┐
│        Header / Navigation          │
├─────────────────────────────────────┤
│    Page Title + Description         │
├─────────────────────────────────────┤
│    Blog Post List                   │
│  [Post Card] [Post Card]            │
│  [Post Card] [Post Card]            │
├─────────────────────────────────────┤
│   Pagination / Load More            │
├─────────────────────────────────────┤
│        Footer                       │
└─────────────────────────────────────┘
```

## Component Hierarchy

```
RootLayout
├── Header
│   └── Navigation
│       ├── Home (Link)
│       ├── Projects (Link)
│       ├── About (Link)
│       └── Blog (Link)
├── PageContent (varies per page)
│   ├── HomePage
│   │   ├── HeroSection
│   │   ├── FeaturedProjectsSection
│   │   │   └── ProjectGrid
│   │   │       └── ProjectCard (×3-4)
│   │   └── AboutPreviewSection
│   ├── ProjectsPage
│   │   ├── ProjectFilter
│   │   └── ProjectGrid
│   │       └── ProjectCard (×N)
│   ├── AboutPage
│   │   ├── BioSection
│   │   ├── SkillsSection
│   │   │   └── SkillBadge (×N)
│   │   └── Timeline
│   │       └── TimelineItem (×N)
│   └── BlogPage
│       └── "Coming soon" placeholder
└── Footer
    ├── ContactInfo
    ├── SocialLinks
    └── Copyright
```

## Content Schema (Phase 1)

### Projects (`src/content/projects.json`)
```typescript
interface Project {
  id: string                    // e.g., "project-1"
  title: string                 // Project name
  description: string           // Short summary (50-100 chars)
  longDescription: string       // Full description (for detail page)
  image: string                 // URL or /public path
  technologies: string[]        // ["React", "TypeScript", "Tailwind"]
  featured: boolean             // Show on home page?
  links: {
    github?: string             // GitHub repo URL
    demo?: string               // Live demo URL
    blog?: string               // Related blog post (Phase 2)
  }
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

## Routing Map

| Route | Component | Source | SSG? |
|-------|-----------|--------|------|
| `/` | `page.tsx` (home) | Components + projects.json | Yes |
| `/projects` | `projects/page.tsx` | Components + projects.json | Yes |
| `/about` | `about/page.tsx` | Components + experience.json, skills.json | Yes |
| `/blog` | `blog/page.tsx` | Placeholder | Yes (Phase 2: Dynamic) |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | Not yet (Phase 2) | No (Phase 2: ISR) |
| `404` | `not-found.tsx` | Built-in Next.js | Yes |
| `Error` | `error.tsx` | Built-in Next.js | Client-side |

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

## Future Architecture Changes

### Phase 2 (Blog)
- Add `/content/blog/` for MDX files
- Implement MDX loader
- Add blog components (post card, table of contents)

### Phase 3 (SEO & Polish)
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
