# Phase 1: Monorepo Migration (Turborepo)

## Overview
- **Priority:** CRITICAL
- **Status:** Complete
- **Effort:** 3h
- **Blocked by:** None

Convert single Next.js project to Turborepo monorepo. Move existing code to `apps/web/`. Site must remain fully functional after migration.

## Key Insights
- Current project is a standalone Next.js 15 app at repo root
- pnpm already used — pnpm workspaces integrate naturally with Turborepo
- Must preserve: Velite config, shadcn/ui, Tailwind, all imports
- Vercel auto-detects Turborepo monorepos

## Architecture

```
BEFORE:                          AFTER:
porfolio_v2/                     porfolio_v2/
├── src/                         ├── apps/
├── public/                      │   └── web/          # ← everything moved here
├── content/                     │       ├── src/
├── next.config.ts               │       ├── public/
├── tailwind.config.ts           │       ├── content/
├── velite.config.ts             │       ├── next.config.ts
├── package.json                 │       ├── velite.config.ts
└── tsconfig.json                │       ├── package.json  # app-specific deps
                                 │       └── tsconfig.json
                                 ├── packages/
                                 │   ├── shared/       # shared types (future)
                                 │   └── prisma/       # prisma schema (Phase 2)
                                 ├── turbo.json
                                 ├── pnpm-workspace.yaml
                                 └── package.json      # root workspace
```

## Implementation Steps

### 1. Create Turborepo structure
- Create `apps/web/` directory
- Create `packages/shared/` with empty `package.json` + `index.ts`
- Create root `pnpm-workspace.yaml`:
  ```yaml
  packages:
    - "apps/*"
    - "packages/*"
  ```
- Create root `turbo.json`:
  ```json
  {
    "$schema": "https://turbo.build/schema.json",
    "tasks": {
      "build": { "dependsOn": ["^build"], "outputs": [".next/**", "!.next/cache/**", ".velite/**"] },
      "dev": { "cache": false, "persistent": true },
      "lint": { "dependsOn": ["^build"] }
    }
  }
  ```
- Create root `package.json` (workspace root, no deps except turbo)

### 2. Move existing code to apps/web
- Move all src/, public/, content/, config files to `apps/web/`
- Update `apps/web/package.json` — keep all current dependencies
- Update `apps/web/tsconfig.json` — adjust paths if needed
- Update `.gitignore` at root level

### 3. Fix import paths
- `@/` alias should still resolve to `apps/web/src/`
- Verify `velite.config.ts` paths work from `apps/web/`
- Verify `tailwind.config.ts` content paths

### 4. Install Turborepo
- `pnpm add -Dw turbo`
- Add root scripts: `"dev": "turbo dev"`, `"build": "turbo build"`, `"lint": "turbo lint"`

### 5. Verify everything works
- `pnpm install` — workspace resolution
- `pnpm dev` — Next.js starts from apps/web
- `pnpm build` — clean build, Velite + Next.js
- `pnpm lint` — 0 errors
- All pages render correctly

## Todo List
- [x] Create `apps/web/` directory structure
- [x] Create `packages/shared/` placeholder
- [x] Create root `pnpm-workspace.yaml`
- [x] Create root `turbo.json`
- [x] Create root `package.json`
- [x] Move all source code to `apps/web/`
- [x] Update `apps/web/package.json`
- [x] Update tsconfig paths
- [x] Install Turborepo at root
- [x] Verify `pnpm install` resolves
- [x] Verify `pnpm dev` works
- [x] Verify `pnpm build` passes
- [x] Verify `pnpm lint` passes

## Success Criteria
- `pnpm dev` starts Next.js from `apps/web/`
- `pnpm build` produces clean build with all routes
- All existing pages render identically
- Velite MDX processing works
- No import path errors

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Import paths break | HIGH | Test `@/` alias resolution immediately after move |
| Velite config paths | MED | Velite uses relative paths — adjust in config |
| Vercel deploy breaks | MED | Test with `vercel build` locally before push |
| shadcn/ui paths | LOW | shadcn components use `@/` which resolves the same |
