# Code Review: Bio Section Redesign

**File:** `src/components/about/bio-section.tsx`
**LOC:** 95 (under 200 limit)
**Focus:** Full rewrite -- plain text to 2-column layout with photo, social links, resume CTA

## Overall Assessment

Solid redesign. Clean structure, correct responsive pattern, good use of `next/image`, gradient CTA matches design guidelines. A few issues found, one high-priority (DRY/consistency with existing social links constant).

## Critical Issues

None.

## High Priority

### 1. Social link URLs are hardcoded and inconsistent with centralized constants

**Problem:** `SOCIAL_LINKS` in bio-section defines its own URLs (`https://linkedin.com/in/kanenguyen`, `mailto:kane@example.com`) while `src/lib/constants.ts` already has the canonical `SOCIAL_LINKS` object with the real URLs (e.g., `mailto:haunt150603@gmail.com`, the real LinkedIn URL with encoded characters). The bio section URLs are different -- likely placeholder/wrong values.

**Impact:** Users clicking LinkedIn/Email in the bio section will reach wrong destinations. Violates DRY -- social URLs now maintained in 3 places (constants, contact-section, bio-section).

**Fix:**
```tsx
import { SOCIAL_LINKS } from '@/lib/constants'

const BIO_SOCIAL_LINKS: SocialLink[] = [
  { label: 'GitHub', href: SOCIAL_LINKS.github, icon: Github },
  { label: 'LinkedIn', href: SOCIAL_LINKS.linkedin, icon: Linkedin },
  { label: 'Email', href: SOCIAL_LINKS.email, icon: Mail },
]
```

### 2. Missing `aria-label` on social links

**Problem:** Footer social icons (line 94 of footer.tsx) and contact-section (line 94) both use `aria-label={social.label}`. The bio section social links do NOT have `aria-label`. While the visible `<span>{link.label}</span>` provides an accessible name, the `<a>` elements with `target="_blank"` should indicate they open in a new window for screen reader users.

**Fix:** Add aria-label to indicate new window behavior:
```tsx
aria-label={`${link.label} (opens in new tab)`}
```

### 3. Missing focus ring on interactive elements

**Problem:** Design guidelines (Accessibility Standards section) specify `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` for keyboard navigation. Neither the social links nor the resume CTA have visible focus indicators.

**Impact:** Keyboard users cannot see which element is focused. WCAG 2.1 AA violation.

**Fix:** Add to both `<a>` elements:
```
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
```

## Medium Priority

### 4. Email `mailto:` link should not use `target="_blank"`

**Problem:** All social links (including Email/`mailto:`) get `target="_blank"` and `rel="noopener noreferrer"`. The `mailto:` protocol opens the mail client, not a new browser tab -- `target="_blank"` is unnecessary and can cause unexpected blank tab behavior in some browsers. Footer (line 92) and contact-section (line 67) both correctly handle this by checking `href.startsWith('http')` or `href.startsWith('mailto:')`.

**Fix:** Conditionally apply target/rel based on href:
```tsx
target={link.href.startsWith('http') ? '_blank' : undefined}
rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
```

### 5. Resume download: no fallback if PDF missing

**Problem:** The `download` attribute on `/resume.pdf` will fail silently or show 404 if the file is missing/corrupt. Currently a placeholder exists, but no indication to the user that it is a placeholder.

**Suggestion:** Low-effort mitigation: add a `title` attribute: `title="Download resume (PDF)"`. For future: consider checking file existence or showing a toast on error.

### 6. `priority` on Image may not be justified

**Problem:** The bio section is below the page `<h1>` heading and is not the very first thing rendered. The `priority` flag on `<Image>` disables lazy loading and adds a `<link rel="preload">`. If the about page is not a primary landing page, this adds unnecessary preloading cost.

**Suggestion:** Remove `priority` unless the about page is a frequent direct-traffic entry point. The image is small (160px) and loads fast regardless.

## Low Priority

### 7. Minor style inconsistency with sibling sections

Sibling sections (`skills-section.tsx`, `timeline.tsx`) use `text-2xl md:text-3xl font-bold` with an explicit `mb-6` on their `<h2>`. The bio section uses `text-2xl font-bold text-foreground md:text-3xl` -- same result but different class ordering. Not a bug, but inconsistent. Also, sibling sections have visible `<h2>` section titles ("Skills", "Experience") while bio has the name as `<h2>` -- this is intentional and fine for the bio's purpose.

### 8. Icon sizing uses `size-4` instead of `h-4 w-4`

Design guidelines show `h-4 w-4` for xs icons. The bio uses `size-4` (Tailwind shorthand). Both produce the same result. Not a real issue, but worth noting for consistency with docs.

## Edge Cases Found by Scout

1. **Duplicate social links data:** 3 separate social link definitions (bio-section, contact-section, footer) with divergent URLs. contact-section also hardcodes different URLs from `SOCIAL_LINKS` constant. This is a codebase-wide problem, not just this PR.
2. **Avatar image missing alt fallback:** If `kane-avatar.png` fails to load, `next/image` shows a broken image. No fallback/placeholder div. Consider using `onError` + state to show initials fallback.
3. **Resume PDF is a placeholder:** Confirmed `/public/resume.pdf` exists. User must replace before going live.

## Positive Observations

- Component is well-structured and concise (95 lines, well under limit)
- Correct use of `next/image` with `fill`, `sizes`, `object-cover`
- Social links extracted to typed constant array (good) -- just needs to source from centralized constants
- Gradient CTA matches design guidelines exactly (`from-orange-500 via-red-500 to-blue-500`)
- Responsive layout (stacked mobile, 2-column desktop) works correctly
- `aria-hidden="true"` on decorative icons
- Clean TypeScript with proper `LucideIcon` typing

## Recommended Actions

1. **[HIGH]** Import URLs from `SOCIAL_LINKS` in `src/lib/constants.ts` instead of hardcoding
2. **[HIGH]** Add `aria-label` with "(opens in new tab)" to external links
3. **[HIGH]** Add focus ring classes to all interactive elements
4. **[MED]** Conditionally apply `target="_blank"` only for `http` links
5. **[MED]** Remove `priority` from Image (not above-fold hero)
6. **[LOW]** Consider codebase-wide cleanup to centralize all social link definitions

## Metrics

- Type Coverage: 100% (no `any`, proper interface)
- Linting Issues: 0 (TypeScript compiles clean)
- Test Coverage: N/A (no tests for this component)
- Component Size: 95/200 lines

## Unresolved Questions

1. Are the GitHub/LinkedIn URLs in bio-section intentional placeholders, or accidental divergence from the real URLs in `src/lib/constants.ts`?
2. Should the email link in bio match `haunt150603@gmail.com` (from constants) or `kane@example.com` (currently in bio)?
3. Should `contact-section.tsx` also be refactored to use `SOCIAL_LINKS` from constants? (Same DRY issue exists there.)
