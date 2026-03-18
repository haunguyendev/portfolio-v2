# CV Builder Platforms Research Report
**Date:** 2026-03-18 | **Focus:** Vietnamese + Global CV Builder Technical Implementations

---

## Executive Summary
Researched TopCV.vn, ITviec.com (Vietnamese platforms), and open-source alternatives (Reactive Resume). Key finding: Most CV builders use **server-side PDF generation via headless Chrome** (Puppeteer/Browserless), **form-based data input**, and **freemium monetization**. Vietnamese platforms emphasize employer-side recruitment tools; global platforms focus on user experience & exportability.

---

## 1. TopCV.vn (Vietnamese Leader)

### How It Works
- **Form-based input** — Users fill form fields (name, experience, skills, etc.)
- **Template selection** — 50+ CV designs (simple, professional, modern, Harvard, ATS-optimized)
- **Real-time preview** — View as you edit
- **Export** — Download PDF or generate shareable online CV URL

### PDF Generation
- Server-side processing (inferred from "pixel-perfect PDF" claim)
- Likely uses Puppeteer or similar headless Chrome approach
- Supports multiple export formats

### Business Model
- **Two-sided marketplace:** Free CV builder → drives job seeker signups
- **Revenue from employers:** Recruitment tools, job posting visibility, employer CMS (HR management platform)
- **Data monetization:** 7.6M+ users, billions of activity records → job matching algorithm
- **Backed by Mynavi** (Japanese recruiter) — focus on AI + recruitment marketing
- Annual revenue growth: 300% (as of last reported)

### Key Differentiators
- Localized for Vietnam (Vietnamese + English support)
- Templates designed by interviews with local IT employers
- ATS-friendly (96% of applicants prefer 2-column layouts)
- Employer ecosystem focus (not just CV builder—full HR platform)

---

## 2. ITviec.com (Vietnam's Dev-Focused Platform)

### How It Works
- **Profile-based approach** — Dev profiles → auto-generate CV
- User fills profile info → system formats into template
- Template selection (8+ templates for IT roles)
- PDF download or share link generation

### Data Flow
```
User Profile → Auto-Populated Form → Template Selection → PDF Export
```

### Design Philosophy
- Templates based on employer interviews (what IT recruiters want to see)
- Font variety (Calibri, Lato, Helvetica)
- 2-column layout preference (96% adoption)
- Support for project descriptions with metrics

### PDF Generation
- Inferred server-side (no client-side PDF library mentioned)
- Likely Puppeteer or wkhtmltopdf

### Monetization
- **Free for job seekers** (CV builder, profile, apply to jobs)
- **Revenue from employers:** Job postings, recruiter features, candidate search
- Similar two-sided marketplace model as TopCV

---

## 3. Open-Source Alternatives

### Reactive Resume (Most Mature OSS)

