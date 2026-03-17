# Kane Nguyen's Portfolio v2

Personal portfolio website showcasing projects, skills, and experience. Built with Next.js, TypeScript, and Tailwind CSS.

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (package manager)

### Setup

**Local Development (with database):**

```bash
# Install dependencies
pnpm install

# Start PostgreSQL in Docker
docker compose up -d

# Run database migrations
pnpm db:migrate

# Seed initial data (optional)
pnpm db:seed

# Run all apps in development mode
pnpm dev

# Web app: http://localhost:3000
# API GraphQL: http://localhost:3001/graphql
# Admin dashboard: http://localhost:3000/admin
```

**Quick start (web only, no DB):**

```bash
cd apps/web
pnpm install
pnpm dev
```

### Build & Deploy

```bash
# Build all apps
pnpm build

# Start production servers (requires running API separately)
pnpm start

# Deploy web app to Vercel (automatic on push to main)
# Note: Configure DATABASE_URL env var in Vercel project settings
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router) |
| Backend API | NestJS 11 + GraphQL (code-first) |
| Database | PostgreSQL + Prisma ORM |
| Authentication | Better Auth + JWT Guard |
| Styling | Tailwind CSS + shadcn/ui |
| Content | MDX (blog/diary) + GraphQL API |
| Rich Editor | TipTap (admin dashboard) |
| Admin Dashboard | Next.js + shadcn/ui |
| Monorepo | Turborepo |
| Language | TypeScript |
| Testing | Vitest + Playwright |
| Deployment | Vercel (web), Docker Compose (local DB) |
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
│
├── apps/
│   ├── web/                   # Next.js frontend + admin dashboard
│   │   ├── src/app/           # App Router pages + admin routes
│   │   ├── src/components/    # Reusable UI components
│   │   ├── src/content/       # Blog + diary MDX content
│   │   └── package.json
│   │
│   └── api/                   # NestJS GraphQL API (port 3001)
│       ├── src/               # Services, resolvers, modules
│       │   ├── posts/         # Blog/diary posts
│       │   ├── projects/      # Projects management
│       │   ├── categories/    # Categories
│       │   ├── tags/          # Tags
│       │   ├── series/        # Blog series
│       │   ├── auth/          # JWT authentication
│       │   └── graphql/       # GraphQL schema
│       └── package.json
│
├── packages/
│   ├── prisma/                # Prisma ORM + schema
│   │   └── schema.prisma      # Database schema
│   │
│   └── shared/                # Shared types & utilities
│
├── docker-compose.yml         # PostgreSQL container
├── turbo.json                 # Monorepo configuration
├── package.json               # Root workspace
└── pnpm-workspace.yaml        # Workspace definition
```

## Development Phases

**Phase 1:** Portfolio pages (Home, Projects, About) with static JSON content. ✓ COMPLETE

**Phase 2:** Blog system with MDX integration and blog pages. ✓ COMPLETE

**Phase 3:** SEO, dark mode toggle, responsive refinements, performance optimization. ✓ COMPLETE

**Phase 4A (CURRENT):** Custom CMS with Turborepo monorepo, NestJS GraphQL API, PostgreSQL, Better Auth admin login, admin dashboard with CRUD pages, TipTap rich editor, content migration.

**Phase 4B:** Advanced features (comments, likes, page views, analytics) — planned.

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
