# Brainstorm: GitHub OAuth Login for Admin Dashboard

**Date:** 2026-03-18
**Status:** Agreed
**Visual:** [OAuth Flow Diagram](../visuals/github-oauth-login-flow-better-auth.md)
**Research:** [Better Auth GitHub OAuth](researcher-260318-0936-better-auth-github-oauth.md)

---

## Problem Statement

Admin dashboard currently uses email/password login via Better Auth. Want to replace with GitHub OAuth for:
- Simpler login (no password management)
- Faster access (one click)
- Leverage existing GitHub identity

## Requirements

- **Only GitHub login** — remove email/password
- **Whitelist only Kane's GitHub** — email: `haunt150603@gmail.com`
- **No Prisma migration needed** — Account table already has OAuth fields
- **Production domain:** `portfolio.haunguyendev.xyz`
- **Callback URL:** `https://portfolio.haunguyendev.xyz/api/auth/callback/github`

## Evaluated Approaches

### Approach 1: Better Auth socialProviders + Hook Whitelist (RECOMMENDED)

**How:** Add `socialProviders.github` config + `user.hooks.before.createUser` whitelist check.

**Pros:**
- Minimal code changes (~4 files)
- Better Auth handles entire OAuth flow (PKCE, state, token exchange)
- No DB migration (Account table ready)
- Whitelist hook runs before user creation → unauthorized users never stored

**Cons:**
- Hook API may change in future Better Auth versions
- Single point of failure (if hook misconfigured, anyone can login)

### Approach 2: Pre-create User + Account Linking

**How:** Seed admin user in DB, configure Better Auth to auto-link GitHub account by email match.

**Pros:**
- User already exists in DB, just links GitHub account
- No hook needed

**Cons:**
- Need `accountLinking` config (may have edge cases)
- More complex: seed script changes + config changes
- Email matching can be unreliable if GitHub email changes

### Approach 3: Custom Middleware Check

**How:** Add Next.js middleware that validates user role after OAuth login.

**Pros:**
- Extra security layer
- Can check both email AND role

**Cons:**
- Overkill for single-user admin
- More code to maintain
- Better Auth already handles session validation

## Final Recommendation: Approach 1

`socialProviders.github` + whitelist hook. Simplest, safest, least code.

## Implementation Plan (High Level)

### Step 1: Create GitHub OAuth App
- GitHub Settings → Developer Settings → OAuth Apps → New
- Homepage: `https://portfolio.haunguyendev.xyz`
- Callback: `https://portfolio.haunguyendev.xyz/api/auth/callback/github`
- Copy Client ID + Client Secret

### Step 2: Update Environment Variables
- `.env` + `.env.example`: add `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- Server `/opt/portfolio/.env`: add same 2 vars
- Local dev callback: `http://localhost:3000/api/auth/callback/github`

### Step 3: Update Better Auth Config (`auth.ts`)
- Add `socialProviders.github` with env vars
- Add whitelist hook: reject if email !== `haunt150603@gmail.com`
- Remove `emailAndPassword: { enabled: true }` (optional, can keep as fallback)

### Step 4: Update Login Page
- Replace email/password form with single "Continue with GitHub" button
- Use `signIn.social({ provider: "github", callbackURL: "/admin" })`
- Add error handling for rejected users

### Step 5: Test Locally
- Create GitHub OAuth App for localhost (separate from prod)
- Test login flow: click → GitHub → callback → /admin
- Test rejection: use different GitHub account → should be blocked

### Step 6: Deploy
- Add env vars to server `.env`
- Push code → CI/CD builds + deploys
- Update GitHub OAuth App callback URL for production
- Verify production login works

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Whitelist hook bypass | HIGH | Test with unauthorized account before deploy |
| GitHub OAuth App callback mismatch | MEDIUM | Exact URL match required — double check |
| Email not returned by GitHub | MEDIUM | Ensure `user:email` scope (default for OAuth Apps) |
| Existing admin user conflict | LOW | Better Auth handles account linking by email |

## Success Criteria

- [ ] Login with GitHub works on production
- [ ] Only `haunt150603@gmail.com` can access admin
- [ ] Other GitHub accounts get rejected
- [ ] Session persists (7 days with auto-refresh)
- [ ] NestJS API still validates sessions correctly
- [ ] No Prisma migration needed

## Unresolved Questions

1. Keep email/password as hidden fallback or remove completely?
2. Need separate GitHub OAuth Apps for dev vs prod? (Yes, recommended — different callback URLs)
3. What happens to existing admin user (seeded via email/password)? Account linking needed?
