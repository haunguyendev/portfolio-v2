# Brainstorm: Phase 4 — Custom Backend CMS

## Problem Statement
Build custom backend/CMS for portfolio instead of third-party CMS. Goals: showcase full-stack skills to HR, full control, future extensibility.

## Final Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend | NestJS (separate service) | Enterprise-grade, showcase microservice architecture, user has NestJS experience |
| Database | PostgreSQL + Prisma | Type-safe ORM, schema-first, popular in industry |
| API style | GraphQL primary + REST for uploads/webhooks | GraphQL for CRUD/queries, REST only for file upload + webhooks |
| Auth | Better Auth (Next.js) + JWT Guard (NestJS) | Auth on frontend, backend verifies JWT. Clean separation |
| Editor | TipTap (headless rich text) | JSON output stored in JSONB. React-friendly, extensible |
| Content storage | Full DB, drop MDX | TipTap JSON in PostgreSQL JSONB. Single source of truth |
| Admin UI | shadcn/ui, /admin/* route in Next.js | Consistent with portfolio style, protected by Better Auth middleware |
| Repo | Monorepo (Turborepo) | apps/web + apps/api + packages/shared + packages/prisma |
| Deploy (web) | Vercel | Existing setup |
| Deploy (api) | Docker on home server + Cloudflare Tunnel | $0 cost, full control, showcase DevOps skills |
| Media storage | Cloudflare R2 | S3-compatible, free egress |

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│ Cloudflare (Tunnel + R2 Storage)                         │
├───────────────────────┬──────────────────────────────────┤
│ Vercel                │ Home Server (Docker Compose)     │
│ ┌───────────────────┐ │ ┌──────────────────────────────┐ │
│ │ Next.js 15        │ │ │ NestJS API                   │ │
│ │ - Public pages    │ │ │ - GraphQL (primary)          │ │
│ │ - /admin/* dash   │ │ │ - REST (uploads/webhooks)    │ │
│ │ - Better Auth     │◄┼─┤ - Prisma + PostgreSQL        │ │
│ │ - TipTap editor   │ │ │ - JWT Guard                  │ │
│ │ - SSR/ISR         │ │ │ - Media upload → R2          │ │
│ └───────────────────┘ │ └──────────────────────────────┘ │
└───────────────────────┴──────────────────────────────────┘
```

## Monorepo Structure

```
porfolio_v2/
├── apps/
│   ├── web/            # Next.js 15 (portfolio + admin)
│   │   └── src/app/
│   │       ├── (public)/    # Public pages (home, blog, about...)
│   │       └── (admin)/     # Admin dashboard
│   │           └── admin/
│   │               ├── page.tsx      # Dashboard
│   │               ├── posts/        # CRUD posts
│   │               ├── projects/     # CRUD projects
│   │               ├── media/        # Media library
│   │               ├── comments/     # Moderation
│   │               ├── analytics/    # View stats
│   │               └── settings/     # Site settings
│   └── api/            # NestJS backend
│       └── src/
│           ├── posts/       # PostModule
│           ├── projects/    # ProjectModule
│           ├── media/       # MediaModule (R2 upload)
│           ├── comments/    # CommentModule
│           ├── analytics/   # AnalyticsModule
│           ├── auth/        # JWT Guard
│           └── graphql/     # Schema-first or code-first
├── packages/
│   ├── shared/         # Shared types, validators, constants
│   └── prisma/         # Prisma schema + generated client
├── docker-compose.yml  # PostgreSQL + NestJS
├── turbo.json
└── package.json
```

## Database Schema (Prisma)

```prisma
// === AUTH ===
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  avatar    String?
  role      Role      @default(ADMIN)
  posts     Post[]
  comments  Comment[]
  createdAt DateTime  @default(now())
}

enum Role { ADMIN  USER }

// === CONTENT ORGANIZATION ===
model Category {
  id          String  @id @default(cuid())
  name        String  @unique
  slug        String  @unique
  description String?
  color       String? // hex for UI badge
  sortOrder   Int     @default(0)
  posts       Post[]
}

model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  slug  String    @unique
  posts PostTag[]
}

model PostTag {
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  String
  @@id([postId, tagId])
}

model Series {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String?
  coverImage  String?
  published   Boolean  @default(false)
  posts       Post[]
  createdAt   DateTime @default(now())
}

// === POSTS (Blog + Diary) ===
model Post {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  description String?
  content     Json      // TipTap JSON document
  coverImage  String?
  published   Boolean   @default(false)
  featured    Boolean   @default(false)
  type        PostType  @default(BLOG)
  readingTime Int?
  mood        String?   // diary only
  // Relations
  author      User      @relation(fields: [authorId], references: [id])
  authorId    String
  category    Category? @relation(fields: [categoryId], references: [id])
  categoryId  String?
  series      Series?   @relation(fields: [seriesId], references: [id])
  seriesId    String?
  seriesOrder Int?
  tags        PostTag[]
  comments    Comment[]
  likes       Like[]
  views       PageView[]
  // SEO
  metaTitle   String?
  metaDesc    String?
  ogImage     String?
  // Timestamps
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum PostType { BLOG  DIARY }

// === PROJECTS ===
model Project {
  id           String   @id @default(cuid())
  title        String
  slug         String   @unique
  description  String
  longDesc     String?
  image        String?
  technologies String[]
  category     String?
  github       String?
  demo         String?
  featured     Boolean  @default(false)
  sortOrder    Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// === ENGAGEMENT ===
model Comment {
  id          String    @id @default(cuid())
  content     String
  authorName  String
  authorEmail String?
  post        Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId      String
  user        User?     @relation(fields: [userId], references: [id])
  userId      String?
  approved    Boolean   @default(false)
  parentId    String?
  parent      Comment?  @relation("Replies", fields: [parentId], references: [id])
  replies     Comment[] @relation("Replies")
  createdAt   DateTime  @default(now())
}

model Like {
  id        String   @id @default(cuid())
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  ipHash    String
  createdAt DateTime @default(now())
  @@unique([postId, ipHash])
}

model PageView {
  id        String   @id @default(cuid())
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  path      String
  referrer  String?
  createdAt DateTime @default(now())
}

// === MEDIA ===
model Media {
  id        String   @id @default(cuid())
  filename  String
  url       String
  mimeType  String
  size      Int
  alt       String?
  folder    String?
  createdAt DateTime @default(now())
}
```

## Feature Phases

### Phase 4A: Admin Dashboard + API Foundation
- Turborepo monorepo setup (migrate existing code to apps/web)
- NestJS project init (apps/api)
- Prisma schema + PostgreSQL (docker-compose)
- GraphQL API: posts, projects, categories, tags, series
- REST: health check, media upload placeholder
- Better Auth integration (Next.js)
- JWT Guard (NestJS)
- Admin dashboard UI: sidebar, dashboard, posts CRUD, projects CRUD
- TipTap editor for post content
- Migrate JSON/MDX content to database (seed script)
- Public pages fetch from API instead of JSON files

### Phase 4B: Media Upload
- Cloudflare R2 setup + NestJS Multer integration
- Image optimization (sharp: resize, webp conversion)
- Media library UI (grid view, upload, delete, copy URL)
- TipTap image extension (insert from media library)
- Cover image picker for posts/projects

### Phase 4C: Comments & Likes
- Comment GraphQL resolvers (create, list, delete, approve)
- Threaded comments (parent/replies)
- Like system (IP-hash based, no auth required)
- Anti-spam: rate limiting, honeypot field
- Comment moderation UI in admin
- Public comment form + display on blog/diary pages

### Phase 4D: Analytics & View Counter
- PageView tracking endpoint (REST, fire-and-forget)
- View counter on posts (ISR cached)
- Admin analytics dashboard (popular posts, traffic chart, referrers)
- Privacy: IP anonymized, no cookies, GDPR-friendly

## Auth Flow

```
1. Admin visits /admin/login
2. Better Auth handles login (email/password or OAuth)
3. Better Auth issues JWT + session cookie
4. Frontend sends JWT in Authorization header to NestJS API
5. NestJS JwtGuard verifies token signature
6. NestJS syncs user record on first login
7. Protected GraphQL mutations accessible
```

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Home server downtime | API offline | SSG/ISR for public pages, API only for admin/comments/analytics |
| Monorepo migration | Break existing site | Incremental: move code to apps/web first, verify build, then add api |
| Content migration | Data loss | Seed script from JSON/MDX, keep originals as backup |
| GraphQL + REST complexity | Maintenance burden | GraphQL for 90% of API, REST only for uploads/webhooks |
| Scope too large | Never ships | Strict phase gates: 4A must ship before 4B |

## Success Metrics
- Admin CRUD posts, projects, diary via dashboard with TipTap editor
- Public site reads from PostgreSQL via GraphQL API
- Threaded comments on blog posts
- View count on posts
- Media library with R2 storage
- `docker compose up` → full stack running locally
- < 200ms API response time
- Zero downtime deployment (Docker + Cloudflare)

## Resolved Questions
1. ~~GraphQL or REST?~~ → GraphQL primary + REST for uploads/webhooks
2. ~~Rich text editor?~~ → TipTap with JSON output
3. ~~Keep MDX?~~ → Full DB, drop MDX
4. Email notifications → deferred, not in Phase 4 scope
