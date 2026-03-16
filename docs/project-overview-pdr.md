# Project Overview & PDR

## Product Definition

**Project:** Kane Nguyen's Portfolio v2
**Owner:** Kane Nguyen
**Purpose:** Personal portfolio website to showcase projects, skills, experience, and (Phase 2+) technical blog
**Target Audience:** Hiring managers, recruiters, peers, potential collaborators
**Status:** Planning phase (Phase 1 in development)

## Goals & Objectives

### Primary Goals
1. Establish professional online presence showcasing 1 year of engineering experience
2. Display completed projects with tech stack and links (GitHub, demos)
3. Provide bio, skills, and experience timeline
4. Lay foundation for technical blog (Phase 2)
5. Maintain as living portfolio (regular updates)

### Success Metrics
- Page load < 2 seconds (Lighthouse performance > 80)
- Mobile-responsive across all viewports
- All links functional, no dead ends
- SEO basics in place (meta, OG, sitemap — Phase 3)
- Regular content updates (projects, blog posts)

## Target Audience

| Segment | Need | Priority |
|---------|------|----------|
| Hiring Managers | Quick overview of projects, skills, experience | High |
| Recruiters | Contact info, CV reference, key achievements | High |
| Peers | Project details, blog insights, GitHub links | Medium |
| Collaborators | Interests, contact, past work examples | Medium |

## Scope by Phase

### Phase 1: Portfolio MVP (Current)
- Home page (hero + featured projects + about intro)
- Projects page (full list, filtering by tech)
- About page (bio, skills badges, timeline)
- Blog placeholder ("Coming soon")
- Diary placeholder ("Coming soon")
- Static content (JSON data files)
- Responsive design (mobile, tablet, desktop)
- Basic analytics ready (setup, not integrated yet)

**Deliverables:**
- All pages functional (Home, Projects, About, Blog, Diary)
- Project data structure finalized
- Design implemented
- Deployed to Vercel

**Timeline:** 2-3 weeks (parallel work)

**Out of Scope:**
- Blog posts
- Dark mode toggle
- SEO optimization
- Database
- Authentication
- Comments/interactions

### Phase 2: Blog System
- MDX integration
- Blog list page + detail pages
- Content structure (categories, tags, reading time)
- Related posts section
- Search/filtering (optional)

**Deliverables:**
- 3-5 initial blog posts
- Blog system operational
- Content management structure

**Timeline:** 1-2 weeks post-Phase 1

### Phase 3: Polish & SEO
- SEO optimization (meta, OG images, sitemap, robots.txt)
- Dark mode toggle with local storage
- Performance optimization (images, code splitting)
- Responsive refinements
- Analytics integration (Umami)

**Deliverables:**
- Lighthouse scores > 90
- Dark mode fully functional
- SEO audit passed

**Timeline:** 1 week post-Phase 2

### Phase 4: CMS & Advanced Features
- Headless CMS integration (Sanity or Payload)
- Admin dashboard
- PostgreSQL database setup
- Drizzle ORM for queries
- Comments/likes system
- View/like counters
- Advanced analytics

**Deliverables:**
- CMS operational
- Database schema finalized
- Interactions fully functional

**Timeline:** 2-3 weeks post-Phase 3

## Tech Stack (Rationale)

| Component | Choice | Why |
|-----------|--------|-----|
| Framework | Next.js 15 | Modern, App Router, built-in SSG, excellent for portfolios |
| Language | TypeScript | Type safety, self-documenting code, better DX |
| Styling | Tailwind + shadcn/ui | Minimal custom CSS, consistent design system, productivity |
| Content (P1) | JSON | Simple, no DB needed, easy to update manually |
| Content (P2+) | MDX | Markdown + React, blog flexibility, future-proof |
| Testing | Vitest + Playwright | Fast unit tests, real browser e2e tests (Phase 3) |
| Deployment | Vercel | Next.js native, free tier, easy CI/CD, analytics included |
| Package Manager | pnpm | Fast, disk space efficient, monorepo ready |

