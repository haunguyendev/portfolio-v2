# Kane Nguyen's Portfolio v2

Personal portfolio website showcasing projects, skills, and experience. Built with Next.js, TypeScript, and Tailwind CSS.

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (package manager)

### Setup
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

### Build & Deploy
```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Deploy to Vercel (automatic on push to main)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Content | JSON (Phase 1), MDX (Phase 2+) |
| Testing | Vitest + Playwright (Phase 3) |
| Deployment | Vercel |
| Package Manager | pnpm |

## Project Structure

```
porfolio_v2/
├── docs/                      # Documentation
│   ├── project-overview-pdr.md
│   ├── codebase-summary.md
│   ├── code-standards.md
│   ├── system-architecture.md
│   ├── design-guidelines.md
│   ├── deployment-guide.md
│   └── project-roadmap.md
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # Reusable UI components
│   ├── content/               # Static content (JSON/MDX)
│   ├── lib/                   # Utility functions
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Development Phases

**Phase 1 (Current):** Portfolio pages (Home, Projects, About) with static JSON content.

**Phase 2:** Blog system with MDX integration and blog pages.

**Phase 3:** SEO, dark mode toggle, responsive refinements, performance optimization.

**Phase 4:** CMS integration (Sanity/Payload), analytics, comments/interactions, database.

## Key Pages

| Page | Purpose | Status |
|------|---------|--------|
| Home | Split hero + featured projects + about intro | Phase 1 |
| Projects | Complete project list with filtering | Phase 1 |
| About | Bio + skills + experience timeline | Phase 1 |
| Blog | "Coming soon" placeholder | Phase 1 |

## Design Direction

- **Style:** Editorial minimalist, light mode first
- **Theme:** shadcn/ui defaults (zinc palette) + gradient accents (orange→red→blue)
- **Layout:** Max-width 1200px, responsive, generous whitespace
- **Animation:** Subtle only (hover effects, page transitions)

## Conventions

- **Files:** kebab-case (e.g., `project-card.tsx`)
- **Components:** One per file, max 200 LOC
- **Styling:** Tailwind utilities + shadcn/ui (no custom CSS unless necessary)
- **Content:** In `/content` data files, not hardcoded
- **Exports:** Named exports only (except page files)
- **TypeScript:** Strict mode, co-located types

## Documentation

See `/docs` for detailed guides:

- [Project Overview & PDR](./docs/project-overview-pdr.md) — Goals, metrics, scope
- [Codebase Summary](./docs/codebase-summary.md) — Structure and organization
- [Code Standards](./docs/code-standards.md) — Conventions and patterns
- [System Architecture](./docs/system-architecture.md) — Data flow and components
- [Design Guidelines](./docs/design-guidelines.md) — Design system specs
- [Deployment Guide](./docs/deployment-guide.md) — Vercel setup
- [Project Roadmap](./docs/project-roadmap.md) — Phases and timeline

## Development Rules

- YAGNI / KISS / DRY
- Ship portfolio first (Phase 1), blog later
- Use shadcn/ui defaults — extend, don't reinvent
- No database or auth in Phase 1
- Keep components under 200 lines each

## Author

Kane Nguyen — Software Engineer (1 year experience)

## License

MIT
