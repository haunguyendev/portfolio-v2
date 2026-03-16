# Code Review: Phase 1 Portfolio MVP

**Date:** 2026-03-16
**Reviewer:** code-reviewer
**Scope:** Full Phase 1 implementation (26 custom files)
**Stack:** Next.js 16 + Tailwind CSS v4 + shadcn/ui (Base UI) + TypeScript

---

## Overall Score: 8.2 / 10

| Category | Score | Notes |
|----------|-------|-------|
| Code Quality | 8.5 | Clean, well-organized, conventions followed |
| TypeScript | 8.0 | Strict mode, no `any`, good typing. Minor cast pattern |
| Component Patterns | 8.5 | Server/client boundaries mostly correct |
| Accessibility | 7.5 | Good ARIA on nav/mobile, missing on some elements |
| Responsiveness | 8.5 | Mobile-first, proper breakpoints |
| Security | 9.0 | No secrets, proper link attributes |
| Performance | 8.0 | Image optimization, priority loading, static gen |

---

## Critical Issues (Must Fix Before Shipping)

### 1. CRITICAL: `FeaturedProjectsSection` is server component but renders `ProjectCard` which uses `Image` -- OK, BUT the section itself has no `'use client'` yet renders fine since `Image` is a server-compatible component. VERIFIED: No issue here.

*No truly critical issues found.* The codebase is shippable.

---

## High Priority Issues

### H1. `Footer` uses `new Date().getFullYear()` in a server component

**File:** `src/components/layout/footer.tsx:38`

The footer is a **server component** (no `'use client'`). `new Date().getFullYear()` executes at build/render time on the server. For a statically-generated site, the year is frozen at build time. This is technically correct behavior for SSG (the year updates on each deployment), but worth noting. **No action needed** -- deploying annually (or on Vercel with ISR) keeps it current.

### H2. `HeroSection` and `AboutPreviewSection` are `'use client'` solely to use `buttonVariants`

**Files:** `src/components/home/hero-section.tsx`, `src/components/home/about-preview-section.tsx`

These components are marked `'use client'` because `buttonVariants` is exported from a `"use client"` module. This means the entire hero section (including the `Image` component and all text) ships as client-side JavaScript.

**Impact:** Increased JS bundle size, no SSR for hero content (hurts SEO/LCP).

**Recommended fix:** Extract the button links into a tiny `'use client'` wrapper component (e.g., `hero-cta-buttons.tsx`) and keep `HeroSection` as a server component. Alternatively, use inline Tailwind classes on the `<Link>` elements (like `not-found.tsx` does) to avoid importing `buttonVariants` entirely.

```tsx
// hero-section.tsx (server component, no 'use client')
import { HeroCtaButtons } from './hero-cta-buttons'
// ... rest as server component

// hero-cta-buttons.tsx ('use client')
// Only the <Link> elements with buttonVariants
```

### H3. JSON data type assertions use `as` casts without runtime validation

**File:** `src/lib/content.ts:6-8`

```ts
const projects = projectsData as Project[]
const skills = skillsData as SkillGroup[]
const experience = experienceData as Experience[]
```

Type assertions bypass compile-time checking. If the JSON shape drifts from the TypeScript interface (e.g., a missing `longDescription` field), there will be no build-time or runtime error -- just `undefined` rendering silently.

**Recommended fix:** For MVP, this is acceptable since the JSON files are co-located and developer-controlled. For Phase 2+, consider adding a lightweight validation (e.g., Zod schemas) or at minimum `satisfies` assertions:

```ts
import type { Project } from '@/types'
const projects: Project[] = projectsData // compile-time check
```

### H4. Mobile nav does not trap focus or handle Escape key

**File:** `src/components/layout/mobile-nav.tsx`

The mobile nav opens a dropdown overlay but:
- Does not close on `Escape` key press
- Does not trap focus within the menu when open
- Does not close when user clicks outside the menu (no backdrop/overlay)
- No `aria-controls` linking the button to the nav panel

**Impact:** Poor keyboard navigation experience, fails WCAG 2.1 AA for focus management.

**Recommended fix:**
```tsx
// Add Escape handler
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false)
  }
  if (isOpen) document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [isOpen])
```

Also add `id` to the nav panel and `aria-controls` on the button.

---

## Medium Priority Issues

### M1. Navigation active state uses exact match only

**File:** `src/components/layout/navigation.tsx:22`

```ts
pathname === link.href ? 'text-zinc-900' : 'text-zinc-500'
```

This means `/projects/some-project` would NOT highlight the "Projects" nav item. For MVP with no nested routes this is fine, but should be updated to `pathname.startsWith(link.href)` (with special handling for `/`) when sub-pages are added.

### M2. `ProjectCard` uses `article` without heading level context

**File:** `src/components/projects/project-card.tsx:12`

Uses `<article>` with `<h3>` inside. When used in `FeaturedProjectsSection`, the heading hierarchy is correct (h2 > h3). But the card component hardcodes `<h3>` regardless of context. Consider accepting heading level as a prop for reusability, or leave as-is for MVP.

### M3. Missing `alt` text specificity on project images

**File:** `src/components/projects/project-card.tsx:19`

```tsx
alt={project.title}
```

Alt text is just the project title (e.g., "Portfolio v2"). More descriptive alt text like `"Screenshot of Portfolio v2 project"` would be better for accessibility, but acceptable for MVP.

### M4. `gradient-text` class uses `-webkit-text-fill-color` without standard fallback

**File:** `src/app/globals.css:136-141`

The gradient text effect uses `-webkit-text-fill-color: transparent` which has broad browser support but is technically non-standard. If it fails, the text becomes invisible against the gradient background. Add a `color: transparent` as the standard property:

