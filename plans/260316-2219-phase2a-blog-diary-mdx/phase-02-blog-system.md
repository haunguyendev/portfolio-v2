# Phase 2: Blog System

## Overview
- **Priority:** HIGH
- **Status:** Complete
- **Effort:** 3h
- **Blocked by:** Phase 1 (MDX Engine Setup)

Blog list page with cards, blog detail page with MDX rendering, custom MDX component overrides, and reading time display.

## Key Insights
- Existing blog page at `src/app/blog/page.tsx` is a placeholder — replace entirely
- Velite outputs compiled MDX as function-body string; need `useMDXComponent` hook to render
- `rehype-pretty-code` handles syntax highlighting at build time (no client JS for code blocks)
- Follow existing patterns: `AnimatedPageTitle`, `container-main`, `section-spacing`
- shadcn/ui Card component already available for blog cards

## Requirements

### Functional
- Blog list: cards with title, description, date, tags, reading time, optional image
- Blog detail: full MDX rendering with styled prose
- MDX overrides: h1-h6 with anchor links, code blocks, blockquote, callout, images
- Reading time displayed on both list and detail
- Tag badges on cards (reuse existing Badge component)
- Back navigation on detail page
- SEO metadata per post (generateMetadata)
- Static generation with generateStaticParams

### Non-Functional
- Server components for list + detail pages (SEO, performance)
- MDX body rendered client-side (compiled MDX needs `useMDXComponent`)
- Max 200 lines per component file

## Architecture

```
src/app/blog/
├── page.tsx                    (MODIFY — blog list)
└── [slug]/
    └── page.tsx                (NEW — blog detail)

src/components/blog/
├── blog-post-card.tsx          (NEW — list item card)
├── blog-post-list.tsx          (NEW — grid of cards)
├── mdx-components.tsx          (NEW — MDX overrides)
└── mdx-content.tsx             (NEW — client MDX renderer)

src/lib/
└── content.ts                  (MODIFY — add blog helpers)
```

## Related Code Files

### Files to Create
- `src/app/blog/[slug]/page.tsx` — dynamic blog detail route
- `src/components/blog/blog-post-card.tsx` — blog card component
- `src/components/blog/blog-post-list.tsx` — blog list grid
- `src/components/blog/mdx-components.tsx` — custom MDX element overrides
- `src/components/blog/mdx-content.tsx` — client component for MDX rendering

### Files to Modify
- `src/app/blog/page.tsx` — replace placeholder with real blog list
- `src/lib/content.ts` — add `getBlogs()`, `getBlogBySlug()`, `getAllBlogTags()`
- `src/types/index.ts` — re-export blog types (or use Velite generated types)

## Implementation Steps

### 1. Extend `src/lib/content.ts` with blog helpers

```typescript
import { blogs } from '#site/blogs'

export function getBlogs() {
  return blogs
    .filter(b => b.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getBlogBySlug(slug: string) {
  return blogs.find(b => b.slug === slug && b.published)
}

export function getAllBlogTags(): string[] {
  const tags = new Set<string>()
  blogs.filter(b => b.published).forEach(b => b.tags.forEach(t => tags.add(t)))
  return Array.from(tags).sort()
}
```

### 2. Create `mdx-content.tsx` (client component)

```typescript
'use client'
import * as runtime from 'react/jsx-runtime'
import { mdxComponents } from './mdx-components'

const useMDXComponent = (code: string) => {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

export function MdxContent({ code }: { code: string }) {
  const Component = useMDXComponent(code)
  return <Component components={mdxComponents} />
}
```

### 3. Create `mdx-components.tsx` — MDX overrides

Custom styled elements for prose content:
- `h1`-`h6`: font sizes, anchor IDs (from rehype-slug), gradient accent on h1
- `pre`/`code`: styled by rehype-pretty-code (add wrapper with copy button later)
- `blockquote`: left-border accent, muted background
- `a`: underline, external link icon for external URLs
- `img`: Next.js Image wrapper with responsive sizing
- `callout`: custom component via MDX (info, warning, tip)
- `table`: responsive wrapper with border styling

### 4. Create `blog-post-card.tsx`

Card showing: optional image, title, description, date, reading time badge, tag badges.
Use existing `Card` + `Badge` shadcn/ui components.
Link wraps entire card to `/blog/{slug}`.

### 5. Create `blog-post-list.tsx`

Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop.
Accept filtered/sorted blog array as prop (for Phase 4 search).
Empty state if no posts.

### 6. Replace `src/app/blog/page.tsx`

```typescript
import { getBlogs } from '@/lib/content'
import { BlogPostList } from '@/components/blog/blog-post-list'
import { AnimatedPageTitle } from '@/components/ui/animated-page-title'

export const metadata = { title: 'Blog', description: '...' }

export default function BlogPage() {
  const posts = getBlogs()
  return (
    <div className="section-spacing">
      <div className="container-main">
        <AnimatedPageTitle>Blog</AnimatedPageTitle>
        <p className="...">Thoughts on web dev, software engineering...</p>
        <BlogPostList posts={posts} />
      </div>
    </div>
  )
}
```

### 7. Create `src/app/blog/[slug]/page.tsx`

- `generateStaticParams()` — return all blog slugs
- `generateMetadata()` — title, description, OG from frontmatter
- Page: back link, title, date, reading time, tags, `<MdxContent code={post.body} />`
- 404 via `notFound()` if slug not found

## Todo List
- [x] Add blog helper functions to src/lib/content.ts
- [x] Create mdx-components.tsx with styled overrides
- [x] Create mdx-content.tsx client renderer
- [x] Create blog-post-card.tsx
- [x] Create blog-post-list.tsx
- [x] Replace blog/page.tsx with real list
- [x] Create blog/[slug]/page.tsx with generateStaticParams
- [x] Add prose styles to globals.css (or Tailwind typography plugin)
- [x] Verify MDX rendering with test content
- [x] Test responsive layout

## Success Criteria
- Blog list displays all published posts sorted by date
- Blog detail renders MDX with syntax highlighting
- Code blocks have proper theme styling
- Tags, dates, reading time all display correctly
- generateStaticParams generates all routes at build
- Mobile responsive (1/2/3 col grid)

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| MDX function-body rendering fails | HIGH | Test with minimal content first; fallback to next-mdx-remote |
| Prose styling conflicts with existing CSS | MED | Scope with `.prose` wrapper class |
| Large MDX bundles | LOW | Velite compiles at build; no runtime cost |

## Security Considerations
- MDX runs arbitrary code; content is author-controlled (not user-submitted), so acceptable
- External links in MDX should get `rel="noopener noreferrer"` via mdx-components override
