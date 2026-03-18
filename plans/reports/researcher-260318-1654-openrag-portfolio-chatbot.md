# OpenRAG Research Report: Portfolio Chatbot Integration

**Date:** 2026-03-18
**Context:** Evaluating OpenRAG for AI chatbot widget on portfolio site (Next.js 15 + NestJS + PostgreSQL, self-hosted Ubuntu server, $0 AI budget)

---

## Executive Summary

OpenRAG is production-grade RAG platform (Apache-2.0 open source) combining Langflow + OpenSearch + Docling. **Viable for portfolio chatbot** but has notable constraints for your $0-budget use case. Key blocker: requires external LLM provider (no built-in free option). Best fit with **Groq free tier** (1k req/day, 6k tokens/min).

---

## 1. What is OpenRAG?

**Definition:** Retrieval-Augmented Generation (RAG) platform that ingests documents, indexes them semantically, and powers conversational AI answers via language models.

**Core Use Cases:**
- Document-powered Q&A (your portfolio = knowledge base)
- Enterprise search + chat interfaces
- Multi-agent agentic workflows with re-ranking

**Key Differentiator:** Pre-packaged, single-command deployment combining three OSS systems (Langflow + OpenSearch + Docling) that would normally require manual integration.

---

## 2. Tech Stack

| Component | Tech | Role |
|-----------|------|------|
| **Backend** | FastAPI (Python 61.9%) | API, orchestration, RAG logic |
| **Frontend** | Next.js + TS (35.3%) | Web dashboard, UI |
| **Vector DB** | OpenSearch | Semantic indexing + retrieval |
| **Doc Parsing** | Docling | Extract text from PDFs, images, messy formats |
| **Workflow Builder** | Langflow | Visual drag-drop RAG orchestration |
| **SDKs** | Python, TypeScript/JS, MCP | Integration layer |

**Language Split:** Python-heavy backend + Node.js frontend (matches your stack split).

---

## 3. How It Works (Architecture)

```
Document Upload
  ↓
Docling (parse PDX/images/unstructured) → Text extraction
  ↓
OpenSearch Indexing → Semantic embeddings + vector storage
  ↓
User Query
  ↓
Retrieval (semantic search + re-ranking)
  ↓
LLM (external provider: OpenAI/Gemini/Groq/etc)
  ↓
Chat Response
```

**Workflow:** Langflow visual builder → Python FastAPI orchestration → OpenSearch retrieval → LLM response generation.

---

## 4. Self-Hosting & System Requirements

**Status:** ✅ **Fully self-hostable.** Apache-2.0 license, no restrictions.

**Deployment Options:**
- Docker/Podman (recommended for your infra)
- Python package (`pip install`)
- Kubernetes + Helm charts (overkill for portfolio)

**System Requirements (estimated):**
- **Backend:** Python 3.10+ runtime
- **Frontend:** Node.js 18+
- **OpenSearch:** Requires separate Elasticsearch/OpenSearch instance (memory-intensive, ~2GB minimum)
- **Storage:** PostgreSQL or built-in persistence layer
- **Network:** Self-hosted OK via Cloudflare Tunnel (your current setup)

**Realistic estimate for Ubuntu VM:** 4GB RAM minimum, 10GB disk (with documents).

---

## 5. Licensing & Cost Model

**OpenRAG:** Apache-2.0 (fully free, no commercial version mentioned).

**Cost Breakdown:**
- OpenRAG platform: $0
- OpenSearch: $0 (OSS version)
- Document parsing (Docling): $0
- **LLM API calls:** $$$$ ← **Your bottleneck**
  - No built-in LLM. Requires external provider.
  - No free self-hosted LLM integration documented in OpenRAG.

**Free LLM Options via OpenRAG/Langflow:**
1. **Groq** (Best for $0 budget)
   - Free tier: 1,000 requests/day, 6,000 tokens/min
   - Models: LLaMA 3.3, Mixtral 8x7B
   - Inference: <50ms (fastest available)
   - Cost: $0 if within free tier

2. **Google Gemini Flash** (if you can get API key)
   - Free tier exists but limited
   - Supported via Langflow integrations
   - Cost: $0-small

3. **Ollama (local LLM)**
   - Not documented as built-in OpenRAG support
   - Would require custom Langflow node
   - Cost: $0 but requires GPU VM upgrade

**Verdict:** Groq free tier is **only realistic $0 option** for portfolio chatbot.

---

## 6. Integration with Next.js + NestJS Monorepo

**OpenRAG SDKs Available:**
- TypeScript/JavaScript SDK (`npm install openrag-sdk`)
- Python SDK (`pip install openrag-sdk`)

**Integration Pattern:**

```
Frontend (Next.js)
  ↓
chat-widget.tsx (uses openrag-sdk)
  ↓ HTTP/WebSocket
NestJS Backend
  ↓ GraphQL mutation
  ↓
OpenRAG API
  ↓
Groq LLM (free tier)
  ↓
Chat response → client
```

**Recommended Setup:**
1. Deploy OpenRAG as separate Docker service (FastAPI) on your Ubuntu server
2. Call OpenRAG REST API from NestJS GraphQL resolver
3. Use TypeScript SDK in Next.js chat widget for streaming responses
4. Manage Groq API key in NestJS environment variables
5. Document indexing: trigger from NestJS admin endpoint when portfolio content changes

