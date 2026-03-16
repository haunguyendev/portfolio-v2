# React/Next.js Performance Audit Report

**Date:** 2026-03-16
**Scope:** Full src/ directory (42 files)
**Build status:** All pages statically generated (SSG) -- no dynamic routes

---

## 1. Bundle Size

### CRITICAL -- react-icons barrel type import

| Severity | File | Line |
|----------|------|------|
| CRITICAL | `src/components/home/tech-stack-tabs.tsx` | 32 |

```ts
import type { IconType } from 'react-icons'
```

**Problem:** Importing from `'react-icons'` (root barrel) rather than a subpath. While this is a `type`-only import and TypeScript strips it at compile time, this pattern is misleading and risky -- if anyone later changes it to a value import or copies the pattern, the entire react-icons package (~3MB uncompressed) gets bundled. The `type` keyword saves it today, but it's a footgun.

**Fix:** Import the type from the subpath or define a local type alias:
```ts
// Option A: local type alias (simplest, zero risk)
type IconType = React.ComponentType<{ className?: string }>

// Option B: import from subpath if available
import type { IconType } from 'react-icons/lib'
```

**Severity reassessment:** MEDIUM in practice (since `type` import is tree-shaken), but flagged as CRITICAL pattern risk.

---

### HIGH -- framer-motion loaded on every page via layout chain

| Severity | Files | Lines |
|----------|-------|-------|
| HIGH | `src/components/home/tech-stack-tabs.tsx` | 4 |
| HIGH | `src/components/home/animated-cta-card.tsx` | 3 |
| HIGH | `src/components/ui/typewriter-heading.tsx` | 4 |
| HIGH | `src/components/ui/rotating-text.tsx` | 4 |

**Problem:** framer-motion (~150KB parsed JS) is used in 4 components, all of which are on the homepage. The about page also loads `TechStackTabs` (via `SkillsSection`), pulling framer-motion there too. Since all pages are SSG, framer-motion JS is shipped in the client bundle for home and about pages even though much of the animation is non-critical (tab transitions, floating particles, typewriter cursor blink).

**Fix -- use `next/dynamic` for heavy animation components:**
```tsx
// In about-preview-section.tsx and skills-section.tsx
import dynamic from 'next/dynamic'
const TechStackTabs = dynamic(
  () => import('@/components/home/tech-stack-tabs').then(m => ({ default: m.TechStackTabs })),
  { ssr: false, loading: () => <div className="h-40 animate-pulse bg-muted rounded-lg" /> }
)
```

Same for `AnimatedCtaCard`:
```tsx
const AnimatedCtaCard = dynamic(
  () => import('@/components/home/animated-cta-card').then(m => ({ default: m.AnimatedCtaCard })),
  { ssr: false }
)
```

**Impact:** Reduces initial JS payload by ~150KB for pages that don't need immediate animation. Improves LCP and TTI.

---

### HIGH -- cmdk + Dialog loaded eagerly in Header for CommandMenu

| Severity | File | Line |
|----------|------|------|
| HIGH | `src/components/layout/command-menu.tsx` | 1-24 |

**Problem:** `CommandMenu` is loaded in `Header` which is in `layout.tsx` (every page). It imports `cmdk`, `Dialog`, and `DialogContent` -- all shipped to every visitor. The command menu is an advanced feature (Cmd+K) that most visitors never use on first load.

**Fix:** Lazy-load `CommandMenu` with `next/dynamic`:
```tsx
// In header.tsx
import dynamic from 'next/dynamic'
const CommandMenu = dynamic(
  () => import('@/components/layout/command-menu').then(m => ({ default: m.CommandMenu })),
  { ssr: false, loading: () => <button className="size-8" aria-label="Search"><Search className="h-4 w-4" /></button> }
)
```

**Impact:** Defers cmdk, Dialog, and associated JS from initial page load. Estimated ~30-50KB saved on first paint.

---

### MEDIUM -- Dead/unused components in tree

| Severity | Files |
|----------|-------|
| MEDIUM | `src/components/ui/HeroAvatar.tsx` |
| MEDIUM | `src/components/ui/Logo.tsx` |

