# Phase 5: Share, Comments UI, RSS

## Overview
- **Priority:** MEDIUM
- **Status:** Complete (comments deferred to Phase 2B per YAGNI)
- **Effort:** 1.5h
- **Blocked by:** Phase 2 (Blog detail page must exist)

Social share buttons, mock comments UI (prepared for NestJS API in Phase 2B), and RSS feed generation.

## Key Insights
- Share buttons use native Web Share API with fallback to manual URL construction
- Comments UI is **mock only** — renders static data, no API calls
- Comments component structured to accept future API data source swap
- RSS generated as static `app/feed.xml/route.ts` at build time
- Keep share simple: 4 targets (Twitter/X, LinkedIn, Facebook, copy link)

## Requirements

### Functional
- Share buttons on blog + diary detail pages
- Share targets: Twitter/X, LinkedIn, Facebook, Copy Link
- Copy link shows toast confirmation
- Comments section on blog posts (mock data, 2-3 comments per post)
- Comment form UI (disabled with "coming soon" note)
- RSS feed at `/feed.xml` with all published blog posts

### Non-Functional
- Web Share API on mobile (native share sheet)
- Fallback to constructed URLs on desktop
- RSS valid per Atom/RSS 2.0 spec
- Comments component prop-driven (easy to swap mock for API later)

## Architecture

```
src/components/shared/
├── share-buttons.tsx           (NEW — social share bar)
└── copy-link-button.tsx        (NEW — copy URL + toast)

src/components/blog/
├── blog-comments-section.tsx   (NEW — comments list + form)
└── blog-comment-item.tsx       (NEW — single comment)

src/app/
└── feed.xml/
    └── route.ts                (NEW — RSS route handler)

src/content/
└── mock-comments.json          (NEW — mock comment data)
```

## Related Code Files

### Files to Create
- `src/components/shared/share-buttons.tsx` — share bar component
- `src/components/shared/copy-link-button.tsx` — copy link with toast
- `src/components/blog/blog-comments-section.tsx` — comments list + form
- `src/components/blog/blog-comment-item.tsx` — single comment display
- `src/content/mock-comments.json` — mock comment data (2-3 per post)
- `src/app/feed.xml/route.ts` — RSS feed route

### Files to Modify
- `src/app/blog/[slug]/page.tsx` — add share buttons + comments section
- `src/app/diary/[slug]/page.tsx` — add share buttons (no comments)

## Implementation Steps

### 1. Create `src/components/shared/share-buttons.tsx`

```typescript
'use client'
interface ShareButtonsProps {
  title: string
  url: string   // full URL, constructed from slug + SITE_URL
}
```

- Check `navigator.share` availability; if yes, show "Share" button using Web Share API
- Fallback: row of icon buttons (Twitter, LinkedIn, Facebook, CopyLink)
- Twitter: `https://twitter.com/intent/tweet?text={title}&url={url}`
- LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url={url}`
- Facebook: `https://www.facebook.com/sharer/sharer.php?u={url}`
- Icons from lucide-react (Share2, Linkedin, Facebook) or simple SVGs
- Open share links in new tab (`target="_blank" rel="noopener noreferrer"`)

### 2. Create `src/components/shared/copy-link-button.tsx`

- Button with Link/Check icon
- `navigator.clipboard.writeText(url)`
- Show checkmark for 2 seconds after copy (local state)
- Accessible: aria-label, focus visible

### 3. Create `src/content/mock-comments.json`

```json
{
  "my-first-blog-post": [
    {
      "id": "1",
      "author": "Jane Developer",
      "avatar": null,
      "date": "2026-03-18T10:00:00Z",
      "content": "Great article! Learned a lot about..."
    }
  ]
}
```

Keyed by post slug. 2-3 comments per mock post.

### 4. Create `blog-comment-item.tsx`

Display: avatar placeholder (initials circle), author name, date, content.
Simple card-like layout, no nesting (keep flat for v1).

### 5. Create `blog-comments-section.tsx`

```typescript
interface BlogCommentsSectionProps {
  slug: string
  comments: Comment[]  // mock data now, API data later
}
```

- Render list of `BlogCommentItem`
- Comment form below: name input, textarea, submit button
- Form is **disabled** with overlay message: "Comments coming soon! Stay tuned."
- Comment count in section header
- Empty state: "No comments yet. Be the first!"

This structure makes API swap trivial: just change the data source prop.

### 6. Create `src/app/feed.xml/route.ts`

```typescript
import { getBlogs } from '@/lib/content'
import { SITE_URL, SITE_NAME } from '@/lib/constants'

export function GET() {
  const posts = getBlogs()
  const xml = generateRSSFeed(posts)
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
```

RSS 2.0 format with: title, link, description, pubDate, guid per item.
Include `<description>` with post description, not full body.

### 7. Add share + comments to detail pages

Blog detail: share buttons below title, comments section below content.
Diary detail: share buttons only (no comments — diary is personal).

## Todo List
- [x] Create share-buttons.tsx with Web Share API + fallbacks
- [x] Create copy-link-button.tsx with clipboard API
- [~] Create mock-comments.json with sample data (deferred to Phase 2B)
- [~] Create blog-comment-item.tsx (deferred to Phase 2B)
- [~] Create blog-comments-section.tsx with disabled form (deferred to Phase 2B)
- [x] Create feed.xml/route.ts RSS generator
- [x] Add share buttons to blog/[slug]/page.tsx
- [x] Add share buttons to diary/[slug]/page.tsx
- [~] Add comments section to blog/[slug]/page.tsx (deferred to Phase 2B)
- [x] Test RSS feed output validity
- [x] Test copy link + toast behavior
- [x] Test share buttons on mobile (Web Share API)

## Success Criteria
- Share buttons render on blog + diary detail pages
- Twitter/LinkedIn/Facebook links open correct share URLs
- Copy link copies full URL and shows confirmation
- Web Share API triggers native sheet on mobile
- Comments section renders mock data
- Comment form visible but disabled with "coming soon"
- RSS feed at `/feed.xml` returns valid XML
- RSS contains all published blog posts

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Web Share API not available | LOW | Always show fallback buttons alongside |
| RSS validation errors | LOW | Test with W3C Feed Validator |
| Mock comments removed in prod | LOW | Keep mock data; remove when real API ships |

## Next Steps (Phase 2B)
- Replace mock-comments.json with NestJS API call
- Enable comment form submission
- Add real-time comment updates
- Add comment moderation
