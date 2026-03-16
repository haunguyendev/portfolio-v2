# Code Review: Phase 2A Blog & Diary MDX System

**Reviewer:** code-reviewer
**Date:** 2026-03-16
**Scope:** Phase 2A implementation -- Blog/Diary MDX content system with Velite

---

## Scope

- **Files reviewed:** 28 (11 modified, 17 new)
- **LOC:** ~1609 lines across all reviewed files
- **Focus:** Full review of all new and modified files in Phase 2A
- **Build status:** PASS (all pages generated, static params working)
- **Lint status:** 2 new errors (see Critical section)

---

## Overall Assessment

Solid implementation. Clean component decomposition, good separation of server/client boundaries, consistent patterns with Phase 1 project components. The Velite integration approach is pragmatic. Two lint errors need fixing before merge, and the MDX rendering pattern has a correctness concern. Type safety is mostly good but Diary mood typing has unnecessary casts scattered through the codebase.

---

## Critical Issues

### 1. Lint Error: `MdxContent` creates component during render

**File:** `src/components/blog/mdx-content.tsx:12-15`

```tsx
export function MdxContent({ code }: { code: string }) {
  const Component = useMDXComponent(code) // creates new component each render
  return (
    <div className="prose ...">
      <Component components={mdxComponents} />  // lint error: component created during render
    </div>
  )
}
```

**Impact:** React will unmount/remount the component tree on every render, destroying state and causing layout shifts. ESLint correctly flags this.

**Fix:** Memoize the component with `useMemo`:

```tsx
'use client'

import { useMemo } from 'react'
import * as runtime from 'react/jsx-runtime'
import { mdxComponents } from './mdx-components'

export function MdxContent({ code }: { code: string }) {
  const Component = useMemo(() => {
    const fn = new Function(code)
    return fn({ ...runtime }).default
  }, [code])

  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:underline-offset-4 prose-pre:p-0">
      <Component components={mdxComponents} />
    </div>
  )
}
```

### 2. Lint Error: `setHeadings` called synchronously in effect

**File:** `src/components/blog/blog-table-of-contents.tsx:18-28`

```tsx
useEffect(() => {
  const elements = document.querySelectorAll('.prose h2[id], .prose h3[id]')
  const items = Array.from(elements).map(...)
  setHeadings(items)  // lint error: setState in effect body
}, [])
```

**Impact:** Cascading render on mount. The DOM query + setState pattern is acceptable for this use case (reading from DOM), but the linter flags it.

**Fix:** Use a ref + separate state initialization, or refactor to use `useRef` for the heading list since it's DOM-derived and doesn't need to trigger re-renders on its own:

```tsx
// Option A: Keep current approach, disable lint rule with comment explaining why
useEffect(() => {
  const elements = document.querySelectorAll('.prose h2[id], .prose h3[id]')
  const items: TocItem[] = Array.from(elements).map((el) => ({
    id: el.id,
    text: el.textContent || '',
    level: el.tagName === 'H2' ? 2 : 3,
  }))
  setHeadings(items) // eslint-disable-line react-hooks/set-state-in-effect -- reading DOM after MDX renders; no cascading risk
}, [])
```

---

## High Priority

### 3. Security: `new Function(code)` in MDX renderer

**File:** `src/components/blog/mdx-content.tsx:7`

```tsx
const fn = new Function(code)
```

**Context:** This is the standard Velite/MDX pattern -- the `code` string is pre-compiled MDX from the build step, not user input. Since this is a personal portfolio with author-controlled MDX, the risk is **low**. However, worth documenting with a comment:

```tsx
// Velite pre-compiles MDX to a JS function body at build time.
// This is safe because content comes from the local filesystem, not user input.
const fn = new Function(code)
```

**No action required** unless CMS/user-submitted content is added in Phase 4.

### 4. SSR hydration risk: `navigator` check in ShareButtons

**File:** `src/components/shared/share-buttons.tsx:28`

```tsx
{typeof navigator !== 'undefined' && 'share' in navigator && (
```

**Issue:** This check runs during SSR where `navigator` is undefined, so the native share button won't render on server. On client hydration, if `navigator.share` exists, React will see a mismatch (server HTML has no button, client wants one). This will cause a hydration warning.

