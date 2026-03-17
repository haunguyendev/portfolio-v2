# Phase 3: Auth Integration

## Overview
- **Priority:** HIGH
- **Status:** Complete
- **Effort:** 3h
- **Blocked by:** Phase 2 (Prisma User model needed)

Better Auth on Next.js side handles login/registration. NestJS has a JWT Guard that verifies tokens from Better Auth. Admin routes protected by middleware.

## Auth Flow

```
Browser → /admin/login
  ↓
Better Auth (Next.js API route)
  ↓ issues session + JWT
Browser stores cookie/token
  ↓
Admin page → GraphQL request + Authorization: Bearer <jwt>
  ↓
NestJS JwtGuard verifies token signature
  ↓
Protected resolver executes
```

## Implementation Steps

### 1. Install Better Auth in apps/web
- `pnpm --filter web add better-auth`
- Create `apps/web/src/lib/auth.ts` — Better Auth server config
- Create `apps/web/src/lib/auth-client.ts` — Better Auth client
- Configure: email/password provider, JWT secret, session strategy
- Database adapter: Prisma (via `@portfolio/prisma`)

### 2. Auth API routes in Next.js
- Create `apps/web/src/app/api/auth/[...all]/route.ts` — Better Auth catch-all handler
- Handles: login, register, logout, session, token refresh

### 3. Admin login page
- Create `apps/web/src/app/(admin)/admin/login/page.tsx`
- Email + password form using shadcn/ui (Input, Button, Card)
- Call Better Auth client `signIn.email()` on submit
- Redirect to `/admin` on success

### 4. Admin auth middleware
- Create `apps/web/src/middleware.ts` — Next.js middleware
- Protect `/admin/*` routes (except `/admin/login`)
- Check Better Auth session, redirect to login if unauthenticated

### 5. NestJS JWT Guard
- `pnpm --filter api add @nestjs/jwt @nestjs/passport passport passport-jwt`
- Create `apps/api/src/auth/jwt.strategy.ts` — verify JWT with same secret as Better Auth
- Create `apps/api/src/auth/jwt-auth.guard.ts` — NestJS Guard
- Create `apps/api/src/auth/auth.module.ts` — register strategy + guard
- Create `apps/api/src/auth/decorators/current-user.decorator.ts` — extract user from request

### 6. User sync
- On first JWT verification, if user not in DB → create from JWT claims
- Or: Better Auth writes directly to same PostgreSQL (shared DB) → NestJS reads user table

### 7. CORS configuration
- NestJS: allow `localhost:3000` (dev) + Vercel domain (prod)
- Credentials: true (for cookies if needed)

## Related Code Files
- `apps/web/src/lib/auth.ts` (NEW)
- `apps/web/src/lib/auth-client.ts` (NEW)
- `apps/web/src/app/api/auth/[...all]/route.ts` (NEW)
- `apps/web/src/app/(admin)/admin/login/page.tsx` (NEW)
- `apps/web/src/middleware.ts` (NEW)
- `apps/api/src/auth/` (NEW — module, strategy, guard, decorator)

## Todo List
- [x] Install Better Auth in apps/web
- [x] Create auth server + client config
- [x] Create auth API catch-all route
- [x] Create admin login page (shadcn/ui form)
- [x] Create Next.js middleware for /admin/* protection
- [x] Install passport/jwt packages in apps/api
- [x] Create JWT strategy + guard in NestJS
- [x] Create current-user decorator
- [x] Configure CORS in NestJS
- [x] Test: login → get token → call protected API endpoint
- [x] Test: unauthenticated request → 401

## Success Criteria
- Admin can login via `/admin/login`
- Unauthenticated users redirected to login
- NestJS API rejects requests without valid JWT (401)
- NestJS API accepts requests with valid JWT
- User record exists in DB after first login

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Better Auth JWT format incompatible with NestJS | MED | Inspect token structure, adjust strategy accordingly |
| Shared DB vs separate user sync | LOW | Better Auth Prisma adapter writes to same DB — NestJS reads directly |
| CORS issues in dev | LOW | Explicit origin config, credentials: true |
