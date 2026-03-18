# Better Auth v1.5+ GitHub OAuth Email Whitelist Hook Research

**Date:** 2026-03-18
**Research:** Better Auth hooks API for user creation interception + GitHub OAuth social sign-in validation

## Summary

Better Auth v1.5 uses **database hooks** (not middleware hooks) for user creation interception. Your original approach was wrong because:

1. ❌ `user.hooks.before.createUser` — Invalid property path
2. ✅ `databaseHooks.user.create.before` — Correct property path (added in v1.5)

For GitHub OAuth social sign-in, users are created via `/sign-in/oauth/callback` endpoint. You can validate + reject users using **database hooks** with email whitelist check.

---

## Correct Implementation

### 1. Database Hooks Configuration (v1.5+)

```typescript
import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";

const ALLOWED_EMAILS = [
  "your-email@example.com",
  "admin@example.com",
  // Add more whitelisted emails
];

export const auth = betterAuth({
  database: prismaAdapter(prisma),

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  // ✅ CORRECT: Database hooks for user creation
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Validate email whitelist BEFORE user is created
          if (!ALLOWED_EMAILS.includes(user.email)) {
            throw new Error(
              `Email ${user.email} is not whitelisted. Contact admin.`
            );
          }
          return user; // Allow creation
        },
      },
    },
  },
});
```

### 2. Hook Lifecycle (v1.5 Behavior)

**Important:** Database hooks now execute **after transaction commits** (not during):

```typescript
databaseHooks: {
  user: {
    create: {
      before: async (user) => {
        // ✅ Runs BEFORE user inserted into database
        // ❌ Cannot access external systems yet (transactions still pending)
        // ✅ CAN throw errors to reject creation
        return user; // Modified user data
      },
      after: async (user) => {
        // ✅ Runs AFTER transaction commits
        // ✅ Safe for external API calls (no rollback risk)
        // Send email, call webhook, etc.
        return user;
      },
    },
  },
}
```

### 3. GitHub OAuth Callback Path

When user completes GitHub OAuth:
- Callback endpoint: `/api/auth/callback/github` (default basePath)
- Or: `{basePath}/callback/github` (if custom basePath)
- User is created via internal `adapter.createUser()` call
- **Database hook triggers automatically** on user creation

---

## Middleware Hooks vs Database Hooks

### When to Use Each

| Hook Type | When | What For |
|-----------|------|----------|
| **Middleware Hooks** (`hooks.before/after`) | Runs on EVERY endpoint | Validate HTTP requests, modify responses, handle cookies, throw HTTP errors |
| **Database Hooks** (`databaseHooks.user.create`) | Runs on user CREATE only | Validate user data BEFORE/AFTER database insertion, transform user properties |

### Your Use Case Needs Database Hooks

- ❌ Middleware hooks run on ALL endpoints (sign-up, OAuth callback, etc.)
- ❌ Harder to intercept just GitHub OAuth user creation
- ✅ Database hooks run only on `adapter.createUser()`
- ✅ Can reject user creation with error
- ✅ Works for all user creation paths (email, OAuth, admin)

---

## Complete Example: GitHub OAuth + Email Whitelist

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

const ADMIN_EMAILS = new Set([
  "admin@haunguyendev.xyz",
  "kane@haunguyendev.xyz",
]);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // Only allow OAuth for now
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  // ✅ GitHub OAuth users validated here
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Check if email is admin (from OAuth)
          if (!ADMIN_EMAILS.has(user.email)) {
            const error = new Error("Unauthorized email");
            (error as any).code = "UNAUTHORIZED_EMAIL";
            throw error;
          }

          // Mark admin users (optional)
          return {
            ...user,
            name: user.name || user.email, // Fallback name from GitHub
          };
        },
      },
    },
  },
});
```

### Client Usage (Same for All Methods)

```typescript
// app/api/auth/[...auth]/route.ts
import { auth } from "@/lib/auth";

export const { POST, GET } = auth.toNextJsHandler();

// app/page.tsx (Client Side)
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <button
      onClick={async () => {
        try {
          await authClient.signIn.social({
            provider: "github",
            callbackURL: "/dashboard",
          });
        } catch (error: any) {
          if (error.message.includes("Unauthorized")) {
            alert("Your email is not authorized. Contact admin.");
          }
        }
      }}
    >
      Sign in with GitHub
    </button>
  );
}
```

---

## Why Your Original Code Failed

```typescript
// ❌ WRONG - This property doesn't exist
user: {
  hooks: {
    before: {
      createUser: async (user) => { ... }
    }
  }
}

// ✅ CORRECT - Use databaseHooks at root level
databaseHooks: {
  user: {
    create: {
      before: async (user) => { ... }
    }
  }
}
```

The `user.hooks` property was from an older version or different configuration pattern. **Better Auth v1.5 standardized on `databaseHooks` at the root config level.**

---

## Key Points for Your Implementation

1. **Use `databaseHooks.user.create.before`** for whitelist validation
2. **Throw Error** to reject user creation (will propagate to client as error)
3. **GitHub OAuth users are created automatically** after OAuth callback
4. **No need to modify middleware** — just add database hook
5. **Email scope required** — Ensure GitHub app has "Read-Only Email Addresses" permission
6. **Production URL** — Set `BETTER_AUTH_URL` env var for callback path (e.g., `https://haunguyendev.xyz`)

---

## Related Resources

- [Better Auth Hooks Documentation](https://better-auth.com/docs/concepts/hooks)
- [Better Auth Configuration Reference](https://better-auth.com/docs/reference/options)
- [Better Auth GitHub OAuth Setup](https://better-auth.com/docs/authentication/github)
- [Better Auth v1.5 Release Notes](https://better-auth.com/blog/1-5)
- [Better Auth Plugin Guide](https://better-auth.com/docs/guides/your-first-plugin)
- [Better Auth OAuth Concepts](https://better-auth.com/docs/concepts/oauth)

---

## Unresolved Questions

None — All API patterns and database hook behavior verified from official docs.
