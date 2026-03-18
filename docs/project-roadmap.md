# Project Roadmap

## Overview

Kane Nguyen's Portfolio v2 is a 4-phase project building from a minimal static portfolio to a feature-rich CMS-driven site with analytics and community interactions.

**Current Status:** Phase 1-5 Complete — Launched with polished editorial design, all pages functional, blog/diary system live, CMS with GitHub OAuth enabled, and certificate management implemented. Ready for advanced features in Phase 6+.

**Last Updated:** March 18, 2026

## Phase 1: Portfolio MVP

**Timeline:** 2-3 weeks (concurrent work)
**Status:** COMPLETE ✓
**Priority:** HIGH
**Completion Date:** March 16, 2026

### Objectives (ACHIEVED)
- Launch professional portfolio website ✓
- Showcase projects, skills, experience ✓
- Establish deployment pipeline ✓
- Create content structure for Phase 2 ✓

### Features Implemented

| Feature | Scope | Priority | Status |
|---------|-------|----------|--------|
| Home page | Hero, featured projects, about preview | HIGH | Complete |
| Projects page | Full list, tech filtering, project cards with category badges | HIGH | Complete |
| About page | Bio, skills, experience timeline, GitHub stats, LifeSourceCode animation | HIGH | Complete |
| Diary page | Placeholder page with nav integration | HIGH | Complete |
| Blog placeholder | "Coming soon" page | HIGH | Complete |
| Responsive design | Mobile, tablet, desktop | HIGH | Complete |
| Static content | JSON data files with category metadata | HIGH | Complete |
| Vercel deployment | CI/CD, custom domain ready | HIGH | Complete |
| Copywriting | HR-focused content for all pages | HIGH | Complete |
| Project categories | Personal, Company, Freelance with badges | HIGH | Complete |
| GitHub API integration | Fetches repos/followers/contribution graph | HIGH | Complete |
| LifeSourceCode terminal | Animated code + lifestyle philosophy display | HIGH | Complete |
| Dark mode support | Light/dark/system theme switching | HIGH | Complete |
| Command palette | ⌘K command menu (lazy-loaded) | HIGH | Complete |
| Animations | Page title, typewriter, rotating text, tech tabs | HIGH | Complete |

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

### Success Criteria (Phase 1 COMPLETE)

- [x] All pages (Home, Projects, About, Blog, Diary) fully functional
- [x] Responsive across mobile (375px), tablet (768px), desktop (1024px+)
- [x] Page load optimized — Core Web Vitals strong
- [x] Lighthouse scores meeting targets (Performance, Accessibility, Best Practices)
- [x] All links functional (projects, about, social media)
- [x] No TypeScript errors or warnings
- [x] No console errors or warnings
- [x] Deployed to Vercel
- [x] Content data structure complete and extensible
- [x] Smooth animations (TypewriterHeading, RotatingText, TechStackTabs)
- [x] Command palette (⌘K) integrated
- [x] Theme switching (light/dark/system) available

### Dependencies & Blockers
- None (greenfield project)

### Handoff to Phase 2
- Finalized content schema
- Tested, working deployment pipeline
- Clear MDX integration plan

---

## Phase 2: Blog System + Diary

**Timeline:** 1-2 weeks (March 17-31, 2026)
**Status:** COMPLETE ✓
**Priority:** MEDIUM
**Completion Date:** March 31, 2026

### Objectives (ACHIEVED)
- Enable blogging as content platform with MDX ✓
- Implement diary/journal content system ✓
- Create blog/diary infrastructure for long-term content ✓

### Features Implemented

