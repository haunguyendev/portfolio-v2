# Code Review: GitHub OAuth Login for Admin Dashboard

**Date:** 2026-03-18
**Reviewer:** code-reviewer
**Scope:** 3 files changed (auth.ts, login page, .env.example)
**Plan:** [GitHub OAuth Login Plan](../260318-0956-github-oauth-admin-login/plan.md)

---

## Overall Assessment

The implementation successfully replaces email/password login with GitHub OAuth using Better Auth's `socialProviders.github` and `signIn.social()`. Code is clean, well-structured, and follows project conventions. However, there is one **critical security gap** that must be addressed before deployment: the whitelist hook only guards first-time user creation, not subsequent logins. Additionally, the admin routes lack server-side session protection entirely (pre-existing issue amplified by this change).

---

## Critical Issues

### 1. CRITICAL: Whitelist hook does NOT protect returning users

**File:** `apps/web/src/lib/auth.ts` (lines 19-29)

The `databaseHooks.user.create.before` hook fires **only when a new user record is created** in the database. Once a user exists (from a prior email/password signup or a previous successful OAuth), subsequent GitHub logins skip this hook entirely and get a valid session.

**Impact:** If any non-whitelisted user somehow gets into the database (e.g., via a future config change, race condition, or a previously created test account), they will be able to log in forever without re-validation.

**Additionally:** The whitelist approach differs from the plan, which specified `user.hooks.before.createUser` (throws `APIError`), but implementation uses `databaseHooks.user.create.before` (returns `false`). Both prevent user creation, but neither blocks returning users.

**Fix:** Add a `session.create.before` hook to validate every login, not just first-time signups:

```typescript
databaseHooks: {
  user: {
    create: {
      before: async (user) => {
        if (!ALLOWED_EMAILS.includes(user.email)) {
          return false
        }
        return undefined
      },
    },
  },
  session: {
    create: {
      before: async (session) => {
        // Fetch user email from DB and validate against whitelist
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
        })
        if (!user || !ALLOWED_EMAILS.includes(user.email)) {
          return false
        }
        return undefined
      },
    },
  },
},
```

### 2. CRITICAL: No server-side route protection for admin pages

**File:** `apps/web/src/app/(admin)/layout.tsx`

The admin layout has **zero session validation**. No middleware, no `getSession()` call, no redirect. Any user who navigates to `/admin` sees the full dashboard. The `useSession()` in `admin-header.tsx` is client-side only and decorative (shows user name) — it does not gate access.

**Impact:** Without route protection, the GraphQL API calls from admin pages may fail if unauthenticated, but the admin UI skeleton is fully visible. This was a pre-existing issue, but switching to OAuth without fixing it increases surface area.

**Fix (recommended — add to admin layout):**

```typescript
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect('/admin/login')
  }
  // ... existing layout JSX
}
```

---

## High Priority

### 3. `NEXT_PUBLIC_APP_URL` missing from `.env.example`

**File:** `apps/web/src/lib/auth-client.ts` (line 4), `.env.example`

The auth-client uses `process.env.NEXT_PUBLIC_APP_URL` for its baseURL, but this variable is not in `.env.example` and not in `.env`. It falls back to `http://localhost:3000`, which works for dev but will silently break in production if OAuth callback URLs don't match.

Meanwhile, `auth.ts` uses `BETTER_AUTH_URL` for the server-side baseURL. These two can diverge in production.

**Fix:** Add `NEXT_PUBLIC_APP_URL` to `.env.example` or unify with `NEXT_PUBLIC_SITE_URL` (which is already defined):

