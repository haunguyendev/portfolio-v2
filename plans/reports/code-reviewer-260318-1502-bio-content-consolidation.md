# Code Review: Bio/About Content Consolidation (DRY Fix)

## Scope
- **Files reviewed:** 8 (1 new, 7 modified)
- **LOC changed:** ~129 (61 added, 68 removed)
- **Focus:** DRY compliance, data flow, type safety, edge cases
- **Scout findings:** 6 remaining hardcoded locations, 1 missed file, 1 fragile coupling

## Overall Assessment

**Good refactor.** The consolidation into `profile.json` successfully eliminates hardcoded bio/contact/social text from 6 components. The JSON structure is well-designed, imports are clean, and TypeScript compiles without errors. Lint passes.

A few edge cases and incomplete consolidation items noted below.

---

## Critical Issues

None.

---

## High Priority

### 1. Missed file: `animated-cta-card.tsx` still hardcodes `/resume.pdf`

`apps/web/src/components/home/animated-cta-card.tsx:70` has `href="/resume.pdf"` while `hero-section.tsx` and `bio-section.tsx` now use `profile.resumePath`. This is the exact DRY violation the refactor aims to fix.

**Fix:**
```tsx
import profile from '@/content/profile.json'
// ...
href={profile.resumePath}
```

### 2. Fragile coupling: `TITLE_STYLES` array length must match `profile.titles`

In `hero-section.tsx`, `TITLE_STYLES` has 3 entries mapped positionally to `profile.titles`:
```ts
const TITLE_STYLES = [style1, style2, style3]
const TITLES = profile.titles.map((text, i) => ({ text, className: TITLE_STYLES[i] }))
```

If someone adds a 4th title to `profile.json`, `TITLE_STYLES[3]` is `undefined`, producing a className of `undefined`. Same for `STAT_ICONS` in `about-preview-section.tsx` (3 icons mapped to `profile.stats`).

**Fix (defensive, minimal):**
```ts
const TITLES = profile.titles.map((text, i) => ({
  text,
  className: TITLE_STYLES[i % TITLE_STYLES.length],
}))
```

Or add a comment: `// IMPORTANT: keep TITLE_STYLES length in sync with profile.titles`

### 3. `constants.ts` has `import` after `export` — unconventional ordering

```ts
export const NAV_LINKS = [...] as const
import profile from '@/content/profile.json'  // import after exports
export const SOCIAL_LINKS = profile.social
```

While JS hoists imports and this works at runtime, it's unconventional and may confuse readers. Imports should be at top of file.

**Fix:** Move import to top of file, before any exports.

---

## Medium Priority

### 4. Remaining hardcoded "Kane Nguyen" in 6+ locations (outside diff scope)

Scout found these files still hardcode personal text:

| File | Hardcoded Value |
|------|----------------|
| `components/seo/json-ld.tsx:12,54` | `'Kane Nguyen'`, `'Software Engineer'` |
| `components/layout/footer.tsx:107` | `Kane Nguyen. All rights reserved.` |
| `app/layout.tsx:15-16,19,24,30` | `Kane Nguyen` in metadata |
| `app/blog/page.tsx:11` | `Kane Nguyen's blog` |
| `app/about/page.tsx:12` | `Kane Nguyen` in description |
| `app/diary/page.tsx:11` | `Kane Nguyen's personal diary` |
| `lib/constants.ts:1-2` | `SITE_NAME = 'Kane Nguyen'` |

These are outside the diff but represent the same DRY pattern. Consider:
- `json-ld.tsx` and `footer.tsx` could import from `profile.json`
- Page metadata could use `SITE_NAME` from constants (which could derive from profile)
- `lib/auth.ts:7` hardcodes the email — acceptable (different concern: auth allow-list)

**Recommendation:** Not blocking, but a follow-up task to fully consolidate. The `SITE_NAME` constant could be derived from `profile.name` to close the loop.

### 5. `paragraph.slice(0, 20)` as React key — functional but fragile

In `about-preview-section.tsx:31`:
```tsx
<p key={paragraph.slice(0, 20)}>{paragraph}</p>
```

Works for 2 paragraphs, but if two paragraphs share the first 20 characters, keys collide. Using index is acceptable here since the list is static from JSON and never reorders.

**Alternative:** `key={i}` with index from `.map((p, i) => ...)` since the array is immutable at runtime.

### 6. Duplicate "Agile/Scrum" and "Technical Writing" in `skills.json`

Both "Other" category (line 17) and "Soft Skills" category (line 21) contain "Agile/Scrum" and "Technical Writing". While not a code bug, it creates redundancy in the displayed UI if both categories render.

---

## Low Priority

### 7. Non-null assertion `profile.name.split(' ').at(-1)!`

In `hero-section.tsx:12,16`, the `!` asserts non-null on `.at(-1)`. Since `profile.name` is a static JSON string that always has a space, this is safe. But if someone sets `name: "Kane"` (single word), `.slice(0, -1).join(' ')` produces `""` and `.at(-1)` returns `"Kane"` — still works correctly. No action needed.

---

## Positive Observations

1. **Clean separation of concerns** — presentation logic (icons, styles, colors) stays in components; data lives in JSON. Good comments like `// presentation concern — stays in component`.
2. **Consistent import pattern** — all 5 consuming files import `profile` the same way.
3. **Well-structured JSON** — `profile.json` has logical grouping (identity, bio variants, stats, contact, social).
4. **`SOCIAL_LINKS` backward compatibility** — `constants.ts` re-exports `profile.social` as `SOCIAL_LINKS`, keeping existing consumers (footer, command-menu, json-ld) working without changes.
5. **Soft skills extracted to `skills.json`** — good choice to centralize alongside tech skills rather than putting in profile.json.
6. **Bio variants for different contexts** — hero, aboutPreview, full, contact — pragmatic approach for different display needs.

---

## Metrics

- **Type Coverage:** Full — `resolveJsonModule: true`, `strict: true`, `noImplicitAny: true` in tsconfig
- **TypeScript:** Compiles clean (0 errors)
- **Lint:** Passes (0 issues)
- **Build Impact:** JSON imports are tree-shaken per-property by bundler; no bundle size concern

---

## Recommended Actions (prioritized)

1. **[High]** Fix `animated-cta-card.tsx` to use `profile.resumePath` instead of hardcoded `/resume.pdf`
2. **[High]** Move `import profile` to top of `constants.ts`
3. **[High]** Add defensive fallback or sync comment for `TITLE_STYLES`/`STAT_ICONS` positional coupling
4. **[Medium]** Follow-up task: consolidate remaining hardcoded "Kane Nguyen" in SEO/layout/metadata files
5. **[Medium]** Remove duplicate "Agile/Scrum" and "Technical Writing" from `skills.json`
6. **[Low]** Consider using array index as key instead of `paragraph.slice(0, 20)`

---

## Unresolved Questions

1. Is the DRY consolidation intended to be completed in phases (this PR = components only, next PR = SEO/metadata)? If so, items in Medium Priority section 4 are expected gaps.
2. Should `animated-cta-card.tsx` use `profile.resumePath` or was it intentionally left as-is (e.g., the CTA card is conceptually separate)?
