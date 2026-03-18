# Brainstorm: Certificate Management Feature

## Problem Statement
Kane needs to showcase 4-7 certificates (Coursera, Udemy, other platforms) on portfolio About page and manage them via admin dashboard. Development starts with mock data (JSON) before backend integration.

## Requirements

### Portfolio (Public)
- Certificates section on About page, after Skills, before Timeline
- Compact card: issuer icon + title + issuer name + date + verify link
- 3-col grid desktop, 2-col tablet, 1-col mobile
- Click verify link → opens credential URL in new tab
- Sorted by date (newest first) or custom order

### Dashboard (Admin)
- Basic CRUD following existing Projects pattern
- Fields: title, issuer, issue date, credential URL, issuer icon, sort order, published toggle
- DataTable list view + form create/edit

## Evaluated Approaches

### Placement Options
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| About page section | HR sees it naturally, low effort | Limited space | ✅ Chosen |
| Dedicated /certificates page | Room for many certs, filters | Overkill for 4-7 | ❌ |
| Both (preview + full page) | Best of both worlds | Over-engineered for now | ❌ YAGNI |

### Card Style Options
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Compact card | Clean, info-dense, fits 3-col | Less visual | ✅ Chosen |
| Image card | Visual, shows actual cert | Takes space, slow load | ❌ |
| List style | Minimal footprint | Too plain, less engaging | ❌ |

### Mock Strategy
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| JSON file | Follows existing pattern, easy swap | Extra file | ✅ Chosen |
| Inline mock | Fastest start | Needs refactor later | ❌ |
| GraphQL mock | API-first | Over-engineered for UI-first | ❌ |

## Final Recommended Solution

### Data Model
```prisma
model Certificate {
  id            String   @id @default(cuid())
  title         String
  issuer        String
  issueDate     DateTime
  credentialUrl String?
  issuerIcon    String?  // URL or icon identifier
  sortOrder     Int      @default(0)
  published     Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Mock Data Structure (certificates.json)
```json
[
  {
    "id": "1",
    "title": "React Advanced Patterns",
    "issuer": "Coursera",
    "issueDate": "2025-01-15",
    "credentialUrl": "https://coursera.org/verify/xxx",
    "issuerIcon": "coursera",
    "sortOrder": 1,
    "published": true
  }
]
```

### Implementation Phases

#### Phase 1 — Portfolio UI (Mock Data)
1. Create `content/certificates.json` with 4-5 sample certs
2. Create `CertificateCard` component (compact style)
3. Create `CertificatesSection` component (grid layout)
4. Add section to About page (after Skills, before Timeline)
5. Type definitions in `src/types/`

#### Phase 2 — Dashboard CRUD
1. Add `Certificate` Prisma model + migration
2. Create GraphQL module (resolver, service, DTOs)
3. Dashboard pages: list (DataTable) + create/edit form
4. Follow existing Projects CRUD pattern exactly

#### Phase 3 — Integration
1. Create `apiGetCertificates()` server fetch function
2. Swap About page from JSON → API fetch (with JSON fallback)
3. Test full flow: dashboard add → portfolio display

### Architecture (follows existing patterns)
```
Dashboard (admin)                    Portfolio (public)
┌─────────────┐                     ┌──────────────────┐
│ CertForm    │──mutation──┐        │ About Page       │
│ CertTable   │            │        │  ├── Bio         │
└─────────────┘            ▼        │  ├── Skills      │
                     ┌──────────┐   │  ├── Certs ◄─────┼── query
                     │ GraphQL  │   │  └── Timeline    │
                     │ API      │   └──────────────────┘
                     └────┬─────┘
                          │
                     ┌────▼─────┐
                     │ Postgres │
                     │ (Prisma) │
                     └──────────┘
```

## Risk Assessment
- **Low risk:** Feature is isolated, no breaking changes to existing code
- **JSON fallback:** If API is down, portfolio still shows certs from JSON
- **Migration:** Simple table addition, no FK dependencies

## Success Metrics
- [ ] 4-7 certificates displayed on About page
- [ ] CRUD operations work in dashboard
- [ ] Credential verify links functional
- [ ] Responsive grid (3/2/1 columns)
- [ ] Page load unaffected (< 100ms overhead)

## Next Steps
→ Create implementation plan with phased approach
→ Phase 1 (UI mock) can ship independently
→ Phase 2-3 follow when ready

## Unresolved Questions
1. Issuer icons — use static SVGs or fetch from platform? (recommend: static SVGs for Coursera/Udemy/common, fallback generic icon)
2. Should certificates link to related projects? (defer to Phase 2+ if needed)
3. Certificate expiration handling? (most dev certs don't expire — skip for now)
