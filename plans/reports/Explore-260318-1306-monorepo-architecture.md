# Portfolio v2 Monorepo Exploration Report

**Date:** 2026-03-18  
**Explored by:** Explore Agent  
**Scope:** Complete monorepo architecture, project structure, database schema, GraphQL API, admin dashboard features, and content data flow

---

## Executive Summary

Kane's portfolio v2 is a **mature Turborepo monorepo** with a sophisticated tech stack:
- **Frontend:** Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui + MDX (Velite)
- **Backend API:** NestJS 11 + GraphQL (code-first) with JWT authentication
- **Database:** PostgreSQL + Prisma ORM with comprehensive schema
- **Admin Dashboard:** Full CRUD CMS for posts, projects, categories, tags, and series
- **Storage:** MinIO (S3-compatible) for media uploads
- **Deployment:** Docker + Vercel (web) + self-hosted Ubuntu server

**Current Phase:** 4A (CMS & admin dashboard with GraphQL API) — ~95% complete. No certificate feature yet.

---

## 1. Project Structure

```
porfolio_v2/
├── apps/
│   ├── web/                           # Next.js 15 frontend + admin dashboard
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── page.tsx          # Home page
│   │   │   │   ├── about/            # About page (bio, skills, timeline)
│   │   │   │   ├── projects/         # Projects listing page
│   │   │   │   ├── blog/             # Blog list + detail pages (MDX)
│   │   │   │   ├── diary/            # Diary list + detail pages (MDX)
│   │   │   │   ├── (admin)/          # Admin dashboard (protected routes)
│   │   │   │   │   ├── admin/
│   │   │   │   │   │   ├── page.tsx  # Admin dashboard home
│   │   │   │   │   │   ├── posts/    # Posts CRUD
│   │   │   │   │   │   ├── projects/ # Projects CRUD
│   │   │   │   │   │   ├── series/   # Blog series CRUD
│   │   │   │   │   │   ├── categories/ # Categories CRUD
│   │   │   │   │   │   └── tags/     # Tags CRUD
│   │   │   │   └── (auth)/           # Auth routes
│   │   │   │       └── admin/login/
│   │   │   │
│   │   │   ├── components/           # 58 reusable components
│   │   │   │   ├── home/             # Hero, featured projects, CTA sections
│   │   │   │   ├── projects/         # ProjectCard, ProjectGrid, ProjectFilter
│   │   │   │   ├── about/            # BioSection, SkillsSection, Timeline, GitHubStats
│   │   │   │   ├── blog/             # BlogPostCard, BlogPostList, MDXRenderer
│   │   │   │   ├── diary/            # DiaryEntryCard, DiaryEntryList, MoodFilter
│   │   │   │   ├── admin/            # AdminHeader, AdminSidebar, DataTable, Forms (Project, Post)
│   │   │   │   ├── layout/           # Header, Footer, Navigation, CommandMenu
│   │   │   │   ├── ui/               # shadcn/ui components (Button, Card, Badge, etc.)
│   │   │   │   └── seo/              # JSON-LD, meta tags
│   │   │   │
│   │   │   ├── content/              # Static JSON data
│   │   │   │   ├── projects.json     # 6 projects (featured + non-featured)
│   │   │   │   ├── experience.json   # 3 employment/education entries
│   │   │   │   └── skills.json       # 4 skill categories
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts     # GraphQL queries for projects, blog, diary
│   │   │   │   ├── graphql-client.ts # GraphQL client factory (public + authenticated)
│   │   │   │   ├── auth-client.ts    # Better Auth client
│   │   │   │   ├── auth.ts           # Auth helpers
│   │   │   │   ├── content.ts        # Content loaders (blogs, diaries, projects, skills)
│   │   │   │   ├── constants.ts      # App constants
│   │   │   │   ├── diary-constants.ts # Mood types for diary
│   │   │   │   └── utils.ts          # Utilities
│   │   │   │
│   │   │   └── types/                # TypeScript type definitions
│   │   │       ├── project.ts        # Project interface
│   │   │       ├── experience.ts     # Experience interface
│   │   │       └── skill.ts          # SkillGroup interface
│   │   │
│   │   └── package.json              # Dependencies: Next.js 16, React 19, TipTap, GraphQL
│   │
│   └── api/                          # NestJS GraphQL API server (port 3001)
│       ├── src/
│       │   ├── main.ts               # Entry point
│       │   ├── app.module.ts         # Root module with imports
│       │   ├── schema.gql            # Generated GraphQL schema
│       │   │
│       │   ├── auth/                 # Authentication module
│       │   │   ├── auth.module.ts
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── decorators/
│       │   │
│       │   ├── projects/             # Projects module
│       │   │   ├── projects.resolver.ts
│       │   │   ├── projects.service.ts
│       │   │   ├── models/
│       │   │   └── dto/
│       │   │
│       │   ├── posts/                # Posts (blog + diary) module
│       │   │   ├── posts.resolver.ts
│       │   │   ├── posts.service.ts
│       │   │   ├── models/
│       │   │   └── dto/
│       │   │
│       │   ├── categories/           # Categories module
│       │   ├── tags/                 # Tags module
│       │   ├── series/               # Blog series module
│       │   ├── media/                # Media upload module
│       │   ├── prisma/               # Prisma service
│       │   ├── graphql/              # GraphQL config
│       │   └── health/               # Health check endpoint
│       │
│       └── package.json              # Dependencies: NestJS 10, Apollo, Prisma, JWT
│
├── packages/
│   ├── prisma/                       # Shared Prisma schema + migrations
│   │   ├── schema.prisma             # 14 models (User, Post, Project, etc.)
│   │   ├── seed.ts                   # Database seeding script
│   │   └── migrations/
│   │
│   └── shared/                       # Shared types/utilities (minimal)
│
├── docs/                             # Documentation
│   ├── project-overview-pdr.md
│   ├── codebase-summary.md
│   ├── code-standards.md
│   ├── system-architecture.md
│   ├── design-guidelines.md
│   ├── deployment-guide.md
│   └── project-roadmap.md
│
├── docker-compose.yml                # PostgreSQL dev container
├── docker-compose.prod.yml           # Production stack (web, api, db)
├── turbo.json                        # Turborepo config
├── pnpm-workspace.yaml               # pnpm workspaces definition
└── CLAUDE.md                         # Project instructions & conventions
```

