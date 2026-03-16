# Phase 1: Project Setup & Configuration

## Context Links
- [Project Overview](../../docs/project-overview-pdr.md)
- [Code Standards](../../docs/code-standards.md)
- [Codebase Summary](../../docs/codebase-summary.md)
- [Design Guidelines](../../docs/design-guidelines.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | HIGH |
| Status | Pending |
| Effort | ~2h |
| Description | Initialize Next.js 15 project, configure TypeScript strict mode, install Tailwind + shadcn/ui, set up directory structure, ESLint + Prettier |

## Key Insights

- Next.js 15 uses App Router by default; `create-next-app` scaffolds the structure
- shadcn/ui uses `npx shadcn@latest init` (not npm install); it copies component files into `src/components/ui/`
- Tailwind CSS v4 is current but shadcn/ui may require v3 — check compatibility during install
- `clsx` + `tailwind-merge` are installed automatically by shadcn/ui init (provides `cn()` utility)
- TypeScript strict mode must be explicitly set in `tsconfig.json`

## Requirements

### Functional
- Working Next.js 15 dev server (`pnpm dev` → `localhost:3000`)
- TypeScript compiling without errors (`pnpm tsc --noEmit`)
- Tailwind CSS processing utility classes
- shadcn/ui initialized with default theme (zinc/neutral)
- ESLint + Prettier configured and passing

### Non-Functional
- pnpm as package manager (not npm/yarn)
- Path alias `@/*` → `./src/*`
- Strict TypeScript (all strict flags enabled)

## Related Code Files

### Files to Create
- `package.json` — via `create-next-app`
- `tsconfig.json` — via `create-next-app`, then modify for strict
- `next.config.ts` — via `create-next-app`, then customize
- `tailwind.config.ts` — via `create-next-app` or shadcn init
- `postcss.config.mjs` — via `create-next-app`
- `src/app/layout.tsx` — scaffolded root layout (will be enhanced in Phase 2)
- `src/app/page.tsx` — scaffolded home page (will be replaced in Phase 4)
- `src/styles/globals.css` — Tailwind directives + custom layer
- `src/lib/utils.ts` — `cn()` utility (created by shadcn init)
- `src/lib/constants.ts` — site constants (nav links, social URLs)
- `.env.example` — environment variable template
- `.prettierrc` — Prettier config
- `.eslintrc.json` — ESLint config (or use flat config)
- `components.json` — shadcn/ui configuration (created by init)

### Directories to Create
```
src/
├── app/
│   ├── projects/
│   ├── about/
│   └── blog/
├── components/
│   ├── layout/
│   ├── home/
│   ├── projects/
│   ├── about/
│   ├── common/
│   └── ui/          (created by shadcn init)
├── content/
├── lib/
├── types/
└── styles/
public/
├── images/
│   ├── hero/
│   └── projects/
```

## Implementation Steps

### Step 1: Initialize Next.js 15 Project

```bash
cd /Users/kanenguyen/personal/side-project/porfolio_v2

# Initialize Next.js 15 with TypeScript, Tailwind, App Router, src/ directory
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

**Flags explained:**
- `--typescript` — TypeScript support
- `--tailwind` — Tailwind CSS included
- `--eslint` — ESLint configured
- `--app` — App Router (not Pages)
- `--src-dir` — Use `src/` directory
- `--import-alias "@/*"` — Path alias `@/` → `src/`
- `--use-pnpm` — Use pnpm package manager

> **IMPORTANT:** Since files already exist (README, docs, .gitignore), the CLI may prompt. Run with `--yes` or handle existing files. May need to back up `README.md` and `.gitignore` before running, then restore/merge after.

### Step 2: Configure TypeScript Strict Mode

Edit `tsconfig.json` to ensure strict flags:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step 3: Initialize shadcn/ui

```bash
# Initialize shadcn/ui (select: New York style, Zinc base color, CSS variables: yes)
pnpm dlx shadcn@latest init
```

During init, choose:
- Style: **Default**
- Base color: **Zinc**
- CSS variables: **Yes**
- Components directory: `src/components/ui`
- Utility directory: `src/lib/utils.ts`

This creates:
- `components.json` — shadcn config
- `src/lib/utils.ts` — `cn()` function (clsx + tailwind-merge)
- Updates `globals.css` with CSS variables for theming

### Step 4: Install shadcn/ui Components

```bash
# Install only the components needed for Phase 1
pnpm dlx shadcn@latest add button card badge
```

Components installed to `src/components/ui/`:
- `button.tsx` — Primary/secondary/ghost buttons
- `card.tsx` — Card, CardHeader, CardContent, CardFooter
- `badge.tsx` — Tech/skill badges

### Step 5: Install Additional Dependencies

```bash
# lucide-react for icons
pnpm add lucide-react
```

No other runtime dependencies needed for Phase 1.

### Step 6: Configure next.config.ts

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
```

Keep minimal — YAGNI. Redirects and headers added later if needed.

### Step 7: Configure Global Styles

`src/styles/globals.css` (or `src/app/globals.css` depending on scaffolding):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* shadcn/ui CSS variables are injected here by init */

@layer base {
  body {
    @apply bg-white text-zinc-700 antialiased;
  }
}

@layer components {
  .gradient-accent {
    @apply bg-gradient-to-r from-orange-500 via-red-500 to-blue-500;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 bg-clip-text text-transparent;
  }

  .container-main {
    @apply max-w-6xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  .section-spacing {
    @apply py-12 md:py-16;
  }
}
```

### Step 8: Create Directory Structure

```bash
# Create all required directories
mkdir -p src/components/{layout,home,projects,about,common}
mkdir -p src/content
mkdir -p src/types
mkdir -p src/styles
mkdir -p public/images/{hero,projects}
mkdir -p src/app/{projects,about,blog}
```

### Step 9: Create Site Constants

`src/lib/constants.ts`:

```typescript
export const SITE_NAME = "Kane Nguyen"
export const SITE_DESCRIPTION = "Software Engineer's Portfolio"
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
] as const

export const SOCIAL_LINKS = {
  github: "https://github.com/kanenguyen",
  linkedin: "https://linkedin.com/in/kanenguyen",
  email: "mailto:kane@example.com",
} as const
```

### Step 10: Create .env.example

```
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Kane's Portfolio
```

### Step 11: Configure Prettier

`.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

```bash
pnpm add -D prettier prettier-plugin-tailwindcss
```

### Step 12: Verify Setup

```bash
# Type check
pnpm tsc --noEmit

# Dev server
pnpm dev

# Build (quick sanity check)
pnpm build
```

## Todo List

- [ ] 1.1 Back up existing files (README.md, .gitignore, docs/, CLAUDE.md)
- [ ] 1.2 Run `create-next-app` to scaffold project
- [ ] 1.3 Restore backed-up files, merge .gitignore
- [ ] 1.4 Configure TypeScript strict mode in tsconfig.json
- [ ] 1.5 Initialize shadcn/ui (`shadcn init`)
- [ ] 1.6 Install shadcn/ui components (button, card, badge)
- [ ] 1.7 Install lucide-react
- [ ] 1.8 Configure next.config.ts (minimal)
- [ ] 1.9 Set up globals.css with gradient utility classes
- [ ] 1.10 Create directory structure (components/, content/, types/, public/images/)
- [ ] 1.11 Create `src/lib/constants.ts` with nav links and social links
- [ ] 1.12 Create `.env.example`
- [ ] 1.13 Configure Prettier + install plugin
- [ ] 1.14 Verify: `pnpm tsc --noEmit` passes
- [ ] 1.15 Verify: `pnpm dev` serves localhost:3000
- [ ] 1.16 Verify: `pnpm build` succeeds

## Success Criteria

- `pnpm dev` starts without errors on localhost:3000
- `pnpm build` completes without errors
- `pnpm tsc --noEmit` returns zero errors
- shadcn/ui components importable from `@/components/ui/`
- `cn()` utility works from `@/lib/utils`
- Directory structure matches codebase-summary.md
- Path alias `@/` resolves correctly

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| `create-next-app` conflicts with existing files | Medium | High | Back up files before running, restore after |
| shadcn/ui incompatible with Tailwind v4 | Medium | Medium | Check shadcn docs; pin Tailwind v3 if needed |
| pnpm version mismatch | Low | Low | Use `corepack enable` to pin pnpm version |

## Security Considerations

- `.env.local` excluded via `.gitignore`
- No secrets needed for Phase 1
- `NEXT_PUBLIC_*` prefix only for client-safe variables

## Next Steps

After setup verified, proceed to **Phase 2: Layout Components** to build Header, Footer, Navigation.
