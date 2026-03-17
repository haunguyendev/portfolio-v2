# Phase 1: SEO & Metadata

## Overview
- **Priority:** HIGH
- **Status:** Complete
- **Effort:** 2h

Comprehensive SEO setup: enhanced metadata, OG image, sitemap, robots.txt, JSON-LD structured data, RSS discovery link.

## Key Insights
- `layout.tsx` already has title template `'%s | Kane Nguyen'` — extend, don't replace
- Next.js 16 App Router has built-in `sitemap.ts` and `robots.ts` support
- Blog posts already have `generateMetadata` with OG — just need global defaults
- `SITE_URL` already defined in `src/lib/constants.ts`
- Existing pages: Home, Projects, About, Blog, Blog/[slug], Diary, Diary/[slug], feed.xml

## Requirements

### Functional
- Root metadata: title, description, OG image, Twitter card, icons
- RSS discovery link in `<head>` (`<link rel="alternate" ...>`)
- Programmatic sitemap.xml covering all static + dynamic routes
- robots.txt allowing all crawlers, pointing to sitemap
- JSON-LD: Person on homepage, Article on blog detail pages
- Canonical URLs on all pages

### Non-Functional
- Sitemap regenerates on build (static)
- OG image 1200x630px
- All meta tags validate via social card validators

## Architecture

```
src/app/
├── layout.tsx              (MODIFY — enhance metadata + RSS link)
├── sitemap.ts              (NEW — programmatic sitemap)
├── robots.ts               (NEW — robots config)
└── blog/[slug]/page.tsx    (MODIFY — add JSON-LD Article)

src/components/
└── seo/
    └── json-ld.tsx         (NEW — JSON-LD script component)

public/
└── images/
    └── og-default.png      (NEW — 1200x630 static OG image)
```

## Implementation Steps

### 1. Create static OG image
- Simple design: site name "Kane Nguyen", subtitle "Software Engineer", gradient accent bar
- 1200x630px PNG at `public/images/og-default.png`
- Can be a simple solid color + text overlay (create via HTML screenshot or design tool)

### 2. Enhance `src/app/layout.tsx` metadata
```typescript
export const metadata: Metadata = {
  title: {
    default: 'Kane Nguyen — Software Engineer',
    template: '%s | Kane Nguyen',
  },
  description: "Software Engineer portfolio — projects, blog, and diary by Kane Nguyen.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Kane Nguyen',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: 'Kane Nguyen — Software Engineer' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/og-default.png'],
  },
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
  robots: { index: true, follow: true },
}
```

### 3. Create `src/app/sitemap.ts`
```typescript
import type { MetadataRoute } from 'next'
import { getBlogs } from '@/lib/content'
import { getDiaries } from '@/lib/content'

export default function sitemap(): MetadataRoute.Sitemap {
  const blogs = getBlogs().map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated || post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const diaries = getDiaries().map(entry => ({
    url: `${SITE_URL}/diary/${entry.slug}`,
    lastModified: entry.date,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/projects`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/diary`, changeFrequency: 'weekly', priority: 0.6 },
    ...blogs,
    ...diaries,
  ]
}
```

### 4. Create `src/app/robots.ts`
```typescript
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

### 5. Create `src/components/seo/json-ld.tsx`
- Person schema for homepage (name, jobTitle, url, sameAs social links)
- Article schema for blog posts (headline, datePublished, author, description)
- Render as `<script type="application/ld+json">`

### 6. Add JSON-LD to pages
- Homepage: `<PersonJsonLd />` in `src/app/page.tsx`
- Blog detail: `<ArticleJsonLd />` in `src/app/blog/[slug]/page.tsx`

### 7. Verify SEO
- Build and check `/sitemap.xml` output
- Check `/robots.txt` output
- Validate meta tags in browser dev tools
- Check OG image renders in `<meta property="og:image">`

## Todo List
- [x] Create static OG image (1200x630)
- [x] Enhance layout.tsx metadata (OG, Twitter, RSS link, metadataBase)
- [x] Create src/app/sitemap.ts
- [x] Create src/app/robots.ts
- [x] Create src/components/seo/json-ld.tsx (Person + Article)
- [x] Add PersonJsonLd to homepage
- [x] Add ArticleJsonLd to blog/[slug]/page.tsx
- [x] Add ArticleJsonLd to diary/[slug]/page.tsx (reviewer finding)
- [x] Build and verify sitemap.xml output
- [x] Build and verify robots.txt output
- [ ] Verify OG meta tags in browser (post-deploy)

## Success Criteria
- `/sitemap.xml` returns valid XML with all routes
- `/robots.txt` allows crawlers, points to sitemap
- OG image appears in `<meta property="og:image">`
- JSON-LD renders in page source for homepage + blog posts
- RSS link discoverable in `<head>`
- `pnpm build` passes

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| OG image not loading | LOW | Use absolute URL via metadataBase |
| Sitemap missing routes | LOW | Generate from same helpers used by pages |
| JSON-LD validation errors | LOW | Test with Google Rich Results Test post-deploy |
