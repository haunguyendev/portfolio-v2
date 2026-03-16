# Deployment Guide

## Vercel Setup

### Prerequisites
- GitHub account (repo pushed)
- Vercel account (free tier sufficient)
- Custom domain (optional, Vercel provides `*.vercel.app`)

### Initial Deployment

**Step 1: Connect Repository**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Select `porfolio_v2` repository
5. Vercel auto-detects Next.js framework

**Step 2: Configure Project**
- **Project Name:** porfolio-v2 (or custom)
- **Root Directory:** ./ (default)
- **Framework:** Next.js (auto-detected)
- **Build Command:** `pnpm build` (auto-detected)
- **Output Directory:** .next (auto-detected)
- **Install Command:** `pnpm install` (auto-detected)

**Step 3: Environment Variables**
Vercel's environment variables page:
```
NEXT_PUBLIC_SITE_URL=https://porfolio-v2.vercel.app
NEXT_PUBLIC_ANALYTICS_ID=your-umami-id (leave empty for Phase 1)
```

Click "Deploy" and wait for build to complete (~2-3 minutes).

### Custom Domain Setup

**Option A: Using Vercel's Domain**
- Use default `porfolio-v2.vercel.app`
- No additional setup needed
- Free HTTPS included

**Option B: Custom Domain**

1. **Buy domain** from registrar (Namecheap, GoDaddy, etc.)

2. **Add domain to Vercel:**
   - Project Settings → Domains
   - Enter custom domain (e.g., kane.dev)
   - Vercel provides DNS records or nameserver instructions

3. **Update DNS at registrar:**
   - Add CNAME or nameserver records from Vercel
   - Wait 24-48 hours for DNS propagation

4. **Verify SSL certificate:**
   - Vercel automatically provisions Let's Encrypt
   - Certificate issued within minutes

### Automatic Deployments

**Branch Configuration:**
- **main branch:** Auto-deploy to production
- **other branches:** Auto-deploy to preview URLs
- **Pull requests:** Auto-generate preview URLs

**Example URLs:**
```
main → https://porfolio-v2.vercel.app
feature/blog → https://feature-blog-porfolio-v2.vercel.app
PR #5 → https://porfolio-v2-pr-5.vercel.app
```

## Environment Variables

### .env.example (Commit)
```
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Kane's Portfolio

# Analytics (Phase 3)
NEXT_PUBLIC_ANALYTICS_ID=

# CMS/Database (Phase 4)
# DATABASE_URL=
# CMS_API_KEY=
```

### .env.local (Don't Commit)
```
# Copy from .env.example and fill in values
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ANALYTICS_ID=
```

### Vercel Environment Variables

In Vercel dashboard → Settings → Environment Variables:

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| NEXT_PUBLIC_SITE_URL | https://kane.dev | https://[name]-[repo].vercel.app | http://localhost:3000 |
| NEXT_PUBLIC_ANALYTICS_ID | [umami-id] | [umami-id] | (empty) |

**Phase 4 additions:**
```
DATABASE_URL=postgresql://...
CMS_API_KEY=...
JWT_SECRET=...
```

## Build Configuration

### next.config.ts

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Redirects (optional)
  redirects: async () => [
    {
      source: '/projects/:slug',
      destination: '/projects',
      permanent: false,
    },
  ],

  // Headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ],
}

export default nextConfig
```

## Build & Deploy Process

### Local Build Test
```bash
# Clean previous builds
rm -rf .next

# Install dependencies
pnpm install

# Build for production
pnpm build

# Run production server locally
pnpm start

# Visit http://localhost:3000 to test
```

### Build Output Analysis
```
Route (pages)          Size     First Load JS
─ ○ /                  1.2 kB   45 kB
- ○ /projects          2.4 kB   48 kB
- ○ /about             1.8 kB   47 kB
- ○ /blog              0.5 kB   40 kB

○ (Static)  prerendered as static HTML
```

### Performance Budgets

Set in `vercel.json` (optional):
```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "env": {
    "NEXT_PUBLIC_SITE_URL": "@next-public-site-url"
  },
  "functions": {
    "api/**/*": {
      "maxDuration": 10
    }
  }
}
```

## Continuous Integration

### GitHub Actions (Optional Setup)

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Type check
        run: pnpm tsc --noEmit

      - name: Lint (Phase 3)
        run: pnpm lint
        continue-on-error: true

      - name: Tests (Phase 3)
        run: pnpm test
        continue-on-error: true
```

Note: Phase 1 focuses on build/deploy. Linting and testing added Phase 3+.

## Monitoring & Debugging

