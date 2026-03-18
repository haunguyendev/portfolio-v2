# Code Review: Certificate Management Feature

## Scope
- **Files**: 20 files across 3 phases (types, JSON, UI, API module, admin CRUD, integration)
- **LOC**: ~700 new lines
- **Focus**: Full-stack CRUD feature — Prisma model, NestJS GraphQL, Next.js portfolio display + admin dashboard
- **Scout findings**: SSRF risk, date timezone edge case, missing input validation

## Overall Assessment

**Solid implementation.** Follows established Projects CRUD pattern closely. Clean separation of concerns. Auth guards applied correctly. API-first with JSON fallback works well. Code is readable and well-structured.

---

## Critical Issues

### 1. SSRF Vulnerability in `extractCertificateUrl` (certificate-url-extractor.service.ts)

The `extract()` method fetches any URL supplied by an authenticated admin without URL validation. While protected by `JwtAuthGuard`, a compromised admin session or XSS could allow:
- Fetching internal services: `http://localhost:3001/...`, `http://192.168.1.123/...`
- Cloud metadata endpoints: `http://169.254.169.254/latest/meta-data/`
- Port scanning internal network

**Fix:** Add URL validation before fetching:

```typescript
private isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const hostname = parsed.hostname;
    // Block private/internal IPs
    if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname)) return false;
    if (hostname === '169.254.169.254') return false;
    return true;
  } catch { return false; }
}
```

Call before `fetch()` in `extract()`. Severity: **Critical** (SSRF).

---

## High Priority

### 2. Missing Input Validation on DTOs (certificate.input.ts)

No `class-validator` decorators on `CreateCertificateInput` / `UpdateCertificateInput`. Other modules in this codebase may lack them too, but since this is new code:

- `title` / `issuer` could be empty strings
- `credentialUrl` has no URL format validation
- `issueDate` accepts any value that NestJS coerces
- `sortOrder` has no min/max bound

**Fix:** Add `@IsNotEmpty()`, `@IsUrl()`, `@IsOptional()`, `@Min(0)` etc. from `class-validator`:

```typescript
import { IsNotEmpty, IsOptional, IsUrl, Min } from 'class-validator';

@InputType()
export class CreateCertificateInput {
  @Field()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsNotEmpty()
  issuer: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  credentialUrl?: string;
  // ...
}
```

### 3. Date Timezone Edge Case (certificate-card.tsx:13, certificate-form.tsx:120)

`new Date(dateStr)` where `dateStr` is `"2025-02-10"` (date-only string) is parsed as UTC midnight. When `.toLocaleDateString()` runs in a timezone behind UTC, the displayed date shifts back one day (e.g., "Jan 2025" instead of "Feb 2025" for Feb 1st dates).

Similarly in `certificate-form.tsx:120`, `new Date(issueDate).toISOString()` on a date-only value `"2025-02-10"` creates `2025-02-10T00:00:00.000Z`. This works but could cause off-by-one in non-UTC server environments.

**Fix for display (certificate-card.tsx):**
```typescript
function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  const d = new Date(Number(year), Number(month) - 1)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
```

---

## Medium Priority

### 4. No Pagination on Admin List Page (certificates/page.tsx)

`certificates` query fetches ALL certificates without limit. Fine for small counts, but inconsistent with typical admin patterns. Not urgent for a portfolio site with <50 certificates.

### 5. Missing `reorderCertificates` Mutation

Projects have `reorderProjects`, but certificates only support individual `sortOrder` edits. If user wants drag-and-drop reorder in admin, this will need to be added later. Not blocking — YAGNI for now.

### 6. `ISSUER_STYLES` Hardcoded in certificate-card.tsx

The mapping `{ coursera, udemy, freecodecamp }` is duplicated conceptually between:
- `certificate-card.tsx` (display styles)
- `certificate-form.tsx` (ISSUER_ICONS select)
- `certificate-url-extractor.service.ts` (PLATFORM_PATTERNS)

If a new platform is added, three files need updating. Consider extracting a shared `CERTIFICATE_PLATFORMS` constant. Low risk for a portfolio site.

### 7. Delete Has No Cascade for Related Media

When a certificate with an uploaded image is deleted via `deleteCertificate`, the image remains in MinIO storage (orphaned). Same pattern as Projects — acceptable if manual cleanup is fine. Note for future: a media cleanup job could address this.

---

## Low Priority

### 8. `certificate-form.tsx` at 243 Lines

Slightly over the 200-line guideline. The form is self-contained and readable. Could split URL-extract logic into a custom hook, but not necessary.

### 9. No Loading/Error States in CertificatesSection

The server component silently falls back to empty JSON on API failure. This is intentional design (graceful degradation), but no logging or monitoring of API failures from the public page. Acceptable.

### 10. `scrollbar-hide` Class Already Defined

Verified: `.scrollbar-hide` exists in `globals.css`. No issue.

---

## Edge Cases Found by Scout

| Edge Case | Severity | Notes |
|-----------|----------|-------|
| SSRF via extractCertificateUrl | Critical | No URL allowlist — can reach internal services |
| Date off-by-one in non-UTC timezone | High | `new Date("2025-02-10")` parsed as UTC, displayed in local TZ |
| Empty title/issuer passes validation | High | No class-validator on DTOs |
| Delete orphans media in MinIO | Medium | Same pattern as Projects — acceptable |
| API failure on public page is silent | Low | Intentional fallback design |

---

## Positive Observations

1. **Consistent pattern**: Follows Projects CRUD exactly — resolver, service, dto, model structure. Easy to maintain.
2. **Auth guards correct**: All mutations protected by `JwtAuthGuard`. Queries are public.
3. **Smart fallback**: `CertificatesSection` tries API first, falls back to static JSON. Resilient.
4. **URL auto-fill UX**: Thoughtful feature — paste a Coursera link, get metadata pre-filled. Good DX.
5. **Proper abort signal**: `AbortSignal.timeout(10000)` on the URL extractor prevents hanging requests.
6. **Clean GraphQL schema**: Auto-generated `schema.gql` includes all certificate types/inputs correctly.
7. **TypeScript compiles clean**: No type errors in web app.
8. **Lint passes**: ESLint clean.

---

## Recommended Actions

1. **[Critical]** Add URL validation to `certificate-url-extractor.service.ts` to prevent SSRF
2. **[High]** Add `class-validator` decorators to `CreateCertificateInput` and `UpdateCertificateInput`
3. **[High]** Fix date parsing in `certificate-card.tsx` `formatDate()` to avoid timezone off-by-one
4. **[Low]** Extract shared platform constants if adding more certificate sources
5. **[Low]** Consider splitting `certificate-form.tsx` URL extraction into a hook to stay under 200 lines

---

## Metrics

- **Type Coverage**: Good — all interfaces typed, GraphQL types match Prisma model
- **Test Coverage**: Not assessed — no test files for certificates module
- **Linting Issues**: 0

## Unresolved Questions

1. Should `extractCertificateUrl` be rate-limited beyond auth guard? (e.g., 10 req/min per session)
2. Should Prisma migration be committed alongside the schema change, or is it handled by deploy pipeline?
3. Are the sample certificates in `certificates.json` real or placeholder? The credential URLs look like placeholders (`ABC123`, `UC-12345`).
