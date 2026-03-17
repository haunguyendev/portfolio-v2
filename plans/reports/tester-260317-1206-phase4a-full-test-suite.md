# Test Report: Phase 4A Full Test Suite
**Date:** 2026-03-17
**Tester:** tester agent
**Branch:** feat/phase-4a-cms

---

## Test Results Overview

| Category | Tests Run | Passed | Failed |
|---|---|---|---|
| Build | 4 packages | 4 | 0 |
| TypeScript | 2 apps | 2 | 0 |
| Lint | 4 packages | 2 | 2 |
| API Endpoints | 8 | 7 | 1 |
| Frontend Pages | 8 | 8 | 0 |
| GraphQL Queries | 4 | 4 | 0 |
| Auth/Security | 2 | 1 | 1 |
| Integration | 2 | 2 | 0 |

---

## Build Status: PASS

`pnpm build` → 4/4 packages successful (10.7s)

- `@portfolio/shared`: cached
- `@portfolio/prisma`: prisma generate OK (deprecation warning for `package.json#prisma` config — minor, will be removed in Prisma 7)
- `api`: `nest build` OK
- `@portfolio/web`: Next.js 16 build OK, 25 routes generated

**Warnings (non-blocking):**
- `BetterAuthError: You are using the default secret` — error logged at build time but doesn't fail build. Need `BETTER_AUTH_SECRET` env in prod.
- Turbo: `no output files found for @portfolio/prisma#build` — outputs key missing in turbo.json (minor config issue)

---

## TypeScript: PASS

- `apps/api`: `tsc --noEmit` → 0 errors
- `apps/web`: `tsc --noEmit` → 0 errors

---

## Lint: FAIL (2 issues)

### Issue 1: Web — JSX in try/catch (6 errors)
**Rule:** `react-hooks/error-boundaries`
**Severity:** Error (blocks lint)

Files:
- `apps/web/src/app/(admin)/admin/posts/[id]/edit/page.tsx` (lines 44-53)
- `apps/web/src/app/(admin)/admin/projects/[id]/edit/page.tsx` (lines 32-36)

**Fix:** Move `return (...)` outside the try block. Keep try/catch only around the `gqlClient.request()` call.

### Issue 2: API — Missing ESLint config
**Severity:** Error (blocks lint)

`apps/api` has no `eslint.config.mjs` but `"lint": "eslint src --ext .ts"` uses ESLint v8 syntax with ESLint v9 installed.

**Fix options:**
- Add `apps/api/eslint.config.mjs` with NestJS-appropriate rules
- OR update lint script to `eslint src` (remove deprecated `--ext` flag) + add config

---

## Backend API (port 3001): MOSTLY PASS

### Setup Note
API requires env vars passed explicitly — no `.env` file in `apps/api/`. Root `.env` is not auto-loaded. Must use:
- `turbo dev` (which passes env via turbo.json `api#dev.env` block)
- OR export env vars before running `pnpm --filter api start`
- **Recommendation:** Add `apps/api/.env` symlink or dotenv loading in `main.ts`

### Missing Package (FIXED)
`@as-integrations/express5` was missing — installed during testing. This package must be added to `apps/api/package.json` dependencies.

| Test | Result | Detail |
|---|---|---|
| Health `GET /api/health` | PASS | `{"status":"ok","timestamp":"..."}` |
| GraphQL POST accessible | PASS | Introspection + queries work |
| GraphQL GET /graphql | NOTE | Returns 400 — Apollo v5 no longer serves HTML playground by default via GET. Not a bug. |
| `{ posts { id title slug type } }` | PASS | 6 seeded posts returned |
| `{ projects { id title slug } }` | PASS | 9 seeded projects returned |
| `{ categories { id name slug } }` | NOTE | Empty array — no categories in seed data |
| `{ tags { id name slug } }` | PASS | 6 tags returned |
| CORS headers | PASS | `Access-Control-Allow-Origin: http://localhost:3000` |

### Auth Guard Issue (FAIL)
Mutation without JWT returns `INTERNAL_SERVER_ERROR` instead of 401:
```
"Cannot read properties of undefined (reading 'logIn')"
```
**Root cause:** `@nestjs/passport` AuthGuard calls `req.logIn()` which doesn't exist on GraphQL context requests. NestJS + Passport requires GqlExecutionContext to extract HTTP request.

**Fix needed in `jwt-auth.guard.ts`:**
```ts
import { GqlExecutionContext } from '@nestjs/graphql'
import { ExecutionContext } from '@nestjs/common'

export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }
}
```

---

## Frontend Pages (port 3000): PASS

| Route | Status | Notes |
|---|---|---|
| `GET /` | 200 PASS | Homepage renders |
| `GET /blog` | 200 PASS | Shows API data (seeded posts) |
| `GET /diary` | 200 PASS | Renders |
| `GET /projects` | 200 PASS | Shows API data (seeded projects) |
| `GET /about` | 200 PASS | Renders |
| `GET /admin/login` | 200 PASS | Login page renders |
| `GET /admin` (no auth) | 307 PASS | Redirects to `/admin/login?callbackUrl=%2Fadmin` |
| Blog post detail `/blog/getting-started-nextjs` | 200 PASS | Renders |
| Diary post detail `/diary/first-day-at-promete` | 200 PASS | Renders |

---

## Integration: PASS

- `apps/web` successfully fetches from `apps/api` GraphQL endpoint
- Blog and projects pages display data from PostgreSQL database (not JSON files)
- API client `src/lib/api-client.ts` uses `NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'`

---

## Critical Issues (Blocking)

1. **Lint: JSX in try/catch** (`apps/web` — 2 files, 6 errors) — blocks `pnpm lint`
2. **Lint: Missing ESLint config in `apps/api`** — blocks `pnpm lint`
3. **Auth guard returns 500 instead of 401** — mutations unprotected (error not proper 401)
4. **`@as-integrations/express5` missing from `apps/api/package.json`** — installed manually during test but not in package.json

---

## Non-Critical Issues (Warnings)

- `BetterAuthError: default secret` — must set `BETTER_AUTH_SECRET` before production deploy
- `apps/api` no `.env` file — requires env injection via turbo or shell; document or add dotenv loading
- No categories seeded — categories GraphQL query returns empty array
- Prisma config deprecation warning (`package.json#prisma`) — migrate to `prisma.config.ts` before Prisma 7
- Turbo `outputs` key missing for `@portfolio/prisma#build` — prevents caching

---

## Recommendations

**Immediate (blocks CI):**
1. Fix JSX-in-try/catch in 2 admin edit pages
2. Add `eslint.config.mjs` to `apps/api` + fix lint script
3. Fix `JwtAuthGuard.getRequest()` to use GqlExecutionContext
4. Add `@as-integrations/express5` to `apps/api/package.json` dependencies

**Short-term:**
5. Add dotenv loading to `apps/api/src/main.ts` or create `apps/api/.env` pointing to root
6. Add categories to seed data
7. Set `BETTER_AUTH_SECRET` in all non-dev environments

---

## Unresolved Questions

- Is `/graphql` GET (returning 400) acceptable, or should a playground plugin be configured for dev?
- Should the API auto-load the root `.env` via dotenv in `main.ts`, or is the turbo env injection approach intentional?
- Are categories intentionally left unseeded, or is this an oversight?