---

## 2. Current Web App Pages & Routes

### Public Pages (Fully Implemented)
1. **Home** (`/`) — Hero section, featured projects, about preview, latest blog, latest diary, contact CTA
2. **Projects** (`/projects`) — Full project list with technology filtering
3. **About** (`/about`) — Bio, skills (tech + soft), experience timeline, GitHub stats
4. **Blog** (`/blog`) — Blog post list; `/blog/[slug]` for detail (MDX rendering)
5. **Diary** (`/diary`) — Diary entry list; `/diary/[slug]` for detail with mood badges

### Admin Pages (Protected, Requires Login)
- **Admin Home** (`/admin`) — Dashboard with stats (total posts, published, drafts, projects)
- **Posts** (`/admin/posts`) — List view with DataTable, create/edit forms (CRUD)
- **Projects** (`/admin/projects`) — List view with DataTable, create/edit forms (CRUD)
- **Series** (`/admin/series`) — Manage blog series
- **Categories** (`/admin/categories`) — Manage post categories
- **Tags** (`/admin/tags`) — Manage post tags
- **Auth** (`/admin/login`) — Better Auth login form

### API Routes
- `/api/auth/[...all]` — Better Auth callback handler
- `/api/media/*` — Media upload endpoint (proxied to NestJS API)

---

## 3. Admin Dashboard Features

### Dashboard Home
- **Stats Cards:** Total posts, published, drafts, total projects
- **Quick Actions:** "New Post" and "New Project" buttons
- **Recent Posts Table:** Shows last 5 posts with title, type, status, date

### Data Management
| Feature | Status | Notes |
|---------|--------|-------|
| Posts CRUD | ✅ Full | Blog + Diary, TipTap editor, featured flag, categories/tags |
| Projects CRUD | ✅ Full | All fields (tech, links, role, impact, dates) |
| Categories CRUD | ✅ Full | For organizing posts |
| Tags CRUD | ✅ Full | For post tagging |
| Series Management | ✅ Full | For blog series |
| Media Upload | ✅ Full | TipTap image editor, MinIO integration |
| Authentication | ✅ Full | Better Auth (JWT) with admin-only access |

