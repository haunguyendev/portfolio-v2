# Brainstorm: CV Download Feature

**Date:** 2026-03-18 | **Status:** Agreed | **Branch:** main

---

## Problem Statement

Portfolio cần tính năng download CV để:
- HR VN yêu cầu CV PDF khi apply job (TopCV, email, ATS)
- HR quốc tế cần CV cho application forms
- Personal showcase — chia sẻ offline

Hiện tại: `resume.pdf` nằm static trong `/public`, cần redeploy để update. CV cũ, cần cách quản lý linh hoạt hơn.

## Evaluated Approaches

### Level 1: Upload Only
- Admin upload PDF → MinIO → user download
- **Pros:** Ship 1-2 ngày, simple, CV design đẹp từ Canva/Figma
- **Cons:** Không auto-sync với portfolio data

### Level 2: Upload + 1 Template Generate ✅ CHOSEN
- Upload PDF + generate từ 1 HTML template (Puppeteer)
- **Pros:** Flexible, 2 options cho admin, data sync với portfolio
- **Cons:** ~1 tuần effort, Docker image nặng hơn +300MB

### Level 3: Full CV Builder (TopCV-style)
- Multi-template, form editor, realtime preview
- **Rejected:** Overkill — đây là product riêng, không phải feature portfolio

## Final Recommended Solution

### Architecture Overview

```
Admin Dashboard (Web App)
├── Upload Tab: Upload PDF → API → MinIO
├── Generate Tab: Read JSON data → Send to API
│   → API renders HTML template + Puppeteer → PDF → MinIO
└── Active Toggle: Choose which CV is served to public

Public Site (Hero + About buttons)
└── [Download CV] → GET /api/resume/download → serves active CV from MinIO
```

### Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage | MinIO (Admin CMS) | No redeploy, consistent with existing media system |
| PDF Engine | Puppeteer | Full CSS, pixel-perfect, industry standard |
| CV Style | Simple professional | 1-2 pages, clean layout |
| UX | Single download button | Admin sets active source, user sees 1 button |
| Placement | Hero + About (existing) | Đã có sẵn, không cần thêm |
| Analytics | None | KISS |
| Trigger | Admin trigger | Admin clicks generate → API → PDF → MinIO |

### Data Flow for Generation

```
Admin clicks "Generate CV"
       ↓
Web app reads: profile.json + skills.json + experience.json
       ↓
Sends JSON payload → POST /api/resume/generate
       ↓
NestJS API: Injects data into HTML template
       ↓
Puppeteer: Renders HTML → PDF buffer
       ↓
Upload PDF → MinIO (resume/generated-cv.pdf)
       ↓
Admin reviews → sets as active (or keeps uploaded PDF active)
```

### Components to Build

#### API (NestJS) — New `resume` module
- `POST /api/resume/upload` — Upload PDF to MinIO (JWT protected)
- `POST /api/resume/generate` — Generate PDF from data payload (JWT protected)
- `GET /api/resume/download` — Serve active CV (public, no auth)
- `GET /api/resume/preview` — Return preview/metadata (admin)
- GraphQL: `ResumeSettings` (activeSource, uploadedFile, generatedFile, updatedAt)
- Prisma: `Resume` model (type, filePath, fileName, fileSize, isActive, createdAt)
- HTML template: 1 professional CV template (stored in API)

#### Web App — Admin Dashboard
- New admin page: `/admin/resume`
- Upload section: file input + upload button + preview
- Generate section: preview template + generate button
- Active toggle: radio select uploaded vs generated
- Current CV info: filename, size, date, preview link

#### Web App — Public Site (minimal changes)
- Update `hero-section.tsx`: `href` from `/resume.pdf` to API endpoint
- Update `bio-section.tsx`: same change
- Update `profile.json`: `resumePath` → API endpoint

### Puppeteer Docker Considerations
- Add `puppeteer` to API dependencies
- Install chromium in API Dockerfile (`apt-get install chromium`)
- Use `--no-sandbox` flag in Docker
- Docker image ~+300MB
- Consider `puppeteer-core` + system chromium to optimize

## Implementation Considerations

### Phase Breakdown
1. **API resume module** — CRUD, upload, download endpoints, Prisma model
2. **MinIO integration** — Upload/serve resume files
3. **Admin dashboard** — Upload UI, preview, active toggle
4. **HTML CV template** — Design 1 professional template
5. **Puppeteer generation** — Generate endpoint, template rendering
6. **Frontend integration** — Update download buttons to use API
7. **Docker update** — Add chromium to API Dockerfile

### Risks
- **Puppeteer in Docker**: Memory-heavy, may need resource limits
- **HTML template design**: Cần iterate nhiều lần để CV trông professional
- **Data completeness**: JSON data thiếu field nào → CV thiếu section đó
- **Font rendering**: Custom fonts trong Docker cần cài thêm

### Migration Path
- Phase 1: Remove `/public/resume.pdf`
- Phase 1: Update download buttons → API endpoint
- Fallback: If API down, show disabled button with tooltip

## Success Criteria
- [ ] Admin upload PDF → user download thành công
- [ ] Admin generate CV từ data → PDF output professional
- [ ] Single download button works cho public users
- [ ] Docker build thành công với Puppeteer
- [ ] CV file served từ MinIO, không từ public folder

## Research Reference
- Platform analysis: `plans/reports/researcher-260318-1548-cv-builder-platforms.md`