```css
.gradient-text {
  background: linear-gradient(to right, #f97316, #ef4444, #3b82f6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}
```

### M5. `ProjectFilter` wraps `Badge` in `button` without type attribute

**File:** `src/components/projects/project-filter.tsx:23-34`

Buttons default to `type="submit"` when inside a form. While there's no form here currently, adding `type="button"` is defensive:

```tsx
<button type="button" onClick={() => onFilterChange(null)} ...>
```

### M6. `error.tsx` logs error to console without filtering sensitive data

**File:** `src/app/error.tsx:16`

```tsx
console.error('Application error:', error)
```

In production, consider using a structured error reporting service. The `error.digest` (server-side hash) is available for correlation without exposing stack traces. For MVP, this is acceptable.

---

## Low Priority Issues

### L1. Convention: Page components use `export default` (correct for Next.js) but project convention says "Named exports only (no default exports except pages)"

All page files correctly use `export default`. All non-page components correctly use named exports. Convention is followed.

### L2. `experience.json` uses placeholder data

**File:** `src/content/experience.json`

"Company Name" and "University / Bootcamp" are placeholders. Should be replaced with real data before deployment.

### L3. `projects.json` links to non-existent demo URLs

**File:** `src/content/projects.json`

URLs like `https://task-app.example.com` and `https://weather.example.com` are placeholder domains. These will show broken links in production. Replace or remove before shipping.

### L4. Missing `<meta name="viewport">` -- handled by Next.js automatically, no issue.

### L5. `tsconfig.json` has `jsx: "react-jsx"` which is fine but Next.js 16 default uses `"preserve"` -- both work. No issue.

---

## Edge Cases Found by Scouting

1. **Empty projects array:** `ProjectGrid` correctly handles empty state with "No projects found" message. `FeaturedProjectsSection` does NOT guard against zero featured projects (would render empty grid -- cosmetic, not a crash).

2. **Long technology names in filter:** If a technology name is very long, the `Badge` inside the filter button will wrap correctly due to `flex-wrap gap-2`. No overflow issue.

3. **Mobile nav z-index stacking:** The mobile nav dropdown uses `absolute top-full` positioned relative to the header. The header has `z-50`. The dropdown does not specify z-index, but since it's a child of the z-50 header, it inherits the stacking context. No issue.

4. **Image fallback:** `ProjectCard` conditionally renders `Image` only if `project.image` is truthy (line 16). Good defensive check. However, the `image` field in the `Project` type is non-optional (`image: string`), so the check is technically unreachable. The `HeroSection` hard-codes the image path with no fallback.

5. **Filter state on navigation:** When a user filters projects, navigates away, and comes back, the filter resets (component state in `ProjectsPageContent` is local). This is expected behavior for MVP.

6. **Scroll position on mobile nav close:** When a mobile nav link is clicked, `setIsOpen(false)` fires. Next.js App Router scroll behavior may or may not reset. No issue for MVP.

---

## Positive Observations

1. **Clean file organization** -- kebab-case naming, one component per file, all under 200 lines (longest: `hero-section.tsx` at 70 lines)
2. **Proper server/client split** -- only components that need interactivity/hooks are `'use client'`
3. **Content in data files** -- JSON content properly separated from components as per convention
4. **Good TypeScript configuration** -- `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`
5. **Correct use of Next.js patterns** -- `Metadata` exports, `Image` with sizes/priority, proper layout nesting
6. **Accessibility basics** -- `aria-label` on social links, `aria-expanded` on mobile nav, `aria-pressed` on filter buttons, `aria-hidden` on decorative elements
7. **Security** -- all external links have `rel="noopener noreferrer"`, no secrets exposed, no XSS vectors
8. **Tailwind utility classes used consistently** -- custom CSS only for gradient effects
9. **Responsive design** -- proper breakpoints at `sm`, `md`, `lg` with mobile-first approach
10. **Image optimization** -- `formats: ['image/avif', 'image/webp']` in next config, `sizes` attribute on images

---

## Recommended Actions (Prioritized)

1. **[High]** Extract `buttonVariants` usage from `HeroSection` and `AboutPreviewSection` into small client wrappers to keep main content as server components (better SSR/SEO/LCP)
2. **[High]** Add `Escape` key handler and `aria-controls` to mobile nav
3. **[Medium]** Add `type="button"` to filter buttons in `ProjectFilter`
4. **[Medium]** Add `color: transparent` fallback in `.gradient-text` CSS class
5. **[Low]** Replace placeholder content in `experience.json` and `projects.json` before deployment
6. **[Low]** Guard `FeaturedProjectsSection` against zero featured projects (conditional render or fallback)

---

## Metrics

| Metric | Value |
|--------|-------|
| Files Reviewed | 26 (custom) + 3 (config) + 3 (shadcn/ui) |
| Total LOC (custom) | ~850 |
| Type Coverage | 100% (strict mode, no `any`) |
| Test Coverage | 0% (no tests yet -- expected for MVP Phase 1) |
| Linting Issues | Not run (no Bash access) |
| `'use client'` Components | 7 of 26 |
| Max File Length | 70 lines (hero-section.tsx) |
| Convention Violations | 0 |

---

## Unresolved Questions

1. Should the hero photo have a fallback/placeholder if the image fails to load? Currently no `onError` handling.
2. Is the `not-found.tsx` gradient text approach (using `gradient-text` class) consistent with the `'use client'` boundary concern? It works because `not-found.tsx` is a server component and `gradient-text` is pure CSS -- no issue.
3. Will the `Inter` font from `next/font/google` conflict with shadcn/ui's default `--font-sans` variable? Should verify visually that the font stack renders as expected.
