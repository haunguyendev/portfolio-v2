# Phase 6: Homepage Integration + Mock Content

## Overview
- **Priority:** HIGH
- **Status:** Complete
- **Effort:** 1.5h
- **Blocked by:** Phase 2 (Blog), Phase 3 (Diary)

Replace homepage blog/diary placeholders with real post previews. Write 2 mock blog posts and 2 mock diary entries with full MDX content.

## Key Insights
- `LatestBlogSection` currently shows "Coming soon" — replace with real post cards
- Homepage should show latest 3 blog posts + latest 2 diary entries
- Mock content must be realistic: code blocks, headings, images, frontmatter
- Mock blog posts should demonstrate syntax highlighting and MDX features
- Mock diary entries should showcase mood system and personal tone
- Homepage is server component — can call `getBlogs()` / `getDiaries()` directly

## Requirements

### Functional
- Homepage "Latest Blog" section shows 3 most recent published posts
- New "Latest Diary" section shows 2 most recent published diary entries
- "View All" links to /blog and /diary respectively
- Graceful fallback if no posts exist (keep "coming soon" style)
- 2 mock blog posts with code blocks, headings, links
- 2 mock diary entries with different moods

### Non-Functional
- No layout shift — section heights consistent with or without content
- Lazy load blog/diary cards below fold (already handled by browser)

## Mock Content Plan

### Blog Post 1: `content/blog/building-my-portfolio-with-nextjs.mdx`
```yaml
---
title: "Building My Portfolio with Next.js 16 and Tailwind CSS"
slug: building-my-portfolio-with-nextjs
description: "A deep dive into how I built this portfolio site using Next.js 16, Tailwind CSS, and shadcn/ui."
date: 2026-03-16
tags: [nextjs, tailwindcss, react, portfolio]
published: true
image: /images/blog/portfolio-architecture.png
---
```
Content: ~600 words. Sections: Why Next.js, Project structure, shadcn/ui setup, deployment. Include TypeScript code block, component example.

### Blog Post 2: `content/blog/typescript-tips-for-react-developers.mdx`
```yaml
---
title: "5 TypeScript Tips Every React Developer Should Know"
slug: typescript-tips-for-react-developers
description: "Practical TypeScript patterns that make React development safer and more productive."
date: 2026-03-14
tags: [typescript, react, tips]
published: true
---
```
Content: ~500 words. Sections: Generic components, discriminated unions, satisfies operator, const assertions, utility types. Multiple code blocks.

### Diary Entry 1: `content/diary/first-year-as-developer.mdx`
```yaml
---
title: "Reflecting on My First Year as a Software Engineer"
slug: first-year-as-developer
description: "One year in — what I've learned, what surprised me, and what's next."
date: 2026-03-15
mood: reflective
published: true
---
```
Content: ~400 words. Personal reflection on growth, challenges, team dynamics.

### Diary Entry 2: `content/diary/shipping-portfolio-v2.mdx`
```yaml
---
title: "Finally Shipped My Portfolio!"
slug: shipping-portfolio-v2
description: "The feeling of launching something personal into the world."
date: 2026-03-16
mood: motivated
published: true
---
```
Content: ~300 words. Excitement about shipping, lessons learned, what's next.

## Architecture

```
content/blog/
├── building-my-portfolio-with-nextjs.mdx    (NEW)
└── typescript-tips-for-react-developers.mdx (NEW)

content/diary/
├── first-year-as-developer.mdx              (NEW)
└── shipping-portfolio-v2.mdx                (NEW)

src/components/home/
├── latest-blog-section.tsx                  (MODIFY — real posts)
└── latest-diary-section.tsx                 (NEW — diary preview)

src/app/
└── page.tsx                                 (MODIFY — add diary section)
```

## Related Code Files

### Files to Create
- `content/blog/building-my-portfolio-with-nextjs.mdx`
- `content/blog/typescript-tips-for-react-developers.mdx`
- `content/diary/first-year-as-developer.mdx`
- `content/diary/shipping-portfolio-v2.mdx`
- `src/components/home/latest-diary-section.tsx`

### Files to Modify
- `src/components/home/latest-blog-section.tsx` — replace placeholder with real cards
- `src/app/page.tsx` — add LatestDiarySection import

## Implementation Steps

### 1. Write 4 mock MDX files

Create all 4 content files with realistic frontmatter and body content. Blog posts should include:
- Multiple heading levels (h2, h3)
- Code blocks with language annotation (```typescript, ```bash)
- Inline code, bold, links
- A blockquote

Diary entries should include:
- Emotional/personal tone
- Shorter paragraphs
- Reflective questions

### 2. Modify `latest-blog-section.tsx`

```typescript
import { getBlogs } from '@/lib/content'
import { BlogPostCard } from '@/components/blog/blog-post-card'

export function LatestBlogSection() {
  const posts = getBlogs().slice(0, 3)

  if (posts.length === 0) {
    return /* existing "coming soon" placeholder */
  }

  return (
    <section className="section-spacing bg-muted">
      <div className="container-main">
        <div className="mb-8 flex items-center justify-between">
          <h2>Latest Blog</h2>
          <Link href="/blog">View All <ArrowRight /></Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

Keep "coming soon" as fallback when `posts.length === 0`.

### 3. Create `latest-diary-section.tsx`

Similar structure to blog section but:
- Show latest 2 entries (diary is more intimate, fewer items)
- 2-col grid max
- Different section bg (no bg-muted, use bg-background)
- "Latest Diary" heading with BookHeart icon
- Link to /diary

### 4. Update `src/app/page.tsx`

Add `LatestDiarySection` between `LatestBlogSection` and `ContactSection`:

```typescript
import { LatestDiarySection } from '@/components/home/latest-diary-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProjectsSection />
      <AboutPreviewSection />
      <LatestBlogSection />
      <LatestDiarySection />
      <ContactSection />
    </>
  )
}
```

### 5. Verify full build

```bash
pnpm build
```

Ensure all 4 MDX files processed, homepage renders cards, blog/diary list pages show entries, detail pages render MDX.

### 6. Add blog placeholder image

Create or add a simple placeholder image at `public/images/blog/portfolio-architecture.png`.
Can use a screenshot of the project structure or a simple diagram.

## Todo List
- [x] Write building-my-portfolio-with-nextjs.mdx (~600 words)
- [x] Write typescript-tips-for-react-developers.mdx (~500 words)
- [x] Write first-year-as-developer.mdx (~400 words)
- [x] Write shipping-portfolio-v2.mdx (~300 words)
- [x] Modify latest-blog-section.tsx to render real posts
- [x] Create latest-diary-section.tsx
- [x] Update page.tsx to include LatestDiarySection
- [x] Add placeholder blog image to public/images/blog/
- [x] Run pnpm build — verify all pages render
- [x] Test homepage with real content
- [x] Test blog list + detail pages
- [x] Test diary list + detail pages
- [x] Verify syntax highlighting in blog code blocks

## Success Criteria
- Homepage shows 3 latest blog posts with cards
- Homepage shows 2 latest diary entries with mood emoji
- Blog list page shows all published posts
- Blog detail pages render MDX with syntax highlighting
- Diary list page shows entries with mood badges
- Diary detail pages render with softer styling
- Fallback "coming soon" still works if content removed
- `pnpm build` succeeds with zero errors

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Mock content looks fake | LOW | Write realistic, personal content |
| Image missing breaks build | LOW | Use optional image field; graceful fallback |
| Homepage too long | LOW | Keep sections compact; 3 blog + 2 diary max |
