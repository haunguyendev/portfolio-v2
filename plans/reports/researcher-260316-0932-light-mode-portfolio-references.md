# Light Mode Portfolio Research Report

**Research Date:** 2026-03-16
**Researcher:** Portfolio Design Analysis
**Context:** Kane Nguyen — 1yr Software Engineer building personal portfolio
**Criteria:** Light mode first, editorial minimalist design, typography-focused, gradient accents, modern tech (Next.js/React), portfolio + blog

---

## Executive Summary

Analyzed 25+ developer portfolios across multiple sources. Identified 7 primary reference portfolios that match Kane's criteria with varying approaches to light-mode-first design, minimalist editorial style, and gradient accents. All leverage modern tech stacks (Next.js, React, Tailwind CSS). Key patterns: clean typography, strategic use of white space, subtle gradient accents as visual interest, blog integration via Markdown/MDX, and light/dark mode toggles.

---

## 7 Reference Portfolios

### 1. **Lee Robinson** — leerob.io / leerob.com
- **URL:** https://leerob.com
- **Developer:** Lee Robinson (Cursor AI, formerly Vercel)
- **Visual Style:**
  - Light mode with grey tones, clean typography
  - Gradient background as visual accent that "really pops"
  - Minimalist layout, recently rebuilt focusing on simplicity
  - High contrast between content and background for readability
- **What Stands Out:**
  - Uses gradient design strategically without being flashy
  - Recently rebuilt to remove accumulated cruft — modern, focused design
  - View Transitions API + Next.js App Router for smooth page animations
  - Blog-forward layout with strong typography hierarchy
- **Key Sections:** Hero, Blog, Work, About, Writing
- **Tech Stack:** Next.js, MDX, Vercel, grey + gradient accents
- **Light Mode:** Primary mode (light); dark mode available
- **Notable Feature:** Rebuilt for simplicity — abandoned complex animations for clean, readable design

---

### 2. **Josh W. Comeau** — joshwcomeau.com
- **URL:** https://www.joshwcomeau.com/
- **Developer:** Josh Comeau (Khan Academy, Gatsby, DigitalOcean, Unsplash)
- **Visual Style:**
  - Dark color scheme as primary (NOTE: not light-first, but referenced for interaction design philosophy)
  - Blog-heavy portfolio with "delightful interactions"
  - Minimal design that evolved from minimal to more polished over time
  - Strong typography + spacing for readability