**GitHub:** [amruthpillai/reactive-resume](https://github.com/AmruthPillai/Reactive-Resume)

**Tech Stack:**
- **Frontend:** React 19 + Vite + TypeScript
- **Backend:** Node.js + TanStack Start
- **API:** ORPC (type-safe RPC)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Better Auth (email, GitHub, Google, 2FA)
- **PDF Generation:** Browserless (headless Chrome) or local Chromium
- **State Management:** Zustand + TanStack Query
- **UI:** Radix UI + Tailwind CSS
- **Storage:** MinIO (S3-compatible for avatars, PDFs, previews)

**Architecture:**
```
React Frontend → ORPC API → Node.js Backend
  ↓
PostgreSQL (user data, templates, resumes)
  ↓
Browserless Service (PDF/preview generation on demand)
```

**PDF Workflow:**
1. Frontend renders resume in HTML
2. Browser submits to `/api/pdf` endpoint
3. Browserless launches headless Chrome
4. Chrome renders HTML → prints to PDF
5. File returned to user

**Key Features:**
- 18+ templates
- Real-time WYSIWYG editing
- OpenAI integration for content suggestions
- Self-hostable (Docker Compose)
- Privacy-first (can run locally, no tracking)
- No account required for basic use
- Multiple export formats

**Monetization:** None (fully free & open-source)

---

### Other Notable OSS Projects

| Project | Tech | PDF Method | Features | Notes |
|---------|------|-----------|----------|-------|
| **RenderCV** | Python-based YAML | LaTeX → PDF | Academics/engineers, version control | Minimal, CLI-focused |
| **OpenResume** | React + Node | PDF library | Resume parser + builder | Free, open-source |
| **FlowCV** | Proprietary SaaS | Text-based PDF rendering | Clean, ATS-friendly, drag-drop | Freemium |

---

## 4. Technical Architecture Patterns

### PDF Generation Approaches

**Approach A: Headless Chrome (Puppeteer/Browserless)**
```javascript
// Best for: Complex layouts, CSS styling, preview accuracy
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(htmlString); // Resume HTML
const pdf = await page.pdf({ format: 'A4', margin: { top: '1cm' } });
await browser.close();
```
- **Pros:** Pixel-perfect rendering, CSS support, fast
- **Cons:** Memory overhead, headless Chrome required
- **Used by:** TopCV, ITviec (inferred), Reactive Resume, FlowCV

**Approach B: PDF Libraries (PDFKit, jsPDF)**
```javascript
// Best for: Simple, lightweight generation
const doc = new PDFDocument();
doc.fontSize(14).text('Name: John Doe');
doc.pipe(fs.createWriteStream('resume.pdf'));
doc.end();
```
- **Pros:** Lightweight, no browser needed
- **Cons:** Limited styling, complex layouts hard
- **Used by:** Smaller OSS projects, not major platforms

**Approach C: HTML-to-PDF Libraries (wkhtmltopdf, html2pdf)**
- Middle ground between Puppeteer and PDFKit
- Good for simple layouts with some CSS

### Data Storage & Rendering

**Model 1: Store JSON → Render on Request (Reactive Resume)**
- Backend stores resume as JSON schema
- On PDF request: hydrate template + JSON → HTML → PDF
- Pros: Single source of truth, easy versioning
- Cons: Template engine needed

**Model 2: Store HTML → Render on Request**
- Backend stores HTML + CSS
- On PDF request: open saved HTML in headless browser
- Pros: WYSIWYG accuracy
- Cons: HTML size, harder to version

**Model 3: Store PDF + HTML Preview (Common in SaaS)**
- Pre-generate PDF + preview image on save
- On download: serve cached PDF
- Pros: Fast delivery, no generation delay
- Cons: Storage overhead, updates require regeneration

---

## 5. Business Model Analysis

### Monetization Strategies

| Model | TopCV | ITviec | Reactive Resume | FlowCV |
|-------|-------|--------|-----------------|--------|
| Job Seeker Features | Free | Free | Free | Freemium |
| CV Builder | Free | Free | Free | Free |
| PDF Export | Free | Free | Free | Premium |
| Premium Templates | Free (50+) | Free (8+) | Free (18+) | Limited free |
| Revenue Source | Employers (job posts, recruiter tools, HR platform) | Employers | None (OSS) | Premium subscription (templates, AI) |

**Freemium CV Builder Revenue Breakdown (Industry Average):**
- Subscriptions: 60-70% (premium templates, AI features, cover letters)
- Watermark removal fees: 10-15%
- Affiliate/job boards: 15-25%
- Enterprise/white-label: 5-10%

**TopCV/ITviec Model: B2B2C Hybrid**
- Free consumer features → drive user base
- Monetize from employers (job postings, recruiter tools, analytics)
- Seller advantage: Captive candidate pool for recruitment

---

## 6. Key Features Comparison

| Feature | TopCV | ITviec | Reactive Resume | FlowCV |
|---------|-------|--------|-----------------|--------|
| **Input Method** | Form-based | Profile → Form | WYSIWYG editor | Drag-drop + form |
| **Templates** | 50+ | 8+ | 18+ | 50+ |
| **Real-time Preview** | Yes | Yes | Yes (live edit) | Yes |
| **PDF Export** | Yes | Yes | Yes | Yes (Premium) |
| **Data Import** | Manual | Auto from profile | Manual | Manual |
| **Multi-language** | VN + EN | VN + EN | 20+ languages | EN |
| **ATS-Friendly** | Yes (optimized) | Yes | Yes | Yes (emphasis) |
| **Self-Hostable** | No | No | Yes (Docker) | No |
| **Open Source** | No | No | Yes | No |
| **Mobile App** | Yes | Yes | Web only | Web only |
| **AI Features** | No (yet) | No | Optional (OpenAI) | Yes (premium) |

---

## 7. Technical Recommendations for Portfolio CV Feature

### Suggested Architecture (Based on Research)

**Option A: Simple (Form + Client-Side PDF)**
```
User fills form → Preview HTML → Client-side PDF generation (jsPDF/pdfkit)
```
- **Tech:** React + jsPDF
- **Pros:** Fast, no server load
- **Cons:** Limited CSS styling, complex layouts hard
- **Best for:** Simple CV

**Option B: Server-Side Headless Chrome (Recommended)**
```
User fills form → Preview HTML → Server generates PDF (Puppeteer) → Download
```
- **Tech:** Next.js API route + Puppeteer/Browserless
- **Pros:** Pixel-perfect, unlimited styling, preview images
- **Cons:** Server resource intensive
- **Best for:** Professional CVs with complex layouts
- **Implementation:** Add to NestJS API backend

**Option C: Template + JSON Storage (Most Scalable)**
```
User data (JSON) + Template selection → Dynamic render → PDF on demand
```
- **Tech:** Prisma + NestJS + Puppeteer
- **Pros:** Versioning, easy updates, scalable
- **Cons:** Schema design overhead
- **Best for:** Multi-template system with version control

### Recommended Stack for Kane's Portfolio
Given existing tech stack (Next.js + NestJS + Prisma):
1. **Frontend:** Next.js form components (shadcn/ui inputs)
2. **Backend:** NestJS API endpoint to handle PDF generation
3. **PDF Engine:** Puppeteer (Docker) or Browserless
4. **Storage:** MinIO (already set up) for PDFs + preview images
5. **Database:** Store CV metadata + versions in Prisma

**Timeline Impact:** ~1-2 weeks (basic form + PDF export)

---

## 8. Unresolved Questions

1. **TopCV PDF generation library:** Exact library/service used (Puppeteer? In-house?)
2. **ITviec server tech stack:** Backend framework (NestJS? Django?)
3. **FlowCV CSS-to-PDF strategy:** How do they embed fonts + maintain ATS compliance?
4. **Reactive Resume scalability:** Browserless performance at 1M+ concurrent users?
5. **Cost analysis:** Server cost for headless Chrome at scale (CPU/memory)?

---

## Sources

### Vietnamese Platforms
- [TopCV Vietnam LinkedIn](https://vn.linkedin.com/company/topcv-vietnam)
- [TopCV Main Site](https://www.topcv.vn/)
- [TopCV Crunchbase](https://www.crunchbase.com/organization/topcv)
- [ITviec CV Templates](https://itviec.com/cv-templates-introduction)
- [ITviec CV Tips for Developers](https://itviec.com/blog/cv-tips-101-developer/)

### Open-Source & Technology
- [Reactive Resume GitHub](https://github.com/AmruthPillai/Reactive-Resume)
- [Reactive Resume Docs](https://docs.rxresu.me/)
- [Puppeteer HTML to PDF (RisingStack)](https://blog.risingstack.com/pdf-from-html-node-js-puppeteer/)
- [Puppeteer + Express PDF Generation (Medium)](https://medium.com/@vishweshshukla20/generate-pdfs-in-node-js-using-puppeteer-express-with-ejs-templates-2ae09f99bf65)
- [HTML to PDF Bannerbear Guide](https://www.bannerbear.com/blog/how-to-convert-html-into-pdf-with-node-js-and-puppeteer/)
- [RenderCV GitHub](https://github.com/rendercv/rendercv)
- [OpenResume GitHub](https://github.com/xitanggg/open-resume)

### Business & Monetization
- [Resume Builder Monetization Guide (Local AI Master)](https://localaimaster.com/blog/monetize-resume-builder-app)
- [Free Resume Builders Comparison (ResuFit)](https://resufit.com/blog/the-ultimate-guide-to-truly-free-resume-builders-no-hidden-costs-or-paywalls/)
- [FlowCV Product Hunt](https://www.producthunt.com/products/flowcv)
- [FlowCV vs Competitors (SaasWorthy)](https://www.saasworthy.com/product/flowcv-io)

### UI/UX References
- [Enhancv Drag-Drop Builder](https://enhancv.com/)
- [Teal AI Resume Builder](https://www.tealhq.com/tools/resume-builder)
- [Canva CV Maker](https://www.canva.com/create/cv/)
- [Jotform Resume Generator](https://www.jotform.com/resume-generator/)
- [Adobe Express Resume](https://www.adobe.com/express/create/resume)
- [FlowCV Free Resume Builder](https://flowcv.com/)
