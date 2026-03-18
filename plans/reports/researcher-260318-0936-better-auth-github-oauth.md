# Better Auth GitHub OAuth Technical Research

**Date:** 2026-03-18
**Topic:** Better Auth's GitHub social provider implementation, OAuth flow, configuration, session management
**Audience:** Developers new to OAuth/auth systems

---

## Executive Summary

Better Auth is a comprehensive authentication framework for TypeScript that abstracts away OAuth complexity. For GitHub, it handles the entire OAuth 2.0 dance—state validation, PKCE, token exchange, session creation—automatically. You configure it with credentials and provide a callback URL; Better Auth does the rest.

Key insight: Better Auth uses **cookie-based sessions**, not access tokens. After GitHub OAuth completes, a session cookie is issued, similar to traditional form-based login.

---

## 1. GitHub OAuth Provider Architecture

### What is "Social Auth" in Better Auth?

Social auth = delegating user verification to a third party (GitHub). Instead of storing passwords, you redirect users to GitHub, GitHub verifies them, then redirects back with proof of identity.

### Better Auth's GitHub Provider

Better Auth supports GitHub as a **social provider** with support for both:
- **GitHub OAuth Apps** (simpler, standard OAuth 2.0)
- **GitHub Apps** (more advanced, requires additional email scope configuration)

For most projects, use **OAuth Apps**.

---

## 2. OAuth Flow: Step-by-Step Walkthrough

Understanding the flow is essential to troubleshoot later.

### Step 1: User Clicks "Login with GitHub"

```
User clicks button → Client calls authClient.signIn.social({ provider: "github" })
```

The client library triggers a redirect to GitHub's authorization endpoint.

### Step 2: Better Auth Prepares Authorization URL

Before redirecting, Better Auth:

