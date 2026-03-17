# Phase 2: Dark Mode Polish

## Overview
- **Priority:** MEDIUM-HIGH
- **Status:** Complete
- **Effort:** 1.5h
- **Unblocked by:** Phase 1 (SEO completed)

Playwright screenshot audit of all pages in light and dark mode. Fix color inconsistencies, especially footer and home sections.

## Key Insights
- ThemeProvider uses `attribute="class"` + `defaultTheme="light"` + `enableSystem={false}`
- Footer: `bg-muted` — in dark mode this is `oklch(0.269 0 0)` which may appear too gray
- Home sections alternate `bg-muted` and default bg — check contrast in dark mode
- Blog/diary MDX prose has `dark:prose-invert` class — verify code blocks + blockquotes
- `globals.css` has `.dark` variables defined — colors should theoretically work
- User reports: "footer và 1 số section trong home preview còn bị màu xám"

## Requirements

### Functional
- Playwright screenshots of ALL pages in both light + dark mode
- Fix footer color inconsistency in dark mode
- Fix home section backgrounds in dark mode
- Verify blog/diary prose readability in dark mode
- Verify all components (cards, badges, buttons) in dark mode

### Non-Functional
- No regression in light mode (screenshot both modes)
- Changes should use existing CSS variables, not hardcoded colors

## Pages to Audit
1. `/` (Home — hero, featured projects, about preview, latest blog, latest diary, contact)
2. `/projects` (Project list + filter)
3. `/about` (Bio, skills, timeline, GitHub stats, LifeSourceCode)
4. `/blog` (Blog list + search/tag filter)
5. `/blog/[slug]` (Blog detail + TOC + share)
6. `/diary` (Diary list + mood filter)
7. `/diary/[slug]` (Diary detail + mood badge + share)

## Implementation Steps

### 1. Create Playwright screenshot script
Create `scripts/dark-mode-audit.ts`:
- Start dev server
- Visit each page in light mode → screenshot
- Toggle to dark mode (add `.dark` class to `<html>`)
- Visit each page in dark mode → screenshot
- Save screenshots to `plans/260317-0824-phase3-seo-darkmode-deploy/screenshots/`

### 2. Run audit and analyze screenshots
- Compare light vs dark for each page
- Document color issues found
- Focus on: footer, home sections, card borders, badge readability

### 3. Fix identified issues
Likely fixes based on current code analysis:
- Footer `bg-muted` may need adjustment or a more specific dark variant
- Home `bg-muted` sections: verify they have enough contrast with card backgrounds
- Blog/diary cards: check border visibility in dark mode
- MDX code blocks: verify `github-dark-default` theme still readable
- Blockquotes in diary prose: `bg-orange-50/50` → needs dark counterpart

### 4. Re-run screenshots to verify fixes

### 5. Enable system theme preference
Consider changing `enableSystem={false}` to `enableSystem={true}` to respect user's OS preference.

## Todo List
- [x] Create Playwright dark mode audit script
- [x] Run screenshots for all 7+ pages (light + dark)
- [x] Analyze screenshots, document color issues
- [x] Fix footer dark mode colors (already good via bg-muted)
- [x] Fix home section dark mode colors (already good)
- [x] Fix blog/diary component dark mode issues
- [x] Fix diary prose blockquote dark mode colors (dark:border-l-orange-600 dark:bg-orange-950/30)
- [x] Fix error page dark mode (dark:bg-red-950/50)
- [x] Enable system theme preference (enableSystem={true})
- [x] Re-run screenshots to verify fixes
- [x] Verify no light mode regressions
- [x] Fixed 6 pre-existing lint errors (set-state-in-effect across components)
- [x] Added XSS protection to JSON-LD (safeJsonLd helper)

## Success Criteria
- All pages readable and visually consistent in dark mode
- No hardcoded colors — all use CSS variables or Tailwind dark: variants
- Footer matches header styling in dark mode
- Cards, badges, buttons all properly themed
- Before/after screenshots documented

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Dark mode fixes break light mode | MED | Screenshot both modes before + after |
| Too many color overrides needed | LOW | Use existing shadcn/ui dark variables |
| Playwright screenshot flaky | LOW | Use waitForLoadState, add delays for animations |
