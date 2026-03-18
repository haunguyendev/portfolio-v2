# Brainstorm: Bio/About Content Management

**Date:** 2026-03-18
**Status:** Decided — Consolidate JSON (not Full CMS)

## Problem Statement

Bio/about content hardcoded across 3+ components (hero, about-preview, bio-section). DRY violation. Stats ("1yr", "9 apps") scattered. Contact info duplicated.

User considered Full CMS management vs JSON consolidation.

## Context

- Content changes 1-2x/year (job change, new experience)
- CI/CD pipeline already working (edit → push → deploy ~5 min)
- Full CMS backend exists (NestJS + GraphQL + Prisma)
- Only 1 editor (Kane)

## Current Hardcoded Content Map

| Content | Location | Issue |
|---------|----------|-------|
| Hero bio text | `hero-section.tsx` | Hardcoded, unique copy |
| About preview bio | `about-preview-section.tsx` | Different version of same bio |
| Full bio | `bio-section.tsx` | 3rd version of bio |
| Stats (1yr, 9 apps, 10+) | `about-preview-section.tsx` | Hardcoded numbers |
| Contact info | `contact-section.tsx` + `constants.ts` | Duplicated |
| Soft skills | Component file | Hardcoded array |

## Options Evaluated

### Option A: Consolidate JSON — CHOSEN
- Create `bio.json` with hero/about/full bio variants
- Create `stats.json` for experience counters
- Merge contact info into single source
- Move soft skills to `skills.json`
- **Pros:** Fix DRY, low effort (~0.5 day), zero maintenance, sufficient for 1-2x/year changes
- **Cons:** Still requires code deploy to update

### Option B: Full CMS (DB + Admin) — REJECTED
- New Prisma model + NestJS module + GraphQL + admin page
- **Pros:** Edit via browser without deploy
- **Cons:** 2-3 days effort, ongoing maintenance, saves ~6 min/year. YAGNI.

### Option C: Keep as-is — REJECTED
- Leaves DRY violation unresolved
- Increases risk of inconsistent content across pages

## Decision

**Consolidate JSON.** Fixes the real problem (DRY) without over-engineering. Full CMS deferred until content changes >1x/month or multiple editors needed.

## Implementation Scope

1. Create `bio.json` — hero text, about-preview text, full bio, names, titles, location
2. Create `stats.json` — years experience, app count, tools count, etc.
3. Consolidate contact info in `constants.ts` (remove duplication)
4. Move soft skills array to `skills.json`
5. Update 5-6 components to import from JSON instead of hardcoded

## Next Steps

→ Creating implementation plan
