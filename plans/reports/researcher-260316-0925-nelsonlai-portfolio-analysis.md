# nelsonlai.dev Portfolio Analysis Report

**Date:** 2026-03-16
**Repository:** https://github.com/nelsonlaidev/nelsonlai.dev
**Live Site:** https://nelsonlai.dev
**Stars:** 823 | **Forks:** 127 | **Language:** TypeScript

---

## 1. TECH STACK OVERVIEW

### Framework & Language
- **Next.js 16** with App Router architecture
- **React 19** for UI components
- **TypeScript 5.9** with strict mode configuration
- **Node.js ≥24** requirement with pnpm package manager

### Styling & Design System
- **Tailwind CSS** for utility-first styling
- **Base UI** & **Ark UI** for accessible component library
- **Motion** for animations
- Light/Dark mode built-in (theme toggle)
- Custom design tokens via Tailwind configuration

### Content Management
- **MDX** (Markdown + JSX) for blog posts and dynamic content
- **Content Collections** for static content organization
- **Shiki** for code syntax highlighting
- RSS feed generation and sitemap support

### Backend & Data
- **PostgreSQL** database with Docker support
- **Drizzle ORM** for type-safe database queries
- **Better Auth** for authentication and user management
- **Redis** for caching and rate limiting
- **Upstash** for serverless Redis

### Code Quality & Testing
- **Vitest** for unit and integration tests
- **Playwright** for end-to-end testing
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** strict type checking

### Additional Tools
- **Next.js Open Graph** image generation
- **React Email** for email templates
- **next-intl** for internationalization (i18n)
- **Umami Analytics** for tracking
- **Lefthook** for git hooks
- **Drizzle Kit** for database management

---

## 2. ARCHITECTURE & PROJECT STRUCTURE

### Directory Organization
```
src/
├── app/                 # Next.js pages (App Router with [locale] dynamic routing)
│   ├── [locale]/       # Locale-based internationalization
│   ├── api/            # API route handlers
│   ├── rpc/            # RPC endpoints
│   └── cosmos/         # Component development environment
├── components/         # Reusable React components
├── content/            # MDX blog posts and content files
├── db/                 # Database schemas and migrations
│   ├── schemas/        # Drizzle ORM schema definitions
│   ├── migrations/     # Database migrations
│   ├── seed.ts         # Seed data initialization
│   └── reset.ts        # Database reset utility
├── emails/             # Email templates (React Email)
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization configuration
├── lib/                # Utility functions and helpers
├── mdx-plugins/        # Custom Rehype/Remark plugins for MDX
├── orpc/               # ORPC (Open RPC) API implementation
├── contexts/           # React context providers
├── styles/             # Global styles and CSS
├── tests/              # Test files
├── constants/          # Application constants
├── utils/              # Utility functions
├── env.ts              # Environment configuration (t3-env)
├── instrumentation.ts  # Observability setup
└── proxy.ts            # Proxy configuration
```

### Path Aliases (TypeScript)
- `@/*` → `./src/*` (source files)
- `~/*` → `./public/*` (public assets)
- `content-collections` → `./.content-collections/generated` (generated content)

### Routing Strategy
- **Locale-based routing:** `[locale]/` dynamic segment for i18n
- **URL structure:** `/en/blog/post-name` or `/vi/blog/post-name`
- **SEO:** Robots.txt and sitemap.ts generation
- **Open Graph:** Dynamic image generation for social sharing

---

## 3. DESIGN STYLE & VISUAL AESTHETICS

### Color Palette & Theming
- **Gradient System:** Orange, red, and blue gradient overlays for depth
- **Dark/Light Modes:** Full theme support with CSS variables/Tailwind dark mode
- **High Contrast:** Ensures accessibility (AA/AAA compliance)
- **Accent Colors:** Bold gradients for CTAs and interactive elements
- **Monochromatic Typography:** Clean, readable text hierarchy

### Typography & Spacing
- **Font Families:** Geist, Noto Sans variants for modern look
- **Generous Whitespace:** Breathing room between content blocks
- **Responsive Grid:** Flexible layout adapting mobile → desktop
- **Max Content Width:** 5xl (Tailwind) for comfortable reading
- **Line Height:** Optimized for readability

### Visual Components
- **Blur Effects:** Background blur for depth and layering
- **Smooth Animations:** Motion library for subtle transitions
- **SVG Elements:** Animated graphics throughout
- **Image Optimization:** Responsive images (75, 100 quality levels)
- **Syntax Highlighting:** Code blocks with Shiki (multiple themes)

### Theme Features
- **Sticky Header:** Navigation always accessible
- **Command Palette:** Keyboard shortcuts for navigation
- **Footer Integration:** Mirrors header + social links
- **Language Selector:** Internationalization dropdown
- **Spotify Integration:** Display current listening status

