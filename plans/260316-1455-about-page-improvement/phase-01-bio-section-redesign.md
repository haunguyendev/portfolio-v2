---
phase: 1
title: "Bio Section Redesign"
status: complete
priority: P2
effort: "1-2h"
---

# Phase 1: Bio Section Redesign

## Context

- [Brainstorm research: HR psychology analysis](../../plans/reports/brainstorm-260316-1455-about-page-hr-research.md)
- [Design guidelines](../../docs/design-guidelines.md)
- Current file: `src/components/about/bio-section.tsx` (33 lines, text-only)

## Overview

Redesign BioSection from plain text to 2-column hero-style layout with photo, social links, and resume download CTA.

## Key Insights

- HR spends ~55 seconds on portfolio → bio must communicate in <10 seconds
- Photo = trust signal, social = reachability, resume = HR workflow enabler
- Bio 2-3 sentences max, avoid generic "passionate developer" language
- Reference sites (nelsonlai.dev, delba.dev) use minimal bio + photo + social links

## Requirements

### Functional
- Display profile photo (placeholder initially)
- Show 2-3 sentence bio (concise, authentic)
- Render social links: GitHub, LinkedIn, Email
- Provide resume download button (placeholder PDF)
- Responsive: 2-column desktop, stacked mobile

### Non-Functional
- Accessible: alt text, sr-only labels, keyboard navigable
- Consistent with design guidelines (zinc palette, gradient accents)
- Component under 200 lines

## Architecture

### Layout (Desktop)
```
┌──────────────────────────────────────────────────┐
│  ┌─────────┐   Name                              │
│  │  Photo  │   Role — Location                   │
│  │ 160x160 │                                     │
│  │ rounded │   Bio paragraph (2-3 sentences)     │
│  └─────────┘                                     │
│                [GitHub] [LinkedIn] [Email]        │
│                                                   │
│                [📄 Download Resume]  ← gradient   │
└──────────────────────────────────────────────────┘
```

### Layout (Mobile)
```
┌──────────────────────┐
│      ┌─────────┐     │
│      │  Photo  │     │
│      └─────────┘     │
│       Name            │
│   Role — Location     │
│                       │
│   Bio paragraph       │
│                       │
│ [GitHub][LinkedIn]... │
│ [📄 Download Resume]  │
└──────────────────────┘
```

## Related Code Files

### Modify
- `src/components/about/bio-section.tsx` — full rewrite

### Create
- `public/resume.pdf` — placeholder (empty or 1-page placeholder)

### No Changes
- `src/app/about/page.tsx` — already imports BioSection
- `src/components/about/skills-section.tsx`
- `src/components/about/timeline.tsx`

## Implementation Steps

1. **Create placeholder resume PDF**
   - Create minimal placeholder at `public/resume.pdf`

2. **Rewrite bio-section.tsx**
   - Import: `Image` from next/image, lucide icons (Github, Linkedin, Mail, Download)
   - Define social links array (label, href, icon) — not hardcoded inline
   - Layout: `grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 md:gap-8`
   - Photo: `Image` component, 160x160, rounded-full, border, placeholder src
   - Name + role: `h2` + subtitle line
   - Bio: 1 `<p>` with 2-3 focused sentences
   - Social links: horizontal flex row with icon buttons
   - Resume CTA: gradient button linking to `/resume.pdf` with download attribute
   - Add sr-only labels and aria attributes

3. **Reuse existing avatar if available**
   - Check `public/images/hero/kane-avatar.png` (already exists per git status)
   - Use as photo source, fallback to placeholder div

4. **Build & type check**
   - `pnpm build` must pass
   - Component must stay under 200 lines

## Todo List

- [x] Create placeholder resume PDF
- [x] Rewrite bio-section.tsx with 2-column layout
- [x] Add profile photo (reuse kane-avatar.png)
- [x] Add social links row (GitHub, LinkedIn, Email)
- [x] Add resume download CTA with gradient accent
- [x] Add sr-only labels and accessibility attributes
- [x] Verify build passes
- [x] Verify responsive on mobile/desktop

## Success Criteria

- Photo visible on About page
- Social links clickable, open in new tab
- Resume download works (triggers file download)
- 2-column on md+, stacked on mobile
- No TypeScript errors
- Component ≤ 200 lines

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| No real photo yet | Use existing kane-avatar.png from hero |
| No real resume yet | Placeholder PDF, user updates later |
| Bio content too generic | Write specific, authentic copy — user can edit |

## Next Steps

After implementation:
- User replaces placeholder photo with real one
- User replaces placeholder resume PDF with actual CV
- User updates bio text with personal voice
