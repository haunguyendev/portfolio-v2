# Project Roadmap

## Overview

Kane Nguyen's Portfolio v2 is a 4-phase project building from a minimal static portfolio to a feature-rich CMS-driven site with analytics and community interactions.

**Current Status:** Phase 1 (Complete) → Phase 2 (Planned)

## Phase 1: Portfolio MVP

**Timeline:** 2-3 weeks (concurrent work)
**Status:** COMPLETE
**Priority:** HIGH

### Objectives
- Launch professional portfolio website
- Showcase projects, skills, experience
- Establish deployment pipeline
- Create content structure for Phase 2

### Features

| Feature | Scope | Priority | Status |
|---------|-------|----------|--------|
| Home page | Hero, featured projects, about preview | HIGH | Complete |
| Projects page | Full list, tech filtering, project cards | HIGH | Complete |
| About page | Bio, skills, experience timeline | HIGH | Complete |
| Blog placeholder | "Coming soon" page | HIGH | Complete |
| Responsive design | Mobile, tablet, desktop | HIGH | Complete |
| Static content | JSON data files | HIGH | Complete |
| Vercel deployment | CI/CD, custom domain | HIGH | Complete |

### Technical Tasks

#### Setup & Configuration
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Install Tailwind CSS + shadcn/ui
- [ ] Configure TypeScript (strict mode)
- [ ] Set up project structure (`src/`, `components/`, `content/`, etc.)
- [ ] Create `.env.example` with required variables
- [ ] Set up `.gitignore`, `prettier`, `eslint` (basic)

#### Component Development
- [ ] Build layout components (Header, Footer, Navigation)
- [ ] Build home page components (HeroSection, FeaturedProjects, AboutPreview)
- [ ] Build projects page components (ProjectCard, ProjectGrid, ProjectFilter)
- [ ] Build about page components (BioSection, SkillsSection, Timeline)
- [ ] Build common components (SectionTitle, GradientText, ExternalLink)
- [ ] Import shadcn/ui components as needed (Button, Card, Badge)

#### Pages Implementation
- [ ] Home page (`app/page.tsx`)
- [ ] Projects page (`app/projects/page.tsx`)
- [ ] About page (`app/about/page.tsx`)
- [ ] Blog placeholder page (`app/blog/page.tsx`)
- [ ] Root layout (`app/layout.tsx`) with header + footer
- [ ] Error boundary (`app/error.tsx`)
- [ ] 404 page (`app/not-found.tsx`)

#### Content & Data
- [ ] Create `/content/projects.json` with 4-6 project entries
- [ ] Create `/content/skills.json` with skill categories
- [ ] Create `/content/experience.json` with 2-3 work experience entries
- [ ] Add hero image to `/public/images/hero/`
- [ ] Add project images to `/public/images/projects/`

#### Styling
- [ ] Configure Tailwind colors (Zinc palette, gradient)
- [ ] Configure typography (Inter/Geist)
- [ ] Configure spacing scale
- [ ] Create global styles (`styles/globals.css`)
- [ ] Test responsive design on breakpoints (375px, 768px, 1024px)

#### Quality & Performance
- [ ] Run TypeScript compiler (`tsc --noEmit`) — zero errors
- [ ] Test all pages in browser (development mode)
- [ ] Test responsive layout on multiple devices
- [ ] Optimize images (compression, formats)
- [ ] Check accessibility (color contrast, semantic HTML)
- [ ] Run Lighthouse audit — target > 80 (Performance, Accessibility, Best Practices)

#### Deployment
- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Test preview deployments
- [ ] Set up custom domain (optional, can use vercel.app)
- [ ] Verify HTTPS working
- [ ] Test production deployment

### Content Requirements

#### Projects Data
Minimum 4 projects to showcase:
1. Significant project from current job or personal work
2. Side project demonstrating full-stack skills
3. Learning project or contribution
4. Open-source contribution or small tool

Each project includes:
- Title, description, long description
- Technology stack (3-5 tech tags)
- Image/screenshot
- GitHub link, live demo link (if available)
- Featured flag (show on home page)

#### Skills Data
Organized by category:
- **Frontend:** React, Next.js, TypeScript, Tailwind CSS, etc.
- **Backend:** Node.js, Express, PostgreSQL, etc. (if applicable)
- **Tools:** Git, Docker, etc. (if applicable)

#### Experience Data
1-3 work experience entries:
- Company, job title, duration
- Description and key highlights

### Success Criteria

- [ ] All 4 pages (Home, Projects, About, Blog placeholder) fully functional
- [ ] Responsive across mobile (375px), tablet (768px), desktop (1024px+)
- [ ] Page load < 2s (desktop), < 3s (mobile) — Core Web Vitals green
- [ ] Lighthouse scores: Performance > 80, Accessibility > 80, Best Practices > 80
- [ ] All links functional (projects, about, social media)
- [ ] No TypeScript errors or warnings
- [ ] No console errors or warnings
- [ ] Deployed to Vercel with custom domain
- [ ] Content data structure finalizable for Phase 2

### Dependencies & Blockers
- None (greenfield project)

