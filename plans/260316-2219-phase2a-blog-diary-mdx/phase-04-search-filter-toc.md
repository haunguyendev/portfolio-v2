# Phase 4: Search, Filter, TOC

## Overview
- **Priority:** MEDIUM
- **Status:** Complete
- **Effort:** 2h
- **Blocked by:** Phase 2 (Blog), Phase 3 (Diary)

Client-side search/filter for blog (by tag, keyword) and diary (by mood, keyword). Auto-generated Table of Contents from headings on detail pages.

## Key Insights
- All content available at build time via Velite — client-side filtering is simple
- No need for search API or indexing; filter in-memory arrays
- TOC extracted from MDX headings (rehype-slug already adds IDs in Phase 1)
- Blog list page becomes a client component wrapper (like projects page pattern)
- Diary mood filter: toggle buttons with emoji
- Existing pattern: `src/app/projects/projects-page-content.tsx` wraps filter state

## Requirements

### Functional
- Blog: filter by tag (toggle badges), search by keyword (title + description)
- Diary: filter by mood (emoji toggle buttons), search by keyword
- TOC: auto-generated from h2/h3 headings on blog detail pages
- TOC: sticky sidebar on desktop, collapsible on mobile
- URL query params for active filters (shareable filter state)
- Clear all filters button

### Non-Functional
- Debounced search input (300ms)
- No external search library (content is small, in-memory filter sufficient)
- Smooth filter transitions with Framer Motion (already installed)

## Architecture

```
src/app/blog/
├── page.tsx                        (MODIFY — wrap with client content)
└── blog-page-content.tsx           (NEW — client wrapper with filter state)

src/app/diary/
├── page.tsx                        (MODIFY — wrap with client content)
└── diary-page-content.tsx          (NEW — client wrapper with filter state)

src/components/blog/
├── blog-search-bar.tsx             (NEW — keyword search input)
├── blog-tag-filter.tsx             (NEW — tag toggle badges)
└── blog-table-of-contents.tsx      (NEW — TOC sidebar)

src/components/diary/
└── diary-mood-filter.tsx           (NEW — mood emoji toggles)

src/components/shared/
└── search-input.tsx                (NEW — reusable debounced search)
```

## Related Code Files

### Files to Create
- `src/app/blog/blog-page-content.tsx` — client wrapper with search + tag filter state
- `src/app/diary/diary-page-content.tsx` — client wrapper with search + mood filter
- `src/components/blog/blog-tag-filter.tsx` — tag toggle badges
- `src/components/blog/blog-table-of-contents.tsx` — TOC component
- `src/components/diary/diary-mood-filter.tsx` — mood emoji toggles
- `src/components/shared/search-input.tsx` — reusable debounced search

### Files to Modify
- `src/app/blog/page.tsx` — server page passes data to client wrapper
- `src/app/diary/page.tsx` — server page passes data to client wrapper
- `src/app/blog/[slug]/page.tsx` — add TOC sidebar to detail layout

### Reference (existing pattern)
- `src/app/projects/projects-page-content.tsx` — follow this pattern for client wrappers

## Implementation Steps

### 1. Create `src/components/shared/search-input.tsx`

Reusable debounced search input:
```typescript
'use client'
import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}
```
- Debounce 300ms via useEffect + setTimeout
- Clear button (X icon) when value present
- Search icon left-aligned

### 2. Create `src/components/blog/blog-tag-filter.tsx`

Toggle badges for tags:
- Receive `allTags: string[]` and `activeTags: string[]` as props
- Click badge toggles tag in/out of active set
- Active tags get `variant="default"`, inactive get `variant="outline"`
- "All" button to clear filters
- Use existing shadcn Badge component

### 3. Create `src/components/diary/diary-mood-filter.tsx`

Similar to tag filter but with emoji:
- Show all 5 mood options as toggle buttons
- Each button: emoji + label
- Active mood highlighted, click to toggle
- Allow multiple moods selected
- Import mood config from `diary-constants.ts`

### 4. Create `src/app/blog/blog-page-content.tsx`

Client component wrapping blog list with filter state:
```typescript
'use client'
// State: searchQuery, activeTags
// Filter logic: match keyword in title/description, match any active tag
// Render: SearchInput + BlogTagFilter + BlogPostList (filtered)
```

Follow `projects-page-content.tsx` pattern.

### 5. Create `src/app/diary/diary-page-content.tsx`

Client component wrapping diary list with filter state:
```typescript
'use client'
// State: searchQuery, activeMoods
// Filter logic: match keyword in title, match any active mood
// Render: SearchInput + DiaryMoodFilter + DiaryEntryList (filtered)
```

### 6. Update `blog/page.tsx` and `diary/page.tsx`

Server pages fetch data, pass to client wrappers:
```typescript
export default function BlogPage() {
  const posts = getBlogs()
  const tags = getAllBlogTags()
  return (
    <div className="section-spacing">
      <div className="container-main">
        <AnimatedPageTitle>Blog</AnimatedPageTitle>
        <BlogPageContent posts={posts} allTags={tags} />
      </div>
    </div>
  )
}
```

### 7. Create `blog-table-of-contents.tsx`

TOC component for blog detail pages:
- Extract headings from DOM after render (useEffect + querySelectorAll)
- Or: parse heading structure from MDX at build time via Velite transform
- Display as nested list (h2 = top level, h3 = indented)
- Sticky position on desktop (right sidebar)
- Collapsible panel on mobile (above content)
- Active heading highlight via IntersectionObserver
- Click scrolls to heading with smooth scroll

Layout change on blog detail: 2-col grid on desktop (content left, TOC right).

## Todo List
- [x] Create shared/search-input.tsx (debounced)
- [x] Create blog-tag-filter.tsx
- [x] Create diary-mood-filter.tsx
- [x] Create blog-page-content.tsx client wrapper
- [x] Create diary-page-content.tsx client wrapper
- [x] Update blog/page.tsx to use client wrapper
- [x] Update diary/page.tsx to use client wrapper
- [x] Create blog-table-of-contents.tsx
- [x] Add TOC to blog/[slug]/page.tsx layout
- [x] Test search debounce behavior
- [x] Test filter combinations (tag + keyword)
- [x] Test TOC IntersectionObserver scroll tracking

## Success Criteria
- Blog search filters posts by keyword in title/description
- Tag filter toggles narrow results
- Diary mood filter works with emoji buttons
- Combined search + filter works correctly
- TOC renders h2/h3 headings with active tracking
- TOC sticky on desktop, collapsible on mobile
- Empty state shown when no results match

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| TOC IntersectionObserver flaky | LOW | Test with various heading counts; fallback to click-only |
| Filter state lost on navigation | LOW | URL query params preserve state |
| Search performance with many posts | LOW | In-memory filter fine for < 100 posts |
