---
title: "Phase 2A: Blog & Diary MDX System"
description: "MDX-powered blog and diary with Velite, search, TOC, share, and homepage integration"
status: complete
priority: P1
effort: 12h
branch: main
tags: [blog, diary, mdx, velite, phase-2]
created: 2026-03-16
---

# Phase 2A: Blog & Diary MDX System

## MDX Library Decision

**Chosen: Velite** (over Contentlayer2 and @next/mdx)

| Criteria | Contentlayer2 | Velite | @next/mdx |
|----------|--------------|-------|-----------|
| Next.js 16 (Turbopack) | Webpack plugin, incompatible | Top-level await workaround, works | Native support |
| Type safety | Generated types | Zod schemas | Manual |
| Last npm publish | 10 months ago | Actively maintained | Part of Next.js |
| MDX processing | Built-in | Built-in with rehype/remark | Built-in |
| Content collections | Yes | Yes, multiple | No (DIY) |
| Build-time generation | Yes | Yes (outputs to .velite/) | No |

**Why not Contentlayer2:** `next-contentlayer2@0.5.8` relies on webpack plugin; Next.js 16 defaults to Turbopack. Risk of breakage, stale maintenance.

**Why not @next/mdx:** No built-in frontmatter, no collections, no type generation. Too much manual plumbing.

**Why Velite:** Turbopack-compatible via programmatic API, Zod schemas, active maintenance, built for exactly this use case.

## Architecture Overview

```
content/              (MDX source files)
  blog/
    my-first-post.mdx
  diary/
    a-reflective-day.mdx
        |
        v
  velite.config.ts    (schema + MDX config)
        |
        v
  .velite/            (generated at build time)
    blogs.json
    diaries.json
    index.ts          (typed exports)
        |
        v
  src/lib/content.ts  (extend existing helpers)
        |
        v
  Components + Pages
```

## Phases

| # | Phase | Effort | Status | File |
|---|-------|--------|--------|------|
| 1 | [MDX Engine Setup (Velite)](./phase-01-mdx-engine-setup.md) | 2h | Complete | velite.config.ts, next.config.ts |
| 2 | [Blog System](./phase-02-blog-system.md) | 3h | Complete | blog pages + components |
| 3 | [Diary System](./phase-03-diary-system.md) | 2h | Complete | diary pages + components |
| 4 | [Search, Filter, TOC](./phase-04-search-filter-toc.md) | 2h | Complete | client-side search + TOC |
| 5 | [Share, Comments UI, RSS](./phase-05-share-comments-rss.md) | 1.5h | Complete | social share + RSS (comments → Phase 2B) |
| 6 | [Homepage Integration + Mock Content](./phase-06-homepage-integration.md) | 1.5h | Complete | replace placeholders |

## Packages to Install

```bash
# Production
pnpm add velite rehype-pretty-code rehype-slug rehype-autolink-headings remark-gfm shiki

# Dev
pnpm add -D @types/mdx
```

## Key Decisions

1. **Content dir**: `content/blog/` and `content/diary/` at project root (Velite convention)
2. **Output dir**: `.velite/` (gitignored, regenerated on build)
3. **Privacy**: Diary `published` field; filter in production, show all in dev
4. **Mood system**: Enum field on diary entries with emoji mapping
5. **Reading time**: Velite computed field from word count
6. **Syntax highlighting**: rehype-pretty-code + shiki (Vercel's choice)
7. **MDX components**: Custom overrides for h1-h6, code, blockquote, callout, img

## Dependencies

- Phase 1 complete (confirmed)
- No backend needed (Phase 2B)
- No database needed
- No authentication needed