### Vercel Dashboard
- **Deployments:** View build logs, rollback to previous versions
- **Analytics:** Performance metrics (Web Vitals, Core Web Vitals)
- **Logs:** Real-time deployment logs
- **Usage:** Bandwidth, build hours, function executions

### Build Logs
If deployment fails:
1. Go to Vercel dashboard → Deployments
2. Click failed deployment
3. View build output
4. Common errors:
   - `ENOENT: file not found` → Missing file, check imports
   - `TypeScript error` → Fix type issues
   - `OOM: out of memory` → Reduce build size (code split, remove large deps)

### Testing Builds Locally
```bash
# Simulate Vercel environment
NODE_ENV=production pnpm build

# Test optimized build
pnpm start
```

## Rollback & Recovery

### Rollback to Previous Version
1. Vercel dashboard → Deployments
2. Find previous successful deployment
3. Click "..." menu → "Promote to Production"
4. Confirm rollback

### Redeployment
Force redeploy without code changes:
1. Vercel dashboard → Deployments
2. Click "..." → "Redeploy"
3. Useful for env variable changes

## Phase 1 Deployment Checklist

Before launching:
- [ ] All pages build without errors
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured (optional)
- [ ] HTTPS working (automatic on Vercel)
- [ ] Pages responsive on mobile/tablet/desktop
- [ ] All links functional
- [ ] Images load correctly
- [ ] No console errors or warnings
- [ ] Lighthouse score > 80 (Performance, Accessibility, Best Practices)
- [ ] Page load time < 2s (desktop), < 3s (mobile)

## Phase 3 Additions

### SEO & Meta Tags
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: "Kane Nguyen's Portfolio",
  description: "Software Engineer's portfolio",
  openGraph: {
    image: '/og-image.png',
    url: process.env.NEXT_PUBLIC_SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

### Sitemap Generation
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: process.env.NEXT_PUBLIC_SITE_URL || '',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/projects`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
```

### Analytics Integration (Umami)
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <script
          async
          src={`https://analytics.example.com/script.js`}
          data-website-id={process.env.NEXT_PUBLIC_ANALYTICS_ID}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## Phase 4 Additions

### Database Deployment
- PostgreSQL (Vercel Postgres or Railway)
- Drizzle ORM migrations
- Connection pooling for serverless functions

### API Routes Deployment
- Vercel serverless functions handle `/api/*` routes
- Automatic scaling, no server management
- Cold start optimization for Next.js

### Environment Variables for Phase 4
```
DATABASE_URL=postgresql://...
CMS_API_KEY=...
JWT_SECRET=...
```

## Troubleshooting

### Build Failures

**Error: "ENOENT: no such file or directory"**
- Check import paths are correct
- Verify all imported files exist
- Run `pnpm install` locally and rebuild

**Error: "TypeScript error"**
- Run `pnpm tsc --noEmit` locally
- Fix all type errors before pushing

**Error: "Module not found"**
- Check package.json has correct dependencies
- Run `pnpm install` to ensure lock file matches

### Runtime Errors

**Images not loading:**
- Verify image paths are correct
- Check `next.config.ts` image domain allowlist
- Use Next.js `<Image>` component

**Slow page loads:**
- Run Lighthouse audit in Chrome DevTools
- Check image sizes and formats
- Verify no large JavaScript bundles

### Environment Variable Issues

**Variables not available in build:**
- Ensure `NEXT_PUBLIC_*` prefix for client-side vars
- Check Vercel Environment Variables are set
- Redeploy after adding variables

## Performance Optimization (Phase 3+)

### Image Optimization
```typescript
<Image
  src="/images/hero/kane-photo.jpg"
  alt="Kane Nguyen's portfolio photo"
  width={600}
  height={600}
  priority // above-fold
  quality={75} // 75% quality
  placeholder="blur" // blur while loading
  blurDataURL="..." // optional
/>
```

### Code Splitting
Next.js automatically code-splits by page. For components:
```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/heavy'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // disable server-side rendering
})
```

### Font Optimization
Use Next.js font loading:
```typescript
import { Inter, Geist } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const geist = Geist({ variable: '--font-geist' })
```

## Backup & Export

### Export Static Site
```bash
pnpm build
# Creates optimized static HTML in .next/standalone
```

### GitHub as Backup
```bash
git push origin main
# Always keep code on GitHub
```

## Summary

1. **Initial Setup:** Connect GitHub repo to Vercel → auto-deploys on push
2. **Environment:** Set vars in Vercel dashboard and .env.example
3. **Monitoring:** Use Vercel dashboard for logs and analytics
4. **Phase 1:** Focus on build/deploy, SEO + analytics Phase 3+
5. **Rollback:** Available in Vercel dashboard if needed
