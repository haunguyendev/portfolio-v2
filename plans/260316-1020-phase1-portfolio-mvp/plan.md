---
title: "Phase 1: Portfolio MVP"
description: "Full implementation plan for Kane Nguyen's portfolio — Home, Projects, About, Blog placeholder with Next.js 16 + Tailwind CSS v4 + Base UI"
status: complete
priority: P1
effort: "2-3 weeks"
branch: main
tags: [portfolio, mvp, next.js, tailwind, shadcn-ui, phase-1]
created: 2026-03-16
completed: 2026-03-16
---

# Phase 1: Portfolio MVP — Implementation Plan

## Overview

Greenfield Next.js 15 portfolio site. 4 pages (Home, Projects, About, Blog placeholder), static JSON content, Vercel deployment. Editorial minimalist design using shadcn/ui + Tailwind CSS.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4.2.1 + Base UI |
| Icons | lucide-react |
| Content | JSON data files (SSG) |
| Deploy | Vercel |
| Pkg Manager | pnpm |

## Phases

| # | Phase | File | Status | Effort |
|---|-------|------|--------|--------|
| 1 | Project Setup & Configuration | [phase-01-setup-and-configuration.md](./phase-01-setup-and-configuration.md) | Complete | 2h |
| 2 | Layout Components | [phase-02-layout-components.md](./phase-02-layout-components.md) | Complete | 3h |
| 3 | Content Data & Types | [phase-03-content-data-and-types.md](./phase-03-content-data-and-types.md) | Complete | 2h |
| 4 | Home Page | [phase-04-home-page.md](./phase-04-home-page.md) | Complete | 4h |
| 5 | Projects Page | [phase-05-projects-page.md](./phase-05-projects-page.md) | Complete | 3h |
| 6 | About Page | [phase-06-about-page.md](./phase-06-about-page.md) | Complete | 3h |
| 7 | Blog Placeholder & Error Pages | [phase-07-blog-and-error-pages.md](./phase-07-blog-and-error-pages.md) | Complete | 1.5h |
| 8 | Deployment | [phase-08-deployment.md](./phase-08-deployment.md) | Complete | 1.5h |

**Total estimated effort:** ~20h across 2-3 weeks

## Dependencies

```
Phase 1 (Setup) ──> Phase 2 (Layout) ──> Phase 3 (Content/Types)
                                              │
                                    ┌─────────┼─────────┐
                                    v         v         v
                              Phase 4     Phase 5    Phase 6
                              (Home)    (Projects)  (About)
                                    │         │         │
                                    └─────────┼─────────┘
                                              v
                                         Phase 7
                                    (Blog + Error Pages)
                                              │
                                              v
                                         Phase 8
                                       (Deployment)
```

- Phases 1-3 are sequential (each depends on prior)
- Phases 4-6 can run in parallel after Phase 3
- Phase 7 depends on layout (Phase 2) but can run alongside 4-6
- Phase 8 is final gate after all pages complete

## Key Design Specs

- **Max container:** `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`
- **Gradient accent:** `bg-gradient-to-r from-orange-500 via-red-500 to-blue-500`
- **Card style:** `bg-white border border-zinc-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`
- **Badge style:** `px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 text-zinc-700`
- **Primary button:** `px-4 py-2 bg-zinc-900 text-white rounded-md font-medium hover:bg-zinc-800 transition-colors`
- **Section spacing:** `py-12 md:py-16` (48-64px vertical)
- **Headings:** zinc-900, body: zinc-700, muted: zinc-500

## Success Criteria

- All 4 pages functional and responsive (375px, 768px, 1024px+)
- Page load < 2s desktop, < 3s mobile
- Lighthouse > 80 (Performance, Accessibility, Best Practices)
- Zero TypeScript errors, zero console errors
- Deployed to Vercel
- Content in JSON files, not hardcoded