```env
# Better Auth (Client)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Or change `auth-client.ts` to use the existing `NEXT_PUBLIC_SITE_URL`.

### 4. Non-null assertions on env vars — silent crash risk

**File:** `apps/web/src/lib/auth.ts` (lines 15-16)

```typescript
clientId: process.env.GITHUB_CLIENT_ID!,
clientSecret: process.env.GITHUB_CLIENT_SECRET!,
```

If these env vars are missing at startup, the `!` assertion passes `undefined` as a string, causing cryptic OAuth failures at runtime (not at boot). The same applies to `BETTER_AUTH_SECRET!`.

**Fix:** Validate at module load:

```typescript
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  throw new Error('Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET env vars')
}
```

Or use a validation library (e.g., `zod` + `t3-env`).

---

## Medium Priority

### 5. `signUp` still exported from auth-client

**File:** `apps/web/src/lib/auth-client.ts` (line 7)

```typescript
export const { signIn, signOut, signUp, useSession } = authClient
```

With email/password disabled, `signUp` is dead code. Anyone importing it will get a runtime error from Better Auth. Remove the export to prevent confusion.

### 6. `return undefined` vs returning user data in hook

**File:** `apps/web/src/lib/auth.ts` (line 27)

The plan specified throwing an `APIError` for unauthorized users, which would produce a meaningful error response. The implementation returns `false` (aborts) for blocked users and `undefined` for allowed. Per Better Auth docs, returning `undefined` should pass through, but explicitly returning `{ data: user }` is more defensive and aligns with the documented API.

### 7. Suspense fallback is empty

**File:** `apps/web/src/app/(auth)/admin/login/page.tsx` (line 65)

```tsx
<Suspense>
  <LoginForm />
</Suspense>
```

No fallback provided. During `useSearchParams()` hydration on static pages, there is a brief flash of nothing. Minor but easily fixed:

```tsx
<Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>}>
```

---

## Low Priority

### 8. `loading` state never resets on successful redirect

**File:** `apps/web/src/app/(auth)/admin/login/page.tsx` (line 28)

`setLoading(false)` only runs in the `catch` block. If `signIn.social()` succeeds, the page navigates away, so this is fine in practice. But if the redirect is slow or blocked, the button stays disabled with "Redirecting..." forever. Not a real bug, just a minor UX edge case.

---

## Positive Observations

- Clean separation: extracted `LoginForm` into its own function for Suspense boundary — correct Next.js pattern
- `errorCallbackURL` properly configured for unauthorized rejection feedback
- Dual error display (URL-based + catch-based) covers both server-side and client-side failures
- `.env.example` updated with GitHub OAuth placeholders — good practice
- No secrets in `NEXT_PUBLIC_*` vars — correct separation
- Whitelist email is correct and specific

---

## Edge Cases Found by Scout

| Edge Case | Severity | Status |
|-----------|----------|--------|
| Returning user bypasses `create.before` hook | Critical | Open |
| Admin routes have no server-side session gate | Critical | Pre-existing, amplified |
| `NEXT_PUBLIC_APP_URL` undefined in production | High | Open |
| Existing email/password user tries GitHub OAuth (account linking) | Medium | Needs testing |
| GitHub OAuth rate limits / downtime = admin lockout | Low | Acceptable risk |
| Multiple browser tabs during OAuth flow | Low | Handled by Better Auth |

---

## Recommended Actions (Prioritized)

1. **[CRITICAL]** Add `session.create.before` hook to validate whitelist on every login, not just first signup
2. **[CRITICAL]** Add server-side session check in `(admin)/layout.tsx` with redirect to `/admin/login`
3. **[HIGH]** Add `NEXT_PUBLIC_APP_URL` to `.env.example` or unify with `NEXT_PUBLIC_SITE_URL`
4. **[HIGH]** Add runtime validation for required env vars (fail-fast at boot)
5. **[MEDIUM]** Remove `signUp` export from `auth-client.ts`
6. **[LOW]** Add Suspense fallback for login page

---

## Metrics

| Metric | Value |
|--------|-------|
| Files changed | 3 |
| LOC changed | ~70 |
| Type coverage | Good (TypeScript throughout) |
| Linting issues | Not checked (no build run) |
| Test coverage | None (no auth tests exist) |

---

## Unresolved Questions

1. Is there an existing admin user in the database from the email/password era? If so, does Better Auth auto-link the GitHub account to the existing user record by matching email? This needs manual verification.
2. What is the expected behavior if GitHub returns a different primary email than `haunt150603@gmail.com`? GitHub allows users to change their primary email — would this lock out the admin?
3. Should `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` be consolidated into a single source of truth?

---

## Sources

- [Better Auth - Database Hooks](https://better-auth.com/docs/concepts/database)
- [Better Auth - Hooks](https://better-auth.com/docs/concepts/hooks)
- [Better Auth - OAuth](https://better-auth.com/docs/concepts/oauth)
- [Issue #7260 - databaseHooks with social login](https://github.com/better-auth/better-auth/issues/7260)
