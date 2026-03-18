# Content Management Architecture Audit

**Date:** 2026-03-18  
**Status:** Complete  
**Focus:** How content flows through the portfolio — hardcoded vs data-driven vs API-managed

---

## Executive Summary

Portfolio content is **mixed:**
- **Data-driven (JSON):** Projects, Experience, Skills, Certificates ✅
- **API-driven:** Projects fetched via GraphQL ✅
- **Hardcoded in components:** Bio texts, hero copy, stats, contact descriptions ❌
- **Duplicated:** Contact info (email, Zalo, social links) in 2+ files ⚠️

**Key issue:** Bio content scattered across 3 components with slight variations; contact info duplicated in constants.ts AND contact-section.tsx.

---

## Content Inventory

### HOME PAGE

#### Hero Section (`components/home/hero-section.tsx`)
```tsx
HARDCODED:
- Line 27: "Hi, I'm" (greeting)
- Lines 7-16: NAMES & TITLES rotating arrays
- Lines 40-42: "Built full-stack web apps serving 500+ users..."
- Line 46: "Ho Chi Minh City, Vietnam · GMT+7"

DYNAMIC:
- None — all hero text hardcoded
```

#### About Preview Section (`components/home/about-preview-section.tsx`)
```tsx
HARDCODED:
- Line 27: "About Me" (title)
- Lines 31-35: "Built 5 production apps across full-stack..."
- Lines 37-39: "Looking for a full-stack or frontend role..."
- STATS array (lines 12-16): ["1yr", "9", "10+"]

DATA-DRIVEN:
- TechStackTabs → pulls from skills.json via getSkills()
```

#### Contact Section (`components/home/contact-section.tsx`)
```tsx
HARDCODED:
- Line 9: haunt150603@gmail.com
- Line 15: 0969 313 263 (Zalo)
- Lines 24, 30, 36: Social URLs (Facebook, LinkedIn, Zalo)
- Line 56-59: Contact description

DUPLICATED:
- Email also in constants.ts:19 ⚠️
- Zalo link also in constants.ts:21 ⚠️
- Social URLs also in constants.ts:15-21 ⚠️
```

#### Featured Projects Section (`components/home/featured-projects-section.tsx`)
```tsx
DATA-DRIVEN:
- Fetches from apiGetProjects(true) → backend API
- Takes first 3 featured projects
```

---

### ABOUT PAGE

#### Bio Section (`components/about/bio-section.tsx`)
```tsx
HARDCODED:
- Line 40: "Kane Nguyen" (name)
- Line 43: "Software Engineer — Vietnam"
- Lines 46-53: Full bio paragraph (long, detailed version)

DATA-DRIVEN:
- Social links from constants.ts (SOCIAL_LINKS)
- Avatar path hardcoded: "/images/hero/kane-avatar.jpg"
```

**BIO TEXT COMPARISON:**
- **Hero:** "Built full-stack web apps serving 500+ users..."
- **About Preview:** "Built 5 production apps across full-stack..."
- **Bio Full:** "I build web apps with React, Next.js, and TypeScript. In my first year... CI/CD pipelines that cut production bugs by 30%..."

All 3 versions are **similar but slightly different** — suggests copy-paste inconsistency.

#### Skills Section (`components/about/skills-section.tsx`)
```tsx
HARDCODED:
- SOFT_SKILLS array (lines 12-21):
  ['Communication', 'English (B2)', 'Teamwork', 'Problem Solving', 
   'Agile/Scrum', 'Technical Writing', 'Time Management', 'Self-learning']

DATA-DRIVEN:
- Tech skills from TechStackTabs → skills.json via getSkills()
```

#### Timeline (`components/about/timeline.tsx`)
```tsx
DATA-DRIVEN:
- Fetches from getExperience() → experience.json
- 3 entries: Promete Technology, FPT Software, FPT University
```

---

## Content Data Files

### `content/experience.json`
- **Structure:** Array of experience entries
- **Fields:** company, role, duration, description, highlights[]
- **Status:** ✅ CMS-ready, fully data-driven

### `content/skills.json`
- **Structure:** Array of skill categories
- **Fields:** category, items[]
- **Status:** ✅ Data-driven (tech stack only; soft skills hardcoded separately)

### `content/certificates.json`
- **Structure:** Array of certificates
- **Fields:** title, issuer, issueDate, credentialUrl, image, issuerIcon, sortOrder, published
- **Status:** ✅ Data-driven, ready for CMS management

### `content/projects.json`
- **Status:** ✅ Fetched via API (backend-driven), not read directly in components

---

## Constants & Duplications

