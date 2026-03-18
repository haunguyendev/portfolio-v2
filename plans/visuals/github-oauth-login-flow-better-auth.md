# Visual Explanation: GitHub OAuth Login Flow qua Better Auth

## Overview

Giải thích chi tiết flow login GitHub OAuth cho admin dashboard portfolio (`portfolio.haunguyendev.xyz`). Better Auth xử lý toàn bộ OAuth 2.0 dance — PKCE, state validation, token exchange, session creation — tự động.

## Quick View (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GITHUB OAUTH LOGIN FLOW                              │
│                    portfolio.haunguyendev.xyz                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌──────────────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Browser  │───►│  Better Auth     │───►│  GitHub  │───►│ GitHub   │  │
│  │  (User)   │    │  (Next.js API)   │    │  OAuth   │    │ User DB  │  │
│  └──────────┘    └──────────────────┘    └──────────┘    └──────────┘  │
│       │                   │                    │               │        │
│  1. Click            2. Generate           3. User            │        │
│  "Login GitHub"      state + PKCE         authorizes          │        │
│       │                   │                    │               │        │
│       │              ┌────▼────┐          ┌────▼────┐         │        │
│       │              │ Store   │          │ Return  │         │        │
│       │              │ state + │          │ auth    │         │        │
│       │              │ verifier│          │ code    │         │        │
│       │              │ in DB   │          │ + state │         │        │
│       │              └─────────┘          └────┬────┘         │        │
│       │                                        │              │        │
│       │    4. Callback: /api/auth/callback/github              │        │
│       │    ┌──────────────────────────────────┐               │        │
│       │    │ a. Validate state (anti-CSRF)    │               │        │
│       │    │ b. Validate PKCE code_verifier   │               │        │
│       │    │ c. Exchange code → access_token  │───────────────┘        │
│       │    │ d. Fetch GitHub user profile     │                        │
│       │    │ e. Check whitelist (email match) │                        │
│       │    │ f. Create/link Account record    │                        │
│       │    │ g. Create Session + set cookie   │                        │
│       │    └──────────────┬───────────────────┘                        │
│       │                   │                                             │
│       │◄──────────────────┘                                             │
│  5. Redirect to /admin                                                  │
│     (with session cookie)                                               │
│                                                                         │
│  ┌──────────────────── Database ────────────────────┐                  │
│  │  User: { id, email, name, role: ADMIN }          │                  │
│  │  Account: { providerId: "github", accessToken }  │                  │
│  │  Session: { token, expiresAt: 7 days }           │                  │
│  └──────────────────────────────────────────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Detailed Flow — Sequence Diagram

```mermaid
sequenceDiagram
    actor User as Admin (Kane)
    participant Browser as Browser
    participant BA as Better Auth<br/>(Next.js API)
    participant DB as PostgreSQL
    participant GH as GitHub OAuth
    participant GHAPI as GitHub API

    Note over User, GHAPI: === PHASE 1: Initiate Login ===

    User->>Browser: Click "Login with GitHub"
    Browser->>BA: signIn.social({ provider: "github" })

    Note over BA: Generate security tokens
    BA->>BA: state = randomString(32)
    BA->>BA: code_verifier = randomString(128)
    BA->>BA: code_challenge = SHA256(code_verifier)
    BA->>DB: Store state + code_verifier (expires 10min)

    BA->>Browser: 302 Redirect

    Note over User, GHAPI: === PHASE 2: GitHub Authorization ===

    Browser->>GH: GET github.com/login/oauth/authorize<br/>?client_id=xxx<br/>&redirect_uri=.../api/auth/callback/github<br/>&scope=user:email<br/>&state=abc123<br/>&code_challenge=yyy

    Note over GH: User sees GitHub consent screen
    User->>GH: "Authorize portfolio app"
    GH->>Browser: 302 Redirect with code + state

    Note over User, GHAPI: === PHASE 3: Token Exchange (Backend) ===

    Browser->>BA: GET /api/auth/callback/github<br/>?code=gho_16C7e42F&state=abc123

    BA->>DB: Lookup stored state
    DB-->>BA: state + code_verifier

    Note over BA: Validate state matches (anti-CSRF)
    Note over BA: Validate PKCE code_verifier

    BA->>GH: POST github.com/login/oauth/access_token<br/>client_id + client_secret + code + code_verifier
    GH-->>BA: access_token = ghu_xxx

    Note over User, GHAPI: === PHASE 4: Fetch Profile + Whitelist ===

    BA->>GHAPI: GET api.github.com/user<br/>Authorization: Bearer ghu_xxx
    GHAPI-->>BA: { id: 12345, login: "haunguyendev",<br/>email: "haunt150603@gmail.com" }

    Note over BA: WHITELIST CHECK:<br/>email == "haunt150603@gmail.com"?
    alt Email NOT in whitelist
        BA->>Browser: 403 "Access denied"
    else Email matches whitelist
        Note over BA: Proceed with account creation
    end

    Note over User, GHAPI: === PHASE 5: Create Session ===

    BA->>DB: Find or create User + Account
    Note over DB: User: { email, name, role: ADMIN }<br/>Account: { providerId: "github",<br/>accessToken: ghu_xxx }

    BA->>DB: Create Session (7-day expiry)
    BA->>Browser: Set-Cookie: better-auth.session=xxx<br/>(HttpOnly, Secure, SameSite=Lax)

    BA->>Browser: 302 Redirect to /admin

    Note over User, GHAPI: === PHASE 6: Authenticated Access ===

    Browser->>BA: GET /admin<br/>Cookie: better-auth.session=xxx
    BA->>DB: Validate session token
    DB-->>BA: User { id, role: ADMIN }
    BA->>Browser: Render admin dashboard
```