| Feature | Scope | Priority | Status |
|---------|-------|----------|--------|
| Blog list page | Posts with cards, date, reading time, tag filters | HIGH | Complete |
| Blog detail page | Full post, syntax-highlighted code, TOC, share buttons | HIGH | Complete |
| MDX integration | Velite engine for processing blog + diary MDX | HIGH | Complete |
| Blog search/filter | Filter by tags, search by title | MEDIUM | Complete |
| Reading time calc | Auto-calculated from word count (÷200) | MEDIUM | Complete |
| Diary list page | Entries with mood filter, date, description | HIGH | Complete |
| Diary detail page | Full entry with mood badge, reading time, share | HIGH | Complete |
| Diary mood system | 5 mood states (happy, sad, reflective, grateful, motivated) | HIGH | Complete |
| Home integration | Latest 3 blog + 2 diary sections on homepage | HIGH | Complete |
| RSS feed | Feed.xml endpoint for blog posts | MEDIUM | Complete |
| Sample content | 3 blog posts + 3 diary entries seeded | HIGH | Complete |

### Technical Implementation

#### MDX Setup (✓ Completed)
- [x] Installed Velite as MDX engine with `@velite/loader`
- [x] Configured Velite in `velite.config.ts` with collections (blogs, diaries)
- [x] Enabled rehype plugins: slug, autolink-headings, pretty-code
- [x] Enabled remark plugins: GitHub-flavored markdown (gfm)
- [x] Output MDX to `.velite/` directory for Next.js consumption
- [x] Created Velite type declarations in `src/types/velite.d.ts`

#### Blog Components (✓ Completed)
- [x] `BlogPostCard` — Post preview with title, date, reading time, tags
- [x] `BlogPostList` — List container with filtering + search
- [x] `BlogTagFilter` — Tag-based filtering (client component)
- [x] `BlogTableOfContents` — Auto-generated from MDX headings
- [x] `MdxContent` — Renders MDX body with custom components
- [x] `MdxComponents` — Styled headings, code, links, images for MDX

#### Diary Components (✓ Completed)
- [x] `DiaryEntryCard` — Diary preview with date, mood, description
- [x] `DiaryEntryList` — List container with mood filtering
- [x] `DiaryMoodFilter` — Filter by mood state (client component)
- [x] `DiaryMoodBadge` — Visual mood indicator (emoji + color)

#### Blog Pages (✓ Completed)
- [x] Blog list page (`app/blog/page.tsx`) — Dynamic with filter state
- [x] Blog detail page (`app/blog/[slug]/page.tsx`) — Dynamic route with MDX rendering
- [x] Share buttons (Twitter, LinkedIn, Copy link)
- [x] Pagination/load more (if needed)

#### Diary Pages (✓ Completed)
- [x] Diary list page (`app/diary/page.tsx`) — Dynamic with mood filter
- [x] Diary detail page (`app/diary/[slug]/page.tsx`) — Dynamic route with MDX rendering
- [x] Share buttons for diary entries

#### Content Structure (✓ Completed)
- [x] Created `/content/blog/` directory with 3 sample posts
- [x] Created `/content/diary/` directory with 3 sample entries
- [x] Blog schema: title, slug, description, date, updated, tags, published, image, body
- [x] Diary schema: title, slug, description, date, mood, published, body
- [x] Auto-calculated reading time for both

#### Home Integration (✓ Completed)
- [x] `LatestBlogSection` — Shows 3 most recent published blog posts
- [x] `LatestDiarySection` — Shows 2 most recent published diary entries
- [x] Links to full blog/diary pages

#### Additional Features (✓ Completed)
- [x] RSS feed at `/feed.xml/route.ts` for blog posts
- [x] Reading time calculation: Math.ceil(wordCount / 200)
- [x] Code syntax highlighting with github-dark-default theme
- [x] Heading slugs with auto-linked IDs (anchor links)
- [x] GitHub-flavored markdown (tables, strikethrough, etc.)

### Success Criteria (Phase 2 COMPLETE)

- [x] Blog list page displays all posts with cards and filters
- [x] Blog detail pages render MDX correctly with TOC and share buttons
- [x] Code blocks syntax-highlighted with github-dark theme
- [x] Reading time calculated accurately
- [x] Diary system fully functional with mood filtering
- [x] Mobile responsive across all pages
- [x] Lighthouse scores maintained > 80
- [x] All 6 sample content files seeded (3 blog, 3 diary)
- [x] RSS feed working at /feed.xml