**Problem:** `HeroAvatar` and `Logo` (in `src/components/ui/`) are never imported by any component. They appear to be earlier iterations. While Next.js tree-shaking should exclude them from bundles, they add confusion and maintenance burden.

**Recommendation:** Delete or move to a `_deprecated/` folder.

---

## 2. Client Component Hygiene

### HIGH -- ThemeProvider wraps entire app, forcing client boundary at root

| Severity | File | Line |
|----------|------|------|
| HIGH | `src/app/layout.tsx` | 27 |
| HIGH | `src/components/layout/theme-provider.tsx` | 1 |

**Problem:** `ThemeProvider` is `'use client'` and wraps the entire app in `layout.tsx`. This means `Header` and `Footer` (and their child components) cannot be server components. All children of a client component are client components.

**Nuance:** This is a well-known trade-off with next-themes and is acceptable. However, Header contains `Navigation`, `MobileNav`, `ThemeToggle`, `CommandMenu`, and `Logo` -- all marked `'use client'`. Since they are children of a client boundary anyway, the `'use client'` directives on them are redundant (though harmless and self-documenting).

**No action required**, but be aware that all layout-level components are client-rendered.

---

### HIGH -- Logo component blocks rendering until mounted

| Severity | File | Line |
|----------|------|------|
| HIGH | `src/components/layout/logo.tsx` | 21-23 |

**Problem:** Logo renders a blank `<div>` placeholder until `useEffect` fires (post-hydration), then swaps to the real `<Image>`. This causes:
1. Logo invisible during SSR and initial paint (CLS flash)
2. Image not preloaded by browser (no `<img>` tag in SSR HTML despite `priority` prop)
3. Layout shift when image appears

**Fix:** Use CSS to handle theme-based logo switching instead of JS:
```tsx
// Server component -- no 'use client' needed
export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/logo/logo-light.svg"
        alt="haunguyen.dev"
        width={180}
        height={40}
        className="h-10 w-auto dark:hidden"
        priority
      />
      <Image
        src="/logo/logo-dark.svg"
        alt="haunguyen.dev"
        width={180}
        height={40}
        className="h-10 w-auto hidden dark:block"
        priority
      />
    </Link>
  )
}
```

**Impact:** Eliminates logo flash, enables SSR of logo image, removes a `'use client'` boundary.

---

### MEDIUM -- Footer uses react-icons (SiFacebook, SiZalo) pulling client JS

| Severity | File | Line |
|----------|------|------|
| MEDIUM | `src/components/layout/footer.tsx` | 3 |

**Problem:** Footer is a server component, but it imports `SiFacebook` and `SiZalo` from `react-icons/si`. react-icons are plain SVG components and work fine in server components. No actual issue here -- `react-icons/si` is a subpath import that tree-shakes correctly.

**Status:** No action needed. The subpath import `react-icons/si` is the correct pattern.

---

### MEDIUM -- `new Date()` in Footer server component

| Severity | File | Line |
|----------|------|------|
| MEDIUM | `src/components/layout/footer.tsx` | 107 |

```tsx
&copy; {new Date().getFullYear()} Kane Nguyen
```

**Problem:** Since all pages are statically generated, `new Date().getFullYear()` runs at build time. This is fine for now (year will be correct at build), but if the site is built in December and served in January, the year will be stale until next deploy.

**Status:** Acceptable for a portfolio site with regular deploys. No action needed.

---

## 3. Image Optimization

### All Images -- Assessment

| Component | src | fill | sizes | priority | alt | Verdict |
|-----------|-----|------|-------|----------|-----|---------|
| `hero-section.tsx` | `/images/hero/kane-photo.jpg` | Yes | `(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px` | Yes | "Kane Nguyen" | GOOD |
| `bio-section.tsx` | `/images/hero/kane-avatar.jpg` | Yes | `160px` | No | "Kane Nguyen's profile photo" | GOOD |
| `project-card.tsx` | `project.image` | Yes | `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw` | No | `project.title` | GOOD |
| `logo.tsx` | SVG files | No | N/A | Yes | "haunguyen.dev" | OK (fixed width/height) |
| `HeroAvatar.tsx` | `/images/hero/kane-avatar.jpg` | Yes | `(max-width: 768px) 16rem, 20rem` | Yes | "Kane Nguyen" | GOOD (but unused) |