**Fix:** Use `useState` + `useEffect` pattern:

```tsx
const [canShare, setCanShare] = useState(false)

useEffect(() => {
  setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
}, [])
```

Then conditionally render based on `canShare`.

### 5. Type inconsistency: Diary `mood` needs redundant casts

**Files:** `diary-entry-card.tsx:12`, `diary-page-content.tsx:31`, `diary/[slug]/page.tsx:58`

The `Diary` interface in `content.ts` already has `mood: 'happy' | 'sad' | 'reflective' | 'grateful' | 'motivated'` which matches `DiaryMood`. Yet multiple files cast with `as DiaryMood` or `as keyof typeof DIARY_MOODS`.

**Root cause:** The `Diary` interface in `content.ts` and the `DiaryMood` type in `diary-constants.ts` are defined independently. They happen to match but TypeScript doesn't know they're the same.

**Fix:** Import and reuse `DiaryMood` in the `Diary` interface:

```tsx
// content.ts
import type { DiaryMood } from './diary-constants'

export interface Diary {
  // ...
  mood: DiaryMood
  // ...
}
```

This eliminates all `as DiaryMood` casts across the codebase.

---

## Medium Priority

### 6. DRY: Date formatting repeated 4 times

**Files:** `blog-post-card.tsx:40`, `diary-entry-card.tsx:52`, `blog/[slug]/page.tsx:75`, `diary/[slug]/page.tsx:68`

Same `toLocaleDateString('en-US', { month: '...', day: '...', year: '...' })` pattern repeated with slight variations (cards use `'short'` month, detail pages use `'long'` month).

**Suggestion:** Extract to a utility:

```tsx
// src/lib/format-date.ts
export function formatDate(date: string, style: 'short' | 'long' = 'short'): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: style,
    day: 'numeric',
    year: 'numeric',
  })
}
```

### 7. DRY: Empty state patterns duplicated

The "no items found" empty state UI is repeated between:
- `blog-post-list.tsx` (lines 10-22)
- `diary-entry-list.tsx` (lines 10-22)
- `latest-blog-section.tsx` (lines 26-35)
- `latest-diary-section.tsx` (lines 26-35)

All follow the same structure: icon + title + description in a dashed border container. Consider extracting an `EmptyState` shared component.

### 8. Blog `getBlogs()` filters published, but `getAllBlogTags()` also filters

**File:** `src/lib/content.ts:86-92`

`getAllBlogTags()` independently filters `b.published`, but `getBlogs()` already does this. If you always call `getAllBlogTags()` in contexts where you already have filtered blogs, consider accepting a blogs array parameter to avoid redundant filtering. Minor optimization.

### 9. SearchInput debounce triggers on mount

**File:** `src/components/shared/search-input.tsx:20-23`

```tsx
useEffect(() => {
  const timer = setTimeout(() => onChange(localValue), 300)
  return () => clearTimeout(timer)
}, [localValue, onChange])
```

**Issue:** On mount, this fires `onChange('')` after 300ms. If `onChange` is `setSearchQuery` from a parent, this triggers an unnecessary state update + re-render on mount. Not a bug, but unnecessary work.

**Fix:** Add a guard:

```tsx
const isFirstRender = useRef(true)
useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false
    return
  }
  const timer = setTimeout(() => onChange(localValue), 300)
  return () => clearTimeout(timer)
}, [localValue, onChange])
```

### 10. Velite fire-and-forget in next.config.ts

**File:** `next.config.ts:7-9`

```tsx
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  import('velite').then((m) => m.build({ watch: isDev, clean: !isDev }))
}
```

**Concern:** The `.then()` promise is not awaited. If Velite build fails, the error is swallowed silently. In dev mode this is usually fine (Velite watches and rebuilds), but during `next build` a Velite failure would produce empty `.velite/` files and the build would succeed with no content.

**Fix:** Add error logging:

```tsx
import('velite').then((m) => m.build({ watch: isDev, clean: !isDev })).catch(console.error)
```

---

## Low Priority

### 11. `.gitignore` has duplicate entries

**File:** `.gitignore`

Lines 1-45 and 46-85 contain overlapping entries (node_modules, .next, coverage, .env, .DS_Store all appear twice). Clean up the duplicates.

### 12. `velite.d.ts` duplicates types from `content.ts`