### Admin Components
- `AdminSidebar` — Navigation with icons
- `AdminHeader` — Top bar with user info
- `DataTable` — Reusable table for CRUD lists
- `ProjectForm` — Form with image upload, tech picker, dates
- `PostForm` — Form with TipTap editor, category/tag selection
- `ImageDropzone` — Drag-drop image upload to MinIO

---

## 4. Database Schema (Prisma)

### 14 Models Total

**Auth Models (Better Auth):**
- `User` — Admin user with role (ADMIN/USER)
- `Session` — JWT sessions
- `Account` — OAuth integration
- `Verification` — Email/OTP verification

**Content Organization:**
- `Category` — Post categories (color, sortOrder)
- `Tag` — Post tags with slug
- `PostTag` — Junction table (many-to-many)
- `Series` — Blog series (title, slug, published)

**Main Content:**
- `Post` — Blog + diary posts (type: BLOG | DIARY)
  - **Fields:** id, title, slug, description, content (JSON/TipTap), coverImage, published, featured, type, mood (for diary), readingTime, authorId (User FK), categoryId, seriesId, tags (many-to-many), metaTitle, metaDesc, ogImage, publishedAt, timestamps
  - **Relations:** author (User), category, series, tags, comments, likes, pageViews
- `Project` — Portfolio projects
  - **Fields:** id, title, slug, description, longDesc, image, technologies (array), category, github, demo, featured, sortOrder, role, teamSize, impact, startDate, endDate, timestamps

**Engagement:**
- `Comment` — Post comments with nested replies
- `Like` — Post likes (tracked by ipHash)
- `PageView` — Page view analytics
- `Media` — Media files (MinIO metadata)

---

## 5. GraphQL Schema & API

### Generated Schema Location
`/Users/kanenguyen/personal/side-project/porfolio_v2/apps/api/src/schema.gql`

### Query Types (Public Accessible)
```graphql
query {
  projects(featuredOnly: Boolean): [Project!]!
  project(id: ID!): Project
  projectBySlug(slug: String!): Project
  
  posts(filter: PostsFilterInput): [Post!]!
  post(id: ID!): Post
  postBySlug(slug: String!): Post
  
  seriesList: [Series!]!
  seriesBySlug(slug: String!): Series
  
  categories: [Category!]!
  category(id: ID!): Category
  
  tags: [Tag!]!
}
```

### Mutation Types (Admin Only, JWT Required)
```graphql
mutation {
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  reorderProjects(ids: [ID!]!): [Project!]!
  deleteProject(id: ID!): Boolean!
  
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  publishPost(id: ID!): Post!
  deletePost(id: ID!): Boolean!
  
  createCategory(input: CreateCategoryInput!): Category!
  updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
  deleteCategory(id: ID!): Boolean!
  
  createTag(input: CreateTagInput!): Tag!
  createSeries(input: CreateSeriesInput!): Series!
  updateSeries(id: ID!, input: UpdateSeriesInput!): Series!
  deleteSeries(id: ID!): Boolean!
}
```

### Key Filter & Input Types
- `PostsFilterInput` — Filter by type (BLOG|DIARY), published, featured, categoryId, tagIds, seriesId
- `CreatePostInput` — All post fields including content (JSON), tagIds array
- `CreateProjectInput` — All project fields, technologies array

### Auth Guard
- `JwtAuthGuard` — Protects all mutations
- `CurrentUser` decorator — Injects authenticated user into resolvers

---

## 6. Data Flow: API to Web

### GraphQL Client Setup
**File:** `/Users/kanenguyen/personal/side-project/porfolio_v2/apps/web/src/lib/graphql-client.ts`

```typescript
// Public client (no auth)
export const gqlClient = new GraphQLClient(`${API_URL}/graphql`)

// Authenticated client factory
export async function getAuthenticatedGqlClient(): GraphQLClient
  // Fetches session token from /api/auth/get-session
  // Adds Authorization: Bearer {token} header
```

### API Client Library
**File:** `/Users/kanenguyen/personal/side-project/porfolio_v2/apps/web/src/lib/api-client.ts`

**Public Query Functions:**
```typescript
apiGetProjects(featuredOnly?: boolean): Promise<Project[]>
apiGetBlogs(): Promise<Blog[]>
apiGetBlogBySlug(slug: string): Promise<Blog | undefined>
apiGetDiaries(): Promise<Diary[]>
apiGetDiaryBySlug(slug: string): Promise<Diary | undefined>
apiGetAllBlogTags(): Promise<string[]>
```

