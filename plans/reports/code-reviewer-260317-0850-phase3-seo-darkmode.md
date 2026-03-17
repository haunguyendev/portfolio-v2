# Code Review: Phase 3 — SEO + Dark Mode Polish

**Reviewer:** code-reviewer | **Date:** 2026-03-17 | **Score: 8/10**

## Scope
- **Files reviewed:** 9 (layout.tsx, sitemap.ts, robots.ts, json-ld.tsx, page.tsx, blog/[slug]/page.tsx, globals.css, error.tsx, theme-provider.tsx)
- **LOC changed:** ~120 (new + modified)
- **Focus:** SEO metadata correctness, JSON-LD validity, dark mode CSS, edge cases
- **Build:** PASSES (all static pages generated, sitemap.xml + robots.txt confirmed)
- **Lint:** 6 pre-existing errors (all `set-state-in-effect` in unrelated files) — none in reviewed files

## Overall Assessment

Solid SEO foundation. Metadata, sitemap, robots, and JSON-LD all follow Next.js App Router conventions correctly. Dark mode fixes are minimal but targeted (diary blockquote, error page, enableSystem). Code is clean, concise, and consistent with project patterns.

---

## Critical Issues

None.

---

## High Priority

### H1. XSS risk in JSON-LD via `dangerouslySetInnerHTML`
**File:** `src/components/seo/json-ld.tsx` (lines 15, 55)
**Problem:** `JSON.stringify(jsonLd)` is used directly with `dangerouslySetInnerHTML`. If blog title/description contains `</script>`, an attacker (or accidental content) can inject arbitrary HTML. This is a standard JSON-LD injection vector.
**Impact:** LOW-MEDIUM — content comes from MDX files under author control, but if CMS is added in Phase 4, this becomes exploitable.
**Fix:**
```typescript
// Replace JSON.stringify usage with escaped version:
const safeJsonLd = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

return (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: safeJsonLd }}
  />
)
```

