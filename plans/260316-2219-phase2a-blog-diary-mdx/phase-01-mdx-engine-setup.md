# Phase 1: MDX Engine Setup (Velite)

## Overview
- **Priority:** HIGH (blocks all other phases)
- **Status:** Complete
- **Effort:** 2h

Install Velite, configure content schemas for blog + diary, integrate with Next.js 16 Turbopack, verify build pipeline.

## Key Insights
- Next.js 16.1.6 uses Turbopack by default; Velite's webpack plugin won't work
- Use top-level await in `next.config.ts` to call Velite programmatic API
- Velite outputs typed JSON to `.velite/` dir, regenerated every build
- Zod-based schemas provide type safety without codegen step
- `s.mdx()` compiles MDX to function-body string for client rendering

## Requirements

### Functional
- Velite processes `content/blog/*.mdx` and `content/diary/*.mdx`
- Blog schema: title, slug, description, date, tags, published, image, body (MDX)
- Diary schema: title, slug, date, mood, published, body (MDX)
- Reading time auto-calculated as computed field
- Syntax highlighting via rehype-pretty-code + shiki
- GFM support (tables, strikethrough, task lists)

### Non-Functional
- Build time < 10s for 10 posts
- Type-safe imports from `.velite/`
- Zero runtime MDX compilation (all at build time)

## Architecture

```
project root/
├── content/
│   ├── blog/
│   │   └── *.mdx
│   └── diary/
│       └── *.mdx
├── velite.config.ts        (NEW - schema definitions)
├── next.config.ts          (MODIFY - add Velite init)
├── tsconfig.json           (MODIFY - add .velite/ path alias)
├── .gitignore              (MODIFY - add .velite/)
└── .velite/                (GENERATED - gitignored)
    ├── blogs.json
    ├── diaries.json
    └── index.ts
```

## Related Code Files

### Files to Create
- `velite.config.ts` — Velite config with blog + diary collections
- `content/blog/.gitkeep` — placeholder for blog MDX dir
- `content/diary/.gitkeep` — placeholder for diary MDX dir

### Files to Modify
- `next.config.ts` — add Velite programmatic build init
- `tsconfig.json` — add `"#site/*": ["./.velite/*"]` path alias
- `.gitignore` — add `.velite/` entry

## Implementation Steps

### 1. Install dependencies
```bash
pnpm add velite rehype-pretty-code rehype-slug rehype-autolink-headings remark-gfm shiki
pnpm add -D @types/mdx
```

### 2. Create `velite.config.ts` at project root
```typescript
import { defineConfig, defineCollection, s } from 'velite'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'

const computedFields = <T extends { body: string }>(data: T) => ({
  ...data,
  readingTime: Math.ceil(data.body.split(/\s+/).length / 200),
})

const blogs = defineCollection({
  name: 'Blog',
  pattern: 'blog/**/*.mdx',
  schema: s.object({
    title: s.string().max(120),
    slug: s.slug('blog'),
    description: s.string().max(260),
    date: s.isodate(),
    updated: s.isodate().optional(),
    tags: s.array(s.string()).default([]),
    published: s.boolean().default(true),
    image: s.string().optional(),
    body: s.mdx(),
  }).transform(computedFields),
})

const diaries = defineCollection({
  name: 'Diary',
  pattern: 'diary/**/*.mdx',
  schema: s.object({
    title: s.string().max(120),
    slug: s.slug('diary'),
    description: s.string().max(260).optional(),
    date: s.isodate(),
    mood: s.enum(['happy', 'sad', 'reflective', 'grateful', 'motivated']),
    published: s.boolean().default(false),
    body: s.mdx(),
  }).transform(computedFields),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { blogs, diaries },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: 'github-dark-default' }],
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
})
```

### 3. Modify `next.config.ts`
```typescript
import type { NextConfig } from 'next'

const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1

if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  import('velite').then(m => m.build({ watch: isDev, clean: !isDev }))
}

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
```

### 4. Add path alias in `tsconfig.json`
Add to `compilerOptions.paths`:
```json
{
  "#site/*": ["./.velite/*"]
}
```
Use `#site` prefix to avoid conflicts with `@/` alias.

### 5. Update `.gitignore`
Add `.velite/` entry.

### 6. Create content directories
```bash
mkdir -p content/blog content/diary
```

### 7. Verify build
```bash
pnpm build
```
Confirm `.velite/` generated with `blogs.json`, `diaries.json`, `index.ts`.

## Todo List
- [x] Install Velite + rehype/remark packages
- [x] Create velite.config.ts with blog + diary schemas
- [x] Modify next.config.ts for Velite programmatic init
- [x] Add tsconfig.json path alias for .velite/
- [x] Add .velite/ to .gitignore
- [x] Create content/blog/ and content/diary/ directories
- [x] Run pnpm build and verify .velite/ output
- [x] Test type imports from #site/blogs and #site/diaries

## Success Criteria
- `pnpm build` completes without errors
- `.velite/` contains typed blog + diary JSON
- TypeScript recognizes imports from `#site/*`
- No existing functionality broken

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Velite + Next.js 16 incompatibility | HIGH | Top-level await approach documented; fallback to @next/mdx + gray-matter |
| rehype-pretty-code version conflict | MED | Pin to latest stable; unified v11+ required |
| Build time regression | LOW | Velite is fast; monitor with 10+ posts |

## Fallback Plan
If Velite fails with Next.js 16.1.6:
1. Try `@next/mdx` + `gray-matter` + manual frontmatter parsing
2. Create custom `src/lib/mdx-utils.ts` with `compileMDX` from `next-mdx-remote/rsc`
3. Manual type definitions instead of generated schemas