### Dependencies
- [x] Phase 1 complete and deployed

---

## Phase 3: Polish & SEO

**Timeline:** 1 week
**Status:** COMPLETE ✓
**Priority:** MEDIUM-HIGH
**Completion Date:** March 17, 2026

### Objectives (ACHIEVED)
- SEO optimization for search visibility ✓
- Dark mode with system preference support ✓
- Performance fine-tuning ✓
- Accessibility enhancements ✓

### Features Implemented

| Feature | Scope | Priority | Status |
|---------|-------|----------|--------|
| SEO meta tags | OG, Twitter, RSS in layout | HIGH | Complete |
| Sitemap | Auto-generated sitemap.ts | HIGH | Complete |
| robots.txt | Search engine crawl rules | HIGH | Complete |
| JSON-LD schema | PersonJsonLd, ArticleJsonLd components | HIGH | Complete |
| Dark mode | System theme preference enabled | MEDIUM | Complete |
| OG images | og-default.png (1200x630) | MEDIUM | Complete |
| Dark mode CSS | Blockquote + error page fixes | MEDIUM | Complete |
| Lint fixes | TypeScript/React warnings cleaned | LOW | Complete |

### Technical Implementation

#### SEO Implementation (✓ Completed)
- [x] Enhanced metadata in `app/layout.tsx` (OG, Twitter, RSS, metadataBase)
- [x] Programmatic `app/sitemap.ts` with blogs, diaries, pages
- [x] `app/robots.ts` with sitemap reference
- [x] `public/images/og-default.png` (1200x630px)
- [x] Created `src/components/seo/json-ld.tsx` with PersonJsonLd + ArticleJsonLd
- [x] Integrated JSON-LD into homepage and blog/diary detail pages
- [x] Canonical URLs configured in metadata

#### Dark Mode (✓ Completed)
- [x] theme-provider.tsx with next-themes (enableSystem: true)
- [x] System theme preference detection via `prefers-color-scheme`
- [x] Dark mode CSS variable support in Tailwind
- [x] Fixed blockquote styling for dark mode in globals.css
- [x] Fixed error boundary (error.tsx) dark mode text contrast
- [x] All pages tested on light/dark/system modes

#### Performance & Quality (✓ Completed)
- [x] Fixed TypeScript warnings (rAF, useSyncExternalStore in animations)
- [x] Fixed React hook dependencies (blog-table-of-contents, share-buttons, typewriter, rotating-text)
- [x] Code lint cleanup for production-ready codebase
- [x] VERCEL_URL fallback in constants.ts for deployment

### Success Criteria (Phase 3 COMPLETE)

- [x] SEO meta tags present on all pages (OG, Twitter cards)
- [x] Sitemap generated automatically at `/sitemap.xml`
- [x] robots.txt configured for search engines
- [x] JSON-LD schema markup for articles and person
- [x] Dark mode fully functional with system preference
- [x] No TypeScript errors or warnings
- [x] Dark mode colors correct across all components
- [x] Mobile responsive in light and dark modes
- [x] Code quality: Zero lint warnings

### Dependencies
- [x] Phase 2 blog system complete

---

## Phase 4A: Custom CMS Backend

**Timeline:** 2 weeks (March 10-17, 2026)
**Status:** COMPLETE ✓
**Priority:** HIGH
**Completion Date:** March 17, 2026

### Objectives (ACHIEVED)
- Build custom CMS with Turborepo monorepo ✓
- Implement NestJS GraphQL API ✓
- Set up PostgreSQL database with Prisma ✓
- Create admin dashboard with authentication ✓
- Migrate blog/diary content from MDX to database ✓

### Features Implemented

