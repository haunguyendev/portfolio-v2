# Brainstorm Report: AI Chatbot RAG for Portfolio

**Date:** 2026-03-18
**Status:** Agreed
**Participants:** Kane Nguyen + Claude

---

## Problem Statement

Add AI chatbot widget to portfolio website that:
- Answers visitor questions about Kane (bio, skills, projects, experience)
- Showcases AI integration capability to HR/tech leads
- Uses RAG pipeline for accurate, context-aware responses
- $0/month budget for AI APIs

## Requirements

### Functional
- Chat widget on all portfolio pages
- Streaming responses (token-by-token)
- Answer questions about: profile, skills, experience, projects, blog posts, certificates
- Vietnamese + English support
- Rate limiting (5 msg/min per IP)

### Non-Functional
- $0 API cost (free tier only)
- No new infrastructure besides pgvector extension
- Fit into existing NestJS + Next.js monorepo
- Self-hosted Docker deployment

## Evaluated Approaches

### Option 1: Context Stuffing + Groq/Gemini
- **Pros:** Simple (1-2 days), no vector DB
- **Cons:** No RAG showcase, limited context window
- **Verdict:** Too simple for showcase goal

### Option 2: LangChain.js + pgvector (CHOSEN)
- **Pros:** Real RAG pipeline, reuses PostgreSQL, impressive showcase, $0
- **Cons:** 3-5 days dev, raw SQL for vectors
- **Verdict:** Best balance of showcase value + feasibility

### Option 3: Vercel AI SDK + context stuffing
- **Pros:** Great DX, streaming UI built-in
- **Cons:** No RAG showcase
- **Verdict:** Use for frontend only, combine with Option 2

### Option 4: OpenRAG (langflow-ai)
- **Pros:** Pre-packaged RAG platform
- **Cons:** Overkill (OpenSearch 2GB RAM), Python stack mismatch
- **Verdict:** Rejected — too heavy for portfolio

### Option 5: Neo4j GraphRAG
- **Pros:** Very high showcase value
- **Cons:** +1 container, +2GB RAM, Cypher learning curve, overkill
- **Verdict:** Rejected — graph unnecessary for simple relationships

## Final Recommended Solution

### Architecture
```
Next.js (Vercel AI SDK useChat)
  → NestJS GraphQL API (ChatModule)
    → RAG Service (LangChain.js)
      → Gemini Embedding API (text → vector, FREE)
      → PostgreSQL + pgvector (vector storage + search)
      → Groq Llama 3.3 70B (LLM chat, FREE)
      → Gemini Flash (backup LLM)
```

### Tech Stack Decision

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Vector DB** | pgvector on PostgreSQL 16 | Reuse existing DB, just change Docker image |
| **Embedding** | Google Gemini text-embedding-001 | Free, 768 dims, good quality |
| **LLM Primary** | Groq (Llama 3.3 70B) | Free, 276 tok/s, fast streaming |
| **LLM Backup** | Google Gemini Flash | Free, better Vietnamese |
| **RAG Framework** | LangChain.js v1.2.x | TypeScript native, stable, supports all providers |
| **Frontend** | Vercel AI SDK (useChat) | Streaming UI built-in, works on Docker |
| **Rate Limiting** | @nestjs/throttler | Simple, IP-based, CF-Connecting-IP header |

### Content Indexing Strategy
- **Sources:** profile.json, skills.json, experience.json, certificates.json, projects (API), blog MDX, diary MDX
- **Chunking:** RecursiveCharacterTextSplitter, 400-512 tokens, 10-20% overlap
- **Re-index trigger:** On CMS content update (admin action)
- **Estimated chunks:** ~50-80 total

### Docker Changes
- Change `postgres:16-alpine` → `pgvector/pgvector:pg16` in docker-compose
- No new containers needed

### UI Decision
- Floating bubble (bottom-right corner)
- Click to open chat panel
- Responsive (mobile: full-screen, desktop: 400px panel)

## Implementation Considerations

### Risks
1. **Vietnamese quality:** Groq (Llama) untested for Vietnamese → A/B test with Gemini Flash
2. **Prisma pgvector:** No native support → use $queryRaw (production-ready workaround)
3. **Free tier limits:** Groq RPM not clearly published → monitor usage, auto-fallback to Gemini
4. **Abuse:** Public endpoint → rate limit + optional CAPTCHA if needed

### Mitigations
- Dual LLM provider (Groq primary, Gemini Flash fallback)
- Rate limiting from day 1
- Content re-indexing is admin-triggered, not automatic
- Chat history optional (can skip for MVP)

## Success Metrics
- Chatbot correctly answers 90%+ of portfolio-related questions
- Response time < 3s for first token (streaming)
- Zero cost for normal portfolio traffic
- Visitors can learn about Kane without navigating multiple pages

## Knowledge Base Management

**Decision:** Post-MVP enhancement (Phase 7). Ship core chatbot (Phases 1-6) first, then add admin control.

### What It Adds
- **KnowledgeSource model** — tracks each content source (profile, skills, blog, custom docs) with enabled/disabled state
- **Toggle sources on/off** — admin controls what chatbot can access (e.g., disable diary from search)
- **Custom documents** — admin creates markdown documents as additional knowledge (detailed CV, tech notes)
- **Selective re-index** — re-index a single source instead of full re-index
- **Chunk preview** — admin sees exactly what the chatbot "knows" from each source

### Why Post-MVP
- Core chatbot works fine with flat `sourceType` field on embeddings — no model needed for MVP
- Knowledge management is admin UX polish, not visitor-facing functionality
- Avoids scope creep on initial 16h estimate; adds ~4h as separate phase
- Phase 2 pipeline is forward-compatible — `sourceType` + `reindexSource()` map cleanly to Phase 7's `KnowledgeSource` FK

### Schema Addition
- `KnowledgeSource { id, name, type(SYSTEM|CUSTOM), sourceKey, enabled, content?, metadata? }`
- `Embedding` gains nullable `knowledgeSourceId` FK (non-breaking migration)
- Vector search adds `JOIN KnowledgeSource WHERE enabled = true` filter

### Phased Approach Agreed
| Phase | Scope | Re-indexing | Source Control |
|-------|-------|-------------|----------------|
| MVP (1-6) | Full re-index button | `reindexAll()` only | None — all sources always active |
| Phase 7 | Knowledge Base Management | Per-source `reindexSource()` | Toggle on/off, CRUD custom docs |

## Related Reports
- `plans/reports/researcher-260318-2012-rag-chatbot-feasibility.md` — Technical feasibility
- `plans/reports/researcher-260318-1654-openrag-portfolio-chatbot.md` — OpenRAG evaluation
- `plans/visuals/rag-ai-chatbot-architecture.md` — Architecture diagrams

## Unresolved Questions
1. Chat history: persist in DB or session-only?
2. Vietnamese vs English: detect language or let user choose?
3. Suggested questions: show pre-built prompts or free-form only?
4. Analytics: track popular questions for content improvement?