- **What Stands Out:**
  - Demonstrates iterative design growth — started minimal, added thoughtful interactions
  - Blog-centric — 70+ page e-book on "Building an Effective Dev Portfolio"
  - Focus on interactions without overanimation (aligns with Kane's "not flashy" requirement)
  - High-value tutorial content integrated with portfolio
- **Key Sections:** Blog, Projects, About, Teaching/Courses
- **Tech Stack:** React-based (blog platform)
- **Light Mode:** Available
- **Notable Feature:** Educational content integrated into portfolio — adds credibility

---

### 3. **Delba de Oliveira** — delba.dev
- **URL:** https://delba.dev/
- **Developer:** Delba de Oliveira (Developer Advocate, Vercel/Next.js)
- **Visual Style:**
  - Light mode friendly
  - Minimal project-based portfolio
  - Uses Rough Notation library for "delightful highlighter animation"
  - Clean, focused presentation
- **What Stands Out:**
  - Subtle animations (Rough Notation) add personality without flashiness
  - Recently refocused on blog content (evolved from project-heavy)
  - Clean typography, strong visual hierarchy
  - Portfolio + Blog integration with Markdown/MDX
- **Key Sections:** Blog, Projects, About
- **Tech Stack:** Next.js, React, Rough Notation (animation library), light mode
- **Notable Feature:** Uses minimal animation libraries to avoid over-engineering

---

### 4. **Nelson Lai** — nelsonlai.dev
- **URL:** https://nelsonlai.dev/
- **Developer:** Nelson Lai (Full-stack developer)
- **Visual Style:**
  - **Reference baseline provided by user** — editorial minimalist design
  - Gradient accents (orange/red/blue noted by user)
  - Light + dark mode toggle
  - Clean, modern typography
  - Minimal layout with strategic whitespace
- **What Stands Out:**
  - Matches user's baseline aesthetic perfectly
  - Gradient accents as visual interest without being loud
  - Both portfolio + blog functionality
  - Professional, readable design
- **Key Sections:** Projects, Blog, About, Links
- **Tech Stack:** TypeScript, Next.js, TailwindCSS
- **Light Mode:** Primary (with dark mode toggle)
- **Notable Feature:** Editorial design with gradient accents as reference point

---

### 5. **Brian Lovin** — brianlovin.com
- **URL:** https://brianlovin.com/
- **Developer:** Brian Lovin (Design + Engineer, Notion)
- **Visual Style:**
  - Minimal design with wiki-style navigation
  - Icon packs for visual consistency
  - Clean typography
  - Web-app like architecture (feels interactive)
- **What Stands Out:**
  - Novel navigation approach (wiki-style) — interesting alternative to traditional nav
  - Icon system adds visual coherence
  - Includes community list of inspiring portfolios (meta-valuable)
  - Writing section + portfolio integration
- **Key Sections:** Writing, Projects, Bookmarks/Inspiration, About
- **Tech Stack:** Next.js, Vercel
- **Light Mode:** Available
- **Notable Feature:** Community-oriented approach (curated list of other portfolios)

---

### 6. **Dillon Verma** — GitHub: dillionverma/portfolio
- **URL:** https://github.com/dillionverma/portfolio
- **Developer:** Dillon Verma
- **Visual Style:**
  - Minimalist design with Shadcn UI + Magic UI components
  - Light/dark mode toggle with appearance settings
  - Modern, clean typography via TailwindCSS
  - Responsive design
- **What Stands Out:**
  - Uses component libraries (Shadcn/UI, Magic UI) for design consistency
  - Blog functionality integrated
  - **Setup takes minutes** via single config file — low friction for customization
  - Strong community adoption (1.3k GitHub stars)
  - Actively maintained template
- **Key Sections:** Projects, Blog, About, Contact
- **Tech Stack:** Next.js 14, React, TypeScript, TailwindCSS, Shadcn/UI, Magic UI, Framer Motion
- **Light Mode:** Primary with toggle
- **Notable Feature:** Modern component library approach — less custom CSS, more reusable

---

### 7. **Nisar Hassan** — GitHub: nisarhassan12/portfolio-template
- **URL:** https://github.com/nisarhassan12/portfolio-template
- **Developer:** Nisar Hassan
- **Visual Style:**
  - Pink accent color system
  - Minimal, accessible design philosophy
  - Clean, simple, modern UI
  - White space emphasized
  - No framework dependencies (vanilla HTML/CSS/JS)
- **What Stands Out:**
  - Pure HTML/CSS/JS — no build tools required
  - High accessibility focus
  - Pink accent color choice (alternative to orange/red/blue)
  - Excellent Lighthouse scores
  - Fast loading, minimal cruft
  - Great educational reference for simplicity
- **Key Sections:** Header/Intro, Work/Projects, Clients, About, Contact, Footer
- **Tech Stack:** HTML, CSS, JavaScript (no frameworks)
- **Light Mode:** Built-in
- **Notable Feature:** Framework-agnostic approach — shows minimalist design possible without heavy tooling

---

## Design Pattern Analysis

### Color Schemes Across References
| Portfolio | Primary Mode | Accent Color(s) | Notes |
|-----------|---|---|---|
| Lee Robinson | Light grey | Gradient (context-dependent) | Strategic, subtle |
| Delba | Light | Minimal, focus on typography | Clean, text-forward |
| Nelson Lai | Light | Orange/Red/Blue gradients | Editorial, bold accents |
| Dillon Verma | Light (toggle) | TailwindCSS defaults + Shadcn | Modern, component-based |
| Nisar Hassan | Light | Pink | Unique, friendly accent |
| Josh Comeau | Dark | Minimal | Exception — dark mode primary |
| Brian Lovin | Light | Icon-based visual system | Consistency over color |

### Typography Patterns
- **Font Size Hierarchy:** H1 large (32-48px), body clean 16-18px
- **Line Height:** 1.6-1.8 for body text (excellent readability)
- **Font Choices:** Inter, System fonts (SF Pro, Segoe), sans-serif focus
- **Spacing:** Generous whitespace (16-32px gaps), minimal clutter

### Animation Philosophy
- **Delightful, not distracting:** Rough Notation (highlighting), hover effects
- **View Transitions API:** Smooth page navigation without Three.js complexity
- **Framer Motion:** Used sparingly for micro-interactions
- **Avoids:** Spinning logos, autoplay videos, parallax (unless minimal)

### Blog Integration
- **Markdown/MDX:** Industry standard (all except pure HTML version)
- **Organization:** `/blog`, `/writing`, `/articles` endpoints
- **Display:** Chronological list with tags, dates, reading time
- **Tool Stack:** MDX Bundler, Next.js file routing, RSS feeds

---

## Tech Stack Patterns

### Universal Stack
- **Framework:** Next.js 12+ (App Router preferred)
- **Styling:** TailwindCSS (universal across modern portfolios)
- **Typing:** TypeScript (professional, error detection)
- **Content:** Markdown/MDX for blogs
- **Hosting:** Vercel (Next.js native, free tier available)

### Optional Enhancements
- **Animation:** Framer Motion (smooth, lightweight)
- **Components:** Shadcn/UI, Magic UI (pre-built, customizable)
- **3D (optional):** Three.js (heavy, use sparingly — see Hamish Williams)
- **Dark Mode:** CSS media queries + toggle (standard practice)

---

## Key Insights for Kane's Portfolio

### ✅ What Works Across Top Portfolios
1. **Light mode as primary** — all 7 references support it; most default to light
2. **Editorial minimalist style** — clean typography, generous whitespace, minimal decoration
3. **Gradient accents (subtle)** — used strategically for visual interest, not flashiness
4. **Blog functionality** — Markdown/MDX standard; worth including
5. **Next.js + TailwindCSS + TypeScript** — industry standard for 2025+
6. **Responsive, accessible design** — non-negotiable
7. **Home, Projects, About, Blog** — standard 4-section structure

### ⚠️ Pitfalls to Avoid
1. **Over-animation:** Avoid autoplay, spinning, parallax. Use subtle transitions.
2. **Color overload:** Stick to 2-3 colors max (primary + 1-2 accents)
3. **Cluttered hero:** Lead with clear value statement, not flashy graphics
4. **Missing blog:** Blog section adds credibility and SEO value
5. **Dark mode only:** Light mode first is modern best practice
6. **Heavy 3D:** Unless it's Hamish Williams-level design, skip Three.js
7. **Outdated tech:** React 18+, Next.js 14+, TailwindCSS v3+

### 📌 Borrowable Elements
1. **Lee Robinson:** Gradient accent approach, View Transitions API for smooth nav
2. **Delba:** Rough Notation for subtle highlighting (accents without animation library)
3. **Nelson Lai:** Full editorial minimalist aesthetic (baseline match)
4. **Dillon Verma:** Component library approach (Shadcn/UI) for consistency
5. **Nisar Hassan:** Pink accent alternative if orange/red/blue doesn't fit
6. **Brian Lovin:** Icon system for visual consistency without heavy graphics
7. **Josh Comeau:** Blog-centric portfolio philosophy (teaching adds value)

---

## GitHub Template References

### High-Quality Open-Source Templates
1. **dillionverma/portfolio** (1.3k stars)
   - Tech: Next.js 14, Shadcn/UI, Magic UI, Framer Motion
   - Light mode primary with toggle
   - Blog functionality
   - Quick setup via config file

2. **nisarhassan12/portfolio-template** (highly accessible)
   - Tech: Pure HTML/CSS/JS (no framework)
   - Educational value for simplicity
   - Excellent Lighthouse scores
   - Pink accent system

3. **RyanFitzgerald/devportfolio** (Astro alternative)
   - Tech: Astro + TailwindCSS
   - Modern, minimal design
   - Fast performance
   - Not Next.js, but worth evaluating

4. **elwynynion/Minimalist-Dev-Portfolio**
   - Tech: Next.js + TailwindCSS + NextUI
   - One-page layout option
   - Fully responsive

---

## Design Recommendations for Kane

### Homepage Hero
- **Headline:** 2-3 words max ("Kane Nguyen. Engineer.")
- **Subheading:** One-sentence value statement (14-16px, grey-600)
- **CTA:** Single button or link ("View Work", "Read Blog")
- **Gradient Accent:** Optional gradient line/bar above or below hero (orange→red or similar)

### Color Palette (Recommended)
- **Background:** #FFFFFF (white)
- **Text Primary:** #000000 (black) or #111111
- **Text Secondary:** #666666 (grey-600)
- **Accent Gradient:** Orange→Red→Blue (nelsonlai reference) or custom
- **Dark Mode:** Invert intelligently; use #0A0A0A background, #E8E8E8 text

### Typography System
- **H1:** 48px, bold, line-height 1.2
- **H2:** 32px, semibold, line-height 1.3
- **Body:** 16px, regular, line-height 1.6-1.8
- **Font:** Inter, SF Pro, or system fonts (avoid custom fonts for light mode performance)

### Layout
- **Max Width:** 1024-1200px (readable, not too wide)
- **Spacing:** 24px margins minimum, 32-48px for sections
- **Grid:** 2-3 columns for projects, 1 column for blog
- **Mobile:** Stack everything to 1 column, touch-friendly spacing (min 44px targets)

### Navigation
- **Sticky header:** Logo + nav links (Home, Projects, Blog, About)
- **Light background:** White or off-white sticky header
- **Dark text:** For high contrast in light mode
- **Mobile:** Hamburger menu or slide-out sidebar

### Sections Structure
1. **Home/Hero** — Headline, subheading, gradient accent, CTA
2. **Featured Projects** — 3-4 recent works with card layout, tech tags, links
3. **Blog** — Latest 5-6 articles, date, reading time, category tags
4. **About** — Professional bio (100-150 words), skills summary, photo (optional)
5. **Contact** — Email form or link, social links (GitHub, LinkedIn, Twitter)

---

## Content Recommendations
- **Portfolio projects:** Aim for 6-12 high-quality projects (not filler)
- **Project pages:** Title, description, tech stack, outcome, links (live + GitHub)
- **Blog frequency:** Aim for bi-weekly posts (shipping, learning, technical insights)
- **About page:** Personal + professional details, values, learning philosophy
- **Contact:** Email form + GitHub/LinkedIn links (primary value)

---

## Tech Stack Decision Matrix

| Aspect | Recommendation | Alternative |
|--------|---|---|
| **Framework** | Next.js 14+ (App Router) | Remix, Astro |
| **Styling** | TailwindCSS v3+ | Panda CSS, UnoCSS |
| **Typing** | TypeScript (full) | JavaScript (less type safety) |
| **Content** | MDX (dynamic content) | Markdown (simpler) |
| **Components** | Shadcn/UI + custom | Magic UI, Radix |
| **Animation** | Framer Motion (minimal) | Motion (lightweight alternative) |
| **Hosting** | Vercel (native) | Netlify, Railway |
| **DB** | None needed (static) | Supabase (if comments/data) |
| **Dark Mode** | CSS media + toggle | External library (heavyweight) |

---

## Deployment & Performance
- **Hosting:** Vercel (free tier supports Next.js perfectly)
- **Domain:** Custom domain (e.g., kane.dev) via Vercel DNS or external registrar
- **Performance:** Aim for Lighthouse 90+ (Core Web Vitals critical)
- **Analytics:** Vercel Analytics (free) or Umami (self-hosted, privacy-focused)
- **SEO:** Next.js metadata API, sitemap.xml, robots.txt, Open Graph tags

---

## Unresolved Questions

1. **3D graphics or animations?** — Research shows minimal portfolios avoid this. Is Kane interested in showcasing design/animation skills?
2. **Blog content scope?** — Should blog focus on technical posts, learning journey, both?
3. **Project detail level?** — Case studies vs. brief descriptions? (time investment varies)
4. **Color accent preference?** — Orange/red/blue gradient (nelsonlai style) vs. pink vs. custom?
5. **Light mode only?** — All references support light+dark toggle. Is dark mode necessary or optional?
6. **Comment system on blog?** — Requires database integration; many skip this for simplicity.

---

## Sources
- [21 Best Developer Portfolios (Examples) 2026 - Colorlib](https://colorlib.com/wp/developer-portfolios/)
- [10 Minimal Portfolio Examples for Web Developers - Scrimba](https://scrimba.com/articles/minimal-web-developer-portfolio-examples/)
- [Top 30 Web Developer Portfolio Examples - 1Byte](https://blog.1byte.com/web-developer-portfolio-examples/)
- [Next.js Portfolio Templates - Vercel](https://vercel.com/templates/next.js)
- [GitHub: dillionverma/portfolio](https://github.com/dillionverma/portfolio)
- [GitHub: nisarhassan12/portfolio-template](https://github.com/nisarhassan12/portfolio-template)
- [23 NextJS Portfolio Template Examples - Magic UI](https://magicui.design/blog/nextjs-portfolio-template)
- [Lee Robinson - leerob.com](https://leerob.com)
- [Josh W. Comeau - joshwcomeau.com](https://www.joshwcomeau.com/)
- [Delba de Oliveira - delba.dev](https://delba.dev/)
- [Nelson Lai - nelsonlai.dev](https://nelsonlai.dev/)
- [Brian Lovin - brianlovin.com](https://brianlovin.com/)
- [GitHub: nisarhassan12/portfolio-template](https://github.com/nisarhassan12/portfolio-template)
- [Free Developer Portfolio Website Templates - Web Portfolios](https://www.webportfolios.dev/)

---

**Report Status:** Complete
**Next Steps:** Planner should use these 7 reference portfolios + recommendations to create implementation plan for Kane's portfolio build