| Feature | Scope | Priority | Status |
|---------|-------|----------|--------|
| Turborepo monorepo | apps/web, apps/api, packages/prisma, packages/shared | HIGH | Complete |
| NestJS GraphQL API | Code-first schema, resolvers, services on port 3001 | HIGH | Complete |
| PostgreSQL database | Docker Compose setup with full schema | HIGH | Complete |
| Prisma ORM | Schema with Posts, Projects, Categories, Tags, Series, Comments, Likes | HIGH | Complete |
| Better Auth | Admin email/password login, JWT tokens | HIGH | Complete (→ OAuth in Phase 4B) |
| JWT Guard | Protect API mutations with JWT authentication | HIGH | Complete |
| Admin Dashboard | /admin/* routes with sidebar, CRUD pages | HIGH | Complete |
| TipTap Editor | Rich text editor for post content (JSON storage) | HIGH | Complete |
| Content Migration | Seed script converts JSON + MDX to database | HIGH | Complete |
| Public GraphQL API | Fetch blog/diary/projects from database (ISR enabled) | HIGH | Complete |
| Self-hosted image upload | MinIO S3-compatible storage with sharp processing | MEDIUM | Complete |
| Image dropzone | Drag-drop upload for cover + project images | MEDIUM | Complete |
| TipTap image upload | Drag-drop, paste, and button upload in rich editor | MEDIUM | Complete |
| Image serving | REST API endpoint (/api/media/*) with caching | MEDIUM | Complete |

### Technical Implementation

#### Monorepo Setup (✓ Completed)
- [x] Created Turborepo with workspace configuration
- [x] apps/web — Next.js frontend + admin dashboard
- [x] apps/api — NestJS GraphQL API
- [x] packages/prisma — Shared Prisma schema
- [x] packages/shared — Shared types and utilities

#### NestJS API (✓ Completed)
- [x] Code-first GraphQL schema with TypeGraphQL
- [x] Database connection pooling (5 connections)
- [x] Modules: PostsModule, ProjectsModule, CategoriesModule, TagsModule, SeriesModule, AuthModule
- [x] Resolvers for all resources (mutations + queries)
- [x] Prisma service for database access
- [x] JWT authentication guard on mutations

#### PostgreSQL Database (✓ Completed)
- [x] Docker Compose service for local development
- [x] Prisma schema with full entity relationships
- [x] Tables: User, Session, Account, Post, Project, Category, Tag, Series, Comment, Like, PageView
- [x] Better Auth tables for user management
- [x] Migration scripts via Prisma

#### Admin Dashboard (✓ Completed)
- [x] /admin/login page (Better Auth integration)
- [x] /admin/posts — Create, read, update, delete posts
- [x] /admin/projects — Manage projects
- [x] /admin/categories — Manage categories
- [x] /admin/tags — Manage tags
- [x] /admin/series — Manage blog series
- [x] TipTap rich editor integrated in post forms
- [x] Sidebar navigation with logout

#### Content Migration (✓ Completed)
- [x] Seed script reads JSON files (projects.json) + MDX (blog/, diary/)
- [x] Converts to Prisma models and inserts to database
- [x] Migrates all existing content to database
- [x] Run with `pnpm db:seed`

#### Public API Changes (✓ Completed)
- [x] Updated blog list/detail pages to fetch from GraphQL API
- [x] Updated diary list/detail pages to fetch from GraphQL API
- [x] Updated projects page to fetch from API
- [x] Enabled ISR (revalidate on demand) for dynamic content

#### Image Upload System (✓ Completed - Sub-feature)
- [x] MinIO Docker service in docker-compose.yml with portfolio-media bucket
- [x] Prisma Media model with thumbnailUrl, width, height fields
- [x] NestJS MediaModule with MinIO, sharp, multer services
- [x] POST /api/upload endpoint with JWT protection, multipart form handling
- [x] GET /api/media/:key endpoint for serving images with cache headers (immutable, ETag)
- [x] DELETE /api/media/:id endpoint for cleanup (JWT protected)
- [x] sharp image processing: 1920px max (main) + 400px (thumbnail), WebP q80/q70
- [x] ImageDropzone React component for cover/project images (drag-drop, click, URL input)
- [x] TipTap image upload extension for drag-drop/paste/button in editor
- [x] Integration with post form (cover image) and project form (image)
- [x] Build verification: zero TypeScript errors, lint clean, all features working

### Success Criteria (Phase 4A COMPLETE)

- [x] Monorepo builds successfully with all apps
- [x] NestJS API runs on port 3001 with GraphQL endpoint
- [x] PostgreSQL database runs in Docker Compose
- [x] Admin login works with Better Auth
- [x] CRUD operations functional for all content types
- [x] Content migration script successful (all data seeded)
- [x] Public pages fetch from GraphQL API with ISR
- [x] TipTap editor saves JSON to database
- [x] JWT mutations protected from unauthenticated access
- [x] No TypeScript errors or runtime errors

### Dependencies
- [x] Phase 3 complete and deployed

---

## Phase 4B: GitHub OAuth + Advanced Features

**Timeline:** 1 week (Post-Phase 4A)
**Status:** PARTLY COMPLETE (OAuth done, advanced features planned)
**Priority:** HIGH (OAuth), MEDIUM (advanced features)

### Objectives (COMPLETE - OAuth)
- Replace email/password admin login with GitHub OAuth ✓
- Implement whitelist enforcement (haunguyendev only) ✓
- Enable secure credential-free authentication ✓

### Features Implemented

| Feature | Scope | Priority | Status |
|---------|-------|----------|--------|
| GitHub OAuth provider | Social login via GitHub OAuth | HIGH | Complete |
| Admin whitelist | Email-based access control (haunt150603@gmail.com only) | HIGH | Complete |
| Database hooks | User/session creation validation | HIGH | Complete |
| Login UI | Single "Continue with GitHub" button | HIGH | Complete |

### Advanced Features (Planned)

| Feature | Scope | Priority |
|---------|-------|----------|
| Comments system | User comments on posts with moderation | MEDIUM |
| Likes/views counter | Social proof and engagement metrics | MEDIUM |
| Page analytics | Track page views, referrers, device info | MEDIUM |
| User profiles | Optional user registration and profiles | LOW |
| Email notifications | Alert on new comments | LOW |

### Dependencies
- Phase 4A complete with working API and admin dashboard

---

## Phase 5: Certificate Management

**Timeline:** 1 day (March 18, 2026)
**Status:** COMPLETE ✓
**Priority:** MEDIUM
**Completion Date:** March 18, 2026

---

## Phase 6: CV Download Feature

**Timeline:** 1 day (March 18, 2026)
**Status:** COMPLETE ✓
**Priority:** HIGH
**Completion Date:** March 18, 2026

---

## Phase 7: AI Chatbot with RAG

**Timeline:** 1 day (March 18, 2026)
**Status:** COMPLETE ✓
**Priority:** HIGH
**Completion Date:** March 18, 2026

### Objectives (ACHIEVED)
- RAG-powered chatbot answering visitor questions about Kane ✓
- pgvector + Gemini embeddings + Groq LLM integration ✓
- Floating chat widget on all pages ✓
- Rate limiting and Cloudflare Tunnel integration ✓

### Features Implemented

| Feature | Scope | Priority | Status |
|---------|-------|----------|--------|
| pgvector infrastructure | PostgreSQL with vector extension + HNSW index | HIGH | Complete |
| Content indexing pipeline | Chunk portfolio content (profile, skills, experience, projects, certificates, blog) | HIGH | Complete |
| Embedding service | Gemini Embedding API integration via LangChain.js (768-dim vectors) | HIGH | Complete |
| Vector search | Cosine similarity search on pgvector with relevance filtering | HIGH | Complete |
| RAG query pipeline | User question → embed → search → retrieve context → stream LLM response | HIGH | Complete |
| LLM streaming | Groq Llama 3.3 70B primary + Gemini Flash fallback via LangChain | HIGH | Complete |
| REST SSE endpoint | NestJS chat API with AI SDK Data Stream Protocol compliance | HIGH | Complete |
| Frontend widget | Floating chat bubble + panel with message streaming | HIGH | Complete |
| Suggested questions | 3 pre-built prompt suggestions on first open | MEDIUM | Complete |
| Rate limiting | IP-based throttling (5 msgs/min) via Cloudflare headers extraction | HIGH | Complete |
| Admin re-index | Dashboard button to trigger full content re-indexing | MEDIUM | Complete |

### Technical Implementation

#### Database & Infrastructure
- [x] Swapped Docker image to `pgvector/pgvector:pg16`
- [x] Created `Embedding` model with `vector(768)` type
- [x] Prisma migration with pgvector extension + HNSW index
- [x] Zero-downtime upgrade for existing deployments

#### Content Pipeline
- [x] ContentChunkerService — reads profile.json, skills.json, experience.json, certificates.json, projects, blog posts
- [x] Structured chunking (1 chunk per item for structured data, 512-token chunks for blog with overlap)
- [x] TipTap JSON text extraction for blog content
- [x] Incremental re-indexing by source type

#### Embedding & Vector Search
- [x] EmbeddingService wraps Gemini `embedding-001` API (free tier, 768-dim)
- [x] VectorStoreService with `$queryRaw` for vector operations
- [x] Cosine similarity search with 0.3 minimum relevance threshold
- [x] Top-5 retrieval for RAG context

#### RAG Pipeline
- [x] RagService orchestrates: query embedding → similarity search → prompt building → LLM streaming
- [x] System prompt constrains bot to portfolio context only
- [x] Conversation history support (last 6 messages / 3 turns)
- [x] LlmProviderService with Groq primary + Gemini fallback

#### API & Frontend
- [x] ChatController with `/api/chat` (SSE, public) and `/api/chat/reindex` (admin-only)
- [x] Streaming response compatible with Vercel AI SDK `useChat`
- [x] ChatWidget component (floating bubble + panel, client-only)
- [x] Message list with auto-scroll and typing indicator
- [x] Suggested questions on first open

#### Deployment & Safety
- [x] Rate limiting (5 msgs/min per IP) via `@nestjs/throttler`
- [x] Cloudflare `CF-Connecting-IP` header extraction for real client IP
- [x] X-Accel-Buffering: no header for SSE through Cloudflare Tunnel
- [x] Environment variables (`GOOGLE_API_KEY`, `GROQ_API_KEY`) in production `.env`

### Success Criteria (Phase 7 COMPLETE)

- [x] Full RAG pipeline functional (embed → search → stream)
- [x] Chat widget visible and interactive on all pages
- [x] Groq streaming working with <3s first token latency
- [x] Fallback to Gemini on Groq failure (graceful degradation)
- [x] Rate limiting prevents abuse (429 responses)
- [x] Real client IP correctly identified behind Cloudflare Tunnel
- [x] SSE streaming works through tunnel without buffering
- [x] Admin can re-index content from dashboard
- [x] Suggested questions improve UX
- [x] System prompt constraints prevent off-topic responses
- [x] Vietnamese language support (responds in Vietnamese if queried)
- [x] No TypeScript errors or build failures
- [x] All phases 1-6 completed and tested

### Dependencies
- Phase 6 (CV Download) complete with working API infrastructure
- PostgreSQL + MinIO available in production
- Gemini API key configured for embeddings
- Groq API key configured for LLM

### Key Decisions
- **No GraphQL for chat** — SSE requires REST; simpler than Apollo subscriptions
- **Session-only history** — No DB persistence for MVP (YAGNI principle)
- **Admin-triggered re-indexing** — No auto-sync; manual CLI or dashboard button
- **Groq primary LLM** — Faster (276 tok/s) than Gemini, better for streaming
- **Gemini Flash fallback** — Better Vietnamese support, always available
- **Knowledge Base Management (Phase 8)** — Post-MVP enhancement for source toggling

---

### Objectives (ACHIEVED)
- Dynamic CV management via API (no static file redeploy) ✓
- Admin upload PDF or auto-generate from portfolio data ✓
- Professional CV PDF download for HR applications ✓
- Puppeteer integration for HTML-to-PDF conversion ✓

### Features Implemented

| Feature | Scope | Priority | Status |
|---------|-------|----------|--------|
| API Resume Module | CRUD endpoints, MinIO storage, active resume logic | HIGH | Complete |
| Admin Upload | Upload PDF file, validation, preview | HIGH | Complete |
| Admin Generate | Render HTML template, Puppeteer → PDF | HIGH | Complete |
| Active Toggle | Select upload vs generated, atomic transactions | HIGH | Complete |
| Public Download | GET /api/resume/download, single button endpoint | HIGH | Complete |
| Frontend Integration | Hero + About + CTA download buttons updated | HIGH | Complete |
| Docker Puppeteer | Chromium installation, --no-sandbox flag | HIGH | Complete |
| XSS Prevention | Escaped template output in generated PDF | HIGH | Complete |

### Technical Changes
- **Prisma:** Resume model with type, fileName, fileSize, isActive fields
- **NestJS API:** ResumeModule with controller, service, Puppeteer integration
- **Admin Dashboard:** /admin/resume with upload, preview, generate, setActive, delete
- **Frontend:** Download button URLs changed from `/resume.pdf` to `/api/resume/download`
- **Docker:** Added chromium to API Dockerfile
- **Content:** Removed static `/public/resume.pdf`

### Success Criteria (Phase 6 COMPLETE)

- [x] Admin can upload PDF resume files
- [x] Admin can generate CV from portfolio data (profile, skills, experience)
- [x] Generated CV renders as professional 1-page PDF via Puppeteer
- [x] Single active resume toggle for upload vs generated
- [x] Public download endpoint serves active resume without auth
- [x] Hero + About + CTA buttons all use new API endpoint
- [x] XSS protection in CV template output
- [x] Docker build includes Chromium for Puppeteer
- [x] MinIO storage integration with proper content-disposition
- [x] All CRUD operations protected with JWT
- [x] No TypeScript errors or build failures

### Code Review Findings (Applied)
- Critical: Filename sanitization in Content-Disposition header
- Critical: Body size limit on generate endpoint (100kb)
- High: Fixed `animated-cta-card.tsx` to use `download` attribute
- High: Added Puppeteer timeout on page.setContent()
- Medium: Created proper DTO with class-validator decorators
- Documentation: Updated codebase references

### Dependencies
- Phase 5 (Certificate Management) complete with working API
- PostgreSQL + MinIO available
- Showcase professional certifications on About page ✓
- Implement full CRUD dashboard for certificate management ✓
- Add smart URL auto-fill feature (Coursera/Udemy link parsing) ✓
- Integrate certificates into portfolio with API-first architecture ✓

### Features Implemented

| Feature | Scope | Priority | Status |
|---------|-------|----------|--------|
| Portfolio UI | CertificateCard + CertificatesSection on About page (3/2/1 grid) | HIGH | Complete |
| Mock data | certificates.json with 4-5 sample certs | HIGH | Complete |
| Dashboard CRUD | List, Create, Edit, Delete pages with DataTable | HIGH | Complete |
| Prisma model | Certificate entity with title, issuer, date, credentialUrl, icon, sortOrder | HIGH | Complete |
| GraphQL API | Public queries + JWT-protected mutations | HIGH | Complete |
| URL auto-fill | Paste Coursera/Udemy link → API scrapes → pre-fills form | MEDIUM | Complete |
| Cheerio integration | Server-side URL metadata extraction (OG tags, platform-specific) | MEDIUM | Complete |
| Error handling | Toast warning on scrape fail, manual fallback works | MEDIUM | Complete |
| API integration | About page fetches from API with JSON fallback | HIGH | Complete |
| Responsive grid | 3-col ≥1024px, 2-col ≥768px, 1-col mobile | HIGH | Complete |
| Verify links | Credential URLs open in new tab with external link icon | HIGH | Complete |

### Technical Changes
- **Prisma:** Certificate model with full schema migration
- **NestJS API:** CertificatesModule with service, resolver, DTOs, and URL extraction service
- **Dashboard:** 3 pages (list, new, edit) with shared CertificateForm component
- **Components:** CertificateCard, CertificatesSection, CertificateForm (admin)
- **API Client:** apiGetCertificates() with JSON fallback
- **Cheerio:** URL scraping for Coursera, Udemy, FreeCodeCamp, generic fallback

### Key Decisions
- **Card layout:** Compact horizontal scroll (changed from grid) for efficient space usage
- **Card content:** Issuer icon + title + issuer + date + verify link
- **Thumbnail:** Certificate thumbnail image added to card (enhancement)
- **Placement:** About page (between Skills and Timeline sections)
- **No OCR:** Manual entry + URL auto-fill sufficient for 4-7 certs
- **Graceful degradation:** API fetch with JSON fallback ensures portfolio works offline

### Success Criteria (Phase 5 COMPLETE)

- [x] Certificates section visible on About page with responsive grid
- [x] Dashboard CRUD fully functional (add/edit/delete certificates)
- [x] URL auto-fill works for Coursera, Udemy, and other platforms
- [x] Credential verify links open in new tab
- [x] API integration with JSON fallback for resilience
- [x] Horizontal scroll layout with compact cards
- [x] Certificate thumbnail images displayed on cards
- [x] GraphQL schema generated without errors
- [x] All mutations protected by JwtAuthGuard
- [x] No TypeScript errors or warnings
- [x] Build passes without errors

### Dependencies
- Phase 4B complete with GitHub OAuth and working API

---

## Timeline Summary

| Phase | Duration | Start | End | Status |
|-------|----------|-------|-----|--------|
| Phase 1 | 2-3 weeks | Feb 16 | Mar 16 | COMPLETE ✓ |
| Phase 2 | 1-2 weeks | Mar 17 | Mar 31 | COMPLETE ✓ |
| Phase 3 | 1 week | Apr 1 | Mar 17 | COMPLETE ✓ |
| Phase 4A | 1 week | Mar 10 | Mar 17 | COMPLETE ✓ |
| Phase 4B | 1 week | Mar 18 | Mar 18 | PARTLY COMPLETE ✓ (OAuth) |
| Phase 5 | 1 day | Mar 18 | Mar 18 | COMPLETE ✓ (Certificates) |
| Phase 6 | 1 day | Mar 18 | Mar 18 | COMPLETE ✓ (CV Download) |

**Total Completed:** Phases 1-3 + Phase 4A + Phase 4B (OAuth) + Phase 5 (Certificates) + Phase 6 (CV Download) ✓
**Production Ready:** All phases complete with working backend CMS, admin dashboard, GitHub OAuth authentication, certificate management, and dynamic CV download system

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

## Phase 1 Success Metrics (ACHIEVED)

**Overall Status:** COMPLETE ✓ (March 16, 2026)

- **Portfolio Launch:** Polished editorial minimalist design ✓
- **All Pages:** Home, Projects, About, Diary, Blog placeholder fully functional and responsive ✓
- **Content Quality:** HR-focused copywriting on hero, bio, about, contact sections ✓
- **Features:** GitHub stats, LifeSourceCode animation, category badges, dark mode, animations ✓
- **Deployment:** Ready for Vercel with custom domain ✓
- **Performance:** Lighthouse > 80 across all metrics (local testing) ✓
- **Build Quality:** Zero TypeScript errors, zero lint warnings, all tests passing ✓
- **Code Review:** 8.2/10 score with no critical issues ✓
- **Data Structure:** Projects expanded from 3 to 6 (2 company, 2 freelance, 2 personal) ✓
- **GitHub Integration:** Live API fetch for repos, followers, contribution graph ✓

### Phase 1 Highlights
1. **4 new mock projects** added (Company CRM Platform, Company Inventory System, Freelance Restaurant Website, Freelance Dental Clinic)
2. **Experience data** updated (Promete Technology, FPT Software, FPT University)
3. **Tech stack expanded** to 20+ technologies (MySQL, SQL Server, Cloudflare, macOS added)
4. **GitHub username** corrected from kanenguyen to haunguyendev
5. **Animated page titles** with fade+slide-up transitions
6. **LifeSourceCode** terminal with char-by-char typing animation
7. **Copywriting audit** completed for HR appeal

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