---

## 4. PAGE STRUCTURE & KEY SECTIONS

### Main Pages
1. **Home/Hero** - Introduction banner + featured content
2. **Blog** - Article listing with categories, search, filtering
3. **Projects** - Portfolio showcase with descriptions and links
4. **About** - Personal background and bio
5. **Uses** - Tools and tech stack used
6. **Dashboard** - Analytics or metrics page
7. **Guestbook** - Community interaction space

### Content Sections
- **Hero Section:** Bold headline "I'm Nelson, a Full Stack Engineer"
- **Skills Display:** Technology grid (React, TypeScript, Next.js, etc.)
- **Featured Projects:** Project cards with images
- **Latest Blog Posts:** Article previews with metadata
- **Social Links:** GitHub, Facebook, Instagram, X, YouTube
- **Comments Section:** Post discussion (fuma-comment adapted)
- **View Counters:** Track post popularity
- **Like Functionality:** Engagement metrics

### Navigation Elements
- **Sticky Header:** Primary navigation menu
- **Command Palette:** Cmd/Ctrl+K shortcuts
- **Sidebar/Footer:** Secondary navigation
- **Breadcrumbs:** Content hierarchy
- **Locale Selector:** Language switching

---

## 5. CONTENT MANAGEMENT APPROACH

### Static vs. Dynamic Content

| Content Type | Management | Approach |
|---|---|---|
| **Blog Posts** | MDX files | Stored in `src/content/` with frontmatter (date, author, tags) |
| **Projects** | MDX or Database | Could be either hardcoded or fetched from DB |
| **About/Bio** | Static or MDX | Likely static file or minimal DB storage |
| **Configuration** | Code constants | Hardcoded in `src/constants/` |
| **User Comments** | Database | Stored in PostgreSQL via Drizzle ORM |
| **Post Interactions** | Database | Likes, views, bookmarks tracked in DB |
| **Author Data** | Database + Auth | Better Auth manages user sessions |

### Content Processing Pipeline
1. MDX files in `src/content/` parsed by Content Collections
2. Remark plugins process markdown (custom: `mdx-plugins/`)
3. Rehype plugins handle HTML generation
4. Shiki syntax highlighting applied
5. Dynamic metadata extracted (dates, tags, slugs)
6. RSS feed generated automatically
7. Open Graph images created dynamically

### Database-Backed Features
- User authentication (Better Auth)
- Comment system (posts ↔ comments relation)
- Post likes and view counters
- Guestbook entries
- Analytics tracking (Umami)

---

## 6. KEY DESIGN PATTERNS & FEATURES

### React/Next.js Patterns
- **Server Components:** App Router with RSC for performance
- **Context API:** Shared state (theme, auth, i18n)
- **Custom Hooks:** Reusable logic (`src/hooks/`)
- **Component Composition:** Base UI + custom components
- **MDX Components:** Custom rendering for markdown elements

### Performance Optimizations
- **Image Optimization:** Responsive images with quality variants
- **Code Splitting:** Dynamic imports for heavy components
- **Cache Strategy:** Redis for database queries, HTTP caching headers
- **Rate Limiting:** Upstash protection on API endpoints
- **Type Safety:** TypeScript prevents runtime errors

### UX/UI Decisions
1. **Gradient Overlays** → Creates visual depth and modern feel
2. **Dark Mode** → Reduces eye strain, modern aesthetic
3. **Blur Effects** → Visual hierarchy, focus on content
4. **Smooth Animations** → Polish and responsiveness perception
5. **Command Palette** → Accessibility and power-user features
6. **Sticky Header** → Navigation always reachable
7. **Open Comments** → Community building
8. **Spotify Widget** → Personal touch, real-time engagement
9. **Multiple Blog Features** → Encourages reading (likes, views, comments)

### Accessibility Features
- High contrast color ratios
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Light/Dark mode for different needs
- Responsive text sizing
- Image alt text requirements

---

## 7. NOTABLE ARCHITECTURAL DECISIONS

### Monorepo with Turborepo
- Workspace configuration (`pnpm-workspace.yaml`)
- Shared TypeScript config (`@nelsonlaidev/typescript-config`)
- Scalable for multiple packages

### Internationalization
- **Routing Strategy:** URL locale prefix `[locale]/`
- **Library:** next-intl for translations
- **Fallback:** English as primary language
- **Scope:** Full site i18n support

### Authentication
- **Better Auth:** Modern, open-source alternative
- **Session Management:** Built into authentication flow
- **User Roles:** Likely admin for content management

### Analytics & Monitoring
- **Umami:** Privacy-first analytics (self-hosted option)
- **Instrumentation:** Setup for observability (`instrumentation.ts`)
- **View Counting:** Per-post tracking
- **Error Tracking:** TypeScript strict mode catches issues