## Design Principles

1. **Minimalism:** Generous whitespace, clear hierarchy, no clutter
2. **Editorial Focus:** Typography-first, content-driven
3. **Light Mode First:** Default light, dark mode optional (Phase 3)
4. **Performance:** Minimal animations, optimized images, code splitting
5. **Accessibility:** WCAG 2.1 AA compliance, semantic HTML, proper color contrast
6. **Responsiveness:** Mobile-first, tested on key breakpoints (640px, 1024px, 1200px)

## Design Direction

**Style Reference:** nelsonlai.dev (simplified), leerob.com, delba.dev

**Theme:**
- Primary: shadcn/ui default (Zinc palette, neutral grays)
- Accent: Gradient (orange→red→blue) for personality
- Typography: Inter/Geist (shadcn/ui defaults)

**Layout:**
- Max-width: 1200px
- Padding: 16-32px (responsive)
- Line height: 1.6-1.8 for readability

**Animation:**
- Subtle hover effects on interactive elements
- Page transitions (fade/slide)
- No parallax, no 3D effects, no distracting animations

## Development Conventions

| Item | Standard |
|------|----------|
| File Naming | kebab-case (project-card.tsx) |
| Component Size | Max 200 lines |
| Exports | Named only (except page.tsx) |
| Styling | Tailwind + shadcn/ui, no custom CSS unless necessary |
| Content | In /content data files, not hardcoded |
| Types | Co-located with components, shared in /types |
| Error Handling | Try-catch with user-friendly messages |
| Security | No secrets in code, use environment variables |

## Team & Responsibilities

| Role | Person | Phase 1 Focus |
|------|--------|--------------|
| Developer | Kane Nguyen | Full-stack (components, content, deployment) |
| Designer (Reference) | nelsonlai.dev, leerob.com | Design inspiration only |

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Scope creep (Phase 4 features in Phase 1) | High | Strict phase gates, prioritize MVP |
| Over-engineering components | Medium | Review code for YAGNI, keep components simple |
| Content not updated regularly | Medium | Set reminder system for quarterly updates |
| Performance regression | Medium | Run Lighthouse in CI, set performance budgets |
| Responsive design gaps | Low | Test on multiple devices, use Playwright e2e tests |

## Success Criteria (Phase 1)

- [ ] All 4 pages (Home, Projects, About, Blog placeholder) fully functional
- [ ] Responsive across mobile (375px), tablet (768px), desktop (1200px)
- [ ] Page load < 2 seconds (desktop), < 3 seconds (mobile)
- [ ] All project links working (GitHub, demos)
- [ ] Lighthouse score > 80 (Performance, Accessibility, Best Practices)
- [ ] No console errors or warnings
- [ ] Deployed to Vercel with custom domain
- [ ] Content data structure ready for Phase 2 expansion

## Next Steps

1. **Setup:** Initialize Next.js project, install dependencies, configure TypeScript + Tailwind
2. **Components:** Build core component library (Header, Footer, Hero, ProjectCard, etc.)
3. **Pages:** Implement Home, Projects, About page logic
4. **Content:** Create JSON data structure, seed with initial projects
5. **Styling:** Apply design system, test responsive
6. **Deploy:** Set up Vercel, configure CI/CD
7. **Review:** Manual testing, performance audit, bug fixes
8. **Phase 2 Prep:** Plan blog system, content structure

## Appendix: Content Structure (Phase 1)

### Project Data Shape
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "longDescription": "string (for project detail view)",
  "image": "string (URL or /public path)",
  "technologies": ["string"],
  "featured": boolean,
  "links": {
    "github": "string (URL)",
    "demo": "string (URL)"
  }
}
```

### Skills Data Shape
```json
{
  "category": "string (e.g., 'Frontend', 'Backend')",
  "items": ["string"]
}
```

### Experience Timeline Shape
```json
{
  "company": "string",
  "role": "string",
  "duration": "string (e.g., 'Jan 2024 - Present')",
  "description": "string",
  "highlights": ["string"]
}
```
