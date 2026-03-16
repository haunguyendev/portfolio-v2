# Phase 3: Diary System

## Overview
- **Priority:** HIGH
- **Status:** Complete
- **Effort:** 2h
- **Blocked by:** Phase 1 (MDX Engine), Phase 2 (reuse mdx-components + mdx-content)

Diary list page with mood-based cards (emoji + date), diary detail page with softer styling. Privacy: `published` flag hides entries in production, shows all in dev.

## Key Insights
- Diary shares MDX infrastructure with blog (mdx-components, mdx-content) — DRY
- Mood system: 5 moods with emoji mapping, used as visual cue on cards
- Privacy toggle: `published: false` by default in schema; filter server-side
- Softer styling than blog: warmer tones, serif-feel headings, more personal
- Existing diary page at `src/app/diary/page.tsx` is a placeholder

## Requirements

### Functional
- Diary list: mood emoji, title, date, short preview
- Diary detail: full MDX with softer prose styling
- Mood filter on list page (client-side, Phase 4 extends this)
- Privacy: production shows only `published: true`; dev shows all with "draft" badge
- Reading time on detail page

### Non-Functional
- Server components for pages
- Reuse MdxContent client component from blog
- Max 200 lines per file

## Mood System

```typescript
export const DIARY_MOODS = {
  happy: { emoji: '😊', label: 'Happy', color: 'text-yellow-500' },
  sad: { emoji: '😢', label: 'Sad', color: 'text-blue-400' },
  reflective: { emoji: '🤔', label: 'Reflective', color: 'text-purple-500' },
  grateful: { emoji: '🙏', label: 'Grateful', color: 'text-green-500' },
  motivated: { emoji: '🔥', label: 'Motivated', color: 'text-orange-500' },
} as const

export type DiaryMood = keyof typeof DIARY_MOODS
```

Place in `src/lib/diary-constants.ts`.

## Architecture

```
src/app/diary/
├── page.tsx                    (MODIFY — diary list)
└── [slug]/
    └── page.tsx                (NEW — diary detail)

src/components/diary/
├── diary-entry-card.tsx        (NEW — list item with mood emoji)
├── diary-entry-list.tsx        (NEW — grid/list of entries)
└── diary-mood-badge.tsx        (NEW — emoji + label badge)

src/lib/
├── content.ts                  (MODIFY — add diary helpers)
└── diary-constants.ts          (NEW — mood config)
```

## Related Code Files

### Files to Create
- `src/app/diary/[slug]/page.tsx` — dynamic diary detail route
- `src/components/diary/diary-entry-card.tsx` — diary card with mood
- `src/components/diary/diary-entry-list.tsx` — entries grid
- `src/components/diary/diary-mood-badge.tsx` — mood emoji badge
- `src/lib/diary-constants.ts` — mood enum + emoji mapping

### Files to Modify
- `src/app/diary/page.tsx` — replace placeholder with real list
- `src/lib/content.ts` — add `getDiaries()`, `getDiaryBySlug()`

### Files to Reuse (from Phase 2)
- `src/components/blog/mdx-content.tsx` — MDX renderer
- `src/components/blog/mdx-components.tsx` — MDX overrides

## Implementation Steps

### 1. Create `src/lib/diary-constants.ts`

Mood config object with emoji, label, Tailwind color class. Export type.

### 2. Extend `src/lib/content.ts` with diary helpers

```typescript
import { diaries } from '#site/diaries'

const isDev = process.env.NODE_ENV === 'development'

export function getDiaries() {
  return diaries
    .filter(d => isDev || d.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getDiaryBySlug(slug: string) {
  const entry = diaries.find(d => d.slug === slug)
  if (!entry) return undefined
  if (!isDev && !entry.published) return undefined
  return entry
}
```

### 3. Create `diary-mood-badge.tsx`

Small component: renders emoji + label from mood constant.
Uses shadcn Badge with `variant="outline"`.

### 4. Create `diary-entry-card.tsx`

Card layout:
- Top: mood emoji (large) + mood label
- Middle: title + date
- Bottom: short description or first line of body
- If unpublished (dev only): "Draft" badge overlay
- Entire card links to `/diary/{slug}`

Softer styling than blog cards: slightly rounded, warm border.

### 5. Create `diary-entry-list.tsx`

Grid: 1 col mobile, 2 col desktop (diary is more intimate; 2 col max).
Accept entries array as prop (for future filtering).
Empty state: "No diary entries yet" with BookHeart icon.

### 6. Replace `src/app/diary/page.tsx`

```typescript
import { getDiaries } from '@/lib/content'
import { DiaryEntryList } from '@/components/diary/diary-entry-list'
import { AnimatedPageTitle } from '@/components/ui/animated-page-title'

export const metadata = { title: 'Diary', description: '...' }

export default function DiaryPage() {
  const entries = getDiaries()
  return (
    <div className="section-spacing">
      <div className="container-main">
        <AnimatedPageTitle>Diary</AnimatedPageTitle>
        <p className="...">Personal reflections, emotions, memories...</p>
        <DiaryEntryList entries={entries} />
      </div>
    </div>
  )
}
```

### 7. Create `src/app/diary/[slug]/page.tsx`

- `generateStaticParams()` — all published diary slugs (+ all in dev)
- `generateMetadata()` — title, description from frontmatter
- Page layout: back link, mood badge, title, date, reading time, `<MdxContent />`
- Softer prose wrapper: add `.diary-prose` class with warmer styling
- `notFound()` if slug invalid or unpublished in production

### 8. Add diary prose styles to `globals.css`

```css
@layer components {
  .diary-prose blockquote {
    @apply border-l-orange-300 bg-orange-50/50 dark:border-l-orange-700 dark:bg-orange-950/20;
  }
}
```

Keep minimal — mostly reuse blog prose with small overrides.

## Todo List
- [x] Create diary-constants.ts with mood mapping
- [x] Add diary helpers to src/lib/content.ts
- [x] Create diary-mood-badge.tsx
- [x] Create diary-entry-card.tsx
- [x] Create diary-entry-list.tsx
- [x] Replace diary/page.tsx with real list
- [x] Create diary/[slug]/page.tsx with generateStaticParams
- [x] Add diary-specific prose styles to globals.css
- [x] Test privacy: published=false hidden in production
- [x] Test privacy: published=false visible in development
- [x] Verify mood emoji renders correctly

## Success Criteria
- Diary list shows published entries with mood emoji
- Detail page renders MDX with softer styling
- Draft entries hidden in production, visible in dev with badge
- Mood badge displays correct emoji + label
- Mobile responsive (1/2 col grid)
- Reuses blog MDX components (no duplication)

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Emoji rendering inconsistency | LOW | Use native emoji; consistent across modern browsers |
| Privacy leak (drafts in prod) | MED | Server-side filter; no client-side toggle |
| Style bleed between blog/diary prose | LOW | Scoped wrapper classes |
