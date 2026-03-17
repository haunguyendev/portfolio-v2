# Phase 3: Deploy to Vercel

## Overview
- **Priority:** HIGH
- **Status:** Pending
- **Effort:** 0.5h
- **Blocked by:** Phase 1 (SEO), Phase 2 (Dark Mode)

Push code to GitHub and deploy to Vercel. Verify all routes and OG previews work in production.

## Key Insights
- Project already has Vercel-compatible setup (Next.js 16, no special config needed)
- `NEXT_PUBLIC_SITE_URL` needed for correct OG URLs and sitemap
- GitHub repo exists at haunguyendev (based on social links)
- Velite build runs automatically during `next build`

## Requirements

### Functional
- Code pushed to GitHub
- Vercel project connected
- Production build succeeds
- All routes accessible
- OG images work when sharing links

### Non-Functional
- HTTPS enabled (Vercel default)
- Build time < 60s
- No environment variable leaks

## Implementation Steps

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Connect Vercel
- Go to vercel.com → Import project from GitHub
- Select repository
- Framework preset: Next.js (auto-detected)

### 3. Configure environment variables
```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```
(Update later when custom domain is set up)

### 4. Deploy and verify
- Wait for build to complete
- Check all pages load
- Check /sitemap.xml
- Check /robots.txt
- Check /feed.xml

### 5. Test OG previews
- Use Twitter Card Validator or opengraph.xyz to check OG image
- Share a blog post link and verify preview renders

### 6. Optional: Custom domain
- Add custom domain in Vercel settings
- Update `NEXT_PUBLIC_SITE_URL` env var
- Verify DNS propagation

## Todo List
- [ ] Push code to GitHub
- [ ] Connect Vercel project
- [ ] Set NEXT_PUBLIC_SITE_URL env var
- [ ] Verify production build succeeds
- [ ] Check all pages load correctly
- [ ] Verify sitemap.xml, robots.txt, feed.xml
- [ ] Test OG image previews
- [ ] Optional: configure custom domain

## Success Criteria
- Production site accessible at Vercel URL
- All routes return 200
- OG image renders when sharing links
- sitemap.xml accessible and valid
- Build completes without errors

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Build fails on Vercel | MED | Test pnpm build locally first |
| Velite .velite/ not generated | HIGH | Velite builds during next build (confirmed working) |
| OG image URL incorrect | LOW | metadataBase handles absolute URL construction |