### `lib/constants.ts`
```typescript
SITE_NAME: "Kane Nguyen"
SITE_DESCRIPTION: "Software Engineer's Portfolio"
NAV_LINKS: [navigation items]
SOCIAL_LINKS:
  - github: https://github.com/haunguyendev
  - linkedin: https://www.linkedin.com/in/h%E1%BA%ADu-nguy%E1%BB%85n-6b1576229/
  - facebook: https://www.facebook.com/nguyen.trung.hau.778410/
  - email: mailto:haunt150603@gmail.com  ⚠️ DUPLICATED
  - zalo: https://zalo.me/0969313263    ⚠️ DUPLICATED
```

### Duplication Issues
| Content | Location 1 | Location 2 | Issue |
|---|---|---|---|
| haunt150603@gmail.com | constants.ts:19 | contact-section.tsx:9 | ❌ Two sources of truth |
| Zalo link | constants.ts:21 | contact-section.tsx:16 | ❌ Two sources of truth |
| Social URLs | constants.ts:15-21 | contact-section.tsx (SOCIALS array) | ❌ Different usage patterns |

---

## Status Summary

### ✅ What's Working
- **Projects:** Fetched via API (graphql-client)
- **Experience:** JSON-driven (experience.json)
- **Skills (tech):** JSON-driven (skills.json)
- **Certificates:** JSON-driven (certificates.json)
- **Timeline:** Renders from JSON via getExperience()

### ❌ What Needs Work
1. **Hero section:** All text hardcoded in component
2. **About preview:** Bio text & stats hardcoded
3. **Bio section:** Full bio paragraph hardcoded
4. **Soft skills:** Hardcoded array in component
5. **Contact info:** Duplicated in constants.ts AND contact-section.tsx
6. **Bio content:** 3 versions scattered across components (inconsistent)

---

## Optimization Recommendations

### Priority 1: Consolidate Contact Info
- **Current:** Email & Zalo in `constants.ts` AND `contact-section.tsx`
- **Fix:** Use `constants.ts` as single source; import in `contact-section.tsx`
- **Effort:** Low (1 file change)

### Priority 2: Create `bio.json`
- **Current:** Bio text hardcoded in 3 components (inconsistent versions)
- **Proposed structure:**
  ```json
  {
    "name": "Kane Nguyen",
    "title": "Software Engineer",
    "location": "Ho Chi Minh City, Vietnam",
    "timezone": "GMT+7",
    "shortBio": "Built full-stack web apps...",
    "heroBio": "Built full-stack web apps serving 500+ users...",
    "aboutBio": "I build web apps with React, Next.js...",
    "contactDescription": "I'm looking for full-stack or frontend roles..."
  }
  ```
- **Benefit:** Single source of truth for all bio variants
- **Effort:** Medium (new file + 3 component updates)

### Priority 3: Create `stats.json`
- **Current:** Stats hardcoded in `about-preview-section.tsx` (lines 12-16)
- **Proposed structure:**
  ```json
  {
    "yearsExperience": "1yr",
    "productionApps": "9",
    "toolsInStack": "10+"
  }
  ```
- **Question:** Should these auto-update from project count or stay manual?
- **Effort:** Low-Medium

### Priority 4: Move SOFT_SKILLS to `skills.json`
- **Current:** Hardcoded in `skills-section.tsx` (lines 12-21)
- **Proposed:** Add `softSkills` property to `skills.json`
  ```json
  [
    { "category": "Frontend", "items": [...] },
    { "category": "Backend", "items": [...] },
    { "category": "Soft Skills", "items": ["Communication", "Teamwork", ...] }
  ]
  ```
- **Benefit:** All skills in one file; easier CMS management
- **Effort:** Low (move array + 1 component update)

---

## Unresolved Questions

1. **Auto-updating stats?** Should "9 production apps" and "10+ tools" auto-calculate from projects/skills, or stay manual in `stats.json`?

2. **CMS management scope?** Is the admin dashboard currently managing experience/certificates only, or also bio/soft skills?

3. **Bio variants needed?** Why 3 different bio versions (hero short → about preview → bio full)? Can these consolidate or are they intentionally different for UX?

4. **Soft skills CMS?** Should soft skills be added to admin dashboard for Kane to edit, or are they considered "static portfolio foundation"?

5. **Contact info management?** Should email/phone/social links be moved to admin CMS, or stay in `constants.ts` as configuration?

---

## Related Files

- `/apps/web/src/lib/content.ts` — Content helpers (getExperience, getSkills, etc.)
- `/apps/web/src/lib/constants.ts` — Global constants (SOCIAL_LINKS, NAV_LINKS)
- `/apps/web/src/lib/api-client.ts` — API fetching (apiGetProjects, etc.)
- `/apps/web/src/content/` — JSON content files (experience.json, skills.json, certificates.json)

---

**Next steps:** Clarify CMS scope & bio variant requirements before consolidating content structure.
