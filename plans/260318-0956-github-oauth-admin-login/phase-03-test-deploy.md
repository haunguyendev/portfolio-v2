# Phase 3: Test + Deploy

## Context

- Production: `portfolio.haunguyendev.xyz`
- CI/CD: GitHub Actions → GHCR → SSH deploy
- Server: `/opt/portfolio/.env`

## Overview

- **Priority:** P1
- **Status:** Pending (blocked by Phase 1 manual steps)
- **Effort:** 30min
- Test locally with dev OAuth App, then deploy to production.
- **Blocker:** Phase 1 (manual GitHub OAuth App creation + env var setup) must complete first

## Implementation Steps

### 1. Test Locally

1. Ensure local `.env` has dev `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`
2. Start dev server: `pnpm dev`
3. Navigate to `http://localhost:3000/admin/login`
4. Click "Continue with GitHub" → should redirect to GitHub
5. Authorize → should redirect back to `/admin`
6. Verify session: admin dashboard loads, header shows user info
7. Test rejection: login with different GitHub account → should see "Access denied"

### 2. Test Session Persistence

1. After login, close browser tab
2. Reopen `http://localhost:3000/admin` → should still be logged in (cookie persists)
3. Check admin operations (create/edit post) still work (NestJS validates session)

### 3. Test Logout

1. Click logout in admin header
2. Verify redirect to `/admin/login`
3. Navigate to `/admin` directly → should not be authenticated

### 4. Deploy to Production

1. Ensure server `/opt/portfolio/.env` has prod credentials (Phase 1)
2. Commit + push to main:
   ```bash
   git add -A
   git commit -m "feat(auth): replace email/password with GitHub OAuth login"
   git push origin main
   ```
3. CI/CD triggers: build → GHCR → SSH deploy
4. Verify at `https://portfolio.haunguyendev.xyz/admin/login`

### 5. Verify Production

1. Navigate to `https://portfolio.haunguyendev.xyz/admin/login`
2. Click "Continue with GitHub" → authorize → admin dashboard
3. Verify session works across pages
4. Verify GraphQL mutations still protected (NestJS session-token strategy)

## Todo List

- [ ] Test login flow locally (click → GitHub → /admin)
- [ ] Test unauthorized account rejection
- [ ] Test session persistence (close/reopen browser)
- [ ] Test logout flow
- [ ] Test admin CRUD operations still work after GitHub login
- [ ] Commit + push to main
- [ ] Verify CI/CD deploys successfully
- [ ] Test production login at portfolio.haunguyendev.xyz
- [ ] Verify production admin operations

## Success Criteria

- [ ] Local: GitHub login → admin dashboard works
- [ ] Local: unauthorized account gets rejected
- [ ] Local: session persists across browser close/reopen
- [ ] Local: logout works correctly
- [ ] Production: login + admin operations work
- [ ] NestJS API still validates sessions correctly (CRUD works)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Prod callback URL mismatch | Double-check GitHub OAuth App settings |
| Server .env missing vars | SSH verify before deploy |
| Docker image missing env | Env vars read at runtime, not build time |

## Next Steps

- Monitor production login for first few days
- Consider adding middleware to protect admin routes (future enhancement)
- Update `docs/system-architecture.md` to reflect auth change
