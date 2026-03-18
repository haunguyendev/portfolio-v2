---
title: "AI Chatbot with RAG for Portfolio"
description: "RAG-powered chat widget answering visitor questions about Kane using pgvector + Groq/Gemini"
status: in-progress
priority: P1
effort: 20h
branch: main
tags: [ai, rag, chatbot, pgvector, langchain, nestjs, nextjs]
created: 2026-03-18
---

# AI Chatbot with RAG — Implementation Plan

## Architecture

```
Next.js (Vercel AI SDK useChat) → NestJS REST endpoint (SSE)
  → RAG Service (LangChain.js)
    → Gemini Embedding API (768 dims, free)
    → PostgreSQL + pgvector (vector search)
    → Groq Llama 3.3 70B (primary LLM) / Gemini Flash (backup)
```

## Phases

| # | Phase | Est. | Status | Depends On |
|---|-------|------|--------|------------|
| 1 | [Infrastructure & pgvector Setup](phase-01-infrastructure-pgvector-setup.md) | 2h | Done | - |
| 2 | [Embedding & Content Indexing Pipeline](phase-02-embedding-content-indexing.md) | 3h | Done | Phase 1 |
| 3 | [RAG Query Pipeline & LLM Integration](phase-03-rag-query-pipeline.md) | 3h | Done | Phase 2 |
| 4 | [NestJS Chat API Endpoint (SSE)](phase-04-nestjs-chat-api-endpoint.md) | 2.5h | Done | Phase 3 |
| 5 | [Frontend Chat Widget](phase-05-frontend-chat-widget.md) | 3h | Done | Phase 4 |
| 6 | [Rate Limiting, Safety & Deployment](phase-06-rate-limiting-safety-deployment.md) | 2.5h | Done | Phase 5 |
| 7 | [Knowledge Base Management](phase-07-knowledge-base-management.md) | 4h | Pending | Phase 6 (post-MVP) |

## Key Decisions
- **No GraphQL for chat** — SSE streaming requires REST endpoint; GraphQL subscriptions add unnecessary complexity
- **LangChain.js** for RAG orchestration — standardized API, future extensibility
- **Prisma `$queryRaw`** for vector ops — native pgvector support not yet available
- **Session-only chat history** — no DB persistence for MVP (YAGNI)
- **Admin-triggered re-indexing** — no auto-sync, manual CLI/admin button
- **Knowledge Base Management is post-MVP** — Phase 7 adds source toggling, custom docs, selective re-index after core chatbot ships

## Reports
- [Brainstorm](../reports/brainstorm-260318-2024-ai-chatbot-rag-portfolio.md)
- [Feasibility Research](../reports/researcher-260318-2012-rag-chatbot-feasibility.md)
- [Architecture Diagrams](../visuals/rag-ai-chatbot-architecture.md)