**Mapping Functions:**
- `mapPostToBlog()` — Converts API Post (type: BLOG) to Blog object
- `mapPostToDiary()` — Converts API Post (type: DIARY) to Diary object
- `mapProject()` — Converts API Project to internal Project type

**Error Handling:** All functions return empty arrays/undefined on API failure (graceful degradation)

### Content Loading Strategy
1. **Server-side:** Next.js pages use async functions to fetch from GraphQL API
2. **Caching:** `revalidate` flags set on pages (60s for projects, 0 for admin)
3. **Error fallback:** Components gracefully handle missing data
4. **Media URLs:** `/api/media/*` paths are proxied by Next.js to NestJS API

---

## 7. Content Data Structure

### Static Content (JSON files in `/content/`)

**projects.json** (6 projects)
```json
{
  "id": "portfolio-v2",
  "title": "Portfolio v2",
  "description": "Short one-liner",
  "longDescription": "Detailed description",
  "image": "/images/projects/portfolio-v2.png",
  "technologies": ["Next.js", "TypeScript", ...],
  "featured": true,
  "category": "Personal|Company|Freelance",
  "links": { "github": "url", "demo": "url" },
  "role": "Full-stack Developer",
  "teamSize": "Solo",
  "impact": "Showcases 5 production projects",
  "startDate": "Mar 2026",
  "endDate": "optional"
}
```

**experience.json** (3 entries: Promete, FPT Software, FPT University)
```json
{
  "company": "Company Name",
  "role": "Job Title",
  "duration": "Mar 2025 - Present",
  "description": "Brief description",
  "highlights": ["Bullet point 1", "Bullet point 2", ...]
}
```

**skills.json** (4 categories)
```json
{
  "category": "Frontend|Backend|Tools & DevOps|Other",
  "items": ["Skill 1", "Skill 2", ...]
}
```

### MDX Content (Velite-managed)
- Blog posts: `/src/content/posts/` (Velite compiles to `#site/blogs`)
- Diary entries: `/src/content/entries/` (Velite compiles to `#site/diaries`)
- **Format:** Frontmatter YAML + Markdown
- **Features:** Syntax highlighting (Shiki), table of contents, code blocks

---

## 8. Component Patterns & Architecture

### Component Organization (58 components total)

**Section Components** (render content areas)
- `FeaturedProjectsSection`, `LatestBlogSection`, `LatestDiarySection`
- Load data via `apiGetProjects()`, `apiGetBlogs()`, etc.
- Async components with loading states

**Card Components** (display individual items)
- `ProjectCard` — Project preview with tech badges, links
- `BlogPostCard` — Blog preview with date, tags, reading time
- `DiaryEntryCard` — Diary preview with mood badge

**Form Components** (admin CRUD)
- `ProjectForm` — GraphQL mutation on submit
- `PostForm` — TipTap editor, category/tag picker
- `ImageDropzone` — Drag-drop to MinIO, shows preview

**Layout Components**
- `Header` — Navigation with command menu
- `Footer` — Links + socials
- `AdminSidebar` — Admin nav with icons
- `DataTable` — Reusable table component for lists

**UI Components** (shadcn/ui)
- Badge, Button, Card, Input, Select, Textarea, etc.
- No custom CSS beyond Tailwind utilities

### Styling Architecture
- **Framework:** Tailwind CSS v4 + shadcn/ui defaults
- **Theme:** Light mode primary, dark mode support via `next-themes`
- **Palette:** Zinc (neutral), orange→red→blue gradients for accents
- **Spacing:** CSS variables from shadcn/ui defaults
- **No custom CSS files** (only utility classes in components)

---

## 9. About Page Structure (Existing)

**Current About Page Sections:**
1. **BioSection** — Text about Kane (hardcoded or from constants)
2. **GitHubStatsSection** — GitHub stats display
3. **SkillsSection** — Tech stack tabs + soft skills badges
4. **Timeline** — Experience entries from `experience.json`

**Components Used:**
- `AnimatedPageTitle` — Page title with animation
- `SkillsSection` — Renders skills.json data
- `Timeline` — Renders experience.json with `TimelineItem`

**No Certificates Section Yet** — Not implemented

