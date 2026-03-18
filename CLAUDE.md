# CLAUDE.md — Kane Nguyen Portfolio v2

## Project Overview
Personal portfolio website for Kane Nguyen — Software Engineer (1yr exp).
Purpose: Showcase projects, skills, experience to HR + personal blog (Phase 2).
Reference: nelsonlai.dev (simplified), leerob.com, delba.dev.

## Tech Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Backend:** NestJS + GraphQL (code-first) + Prisma ORM
- **Styling:** Tailwind CSS + shadcn/ui (default light theme)
- **Content:** MDX (Velite) + PostgreSQL (admin CMS)
- **Storage:** MinIO (S3-compatible, self-hosted)
- **Deploy:** Docker → Self-hosted Ubuntu server via CI/CD
- **CI/CD:** GitHub Actions → GHCR → SSH deploy via Cloudflare Tunnel
- **Monorepo:** Turborepo + pnpm workspaces
- **Package Manager:** pnpm

## Infrastructure
- **Server:** Proxmox VM (Ubuntu), LAN 192.168.1.123
- **Domain:** haunguyendev.xyz (Cloudflare DNS)
- **Tunnel:** Cloudflare Tunnel (ID: a822eac2-2e80-4ec9-8ebd-40b8d678b702)
- **Registry:** GHCR (ghcr.io/haunguyendev/portfolio-v2)
- **Monitoring:** Portainer CE (portfolio-portainer.haunguyendev.xyz)

### Live URLs
| Service | URL |
|---------|-----|
| Web | https://portfolio.haunguyendev.xyz |
| API | https://portfolio-api.haunguyendev.xyz |
| SSH | deploy.haunguyendev.xyz (via cloudflared proxy) |
| Portainer | https://portfolio-portainer.haunguyendev.xyz |

### Deploy Flow
```
Push to main → GH Actions build Docker images → Push GHCR
  → SSH via Cloudflare Tunnel → docker compose pull/up → Live
```

### Server Files
- `/opt/portfolio/docker-compose.prod.yml` — Production stack
- `/opt/portfolio/.env` — Secrets (NOT in git)
- `/etc/cloudflared/config.yml` — Tunnel config

## Design Direction
- **Style:** Editorial minimalist, light mode first
- **Theme:** shadcn/ui default palette (neutral/zinc) + gradient accents (orange→red→blue)
- **Typography:** shadcn/ui defaults (Inter/Geist)
- **Hero:** Split layout — text left, personal photo right
- **Animation:** Subtle only — hover effects, page transitions. NO parallax, NO 3D.
- **Layout:** Max-width 1200px, generous whitespace, responsive

## Pages (MVP — Phase 1)
1. **Home** — Split hero + Featured Projects grid + Brief About + Blog placeholder
2. **Projects** — Full project list with tech tags
3. **About** — Bio, skills badges, experience timeline
4. **Blog** — "Coming soon" placeholder (Phase 2)

## Project Structure (Expected)
```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout (header + footer)
│   ├── page.tsx          # Homepage
│   ├── projects/         # Projects page
│   ├── about/            # About page
│   └── blog/             # Blog placeholder
├── components/           # Reusable UI components
│   ├── layout/           # Header, Footer, Navigation
│   ├── home/             # Hero, FeaturedProjects
│   ├── projects/         # ProjectCard, ProjectGrid
│   ├── about/            # Bio, SkillBadges, Timeline
│   └── ui/               # shadcn/ui components
├── content/              # Static content (JSON/MDX)
│   ├── projects.json     # Project data
│   └── posts/            # Blog posts (Phase 2)
├── lib/                  # Utility functions
└── styles/               # Global styles
```

## Conventions
- **File naming:** kebab-case for all files (e.g., `project-card.tsx`, `hero-section.tsx`)
- **Components:** One component per file, max 200 lines
- **Styling:** Tailwind utility classes + shadcn/ui components. NO custom CSS unless absolutely needed.
- **Content:** Store project data in `/content/projects.json` — NOT hardcoded in components
- **Exports:** Named exports only (no default exports except pages)
- **Types:** Co-locate types with their component. Shared types in `src/types/`

## Skill Activation Guide
Activate these skills as needed during development:

### Always (every feature/fix)
- `/ck:cook` — Before implementing ANY feature
- `/ck:fix` — Before fixing ANY bug
- `/ck:code-review` — After implementing features

### Core Development
- `/ck:frontend-development` — React/TypeScript components
- `/ck:ui-styling` — shadcn/ui + Tailwind styling
- `/ck:react-best-practices` — Performance optimization
- `/ck:web-frameworks` — Next.js App Router patterns

### Support
- `/ck:docs-seeker` — Latest library docs lookup
- `/ck:plan` — Phase planning
- `/ck:test` — Testing after implementation
- `/ck:git` — Commits and PRs
- `/ck:deploy` — Docker/server deployment

## Development Phases
- **Phase 1:** Portfolio — Home, Projects, About pages. Static content. ✅
- **Phase 2:** Blog — MDX integration, blog list + detail pages. ✅
- **Phase 3:** Polish — SEO, dark mode, performance. ✅
- **Phase 4A:** CMS — NestJS API, admin dashboard, image upload (MinIO). ✅
- **Phase 4B:** CI/CD — Docker, GitHub Actions, Cloudflare Tunnel, self-hosted deploy. ✅
- **Phase 5:** Advanced — Comments, likes, analytics, email notifications.

## Post-Implementation Protocol
After each `/ck:cook` completes a plan/phase:
1. **Update docs** — Sync `docs/` files to reflect current state (architecture, roadmap progress, code standards changes)
2. **Track bugs via GitHub Issues** — Use `gh issue create` for any known bugs or TODOs discovered during implementation
3. **Update roadmap** — Mark completed tasks in `docs/project-roadmap.md`, update phase status
4. **Label issues** — Use labels: `bug`, `enhancement`, `phase-1`, `phase-2`, etc. via `gh issue create --label "bug,phase-1"`
5. **Link issues to plan** — Reference plan phase in issue body for traceability

## Rules
- YAGNI / KISS / DRY — no over-engineering
- Use shadcn/ui defaults — don't reinvent components
- Content in data files, not hardcoded in JSX
- Gradient accents for personality, but keep minimal overall
- NEVER commit .env files or secrets to git
- SSH key for deploy: `~/.ssh/github-deploy` (ed25519)
- Test Docker build locally before pushing: `docker build -f apps/web/Dockerfile -t portfolio-web .`
