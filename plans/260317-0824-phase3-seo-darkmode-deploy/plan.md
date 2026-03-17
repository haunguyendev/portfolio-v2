---
title: "Phase 3: SEO + Dark Mode Polish + Deploy"
description: "SEO optimization, dark mode color fixes, and Vercel deployment"
status: in-progress
priority: P1
effort: 4h
branch: main
tags: [seo, dark-mode, deploy, phase-3]
created: 2026-03-17
---

# Phase 3: SEO + Dark Mode Polish + Deploy

## Context
- Phase 1 (Portfolio) + Phase 2 (Blog/Diary MDX) complete
- Site not yet deployed — SEO should be done BEFORE deploy so Google indexes correctly
- Dark mode has color inconsistencies in footer + some home sections
- Goal: HR + personal brand → need both portfolio SEO + blog SEO

## Approach
Sequential: SEO → Dark Mode → Deploy

## Current State
- `layout.tsx` has basic title template, missing OG/icons/RSS link
- No `sitemap.ts` or `robots.txt`
- ThemeProvider: `next-themes` with `defaultTheme="light"`, `enableSystem={false}`
- Footer uses `bg-muted` — may appear gray in dark mode
- No JSON-LD structured data

## Phases

| # | Phase | Effort | Status | File |
|---|-------|--------|--------|------|
| 1 | [SEO & Metadata](./phase-01-seo-metadata.md) | 2h | Complete | layout, sitemap, robots, JSON-LD |
| 2 | [Dark Mode Polish](./phase-02-dark-mode-polish.md) | 1.5h | Complete | Playwright audit + fixes |
| 3 | [Deploy to Vercel](./phase-03-deploy-vercel.md) | 0.5h | Pending | Vercel setup |

## Key Decisions
1. **Static OG image** — 1 image for entire site (KISS), no dynamic generation
2. **JSON-LD** — Person schema on homepage, Article schema on blog posts
3. **Playwright** — screenshot audit for dark mode, compare light vs dark
4. **Deploy** — Vercel with `NEXT_PUBLIC_SITE_URL` env var

## Dependencies
- Phase 2A complete (confirmed)
- No cross-plan blockers