The `Blog` and `Diary` interfaces are defined in both `src/types/velite.d.ts` (for module resolution) and `src/lib/content.ts` (for runtime use). If the schema changes, both must be updated. This is inherent to the Velite workaround, so just document it with a comment in `velite.d.ts`:

```tsx
// Keep in sync with src/lib/content.ts Blog/Diary interfaces
```

### 13. Accessibility: filter buttons lack `aria-pressed`

**File:** `src/components/blog/blog-tag-filter.tsx`, `src/components/diary/diary-mood-filter.tsx`

The filter toggle buttons don't have `aria-pressed` to indicate active state. The existing `project-filter.tsx` correctly uses `aria-pressed={isActive}`.

**Fix:** Add `aria-pressed` to tag and mood filter buttons for screen reader support.

### 14. Minor: Diary default `published: false` in Velite config

**File:** `velite.config.ts:41`

```tsx
published: s.boolean().default(false),
```

Blog defaults to `published: true` (line 24), diary defaults to `false`. This is intentional (diary is more private), but worth a comment explaining the difference to avoid confusion for future content.

---

## Positive Observations

1. **Clean server/client boundary:** List pages are server components, filter wrappers (`BlogPageContent`, `DiaryPageContent`) are client. Data fetched server-side, passed as props. Correct Next.js 15 pattern.

2. **Good component decomposition:** Each component is well under 200 lines. Clear single responsibility. Card, list, filter, page-content separation mirrors Phase 1 project component patterns.

3. **Velite integration is pragmatic:** The `#site/*` path alias + `.velite/` output + `velite.d.ts` type declarations is a clean workaround for Velite's module system. `computedFields` for reading time is elegant.

4. **RSS feed is correct:** Proper CDATA escaping, atom:link self-reference, appropriate cache headers.

5. **MDX components are well-designed:** External link handling with `noopener noreferrer`, responsive images via Next.js `Image`, styled code blocks, table overflow wrapper. All security-conscious.

6. **Consistent styling:** Blog and diary components follow the same visual patterns as project components (same card hover effects, badge usage, layout grids).

7. **Good empty states:** "Coming soon" and "No posts found" states handled gracefully with icons and helpful messaging.

8. **kebab-case naming convention** followed consistently across all new files.

---

## Recommended Actions (Priority Order)

1. **[Critical]** Fix `MdxContent` lint error -- memoize the component with `useMemo`
2. **[Critical]** Fix `BlogTableOfContents` lint error -- suppress with justification comment or refactor
3. **[High]** Fix `ShareButtons` hydration mismatch -- use `useState` + `useEffect` for `canShare`
4. **[High]** Unify `DiaryMood` type -- import in `content.ts` Diary interface to eliminate casts
5. **[Medium]** Extract `formatDate` utility to DRY up date formatting
6. **[Medium]** Add `.catch(console.error)` to Velite build promise in `next.config.ts`
7. **[Low]** Clean up `.gitignore` duplicates
8. **[Low]** Add `aria-pressed` to tag/mood filter buttons

---

## Metrics

| Metric | Value |
|--------|-------|
| Files reviewed | 28 |
| Total LOC | ~1609 |
| Max file LOC | 172 (globals.css) / 112 (blog [slug] page.tsx) |
| All files under 200 lines | Yes |
| Lint errors (new) | 2 |
| Lint errors (pre-existing) | 4 (rotating-text, typewriter-heading) |
| Build status | PASS |
| Type coverage | Good (minor cast cleanup needed) |
| Security issues | None blocking (documented `new Function` is standard MDX pattern) |

---

## Unresolved Questions

1. **Diary visibility in production:** `getDiaries()` shows unpublished entries in dev mode. Is `generateStaticParams` for diary supposed to also include unpublished entries in dev? Currently it calls `getDiaries()` which filters by env, meaning unpublished diary entries get static pages in dev but 404 in prod. Confirm this is intentional.

2. **RSS feed for diary:** Currently only blog posts are in the RSS feed. Should diary entries also have their own feed, or is blog-only intentional?

3. **SEO: Missing `<link rel="alternate" type="application/rss+xml">` in layout head.** The feed exists at `/feed.xml` but nothing in the HTML points to it. Consider adding the link tag in the root layout or metadata.