1. **Generates state parameter** — A random string to prevent CSRF attacks (session fixation)
2. **Generates code verifier** — For PKCE (Proof Key for Code Exchange), protects against authorization code interception
3. **Stores both in database** — Under a temporary "OAuth state" record with expiration
4. **Constructs GitHub authorization URL** with:
   - `client_id` (from your config)
   - `redirect_uri` (http://localhost:3000/api/auth/callback/github)
   - `scope` (openid, profile, email — GitHub doesn't use "openid" but respects profile + email)
   - `state` (the random string)
   - `code_challenge` (derived from code verifier for PKCE)

### Step 3: Browser Redirects to GitHub

```
Browser redirected to:
https://github.com/login/oauth/authorize?
  client_id=YOUR_CLIENT_ID
  redirect_uri=http://localhost:3000/api/auth/callback/github
  scope=user:email
  state=abc123xyz
  code_challenge=xxx
```

User logs into GitHub (if not already) and grants permission to your app.

### Step 4: GitHub Redirects Back with Code

```
GitHub redirected to:
http://localhost:3000/api/auth/callback/github?
  code=gho_16C7e42F292c6912E7...
  state=abc123xyz
```

The `code` is a short-lived authorization code (expires in 10 minutes). The `state` must match what we sent.

### Step 5: Better Auth Backend Validates & Exchanges Code

On the `/api/auth/callback/github` route (handled by Better Auth automatically):

1. **Validate state** — Check that returned state matches stored state (prevents CSRF)
2. **Validate code challenge** — Verify PKCE code_verifier matches code_challenge (prevents code interception)
3. **Exchange code for tokens** — Backend-to-backend HTTP call:
   ```
   POST https://github.com/login/oauth/access_token
   client_id=YOUR_CLIENT_ID
   client_secret=YOUR_CLIENT_SECRET  ← only backend knows this
   code=gho_16C7e42F292c6912E7...
   code_verifier=xxx
   ```

4. **GitHub responds with access token**:
   ```
   {
     "access_token": "ghu_16C7e42F292c6912E7...",
     "token_type": "bearer",
     "scope": "user:email"
   }
   ```
   **Note:** GitHub does NOT issue refresh tokens for OAuth apps; access tokens are valid indefinitely unless revoked or unused for 1 year.

### Step 6: Fetch User Profile from GitHub API

Using the access token, Better Auth calls GitHub's user endpoint:

```
GET https://api.github.com/user
Authorization: Bearer ghu_16C7e42F292c6912E7...
```

GitHub returns user data:
```json
{
  "id": 12345,
  "login": "yourname",
  "avatar_url": "...",
  "email": "your@email.com"  ← requires user:email scope
}
```

### Step 7: Create or Link User Account

Better Auth checks: Does a user with this GitHub ID (12345) already exist?

- **New user?** Create new user record + account record
- **Existing user?** Link GitHub account to existing user
- **Email already used?** Depends on config (default: fail with error)

### Step 8: Create Session Cookie

After account is ready:

1. Generate session token (or use compact/JWT encoding)
2. Store in `sessions` table
3. Set signed/encrypted session cookie (defaults to 7-day expiration)
4. Redirect user to success callback URL (e.g., `/dashboard`)

### Step 9: User is Logged In

On subsequent requests, the session cookie is sent automatically. Better Auth validates it and returns user data.

---

## 3. GitHub OAuth App Setup (Developer Settings)

### Required Steps

1. **Go to GitHub Settings > Developer settings > OAuth Apps** (or create GitHub App)
2. **Click "New OAuth App"**
3. **Fill form:**
   - **Application name:** Your app name
   - **Homepage URL:** http://localhost:3000 (or your domain)
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github` ← exact match required
   - **Description:** (optional)

4. **Copy credentials:**
   - Client ID (public, safe to include in frontend)
   - Client Secret (keep secret, backend only)

5. **Store in `.env.local`:**
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### Important: Email Scope

For **GitHub OAuth Apps**: Email scope works automatically with `user:email`.

For **GitHub Apps** (advanced): After creating the app, go to:
- **Permissions and events** > **Account permissions** > **Email addresses**
- Set to **"Read-only"**
- Save changes

Without email scope, you'll get `"email_not_found"` error.

### Redirect URL Flexibility (Production)

For production, change to your real domain:
```
https://yourdomain.com/api/auth/callback/github
```

GitHub validates redirect URLs exactly—no wildcards, no HTTP→HTTPS mismatch.

---

## 4. Better Auth Configuration for GitHub

### Server-Side Setup

```typescript
// src/auth.ts
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    type: "postgres", // or sqlite, mysql, mongodb
    url: process.env.DATABASE_URL!,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      // optional: customize scopes
      // scopes: ["user:email", "public_repo"],
    },
  },
  // optional: customize redirect URLs per user type
  // redirects: {
  //   onSignOut: "/",
  //   onError: "/auth/error",
  //   onSuccess: "/dashboard",
  // },
})
```

### Required Database Tables

Better Auth creates these automatically (or via CLI):

```
users (id, email, name, image, createdAt, updatedAt)
accounts (id, userId, providerId, providerAccountId, accessToken, refreshToken, scope, expiresAt)
sessions (id, userId, token, expiresAt, createdAt, updatedAt, ipAddress, userAgent)
verifications (id, identifier, value, expiresAt, createdAt, updatedAt)
```

Key insight: GitHub accounts link via the `accounts` table, not replacing the user. One user can have multiple social accounts.

### Client-Side Setup

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient()
```

### Signing In with GitHub

```typescript
// In a React component
import { authClient } from "@/lib/auth-client"

export function SignInWithGithub() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",      // redirect here on success
      errorCallbackURL: "/auth/error", // redirect here on error
    })
  }

  return <button onClick={handleSignIn}>Sign in with GitHub</button>
}
```

---

## 5. Session & Token Management After GitHub Login

### What Happens After OAuth Completes