## Security Flow — PKCE + State Validation

```mermaid
flowchart TD
    subgraph INIT["1. Initialization (Better Auth)"]
        A["Generate random state"] --> B["Generate code_verifier (128 chars)"]
        B --> C["code_challenge = SHA256(code_verifier)"]
        C --> D["Store state + code_verifier in DB"]
    end

    subgraph REDIRECT["2. GitHub Redirect"]
        E["Send to GitHub with:<br/>state + code_challenge"] --> F{"User authorizes?"}
        F -->|Yes| G["GitHub returns: code + state"]
        F -->|No| H["Login cancelled"]
    end

    subgraph VALIDATE["3. Callback Validation"]
        I{"state matches<br/>stored value?"} -->|No| J["CSRF attack blocked"]
        I -->|Yes| K["Exchange code + code_verifier<br/>for access_token"]
        K --> L{"GitHub validates<br/>SHA256(code_verifier)<br/>== code_challenge?"}
        L -->|No| M["Code interception blocked"]
        L -->|Yes| N["Access token issued"]
    end

    subgraph WHITELIST["4. Whitelist Check"]
        O["Fetch GitHub profile"] --> P{"email ==<br/>haunt150603@gmail.com?"}
        P -->|No| Q["403 Access Denied"]
        P -->|Yes| R["Create session + cookie"]
    end

    INIT --> REDIRECT
    REDIRECT --> VALIDATE
    VALIDATE --> WHITELIST

    style J fill:#ff6b6b,color:#fff
    style M fill:#ff6b6b,color:#fff
    style Q fill:#ff6b6b,color:#fff
    style R fill:#51cf66,color:#fff
    style H fill:#ffd43b,color:#333
```

## Login Page — Before vs After

```
BEFORE (Email/Password)              AFTER (GitHub Only)
┌───────────────────────┐           ┌───────────────────────┐
│     Admin Login       │           │     Admin Login       │
│                       │           │                       │
│  Email:               │           │  Sign in to manage    │
│  ┌─────────────────┐  │           │  your portfolio       │
│  │ admin@example   │  │           │                       │
│  └─────────────────┘  │           │  ┌─────────────────┐  │
│                       │           │  │  ◉ Continue with │  │
│  Password:            │           │  │    GitHub        │  │
│  ┌─────────────────┐  │    →→→    │  └─────────────────┘  │
│  │ ••••••••        │  │           │                       │
│  └─────────────────┘  │           │  Only authorized      │
│                       │           │  GitHub accounts      │
│  [    Sign in     ]   │           │  can access.          │
│                       │           │                       │
└───────────────────────┘           └───────────────────────┘
```

## Key Concepts

### 1. **PKCE (Proof Key for Code Exchange)**
Bảo vệ chống code interception. Ngay cả khi attacker bắt được `code` từ redirect URL, họ không thể exchange thành access_token vì không có `code_verifier`.

```
Client:  code_verifier = "random128chars..."
         code_challenge = SHA256(code_verifier)
         → Send code_challenge to GitHub

GitHub:  Returns code to callback URL

Backend: Send code + code_verifier to GitHub
GitHub:  Check SHA256(code_verifier) == code_challenge
         → If match: issue access_token
         → If not: reject (attacker blocked)
```

### 2. **State Parameter (Anti-CSRF)**
Ngăn chặn CSRF attack. Attacker không thể giả mạo OAuth flow vì không biết `state` value.

```
Before redirect:  Store state="abc123" in DB
After callback:   Check returned state matches stored value
                  → If match: legitimate flow
                  → If not: CSRF attack → reject
```

### 3. **Whitelist Hook (Admin Restriction)**
Better Auth hook `before` trên `createUser` kiểm tra email GitHub. Chỉ `haunt150603@gmail.com` mới tạo được user.

```typescript
// In auth.ts
user: {
  hooks: {
    before: {
      createUser: async (user) => {
        if (user.email !== "haunt150603@gmail.com") {
          throw new Error("Access denied")
        }
      }
    }
  }
}
```

### 4. **Session Cookie vs OAuth Token**

| | OAuth Token (GitHub) | Session Cookie (Better Auth) |
|---|---|---|
| **Stored in** | `accounts` table | `sessions` table + browser cookie |
| **Lifetime** | Indefinite (until revoked) | 7 days (auto-refresh) |
| **Used for** | Calling GitHub API | Authenticating admin requests |
| **Visible to client** | No (server-side only) | As encrypted cookie |
| **Security** | Never exposed to frontend | HttpOnly + Secure + SameSite |

### 5. **Account Linking**
Better Auth tự link GitHub account vào User record. Schema:

```
User (id: "abc")
  ├── Account (providerId: "github", providerAccountId: "12345")
  │   └── accessToken: "ghu_xxx"
  └── Session (token: "sess_yyy", expiresAt: +7 days)
```

## Implementation Changes

```
Files to modify:
├── apps/web/src/lib/auth.ts              ← Add socialProviders.github + whitelist hook
├── apps/web/src/app/(auth)/admin/login/  ← Replace form → "Login with GitHub" button
├── .env / .env.example                   ← Add GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
└── Server /opt/portfolio/.env            ← Add same 2 env vars

NO changes needed:
├── Prisma schema (Account table already has OAuth fields)
├── auth-client.ts (signIn.social already available)
├── NestJS API (session-token strategy unchanged)
└── Docker/CI/CD (just env vars, no rebuild logic change)
```
