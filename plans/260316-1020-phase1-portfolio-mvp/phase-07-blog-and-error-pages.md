# Phase 7: Blog Placeholder & Error Pages

## Context Links
- [System Architecture — Blog Page, Error Handling](../../docs/system-architecture.md)
- [Design Guidelines](../../docs/design-guidelines.md)
- [Code Standards — Error Boundaries](../../docs/code-standards.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | HIGH |
| Status | Complete |
| Effort | ~1.5h |
| Depends On | Phase 2 (layout) |
| Description | Build Blog "Coming soon" placeholder page, 404 not-found page, and error boundary page. Final responsive testing and polish pass. |

## Key Insights

- Blog placeholder is minimal — just a heading and "coming soon" message
- `not-found.tsx` is a Next.js special file; exported as default function
- `error.tsx` must be a client component (`'use client'`) — Next.js requirement
- `error.tsx` receives `error` and `reset` props for retry functionality
- These pages should match the overall design language (minimal, clean)

## Requirements

### Functional
- **Blog page:** "Coming soon" with brief message about future blog plans
- **404 page:** Friendly message, link back to home
- **Error page:** Error message, "Try again" button, link to home

### Non-Functional
- `error.tsx` must be a client component
- `not-found.tsx` is a server component
- Consistent visual style with rest of site
- Accessible error messages

## Related Code Files

### Files to Create
| File | Component | Type |
|------|-----------|------|
| `src/app/blog/page.tsx` | BlogPage | Server |
| `src/app/not-found.tsx` | NotFound | Server |
| `src/app/error.tsx` | ErrorPage | Client |

## Implementation Steps

### Step 1: Blog Placeholder Page

`src/app/blog/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { PenLine } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog',
  description: "Kane Nguyen's technical blog — coming soon.",
}

export default function BlogPage() {
  return (
    <div className="section-spacing">
      <div className="container-main">
        <div className="flex flex-col items-center justify-center text-center py-16 md:py-24">
          {/* Icon */}
          <div className="mb-6 p-4 rounded-full bg-zinc-100">
            <PenLine className="h-8 w-8 text-zinc-400" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3">
            Blog
          </h1>

          {/* Message */}
          <p className="text-base text-zinc-500 max-w-md mb-2">
            Coming soon! I'm working on sharing my thoughts on web development,
            software engineering, and the tools I use every day.
          </p>
          <p className="text-sm text-zinc-400">
            Stay tuned for articles and tutorials.
          </p>
        </div>
      </div>
    </div>
  )
}
```

**Design Details:**
- Centered layout with generous vertical padding
- PenLine icon in a circular zinc-100 background
- Clean, minimal — doesn't look broken, clearly intentional "coming soon"

### Step 2: 404 Not Found Page

`src/app/not-found.tsx`:

```tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="section-spacing">
      <div className="container-main">
        <div className="flex flex-col items-center justify-center text-center py-16 md:py-24">
          {/* Large 404 */}
          <p className="text-6xl md:text-8xl font-bold gradient-text mb-4">
            404
          </p>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            Page Not Found
          </h1>

          {/* Message */}
          <p className="text-base text-zinc-500 max-w-md mb-8">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          {/* CTA */}
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Design Details:**
- Large "404" with gradient text (gradient-accent class) — visually distinctive
- Friendly copy, not technical jargon
- Single CTA: "Back to Home"

### Step 3: Error Boundary Page

`src/app/error.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error for debugging (replace with error reporting service later)
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="section-spacing">
      <div className="container-main">
        <div className="flex flex-col items-center justify-center text-center py-16 md:py-24">
          {/* Icon */}
          <div className="mb-6 p-4 rounded-full bg-red-50">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            Something Went Wrong
          </h1>

          {/* Message */}
          <p className="text-base text-zinc-500 max-w-md mb-8">
            An unexpected error occurred. Please try again or navigate back
            to the home page.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Design Details:**
- `'use client'` — required by Next.js for error boundaries
- Red accent (AlertTriangle icon in red-50 bg) — clearly communicates error
- Two actions: "Try Again" (calls `reset()`) and "Back to Home"
- `console.error` for debugging; replace with error reporting in Phase 3+
- `error.digest` available for server-side error tracking

### Step 4: Final Responsive Testing & Polish

After all pages built, do a comprehensive responsive pass:

**Test matrix:**
| Breakpoint | Width | Check |
|-----------|-------|-------|
| Mobile | 375px | All pages single-column, touch targets 44px+, hamburger nav works |
| Tablet | 768px | Grid transitions (2-col), hero side-by-side, nav visible |
| Desktop | 1024px | Full grid (3-col), max-w-6xl container, generous whitespace |
| Wide | 1280px | Content stays centered, no overflow, looks intentional |

**Polish checklist:**
- Consistent section spacing across all pages
- All links work (nav, CTAs, project links, social links)
- Gradient accent bar visible on all pages
- Active nav link highlighted on each page
- Footer at bottom of short pages (flexbox sticky footer)
- No horizontal scrollbar at any breakpoint
- Images have alt text
- Focus rings visible on keyboard navigation

## Todo List

- [x] 7.1 Create `src/app/blog/page.tsx` (coming soon placeholder)
- [x] 7.2 Create `src/app/not-found.tsx` (404 page with gradient 404 text)
- [x] 7.3 Create `src/app/error.tsx` (error boundary with retry + home link)
- [x] 7.4 Test blog page: renders with icon, heading, coming soon message
- [x] 7.5 Test 404: navigate to `/nonexistent-route`, see 404 page
- [x] 7.6 Test error page: verify it renders (can force error in dev for testing)
- [x] 7.7 Run full responsive test on all pages at 375px, 768px, 1024px
- [x] 7.8 Verify all nav links work and show active state
- [x] 7.9 Verify footer sticks to bottom on short pages (Blog, 404)
- [x] 7.10 Check for horizontal scrollbar at all breakpoints
- [x] 7.11 Keyboard navigation audit: tab through all pages
- [x] 7.12 Verify `pnpm build` succeeds with all pages

## Success Criteria

- Blog page: clean "coming soon" with icon, no broken appearance
- 404 page: gradient "404", friendly message, working "Back to Home" link
- Error page: red alert icon, "Try Again" resets, "Back to Home" navigates
- All pages responsive across 375-1280px
- No broken links, no console errors
- Footer at bottom on all pages (including short-content pages)
- `pnpm build` passes

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Error boundary not triggering in dev | Low | Next.js dev mode shows error overlay; test in production build |
| 404 not rendering for dynamic routes | Low | `not-found.tsx` at app root catches all unmatched routes |
| Short pages causing footer float | Low | `flex-1` on `<main>` in root layout handles this |

## Next Steps

After all pages verified and polished, proceed to **Phase 8: Deployment**.