**No official "Next.js + NestJS + OpenRAG" example found**, but pattern is standard (service-oriented architecture).

---

## 7. LLM Provider Support

**Langflow (OpenRAG's backbone) supports:**
- ✅ Groq (dedicated component, free tier)
- ✅ Google Gemini (supported, limited free)
- ✅ OpenAI (paid)
- ✅ Anthropic Claude (paid)
- ✅ Cohere (paid)
- ✅ Local models (Ollama integration, needs GPU)
- ❓ Other providers (check Langflow docs for full list)

**For $0 Budget:** **Groq is only realistic option.**
- Free tier: 1,000 req/day → ~33 req/hour → ~8 requests/user/month (tiny portfolio = OK)
- 6,000 tok/min: Groq's limits rarely hit for simple Q&A
- Fastest inference (< 50ms) = best user experience

---

## 8. Pros & Cons for Portfolio Chatbot

### ✅ Pros

1. **Pre-packaged solution** — One command to deploy (vs integrating Langflow + OpenSearch + Docling manually)
2. **Self-hosted** — Aligns with your existing infrastructure (Ubuntu server, Docker, Cloudflare Tunnel)
3. **Document parsing** — Docling handles PDFs/images well (portfolio PDFs, project screenshots)
4. **Semantic search** — OpenSearch provides better Q&A than keyword matching
5. **Extensible** — Langflow visual editor = easy to add re-ranking, multi-agent logic later
6. **No vendor lock-in** — Full OSS, can fork/modify if needed
7. **Active ecosystem** — Langflow + OpenSearch + Docling = mature, well-supported components

### ❌ Cons

1. **Overkill for simple use case** — Full RAG platform for "answer Q&A about Kane" seems heavy
2. **Infrastructure overhead** — OpenSearch + FastAPI + Next.js = 3+ services (vs simple chatbot widget)
3. **$0 LLM limitation** — Groq free tier = 1k req/day (tight if chatbot gets traffic)
4. **No built-in LLM** — Must integrate external provider (adds complexity, potential latency)
5. **Documentation gaps** — Next.js + NestJS integration patterns not well-documented in OpenRAG
6. **Deployment complexity** — FastAPI backend + OpenSearch requires more ops knowledge than alternatives
7. **Limited free LLM options** — No built-in self-hosted LLM (Ollama integration requires custom setup)

### Trade-offs

| Aspect | OpenRAG | Alternative (e.g., LangChain + API) |
|--------|---------|-------------------------------------|
| **Setup** | ~1-2 hours (Docker + compose) | ~30 mins (API-only, no vector DB) |
| **Maintenance** | OpenSearch admin burden | Delegated to service |
| **Flexibility** | High (Langflow visual editor) | Medium (code-based) |
| **Hosting** | Self-hosted ✅ | Possible but harder |
| **Cost** | $0 platform + Groq free tier | $0 if using Groq |

---

## 9. Recommendation for Portfolio Chatbot

### IF you want full RAG:
**OpenRAG + Groq = viable**
- Document indexing of portfolio content (projects, bio, blog posts)
- Semantic search on portfolio knowledge base
- Free tier covers typical traffic
- Self-hosted on your Ubuntu server
- **Effort:** 2-3 days setup + integration

### IF you want minimal implementation:
**Consider simpler alternatives first:**
- LangChain + Groq API (lighter weight)
- Vercel AI SDK + Groq (TypeScript-native, minimal backend)
- Simple RAG with Supabase + Groq
- **Effort:** 1 day for MVP

### Best Fit Scenario
OpenRAG is ideal **IF:**
1. You need multi-document indexing (portfolio = multiple markdown/PDF files)
2. You want extensibility later (agents, re-ranking, analytics)
3. You're comfortable with FastAPI + ops overhead
4. Your portfolio traffic can fit within Groq free tier (likely yes, small audience)

---

## Implementation Checklist (if proceeding)

- [ ] Spin up OpenSearch docker container on Ubuntu server
- [ ] Deploy OpenRAG FastAPI service (docker-compose)
- [ ] Set up Groq API key (free account)
- [ ] Index portfolio content via OpenRAG API
- [ ] Create NestJS resolver to call OpenRAG chat endpoint
- [ ] Build Next.js chat widget component
- [ ] Test streaming responses
- [ ] Monitor Groq free tier usage (1k req/day)
- [ ] Add rate limiting in NestJS if needed

---

## Unresolved Questions

1. **Exact Groq free tier limitations:** Does 1k req/day reset daily? Per calendar day or 24h rolling window?
2. **OpenRAG embedding model:** Which embeddings does it use by default? (affects retrieval quality)
3. **Streaming support:** Does OpenRAG API support streaming responses? (better UX for chat)
4. **Production concerns:** Any known issues running OpenRAG on resource-constrained VMs?
5. **Alternative:** Would simple vector search (Postgres pgvector) + Groq be simpler for small portfolio?

---

## Sources

- [OpenRAG GitHub Repository](https://github.com/langflow-ai/openrag)
- [Langflow Documentation - Groq Integration](https://docs.langflow.org/bundles-groq)
- [Groq API Free Tier Details](https://www.analyticsvidhya.com/blog/2026/01/top-free-llm-apis/)
- [Free LLM APIs for 2026](https://github.com/cheahjs/free-llm-api-resources)
- [Best Open-Source RAG Frameworks 2026](https://www.firecrawl.dev/blog/best-open-source-rag-frameworks)