**Assessment:** Image usage is solid. All `fill` mode images have `sizes` prop. Hero image has `priority`. Alt text present on all images.

### MEDIUM -- bio-section avatar missing priority

| Severity | File | Line |
|----------|------|------|
| MEDIUM | `src/components/about/bio-section.tsx` | 29 |

The avatar is above the fold on the about page. Consider adding `priority` to avoid lazy-loading it.

---

## 4. Eliminating Waterfalls

### Assessment: No waterfalls detected

All data fetching uses synchronous JSON imports (`getProjects()`, `getFeaturedProjects()`, `getExperience()`, `getAllTechnologies()`). No `async/await`, no `fetch()`, no Suspense boundaries needed.

**Status:** Clean. No request waterfalls possible with current static data architecture.

---

## 5. Server-Side Performance

### Assessment: Minimal serialization overhead

The only server-to-client data passing is in `projects/page.tsx`:
```tsx
<ProjectsPageContent projects={projects} technologies={technologies} />
```

This serializes the full project list + tech list to the client. With a small dataset (5-10 projects), this is negligible.

**Status:** No action needed for current scale.

---

## Summary Table

| # | Issue | File | Severity | Category |
|---|-------|------|----------|----------|
| 1 | framer-motion not lazy-loaded; ~150KB on home+about | `tech-stack-tabs.tsx`, `animated-cta-card.tsx`, `typewriter-heading.tsx`, `rotating-text.tsx` | HIGH | Bundle Size |
| 2 | CommandMenu (cmdk+Dialog) eagerly loaded in every-page Header | `command-menu.tsx` via `header.tsx` | HIGH | Bundle Size |
| 3 | Logo blocks render until hydration (mounted state) | `logo.tsx:21-23` | HIGH | Client Component |
| 4 | `react-icons` barrel type import (footgun pattern) | `tech-stack-tabs.tsx:32` | MEDIUM | Bundle Size |
| 5 | Unused components `HeroAvatar.tsx`, `Logo.tsx` in ui/ | `src/components/ui/` | MEDIUM | Cleanup |
| 6 | Bio avatar missing `priority` (above fold) | `bio-section.tsx:29` | MEDIUM | Images |

---

## Recommended Actions (Priority Order)

1. **Lazy-load CommandMenu** with `next/dynamic({ ssr: false })` -- quick win, saves ~30-50KB per page
2. **Fix Logo hydration pattern** -- use CSS dark/light switching instead of mounted state
3. **Lazy-load framer-motion components** -- `TechStackTabs` and `AnimatedCtaCard` via `next/dynamic`
4. **Add `priority` to about page avatar** -- one-line change
5. **Remove unused `HeroAvatar.tsx` and `Logo.tsx`** from `src/components/ui/`
6. **Replace `react-icons` barrel type import** with local type alias

---

## Positive Observations

- All pages are statically generated (SSG) -- excellent for a portfolio
- `react-icons/si` subpath imports used correctly (not barrel imports)
- `lucide-react` named imports used throughout -- tree-shakes well
- `next/image` used consistently with proper `sizes`, `fill`, `alt` attributes
- Hero image has `priority` set correctly
- `next.config.ts` enables AVIF + WebP image formats
- Clean server/client boundary: only components that need interactivity are `'use client'`
- Data is co-located in JSON files, not hardcoded in JSX
- No barrel file exports in component directories (clean direct imports)
- `ThemeProvider` correctly uses `disableTransitionOnChange` to avoid flash

---

## Unresolved Questions

1. What is the actual bundle size impact of framer-motion on this project? Could not inspect `.next/static/chunks/` due to access restrictions. Recommend running `npx @next/bundle-analyzer` to get exact figures.
2. Are `HeroAvatar.tsx` and `Logo.tsx` in `src/components/ui/` intended for future use, or safe to delete?
