# Phase 6: Content Migration

## Overview
- **Priority:** HIGH
- **Status:** Complete
- **Effort:** 3h
- **Blocked by:** Phase 4 (GraphQL API must be working)

Migrate existing content from JSON files + MDX (Velite) to PostgreSQL. Refactor public pages to fetch from API instead of static imports. Remove Velite dependency.

## Current Content Sources

```
content/projects.json    → 9 projects
content/skills.json      → 5 skill groups (keep as JSON — static, rarely changes)
content/experience.json  → 3 entries (keep as JSON — static)
content/blog/*.mdx       → 3 blog posts (Velite)
content/diary/*.mdx      → 3 diary entries (Velite)
```

## Migration Strategy

```
JSON/MDX files
  ↓ (seed script reads files)
Prisma seed (packages/prisma/seed.ts)
  ↓ (inserts into PostgreSQL)
Database
  ↓ (GraphQL API serves data)
Public pages (fetch from API via SSR/ISR)
```

**Keep as static JSON**: skills.json, experience.json — rarely change, no CMS needed.
**Migrate to DB**: projects.json, blog MDX, diary MDX.

## Implementation Steps

### 1. Create seed script
- `packages/prisma/seed.ts`
- Read `content/projects.json` → insert into Project table
- Read `content/blog/*.mdx` → parse frontmatter + convert body to TipTap JSON → insert into Post (type: BLOG)
- Read `content/diary/*.mdx` → parse frontmatter + convert body to TipTap JSON → insert into Post (type: DIARY)
- Create default admin user
- Create categories from existing tags
- Run: `pnpm --filter @portfolio/prisma seed`

### 2. MDX to TipTap JSON converter
- Parse MDX content (markdown → AST → TipTap JSON)
- Use `remark-parse` to get AST, then transform to TipTap document structure
- Or: simpler approach — convert markdown to HTML, then use TipTap's `generateJSON()` from HTML
- Handle: headings, paragraphs, code blocks, lists, images, links, blockquotes

### 3. Refactor public pages to use API
- Create `apps/web/src/lib/api-client.ts` — server-side GraphQL fetch utility
- Refactor pages to fetch from API:
  - `app/page.tsx` (home) — featured projects, latest blog, latest diary
  - `app/blog/page.tsx` — blog list from API
  - `app/blog/[slug]/page.tsx` — single post from API
  - `app/diary/page.tsx` — diary list from API
  - `app/diary/[slug]/page.tsx` — single diary from API
  - `app/projects/page.tsx` — projects list from API
- Use `fetch()` with ISR revalidation (e.g., `revalidate: 60`)

### 4. TipTap content renderer
- Create `apps/web/src/components/blog/tiptap-renderer.tsx`
- Converts TipTap JSON → React components (or HTML via generateHTML)
- Replace current `MdxContent` component usage
- Preserve: code syntax highlighting, heading IDs for TOC

### 5. Update sitemap + RSS
- `app/sitemap.ts` — fetch posts from API instead of Velite
- `app/feed.xml/route.ts` — fetch from API

### 6. Remove Velite (optional — can keep for local dev fallback)
- Remove `velite`, `@velite/loader` from deps
- Remove `velite.config.ts`
- Remove `content/blog/`, `content/diary/` MDX files
- Remove `.velite/` from gitignore
- Remove Velite types from `src/types/velite.d.ts`
- Clean up `next.config.ts` Velite webpack config

### 7. Verify everything works
- All public pages render with data from API
- Blog posts display TipTap content correctly
- Sitemap includes all posts
- RSS feed works
- `pnpm build` passes

## Todo List
- [x] Create MDX → TipTap JSON converter utility
- [x] Create seed script (projects, posts, categories, tags, admin user)
- [x] Run seed, verify data in Prisma Studio
- [x] Create API client utility (server-side fetch)
- [x] Create TipTap content renderer component
- [x] Refactor home page to fetch from API
- [x] Refactor blog list + detail pages
- [x] Refactor diary list + detail pages
- [x] Refactor projects page
- [x] Update sitemap.ts to use API
- [x] Update feed.xml to use API
- [x] Verify all pages render correctly
- [x] Verify build passes
- [x] (Optional) Remove Velite dependency

## Success Criteria
- All existing content visible in admin dashboard
- Public pages render identically (from API data)
- Blog post content (TipTap JSON) renders with syntax highlighting
- Sitemap and RSS feed work with API data
- `pnpm build` clean, all routes generated
- No regression in public site appearance

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| MDX → TipTap conversion lossy | HIGH | Compare rendered output before/after, manual fix if needed |
| API not available during build | HIGH | Use ISR with fallback, or keep JSON imports as fallback |
| Code block highlighting lost | MED | TipTap code-block-lowlight extension preserves language info |
| TOC breaks (heading IDs) | MED | TipTap heading IDs may differ — adjust TOC component |