1. **No access token stored in cookies** — Better Auth doesn't expose GitHub's access token to frontend
2. **Session cookie issued** — Contains encrypted session ID + user info
3. **Session validity** — 7 days (configurable)
4. **Session refresh** — Auto-refreshed on use if `updateAge` threshold reached

### Accessing User Data

```typescript
// Server-side (RSC or API route)
import { auth } from "@/auth"

export default async function Dashboard() {
  const session = await auth.getSession()
  // session = { user: { id, email, name, ... }, expires, ... }
}
```

```typescript
// Client-side
import { useSession } from "@/lib/auth-client"

export function Dashboard() {
  const { data: session } = useSession()
  // null until loaded, then { user: {...}, expires, ... }
}
```

### Accessing GitHub Access Token (If Needed)

If you need to call GitHub API on behalf of the user:

```typescript
const { accessToken } = await authClient.getAccessToken({
  providerId: "github",
})
// accessToken = "ghu_16C7e42F292c6912E7..."
```

Better Auth stores the token in the `accounts` table and handles expiration logic (though GitHub tokens don't expire).

### Session Expiration Behavior

- **Default expiry:** 7 days
- **Automatic refresh:** When `updateAge` (default: 24 hours) is reached and session is used, expiration is bumped forward 7 more days
- **Manual logout:** Destroys session immediately
- **Revoke all sessions:** Owner can revoke all sessions at once (useful for account security)

---

## 6. Database Schema (Simplified)

### Users Table

```sql
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  image TEXT,
  emailVerified BOOLEAN,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Accounts Table (Stores OAuth Credentials)

```sql
CREATE TABLE "account" (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES "user"(id),
  providerId TEXT,  -- "github"
  providerAccountId TEXT,  -- GitHub user ID (12345)
  accessToken TEXT,  -- GitHub access token
  refreshToken TEXT,  -- NULL for GitHub
  accessTokenExpiresAt BIGINT,  -- NULL for GitHub
  scope TEXT,  -- "user:email,public_repo"
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### Sessions Table

```sql
CREATE TABLE "session" (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES "user"(id),
  token TEXT,  -- Session token (encrypted)
  expiresAt BIGINT,  -- 7 days from creation
  createdAt TIMESTAMP,
  ipAddress TEXT,  -- Optional, for security
  userAgent TEXT  -- Optional, for security
);
```

### Relationship

```
GitHub user (ID 12345)
    ↓
account.providerAccountId = "12345"
account.providerId = "github"
account.userId → user.id
    ↓
user (name, email, etc.)
    ↓
sessions (1 or many per user)
```

---

## 7. Common Gotchas & Troubleshooting

### Gotcha 1: Missing Email Scope

**Error:** `"email_not_found"` during signup

**Cause:** GitHub app not configured to read email

**Fix:**
- GitHub OAuth Apps: scopes default to `user:email`
- GitHub Apps: explicitly enable "Email addresses" → "Read-only" in Permissions

### Gotcha 2: Redirect URL Mismatch

**Error:** `"redirect_uri_mismatch"` from GitHub

**Cause:** Callback URL in Better Auth config doesn't match GitHub Developer Settings

**Fix:**
- Ensure `http://localhost:3000/api/auth/callback/github` in local dev
- Ensure `https://yourdomain.com/api/auth/callback/github` in production
- No trailing slash, exact match required

### Gotcha 3: Missing Client Secret in Frontend

**Error:** Token exchange fails silently

**Cause:** Trying to exchange auth code from frontend (which has no client secret)

**Fix:**
- Better Auth handles this automatically on backend via `/api/auth/callback/github`
- Never expose `GITHUB_CLIENT_SECRET` in frontend

### Gotcha 4: GitHub Access Tokens Don't Refresh

**Error:** After 1 year of non-use, token becomes invalid

**Cause:** GitHub doesn't issue refresh tokens; access tokens are indefinite unless revoked/unused

**Fix:**
- Don't rely on token validity for session management
- Use Better Auth sessions (not tokens) for user auth
- If you call GitHub API, handle 401 gracefully and re-link account if needed

### Gotcha 5: Database Not Initialized

**Error:** `"relations not found"` or table doesn't exist

**Cause:** Forgot to run migrations

**Fix:**
```bash
# Better Auth CLI generates migration
npx better-auth migrate
```

Or use Prisma/DrizzleORM migrations for schema management.

### Gotcha 6: Email Already Exists (Account Linking)

**Error:** User tries to sign up with GitHub email that's already in system

**Cause:** Email collision between GitHub account and existing user

**Fix:**
- Default: Better Auth prevents this (returns error)
- Option 1: Auto-link if email matches (set config `allowAccontLinking: true`)
- Option 2: Manual linking flow (user provides password to confirm account)

---

## 8. Security Considerations

### PKCE (Proof Key for Code Exchange)

Better Auth auto-enables PKCE for GitHub OAuth. This protects against authorization code interception on mobile (where HTTP can be sniffed).

Flow:
1. Client generates `code_verifier` (random 128-char string)
2. Client computes `code_challenge = SHA256(code_verifier)`
3. Client sends `code_challenge` with authorization request
4. Client receives `code` from GitHub
5. Backend exchanges `code` + `code_verifier` for token (GitHub validates `code_challenge == SHA256(code_verifier)`)

This prevents attackers who intercept the `code` from exchanging it (they'd also need the `code_verifier`).

### State Validation

Better Auth stores the `state` parameter in database and validates it on callback. Prevents CSRF attacks (attackers can't forge valid state).

### Secure Cookie Flags

Session cookies are:
- `HttpOnly` — JavaScript can't access (prevents XSS token theft)
- `Secure` — HTTPS only (prevents MITM)
- `SameSite=Lax` (default) — Not sent cross-site (prevents CSRF via cookies)

### Client Secret Protection

`GITHUB_CLIENT_SECRET` must never be exposed to frontend. Better Auth enforces this by handling token exchange server-side only.

---

## 9. Summary: OAuth vs Sessions

| Aspect | OAuth Token | Better Auth Session |
|--------|------------|-------------------|
| **Lifetime** | GitHub: indefinite (unless revoked/unused 1yr) | 7 days (auto-refresh) |
| **Used for** | Calling GitHub API on user's behalf | Verifying user identity |
| **Stored** | `accounts` table | `sessions` table + cookie |
| **Sent to client** | Not in cookie (only via `getAccessToken()`) | As encrypted cookie |
| **Refresh** | Manual re-linking if expired | Automatic on use |
| **Privacy** | Delegates auth to GitHub | First-party auth |

**Key insight:** Better Auth's sessions abstract away the OAuth complexity. You don't need to think about GitHub tokens for normal app auth—sessions handle it like traditional login.

---

## 10. Recommended Learning Path

1. **Understand OAuth conceptually** — Read this document's flow section
2. **Create GitHub OAuth App** — Follow section 3
3. **Configure Better Auth** — Follow section 4
4. **Test locally** — Use `npm run dev`, click "Sign in with GitHub"
5. **Debug with browser DevTools** — Inspect Network tab to see redirects
6. **Read Better Auth docs on plugins** — Account linking, email verification, custom fields

---

## Unresolved Questions

- How to implement custom GitHub scopes for additional permissions (e.g., `public_repo`)?
- How to handle account merging if user signs up with email, then later tries GitHub with same email?
- Can Better Auth auto-populate user profile fields from GitHub (avatar, bio)?
- How to revoke a user's GitHub connection without signing them out?

---

## Sources

- [GitHub | Better Auth](https://better-auth.com/docs/authentication/github)
- [OAuth | Better Auth](https://better-auth.com/docs/concepts/oauth)
- [Session Management | Better Auth](https://better-auth.com/docs/concepts/session-management)
- [User & Accounts | Better Auth](https://better-auth.com/docs/concepts/users-accounts)
- [Database | Better Auth](https://better-auth.com/docs/concepts/database)
