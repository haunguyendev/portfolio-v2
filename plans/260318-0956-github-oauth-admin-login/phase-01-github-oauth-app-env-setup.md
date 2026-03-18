# Phase 1: Create GitHub OAuth App + Env Vars

## Context

- [OAuth Flow Diagram](../visuals/github-oauth-login-flow-better-auth.md)
- [Better Auth GitHub Docs](https://better-auth.com/docs/authentication/github)

## Overview

- **Priority:** P1
- **Status:** Partial (code done, manual pending)
- **Effort:** 15min
- Manual setup: create GitHub OAuth App, add env vars locally + server.

## Key Insights

- Need 2 separate OAuth Apps: localhost (dev) and production (different callback URLs)
- GitHub OAuth Apps auto-include `user:email` scope — no extra config needed
- Callback URL must be exact match: no trailing slash, no HTTP/HTTPS mismatch

## Requirements

- GitHub account with Developer Settings access
- SSH access to production server (`/opt/portfolio/.env`)

## Implementation Steps

### 1. Create GitHub OAuth App (Development)

1. Go to https://github.com/settings/developers → "OAuth Apps" → "New OAuth App"
2. Fill:
   - **Application name:** `Portfolio Admin (Dev)`
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Click "Register application"
4. Copy **Client ID**
5. Click "Generate a new client secret" → Copy **Client Secret**

### 2. Create GitHub OAuth App (Production)

1. Same page → "New OAuth App"
2. Fill:
   - **Application name:** `Portfolio Admin`
   - **Homepage URL:** `https://portfolio.haunguyendev.xyz`
   - **Authorization callback URL:** `https://portfolio.haunguyendev.xyz/api/auth/callback/github`
3. Copy **Client ID** and **Client Secret**

### 3. Update Local `.env`

Add to `.env`:
```bash
# GitHub OAuth (Dev)
GITHUB_CLIENT_ID=<dev-client-id>
GITHUB_CLIENT_SECRET=<dev-client-secret>
```

### 4. Update `.env.example`

Add to `.env.example`:
```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 5. Update Production Server `.env`

SSH to server and add to `/opt/portfolio/.env`:
```bash
# GitHub OAuth (Prod)
GITHUB_CLIENT_ID=<prod-client-id>
GITHUB_CLIENT_SECRET=<prod-client-secret>
```

## Todo List

- [x] Update `.env.example` with placeholder values (DONE)
- [ ] Create dev OAuth App on GitHub (MANUAL — user action)
- [ ] Create prod OAuth App on GitHub (MANUAL — user action)
- [ ] Add `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` to local `.env` (MANUAL — user action)
- [ ] SSH to server, add env vars to `/opt/portfolio/.env` (MANUAL — user action)

## Success Criteria

- [x] `.env.example` updated (DONE)
- [ ] 2 GitHub OAuth Apps created (dev + prod) (MANUAL — pending)
- [ ] Local `.env` has dev credentials (MANUAL — pending)
- [ ] Server `.env` has prod credentials (MANUAL — pending)

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Client Secret leaked | Never commit `.env` — already in `.gitignore` |
| Callback URL mismatch | Double-check exact URL before saving |

## Next Steps

→ Phase 2: Configure Better Auth + update login UI
