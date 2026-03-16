# Planner Report: Phase 2A Blog & Diary MDX System

**Date:** 2026-03-16 | **Plan:** `plans/260316-2219-phase2a-blog-diary-mdx/`

## MDX Library Decision: Velite

Researched 3 options. **Velite** selected over Contentlayer2 and @next/mdx.

**Why not Contentlayer2:**
- `next-contentlayer2@0.5.8` last published 10 months ago
- Relies on webpack plugin; Next.js 16.1.6 defaults to Turbopack — incompatible
- Peer dependency unclear for Next.js 16

**Why not @next/mdx:**
- No frontmatter support, no collections, no type generation
- Too much manual plumbing for 2 content types

**Why Velite:**
- Turbopack-compatible via top-level await in `next.config.ts` (documented workaround)
- Zod-based schemas with type-safe output to `.velite/`
- Active maintenance, multiple Next.js 15/16 community templates exist
- Built-in MDX compilation with rehype/remark plugin support
- Used successfully with shadcn/ui + Next.js in production sites

## Plan Summary

| Phase | Description | Effort | Dependencies |
|-------|------------|--------|-------------|
| 1 | MDX Engine Setup (Velite) | 2h | None |
| 2 | Blog System (list + detail + MDX) | 3h | Phase 1 |
| 3 | Diary System (list + detail + mood) | 2h | Phase 1, 2 |
| 4 | Search, Filter, TOC | 2h | Phase 2, 3 |
| 5 | Share, Comments UI, RSS | 1.5h | Phase 2 |
| 6 | Homepage Integration + Mock Content | 1.5h | Phase 2, 3 |
| **Total** | | **12h** | |

## Packages to Install
```
velite rehype-pretty-code rehype-slug rehype-autolink-headings remark-gfm shiki @types/mdx
```

## Key Architectural Decisions
1. **Velite** over Contentlayer2 — Turbopack compat, active maintenance
2. **Content at project root** (`content/blog/`, `content/diary/`) per Velite convention
3. **`#site/*` path alias** for `.velite/` imports (avoids conflict with `@/`)
4. **Privacy via `published` flag** — server-side filter, no client toggle
5. **Shared MDX renderer** between blog and diary (DRY)
6. **Client wrapper pattern** for search/filter (mirrors existing `projects-page-content.tsx`)
7. **Mock comments** — UI ready, data from JSON, swap to API in Phase 2B

## Files Summary
- **New files:** ~20 (components, pages, content, config)
- **Modified files:** ~8 (next.config, tsconfig, gitignore, existing pages, content.ts)
- **Content files:** 4 mock MDX posts (2 blog, 2 diary)

## Unresolved Questions
1. **Velite + Next.js 16.1.6 runtime test needed** — research confirms compatibility pattern exists, but no one has publicly confirmed 16.1.6 specifically. Phase 1 includes fallback plan.
2. **rehype-pretty-code theme** — defaulted to `github-dark-default`; may want light/dark theme switching (defer to Phase 3 dark mode polish).
3. **Blog image optimization** — Velite `output.assets` sends to `public/static/`; should MDX images use Next.js `<Image>` or standard `<img>`? Plan uses Next.js Image via mdx-components override.

## Sources
- [Contentlayer2 npm](https://www.npmjs.com/package/contentlayer2)
- [next-contentlayer2 npm](https://www.npmjs.com/package/next-contentlayer2)
- [Velite Next.js Integration](https://velite.js.org/guide/with-nextjs)
- [Velite Define Collections](https://velite.js.org/guide/define-collections)
- [Next.js 16 Turbopack](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Velite GitHub example](https://github.com/zce/velite/blob/main/examples/nextjs/velite.config.ts)