### H2. Missing ArticleJsonLd on diary detail pages
**File:** `src/app/diary/[slug]/page.tsx`
**Problem:** Blog posts get `<ArticleJsonLd />` but diary entries do not. Diary entries are also authored content with dates and descriptions — they qualify for Article schema. Google will index diary pages (they're in sitemap) but won't have structured data.
**Fix:** Add `ArticleJsonLd` to diary/[slug]/page.tsx, same pattern as blog.

### H3. `SITE_URL` defaults to `http://localhost:3000` — sitemap + OG will contain localhost URLs if env var not set
**File:** `src/lib/constants.ts` (line 4)
**Problem:** During build on Vercel, if `NEXT_PUBLIC_SITE_URL` is not configured, all sitemap URLs and OG image URLs will point to localhost. Sitemap is generated at build time, so this is especially important.
**Impact:** HIGH for SEO if env var forgotten. Google indexes localhost URLs = broken.
**Recommendation:** Add build-time validation or use Vercel's `VERCEL_URL` as fallback:
```typescript
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
```

---

## Medium Priority

### M1. Hardcoded color in MDX pre block
**File:** `src/components/blog/mdx-components.tsx` (line 93)
**Problem:** `bg-[#0d1117]` is hardcoded for code block background. This works fine in dark mode but in light mode creates a dark code block that may look jarring without a transition. Not a dark mode bug per se, but violates the "no hardcoded colors" principle from the plan.
**Recommendation:** Acceptable if intentional (GitHub dark theme for code). Document this as a deliberate choice.

### M2. Static pages missing `lastModified` in sitemap
**File:** `src/app/sitemap.ts` (lines 22-25)
**Problem:** Static pages (projects, about, blog list, diary list) don't have `lastModified` field. While optional, providing it helps search engines determine crawl frequency.
**Fix:** Add `lastModified: new Date()` to all static entries (they rebuild on deploy anyway).

### M3. Missing OG metadata on diary detail pages
**File:** `src/app/diary/[slug]/page.tsx` (lines 26-29)
**Problem:** `generateMetadata` returns only `title` + `description` but no `openGraph` or `twitter` fields. Blog posts have full OG metadata. Diary pages shared on social will show generic OG image instead of any entry-specific info.
**Fix:** Add `openGraph: { title, description, type: 'article', publishedTime: entry.date }` to diary's `generateMetadata`.

### M4. `enableSystem` change could surprise existing users
**File:** `src/components/layout/theme-provider.tsx` (line 15)
**Problem:** Changed from `enableSystem={false}` to `enableSystem` (true). Users who previously saw light theme will now see dark theme if their OS preference is dark. This is the intended behavior per plan, but worth noting: first-time visitors with dark OS will now see dark mode by default.
**Impact:** Cosmetic. Likely the desired behavior. No action needed, just awareness.

---

## Low Priority

### L1. Tech stack icon colors are hardcoded hex values
**File:** `src/components/home/tech-stack-tabs.tsx`, `src/components/home/contact-section.tsx`
**Problem:** ~25+ hardcoded hex colors for brand icons. These are brand colors (React blue, TypeScript blue, etc.) and do NOT change with theme. This is correct — brand colors should remain fixed.
**Status:** No action needed. This is intentional.

### L2. Gradient accent uses hardcoded hex
**File:** `src/app/globals.css` (lines 133, 137)
**Problem:** `.gradient-accent` and `.gradient-text` use hardcoded `#f97316, #ef4444, #3b82f6`. These are the brand gradient and are identical in both themes.
**Status:** Intentional. The gradient is a brand element, not a theme element.

---

## Edge Cases Found by Scouting

1. **feed.xml route does not include diary entries** — RSS only covers blog posts. If diary entries should be discoverable via RSS, they need to be added. (Design decision, not a bug.)
2. **Unpublished diary entries appear in dev sitemap** — `getDiaries()` includes unpublished entries in dev mode. Sitemap uses `getDiaries()` at build time, so production is fine (build uses `NODE_ENV=production`). No issue.
3. **Blog posts without `image` field** — `ArticleJsonLd` conditionally includes `image`. Google's Article schema recommends `image` for Rich Results. Posts without images won't get enhanced search results. Acceptable.
4. **`not-found.tsx` has no dark mode issues** — uses `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`. All CSS variable-based. Good.

---

## Positive Observations

- Clean separation: JSON-LD in its own component file under `seo/` directory
- Correct use of `metadataBase` — relative image paths resolve correctly
- `suppressHydrationWarning` on `<html>` correctly handles next-themes flash
- `disableTransitionOnChange` prevents ugly color transition flicker on theme switch
- Sitemap correctly uses content helper functions (single source of truth for routes)
- Diary blockquote dark mode fix uses proper `dark:` variant with `oklch` colors
- Error page dark mode fix is clean: `dark:bg-red-950/50` matches light `bg-red-50`
- Build succeeds with all routes — sitemap.xml and robots.txt confirmed in output

---

## Plan Todo Checklist Status

### Phase 1 (SEO & Metadata)
- [x] Create static OG image (confirmed at `public/images/og-default.png`)
- [x] Enhance layout.tsx metadata (OG, Twitter, RSS link, metadataBase)
- [x] Create src/app/sitemap.ts
- [x] Create src/app/robots.ts
- [x] Create src/components/seo/json-ld.tsx (Person + Article)
- [x] Add PersonJsonLd to homepage
- [x] Add ArticleJsonLd to blog/[slug]/page.tsx
- [x] Build and verify sitemap.xml output
- [x] Build and verify robots.txt output
- [ ] Verify OG meta tags in browser (post-deploy task)

### Phase 2 (Dark Mode Polish) — Partial
- [ ] Create Playwright dark mode audit script (not done)
- [ ] Full screenshot audit (not done)
- [x] Fix diary prose blockquote dark mode colors
- [x] Fix error page dark mode (bg-red-50 → dark:bg-red-950/50)
- [x] Enable system theme preference
- [ ] Fix footer dark mode colors (plan mentioned this, not addressed)
- [ ] Fix home section dark mode colors (plan mentioned this, not addressed)

---

## Recommended Actions (Priority Order)

1. **H3** — Add `VERCEL_URL` fallback in `SITE_URL` constant to prevent localhost in production sitemap/OG
2. **H1** — Escape `</script>` in JSON-LD output (quick 1-line fix, future-proofs for CMS)
3. **H2** — Add `ArticleJsonLd` to `diary/[slug]/page.tsx` for consistency
4. **M3** — Add OG metadata to diary detail `generateMetadata`
5. **M2** — Add `lastModified` to static sitemap entries
6. Complete remaining Phase 2 items (footer dark mode, Playwright audit)

---

## Metrics
- **Type Coverage:** Full — all props typed, interfaces defined
- **Test Coverage:** N/A (SEO metadata; would need E2E validation)
- **Lint Issues:** 0 in reviewed files (6 pre-existing in unrelated files)
- **Build:** PASSES
- **Phase 1 Completion:** 9/10 tasks done
- **Phase 2 Completion:** 3/9 tasks done (footer + home sections + Playwright audit remaining)

---

## Unresolved Questions

1. Should diary entries be included in RSS feed alongside blog posts?
2. Should Projects/About pages also get JSON-LD (WebPage schema)?
3. Is the Playwright dark mode audit still planned, or were manual visual checks sufficient?
4. Footer dark mode issue from plan ("bg-muted appears too gray") — was this fixed elsewhere or still pending?