---

## 10. Admin Authentication & Protection

### Authentication Stack
- **Library:** Better Auth (open-source auth framework)
- **Session Type:** JWT tokens with HttpOnly cookies
- **Login Flow:** `/admin/login` page with email/password form
- **Session Check:** Middleware protects `/admin` routes

### Admin Middleware
**File:** `/Users/kanenguyen/personal/side-project/porfolio_v2/apps/web/src/app/(admin)/layout.tsx`

```typescript
// AdminLayout wraps all /admin routes
// Checks session and redirects to login if needed
// Renders AdminSidebar + AdminHeader + children
```

### GraphQL Auth Guard
**File:** `/Users/kanenguyen/personal/side-project/porfolio_v2/apps/api/src/auth/jwt-auth.guard.ts`

- `@UseGuards(JwtAuthGuard)` protects mutations
- `@CurrentUser()` decorator injects authenticated user into resolvers

---

## 11. Existing Features & Gaps

### Implemented Features ✅
| Feature | Location | Status |
|---------|----------|--------|
| Project management | `/admin/projects/` | Complete CRUD |
| Blog/Diary posts | `/admin/posts/` | Complete CRUD + TipTap editor |
| Categories | `/admin/categories/` | CRUD |
| Tags | `/admin/tags/` | CRUD |
| Blog series | `/admin/series/` | CRUD |
| Image upload | Admin forms | MinIO integration |
| Authentication | `/admin/login` | Better Auth |
| GraphQL API | Port 3001 | Apollo + NestJS |
| Home page sections | `/` | 6 sections |
| Projects listing | `/projects` | With tech filter |
| Blog listing | `/blog` | With tag filter + MDX |
| Diary listing | `/diary` | With mood filter |
| About page | `/about` | Bio + skills + timeline |

### Missing Features ❌
| Feature | Scope | Notes |
|---------|-------|-------|
| **Certificates section** | About page | Not in DB schema, no admin UI |
| Comments | Posts | Model exists, no UI |
| Likes | Posts | Model exists, no UI |
| Page analytics | General | PageView model exists, no dashboard |
| Dark mode toggle | UI | Model exists in Next-themes, not visible |
| Search | General | No full-text search implemented |

---

## 12. Data Persistence & Storage

### Database
- **Type:** PostgreSQL (self-hosted via Docker Compose)
- **Connection:** Prisma ORM
- **Migrations:** Turborepo script `db:migrate`
- **Seeding:** `db:seed` script in `packages/prisma/seed.ts`

### Media Storage
- **Type:** MinIO (S3-compatible)
- **Use Case:** Project images, post cover images, blog media
- **Client:** AWS SDK (@aws-sdk/client-s3)
- **Endpoint:** Configurable via env var `MINIO_ENDPOINT`
- **Access:** Private uploads, public read via `/api/media/*`

### Static Content
- **Projects:** Fallback to `/content/projects.json` if API unavailable
- **Experience:** Loaded from `/content/experience.json`
- **Skills:** Loaded from `/content/skills.json`
- **Blog/Diary:** Managed via Velite (MDX → JSON compilation)

---

## 13. Development & Deployment

### Local Development
```bash
pnpm install                          # Install all dependencies
docker compose up -d                  # Start PostgreSQL + MinIO
pnpm db:migrate                       # Run Prisma migrations
pnpm db:seed                          # Seed initial data
pnpm dev                              # Start all apps in watch mode
                                      # Web: http://localhost:3000
                                      # API: http://localhost:3001/graphql
```

### Build & Production
```bash
pnpm build                            # Build all apps
pnpm start                            # Start production servers
docker compose -f docker-compose.prod.yml up  # Full prod stack
```

### CI/CD (GitHub Actions)
- Auto-build Docker images on push to main
- Push to GHCR (GitHub Container Registry)
- SSH deploy to self-hosted server via Cloudflare Tunnel
- Environment variables auto-synced to container

### Vercel (Web app alternative)
- Can deploy Next.js web app separately
- Requires `DATABASE_URL` env var for API calls

---

## 14. Key Technologies & Versions

