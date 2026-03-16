---
title: "About Page Improvement"
description: "Redesign About page bio section with photo, social links, and resume download for HR readability"
status: complete
priority: P2
effort: "1-2h"
branch: main
tags: [about, bio, hr, social-links, resume, phase-1-polish]
created: 2026-03-16
blockedBy: []
blocks: []
---

# About Page Improvement

## Problem

Current About page is text-heavy, no photo, no social links, no resume download. HR spends ~55 seconds scanning — page lacks visual hooks and critical conversion elements.

## Research Findings

- 85% hiring managers value problem-solving evidence
- HR clicks About AFTER liking your work → need quick confirmation of fit
- Bio should be 2-3 sentences, not 3 paragraphs
- Photo humanizes — 85% top portfolios include one
- Resume download is HR workflow critical (forward to hiring manager)
- Social links = reachability signal

## Scope

Redesign `BioSection` only. Keep SkillsSection + Timeline unchanged.

## Phases

| # | Phase | File | Status | Effort |
|---|-------|------|--------|--------|
| 1 | Bio Section Redesign | [phase-01-bio-section-redesign.md](./phase-01-bio-section-redesign.md) | Complete | 1-2h |

## Files to Modify

- `src/components/about/bio-section.tsx` — full redesign
- `src/types/index.ts` — add SocialLink type if needed

## Files to Create

- `public/resume.pdf` — placeholder PDF
- `public/images/about/avatar-placeholder.png` — placeholder (or reuse hero avatar)

## Files Unchanged

- `src/app/about/page.tsx`
- `src/components/about/skills-section.tsx`
- `src/components/about/timeline.tsx`
- `src/components/about/timeline-item.tsx`

## Success Criteria

- Bio: max 3 short sentences, focused and authentic
- Profile photo visible (placeholder OK)
- Social links: GitHub, LinkedIn, Email — clickable
- Resume download button functional (placeholder PDF OK)
- 2-column layout on desktop, stacked on mobile
- Accessible (sr-only labels, alt text, keyboard nav)
- TypeScript compiles, build passes