### Handoff to Phase 2
- Finalized content schema
- Tested, working deployment pipeline
- Clear MDX integration plan

---

## Phase 2: Blog System

**Timeline:** 1-2 weeks post-Phase 1
**Status:** PLANNED
**Priority:** MEDIUM

### Objectives
- Enable blogging as content platform
- Integrate MDX for markdown + React flexibility
- Create blog infrastructure for long-term content

### Features

| Feature | Scope | Priority |
|---------|-------|----------|
| Blog list page | Posts with cards, date, reading time | HIGH |
| Blog detail page | Full post, syntax-highlighted code | HIGH |
| MDX integration | Markdown + React components | HIGH |
| Related posts | Show 2-3 related posts | MEDIUM |
| Blog search | Filter by category/tag | LOW |
| Reading time calc | Auto-calculate estimated time | MEDIUM |

### Technical Tasks

#### MDX Setup
- [ ] Install `@next/mdx` and dependencies
- [ ] Configure MDX loader in `next.config.ts`
- [ ] Create MDX-compatible component exports

#### Blog Components
- [ ] Create `BlogPostCard` component
- [ ] Create `BlogPostList` component
- [ ] Create `BlogPostContent` component with heading styling
- [ ] Create `BlogTOC` (table of contents) component — optional
- [ ] Create `RelatedPosts` component
- [ ] Create MDX component overrides (h1, h2, code, etc.)

#### Blog Pages
- [ ] Blog list page (`app/blog/page.tsx`)
- [ ] Blog detail page (`app/blog/[slug]/page.tsx`)
- [ ] Update placeholder to real blog list

#### Content Structure
- [ ] Create `/src/content/blog/` directory
- [ ] Define blog post frontmatter schema (title, date, description, tags, etc.)
- [ ] Write 3-5 initial blog posts
- [ ] Create `lib/mdx-utils.ts` for parsing frontmatter

#### Features
- [ ] Reading time calculation
- [ ] Post date display
- [ ] Category/tag filtering
- [ ] "Published on" metadata
- [ ] Author name/bio (optional)

### Success Criteria

- [ ] Blog list page displays all posts with cards
- [ ] Blog detail pages render MDX correctly
- [ ] Code blocks syntax-highlighted
- [ ] Reading time calculated accurately
- [ ] Links to related posts work
- [ ] Mobile responsive
- [ ] Lighthouse scores maintained > 80

### Dependencies
- Phase 1 must be complete and deployed

---

## Phase 3: Polish & SEO

**Timeline:** 1 week post-Phase 2
**Status:** PLANNED
**Priority:** MEDIUM-HIGH

### Objectives
- SEO optimization for search visibility
- Dark mode for user preference
- Performance fine-tuning
- Accessibility audit

### Features

| Feature | Scope | Priority |
|---------|-------|----------|
| SEO meta tags | Title, description, OG images | HIGH |
| Sitemap | Auto-generated sitemap.xml | HIGH |
| robots.txt | Search engine crawl rules | HIGH |
| Dark mode toggle | User preference + localStorage | MEDIUM |
| Performance audit | Lighthouse > 90 | HIGH |
| Responsive refinement | Edge case breakpoints | MEDIUM |

### Technical Tasks

#### SEO Implementation
- [ ] Configure metadata in `app/layout.tsx`
- [ ] Generate `app/sitemap.ts` programmatically
- [ ] Create `public/robots.txt`
- [ ] Add Open Graph images (1200x630px)
- [ ] Configure favicon and app icons
- [ ] Add structured data (JSON-LD) for blog posts
- [ ] Verify canonical URLs

#### Dark Mode
- [ ] Define dark mode color scheme (CSS variables)
- [ ] Create `useTheme` hook or use Context API
- [ ] Add theme toggle button in header
- [ ] Store preference in localStorage
- [ ] Respect `prefers-color-scheme` media query
- [ ] Test dark mode on all pages

#### Performance Optimization
- [ ] Image optimization (webp, lazy loading)
- [ ] Code splitting / dynamic imports for heavy components
- [ ] CSS optimization (Tailwind purging)
- [ ] Font subsetting
- [ ] Remove unused dependencies
- [ ] Bundle analysis with `@next/bundle-analyzer`

#### Testing & QA
- [ ] Vitest setup for unit tests (basic)
- [ ] Test utilities, components
- [ ] Playwright setup for e2e tests (basic)
- [ ] Test navigation, page rendering
- [ ] Run Lighthouse audits (desktop + mobile)
- [ ] Accessibility audit (WAVE, axe)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

#### Analytics
- [ ] Set up Umami analytics (self-hosted or SaaS)
- [ ] Add analytics script to layout
- [ ] Configure goals/events
- [ ] Test analytics tracking

### Success Criteria

- [ ] Lighthouse Performance > 90, Accessibility > 90, Best Practices > 90
- [ ] SEO audit passed (all meta tags present)
- [ ] Dark mode fully functional and persistent
- [ ] All tests passing (unit + e2e)
- [ ] No accessibility violations (WCAG 2.1 AA)
- [ ] Analytics tracking data correctly

