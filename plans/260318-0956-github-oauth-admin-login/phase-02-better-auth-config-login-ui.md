# Phase 2: Better Auth Config + Login UI

## Context

- [Brainstorm Report](../reports/brainstorm-260318-0956-github-oauth-admin-login.md)
- [OAuth Research](../reports/researcher-260318-0936-better-auth-github-oauth.md)
- Current auth config: `apps/web/src/lib/auth.ts`
- Current login page: `apps/web/src/app/(auth)/admin/login/page.tsx`

## Overview

- **Priority:** P1
- **Status:** Complete
- **Effort:** 1h
- Core implementation: add GitHub social provider, whitelist hook, replace login form.

## Key Insights

- Account table already has `providerId`, `accessToken`, `refreshToken` columns — no migration
- `signIn.social()` already available in auth-client — no client package changes
- Whitelist via `user` hooks → `before.createUser` rejects unauthorized emails
- Remove `emailAndPassword: { enabled: true }` completely

## Related Code Files

### Modify
- `apps/web/src/lib/auth.ts` — Add socialProviders.github + whitelist hook, remove emailAndPassword
- `apps/web/src/app/(auth)/admin/login/page.tsx` — Replace form with GitHub button
- `apps/web/src/lib/auth-client.ts` — No change needed (signIn.social already available)

### No Change
- `packages/prisma/schema.prisma` — Account table ready
- `apps/api/src/auth/` — Session-token strategy unchanged
- `apps/web/src/app/api/auth/[...all]/route.ts` — Better Auth auto-handles callback

## Implementation Steps

### 1. Update `apps/web/src/lib/auth.ts`

```typescript
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ALLOWED_EMAILS = ['haunt150603@gmail.com']

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  user: {
    hooks: {
      before: {
        createUser: async (user) => {
          if (!ALLOWED_EMAILS.includes(user.data.email)) {
            throw new Error('Access denied: unauthorized account')
          }
        },
      },
    },
  },
})
```

**Changes from current:**
- Removed `emailAndPassword: { enabled: true }`
- Added `socialProviders.github`
- Added `user.hooks.before.createUser` whitelist

### 2. Update Login Page `apps/web/src/app/(auth)/admin/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Github } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGitHubLogin() {
    setError('')
    setLoading(true)
    try {
      await signIn.social({
        provider: 'github',
        callbackURL: '/admin',
        errorCallbackURL: '/admin/login?error=unauthorized',
      })
    } catch {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Admin Login</CardTitle>
          <CardDescription>Sign in to manage your portfolio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGitHubLogin}
            className="w-full"
            disabled={loading}
          >
            <Github className="mr-2 h-4 w-4" />
            {loading ? 'Redirecting…' : 'Continue with GitHub'}
          </Button>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Only authorized GitHub accounts can access.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Changes from current:**
- Removed email/password state + form inputs
- Replaced with single "Continue with GitHub" button
- Uses `signIn.social({ provider: "github" })` instead of `signIn.email()`
- Added `errorCallbackURL` for unauthorized rejections
- Added lucide `Github` icon

### 3. Handle Error Callback (Optional Enhancement)

Parse `?error=unauthorized` query param in login page to show appropriate message.

Add to login page:
```typescript
import { useSearchParams } from 'next/navigation'

// Inside component:
const searchParams = useSearchParams()
const urlError = searchParams.get('error')

// In render:
{urlError === 'unauthorized' && (
  <p className="text-sm text-destructive text-center">
    Access denied. Your GitHub account is not authorized.
  </p>
)}
```

### 4. Verify Build

```bash
cd /Users/kanenguyen/personal/side-project/porfolio_v2
pnpm build --filter web
```

Ensure zero TypeScript errors.

## Todo List

- [x] Update `auth.ts`: add socialProviders.github + whitelist hook (DONE)
- [x] Update `auth.ts`: remove emailAndPassword config (DONE)
- [x] Rewrite login page: GitHub button replacing email/password form (DONE)
- [x] Handle error callback for unauthorized users (DONE)
- [x] Verify `lucide-react` has `Github` icon (DONE)
- [x] Run `pnpm build --filter web` — zero errors (DONE)

## Success Criteria

- [x] `auth.ts` has `socialProviders.github` configured (DONE)
- [x] Whitelist hook blocks non-whitelisted emails (DONE)
- [x] Login page shows single "Continue with GitHub" button (DONE)
- [x] Error query params display rejection message (DONE)
- [x] Build passes with zero TypeScript errors (DONE)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hook API changes in Better Auth | LOW | Pin version, test on upgrade |
| Whitelist misconfigured | HIGH | Test with unauthorized account |
| `signIn.social` redirect fails | MEDIUM | Check BETTER_AUTH_URL matches |
| Existing admin user in DB | LOW | Account linking handles email match |

## Security Considerations

- `GITHUB_CLIENT_SECRET` only on server (never in `NEXT_PUBLIC_*`)
- Whitelist check runs server-side before user creation
- Session cookies: HttpOnly + Secure + SameSite=Lax
- PKCE + state validation handled by Better Auth automatically

## Code Review Notes

**Critical Fix Applied:**
- Added `session.create.before` hook for defense-in-depth session validation (prevents unauthorized session creation)
- Ensures only whitelisted emails can create/maintain valid sessions

**Known Pre-existing Issue (Out of Scope):**
- Admin layout has no server-side session protection (inherited from previous implementation)
- Can be addressed in future security hardening phase

## Next Steps

→ Phase 3: Test locally + deploy to production