### Security
- Security headers in Next.js config
- Strict HTTPS enforcement
- XSS prevention via Content Security Policy
- CORS restrictions on API endpoints
- Rate limiting via Upstash

---

## 8. WHAT MAKES IT VISUALLY APPEALING

### Design Excellence
1. **Minimalist Foundation** - Clean layout without clutter
2. **Strategic Color Use** - Gradients accent key elements
3. **Professional Typography** - Modern fonts with clear hierarchy
4. **Responsive Design** - Looks great on all devices
5. **Micro-interactions** - Subtle animations enhance engagement
6. **Whitespace** - Breathing room between sections
7. **Visual Hierarchy** - Important content stands out
8. **Consistency** - Design tokens applied uniformly

### Technical Polish
- Lighthouse scores near perfect
- Fast load times with Next.js optimizations
- Smooth scrolling behavior
- No layout shifts (CLS optimization)
- Proper image sizing and formats
- Efficient CSS bundling via Tailwind

### Content-First Approach
- Blog takes center stage
- Projects showcase with detailed descriptions
- About section builds trust
- Uses page shows transparency
- Guestbook enables community
- Comments foster discussion

### Personal Touch
- Spotify integration showing real-time activity
- Handwritten bio or personal narrative
- Project descriptions show personality
- Social links for deeper connection
- Consistent voice in writing

---

## 9. TECH DECISIONS ANALYSIS

### Why These Choices?
| Choice | Why | Benefit |
|---|---|---|
| Next.js 16 | Full-stack React framework | SSR, SSG, API routes, great DX |
| TypeScript | Type safety | Catch errors at compile time, better IDE support |
| Tailwind CSS | Utility-first styling | Fast development, consistent design, small bundle |
| MDX | Markdown + React components | Dynamic, interactive blog posts |
| Drizzle ORM | Type-safe queries | SQL-like syntax, database agnostic, excellent DX |
| Better Auth | Open-source auth | Privacy-focused, flexible, no vendor lock-in |
| PostgreSQL | Relational database | ACID compliance, robust, scalable |
| Turborepo | Monorepo tool | Shared packages, DRY principles, better org |
| Vitest + Playwright | Testing tools | Fast unit tests, realistic E2E tests |

### Scalability Considerations
- Database normalized via Drizzle schemas
- Caching layer (Redis) for high traffic
- Rate limiting to prevent abuse
- Internationalization ready for expansion
- Monorepo allows plugin architecture
- Component library (Base UI) reusable across projects

---

## 10. CONTENT MANAGEMENT SUMMARY

### Static Content (Mostly)
- Blog posts stored as MDX files in version control
- Projects likely defined as MDX or constants
- Pages (About, Uses) as static files

### Dynamic Content (Database)
- User comments and interactions
- Post metrics (views, likes)
- Guestbook entries
- User sessions and authentication
- Site analytics

### Hybrid Approach
- Content source of truth in MDX files
- Metadata and interactions in database
- Best of both: version control + user data separation

---

## KEY INSIGHTS FOR YOUR PORTFOLIO

1. **Use Gradients Strategically** - Not everywhere, but key accent areas create modern feel
2. **Dark Mode Support** - Essential for 2026, adds accessibility
3. **MDX for Blog** - Content as code allows version control and rich formatting
4. **Database for Interactions** - Likes, comments, views engage visitors
5. **Monorepo Structure** - Allows sharing components/config across projects
6. **Type-Safe Stack** - TypeScript + Drizzle ORM catches errors early
7. **Performance First** - Image optimization, code splitting, caching matter
8. **Personal Touch** - Spotify widget, real bios, interactive elements = memorable
9. **Accessibility Built-in** - High contrast, keyboard nav, semantic HTML
10. **Open Source Inspirations** - Attribution builds community, allows forks/inspiration

---

## UNRESOLVED QUESTIONS

1. How is the Spotify API integrated? (OAuth flow, refresh tokens, real-time updates?)
2. What database migrations strategy? (Drizzle versions, rollback procedures?)
3. Email notification system - when are emails sent? (Comments? Newsletter?)
4. Image hosting strategy - where are blog images stored? (Vercel, S3, self-hosted?)
5. Search implementation - full-text search or basic filtering? (Algolia? PostgreSQL FTS?)
6. Comment moderation - manual review or automated spam filtering?
7. Analytics retention - how long is visitor data kept? (GDPR compliance?)
8. Deployment - Vercel exclusively or other options? (Database backups?)
9. CSS-in-JS or pure Tailwind? (No emotion/styled-components visible)
10. Component testing - are components unit tested or integration tested? (Coverage %?)