### Dependencies
- Phase 2 blog system complete

---

## Phase 4: CMS & Advanced Features

**Timeline:** 2-3 weeks post-Phase 3
**Status:** PLANNED
**Priority:** LOW (optional enhancement)

### Objectives
- Enable content management without code deploys
- Add interactive features (comments, likes, views)
- Scale content infrastructure

### Features

| Feature | Scope | Priority |
|---------|-------|----------|
| Headless CMS | Sanity or Payload integration | MEDIUM |
| Admin dashboard | Content management UI | MEDIUM |
| Comments system | User comments on posts | LOW |
| Likes/views counter | Social proof, engagement | LOW |
| PostgreSQL database | Structured data store | MEDIUM |
| Drizzle ORM | Type-safe database queries | MEDIUM |
| API routes | Backend for mutations | MEDIUM |

### Technical Tasks

#### CMS Setup
- [ ] Choose CMS (Sanity, Payload, Hygraph)
- [ ] Set up CMS project
- [ ] Define content schemas in CMS
- [ ] Configure API access tokens
- [ ] Test content queries

#### Database Setup
- [ ] Create PostgreSQL database (Vercel Postgres or Railway)
- [ ] Set up Drizzle ORM
- [ ] Define database schema (comments, likes, analytics)
- [ ] Create migrations
- [ ] Set up connection pooling

#### API Routes
- [ ] Create `/api/posts` for blog posts
- [ ] Create `/api/comments` for comments (CRUD)
- [ ] Create `/api/likes` for like counts
- [ ] Add authentication middleware
- [ ] Set up rate limiting

#### Features
- [ ] Comments form + display
- [ ] Like button with count
- [ ] View counter
- [ ] User authentication (optional)
- [ ] Comment moderation (optional)

#### Migration from Phase 2
- [ ] Migrate blog posts to CMS
- [ ] Migrate project data to CMS
- [ ] Update components to use API routes

### Success Criteria

- [ ] CMS fully operational
- [ ] All content manageable via admin UI
- [ ] API routes working with proper auth
- [ ] Comments and likes functional
- [ ] Database queries performant
- [ ] Lighthouse scores maintained > 85

### Dependencies
- Phase 3 complete and stable
- Decision on CMS platform made

---

## Timeline Summary

| Phase | Duration | Start | End | Status |
|-------|----------|-------|-----|--------|
| Phase 1 | 2-3 weeks | Feb 16 | Mar 16 | COMPLETE |
| Phase 2 | 1-2 weeks | Mar 17 | ~Mar 31 | PLANNED |
| Phase 3 | 1 week | Apr 1 | ~Apr 7 | PLANNED |
| Phase 4 | 2-3 weeks | Apr 8 | ~Apr 28 | PLANNED |

**Total Estimated Time:** 6-9 weeks for full feature set
**Phase 1 MVP:** Shipped on schedule in ~2-3 weeks

## Key Milestones

1. **Phase 1 Completion:** Portfolio live on custom domain with 4+ projects
2. **Phase 2 Completion:** Blog system with 5+ published posts
3. **Phase 3 Completion:** SEO optimized, dark mode, performance audited
4. **Phase 4 Completion:** Full CMS, comments, analytics

## Risk Management

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Scope creep (adding Phase 4 to Phase 1) | HIGH | MEDIUM | Strict phase gates, MVP focus |
| Performance regression | MEDIUM | LOW | Lighthouse monitoring in CI |
| Content not updated | MEDIUM | MEDIUM | Set quarterly update reminders |
| Responsive design gaps | MEDIUM | LOW | Test on multiple devices, e2e tests |
| CMS migration complexity (Phase 4) | HIGH | MEDIUM | Plan schema migration carefully |

## Future Considerations (Post-Phase 4)

- **Internationalization (i18n):** Multi-language support
- **Social sharing:** Twitter, LinkedIn integration
- **Email newsletter:** Substack/ConvertKit integration
- **Podcast/video:** Media content support
- **E-commerce:** Selling products or courses (if applicable)
- **Community features:** Forum, Discord bot
- **AI features:** ChatGPT for recommendations, summaries

## Success Definition

**Phase 1 Success:** ACHIEVED
- Portfolio launched with polished editorial minimalist design
- All pages (Home, Projects, About, Blog placeholder) fully functional and responsive
- Deployed to Vercel with custom domain (vercel.app or custom)
- Page performance strong (Lighthouse > 80 across all metrics)
- Build, lint, and type-check passing
- Code review score: 8.2/10 with no critical issues

**Full Project Success (All Phases):**
- Thriving blog with regular readership
- Strong SEO presence (top Google results for name)
- Engaged community (comments, likes, analytics)
- Easy content management (CMS)
- Foundation for future expansion

## Notes

- Keep focus on Phase 1 MVP (ship fast)
- Blog (Phase 2) adds significant value for SEO
- SEO (Phase 3) critical for discoverability
- CMS (Phase 4) optional — depends on scale and content volume
- Regular updates to portfolio and blog crucial for success
