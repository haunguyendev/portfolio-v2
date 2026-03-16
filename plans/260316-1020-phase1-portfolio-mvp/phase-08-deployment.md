# Phase 8: Deployment

## Context Links
- [Deployment Guide](../../docs/deployment-guide.md)
- [Project Roadmap — Phase 1 Success Criteria](../../docs/project-roadmap.md)
- [Project Overview — Success Metrics](../../docs/project-overview-pdr.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | HIGH |
| Status | Pending |
| Effort | ~1.5h |
| Depends On | All previous phases (1-7) |
| Description | Verify production build, push to GitHub, connect to Vercel, test live deployment, run Lighthouse audit |

## Key Insights

- All pages are static (SSG) — no server-side rendering needed in Phase 1
- Vercel auto-detects Next.js and configures build settings
- Free tier is sufficient for portfolio traffic
- `pnpm build` must pass locally before deployment
- Custom domain is optional for MVP launch — `.vercel.app` domain is fine initially

## Requirements

### Functional
- Production build completes without errors
- All pages render correctly in production mode (`pnpm start`)
- Live site accessible via Vercel URL
- All links, images, and navigation work on live site

### Non-Functional
- Lighthouse Performance > 80
- Lighthouse Accessibility > 80
- Lighthouse Best Practices > 80
- Page load < 2s desktop, < 3s mobile
- HTTPS working (automatic on Vercel)
- No console errors on live site

## Implementation Steps

### Step 1: Local Production Build Test

```bash
# Clean previous builds
rm -rf .next

# Install dependencies (ensure lock file is up to date)
pnpm install

# Build for production
pnpm build
```

**Expected output:**
```
Route (app)                Size     First Load JS
─ ○ /                      X kB     XX kB
─ ○ /about                 X kB     XX kB
─ ○ /blog                  X kB     XX kB
─ ○ /projects              X kB     XX kB

○  (Static)  prerendered as static HTML
```

All routes should show `○` (static), not `λ` (server-rendered).

### Step 2: Local Production Server Test

```bash
pnpm start
# Opens http://localhost:3000 in production mode
```

**Test checklist:**
- [ ] Home page: hero, featured projects, about preview render
- [ ] Projects page: all projects display, filter works
- [ ] About page: bio, skills, timeline render
- [ ] Blog page: coming soon placeholder renders
- [ ] 404: navigate to `/test-404` — 404 page shows
- [ ] Navigation: all links work, active states correct
- [ ] Footer: social links open in new tab
- [ ] Mobile: test at 375px using DevTools responsive mode
- [ ] Images: all load correctly (hero, project cards)
- [ ] No console errors or warnings

### Step 3: Push to GitHub

```bash
# Ensure .gitignore is correct (excludes node_modules, .next, .env.local)
git add .
git commit -m "feat: complete Phase 1 portfolio MVP

- Home page with hero, featured projects, about preview
- Projects page with tech tag filtering
- About page with bio, skills, experience timeline
- Blog coming soon placeholder
- 404 and error boundary pages
- Responsive layout with sticky header and footer
- JSON content data structure
- shadcn/ui components (Button, Card, Badge)"

git push origin main
```

### Step 4: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Select `porfolio_v2` repository
5. Verify auto-detected settings:
   - **Framework:** Next.js
   - **Build Command:** `pnpm build`
   - **Output Directory:** `.next`
   - **Install Command:** `pnpm install`
6. Add environment variables:
   - `NEXT_PUBLIC_SITE_URL` = `https://porfolio-v2.vercel.app` (or custom domain)
7. Click "Deploy"

### Step 5: Verify Live Deployment

After deploy completes (~2-3 minutes):

**Test on live URL:**
- [ ] Home page loads correctly
- [ ] Projects page loads, filter works
- [ ] About page loads with all sections
- [ ] Blog page loads with placeholder
- [ ] 404 page works for unknown routes
- [ ] Navigation works across all pages
- [ ] Images load (may need to verify paths)
- [ ] HTTPS working (check for lock icon)
- [ ] Mobile responsive (test on actual phone if possible)
- [ ] Social links in footer open correctly

### Step 6: Run Lighthouse Audit

In Chrome DevTools:
1. Open live site
2. DevTools → Lighthouse tab
3. Run audit for: Performance, Accessibility, Best Practices, SEO
4. Test both Mobile and Desktop

**Target scores:**
| Category | Target | Acceptable |
|----------|--------|-----------|
| Performance | > 90 | > 80 |
| Accessibility | > 90 | > 80 |
| Best Practices | > 90 | > 80 |
| SEO | > 80 | > 70 |

**Common issues and fixes:**
| Issue | Fix |
|-------|-----|
| Large images | Compress with squoosh.app, use webp |
| Missing meta description | Already set in layout.tsx metadata |
| CLS (layout shift) | Ensure Image width/height set, fonts preloaded |
| LCP too slow | Verify `priority` on hero image, check hosting speed |
| Missing alt text | Audit all `<img>` / `<Image>` tags |

### Step 7: Custom Domain (Optional)

If setting up custom domain:
1. Vercel Project Settings → Domains
2. Add custom domain (e.g., `kanenguyen.dev`)
3. Follow DNS instructions from Vercel
4. Wait for SSL certificate provisioning (~5 min)
5. Verify HTTPS works on custom domain

### Step 8: Post-Deployment Checklist

- [ ] Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to final domain
- [ ] Update social links in `constants.ts` if needed
- [ ] Replace placeholder content with real data (projects, bio, experience)
- [ ] Replace placeholder images with real screenshots/photos
- [ ] Share link for feedback
- [ ] Update `docs/project-roadmap.md` — mark Phase 1 as COMPLETE

## Todo List

- [ ] 8.1 Run `pnpm build` locally — verify zero errors and all routes static
- [ ] 8.2 Run `pnpm start` — test all pages in production mode locally
- [ ] 8.3 Test responsive at 375px, 768px, 1024px in production mode
- [ ] 8.4 Commit all files to git with clean commit message
- [ ] 8.5 Push to GitHub main branch
- [ ] 8.6 Connect repo to Vercel, configure project settings
- [ ] 8.7 Set environment variables in Vercel
- [ ] 8.8 Deploy and verify live site
- [ ] 8.9 Test all pages on live URL
- [ ] 8.10 Run Lighthouse audit — achieve > 80 on all categories
- [ ] 8.11 Fix any Lighthouse issues
- [ ] 8.12 (Optional) Configure custom domain
- [ ] 8.13 Update project roadmap to mark Phase 1 complete
- [ ] 8.14 Update docs if any architectural decisions changed during implementation

## Success Criteria

- `pnpm build` passes with zero errors
- All routes are statically generated (SSG)
- Live site accessible via Vercel URL
- All 4 pages work correctly on live site
- Lighthouse Performance > 80
- Lighthouse Accessibility > 80
- Lighthouse Best Practices > 80
- HTTPS working
- No console errors on production site
- Responsive across mobile/tablet/desktop

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Build fails on Vercel but passes locally | Medium | Ensure `pnpm-lock.yaml` committed; match Node.js version |
| Images 404 on production | Medium | Verify `/public/images/` paths match component `src` props |
| Vercel free tier limits | Low | Portfolio traffic is minimal; free tier is more than sufficient |
| DNS propagation slow for custom domain | Low | Use `.vercel.app` URL initially; domain will resolve within 24-48h |

## Security Considerations

- No secrets in client-side code
- `.env.local` not committed (verified in `.gitignore`)
- HTTPS enforced by Vercel
- No user input or forms in Phase 1 — no XSS/injection risk
- Content Security headers can be added in Phase 3

## Next Steps

After successful deployment:
1. Replace placeholder content with real data
2. Gather feedback on design and UX
3. Begin **Phase 2: Blog System** planning
4. Create GitHub issues for any bugs found during testing