### Frontend (Web App)
- **Next.js:** 16.1.6
- **React:** 19.2.3
- **TypeScript:** 5.x
- **Tailwind CSS:** 4.x
- **shadcn/ui:** 4.0.8
- **GraphQL Client:** graphql-request 7.4.0
- **Auth:** better-auth 1.5.5
- **Rich Editor:** TipTap 2.27.2
- **MDX:** Velite 0.3.1
- **Testing:** Playwright 1.58.2

### Backend API
- **NestJS:** 10.4.15
- **GraphQL:** 16.13.1
- **Apollo Server:** 5.4.0
- **Prisma:** 6.5.0
- **JWT:** @nestjs/jwt 11.0.2
- **File Upload:** multer 2.1.1
- **S3 Client:** @aws-sdk/client-s3 3.1010.0
- **Image Processing:** sharp 0.34.5

### Shared
- **TypeScript:** 5.8.2
- **Database Driver:** @prisma/client 6.5.0

---

## 15. Code Quality & Standards

### File Naming Convention
- Components: `kebab-case` (e.g., `project-card.tsx`)
- Max component size: 200 lines (well-followed)
- One component per file

### Type Safety
- **Strict TypeScript** enabled
- **Co-located types** (types defined near usage)
- Shared types in `/src/types/`

### Component Structure
- Functional components with hooks
- No class components
- Async server components for data fetching
- Dynamic imports for client-side only components

### Code Organization
- Clear module structure (auth, projects, posts, etc.)
- Dedicated service layers in NestJS
- Resolver → Service → Prisma pattern
- GraphQL DTOs for input validation

---

## 16. Unresolved Questions

1. **Certificate Feature Scope:**
   - Where should certificates appear? Separate section on About page? Or new page?
   - What data fields? (certificate name, issuer, date, image, verification link)
   - How to handle certificate images? (MinIO or external link)
   - Should certificates be part of admin CMS or hardcoded JSON?

2. **About Page Enhancements:**
   - Should certificates be editable via admin dashboard?
   - What sort order for sections? (current: Bio → GitHub → Skills → Timeline)
   - Any missing sections before adding certificates?

3. **Database & API Impact:**
   - Create new Prisma model `Certificate` or use generic content model?
   - Should certificates have categories/tags like posts?
   - Need GraphQL queries/mutations for certificate CRUD?

4. **Admin Dashboard:**
   - New `/admin/certificates/` page for CRUD?
   - Image upload support like projects?
   - Reuse existing components (DataTable, Form pattern)?

---

## File Paths Reference

### Critical Files
- `/Users/kanenguyen/personal/side-project/porfolio_v2/apps/web/src/app/about/page.tsx` — About page (29 lines)
- `/Users/kanenguyen/personal/side-project/porfolio_v2/packages/prisma/schema.prisma` — DB schema
- `/Users/kanenguyen/personal/side-project/porfolio_v2/apps/api/src/schema.gql` — GraphQL schema
- `/Users/kanenguyen/personal/side-project/porfolio_v2/apps/web/src/lib/api-client.ts` — API queries
- `/Users/kanenguyen/personal/side-project/porfolio_v2/apps/web/src/app/(admin)/admin/page.tsx` — Admin dashboard
- `/Users/kanenguyen/personal/side-project/porfolio_v2/apps/web/src/content/` — Static data (projects.json, experience.json, skills.json)

### Admin Pages
- Posts: `/apps/web/src/app/(admin)/admin/posts/page.tsx`
- Projects: `/apps/web/src/app/(admin)/admin/projects/page.tsx`
- Components: `/apps/web/src/components/admin/` (8 admin-specific components)

### API Modules
- Projects: `/apps/api/src/projects/` (resolver, service, models, DTOs)
- Posts: `/apps/api/src/posts/` (resolver, service, models, DTOs)
- Auth: `/apps/api/src/auth/` (JWT guard, decorators)

---

## Summary

Kane's portfolio is a **production-grade full-stack application** with:
- ✅ Mature monorepo structure using Turborepo
- ✅ Comprehensive GraphQL API with code-first approach
- ✅ Full-featured admin CMS (posts, projects, categories, tags, series)
- ✅ Rich content editing with TipTap + MDX
- ✅ Strong type safety and code organization
- ✅ Responsive design with shadcn/ui
- ✅ Proper authentication & authorization
- ✅ Modern deployment pipeline (Docker + GitHub Actions)

**No certificates feature yet** — ready to be added to About page with new DB model, GraphQL API, and admin CRUD pages following existing patterns.
