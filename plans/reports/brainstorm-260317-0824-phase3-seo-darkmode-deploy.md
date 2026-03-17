# Brainstorm: Phase 3 — SEO, Dark Mode, Deploy

## Problem
Portfolio Phase 1-2 complete (portfolio + blog/diary) but lacks SEO, has dark mode color inconsistencies, not deployed to production.

## User Requirements
- **Priority:** SEO first, then dark mode polish, then deploy
- **OG Images:** 1 static image for entire site (KISS)
- **Dark mode:** Footer + home sections have gray color issues → audit with Playwright
- **Goal:** HR + personal brand → need both portfolio SEO and blog SEO
- **Deploy status:** Not yet deployed

## Chosen Approach: Sequential (SEO → Dark Mode → Deploy)

### Phase 3A: SEO (~2h)
- Meta tags template (title, description per page)
- Static OG image (1200x630)
- Programmatic sitemap.xml (blog + diary slugs)
- robots.txt
- JSON-LD (Person schema + Article schema)
- RSS link in layout head
- Canonical URLs

### Phase 3B: Dark Mode Polish (~1.5h)
- Playwright screenshot audit (all pages, light vs dark)
- Fix footer + home section color issues
- Verify blog/diary MDX prose in dark mode
- Component-level dark mode check

### Phase 3C: Deploy to Vercel (~0.5h)
- Push to GitHub + connect Vercel
- Configure env vars (NEXT_PUBLIC_SITE_URL)
- Verify production routes + OG previews

## Skipped (YAGNI)
- Dynamic OG images per post
- Analytics (Umami) → post-deploy
- Full test suite (Vitest + Playwright) → Phase 3.5
- Bundle analysis → only if Lighthouse < 90

## Risks
| Risk | Mitigation |
|------|------------|
| OG image not rendering on social | Test with Twitter Card Validator + FB Debugger |
| Dark mode fix breaks light mode | Playwright screenshots both modes |
| Sitemap missing dynamic routes | Generate from getBlogs() + getDiaries() |

## Next Steps
→ Create detailed implementation plan via /ck:plan
