# RAG-Powered AI Chatbot Feasibility Research

**Date:** 2026-03-18
**Status:** Comprehensive feasibility assessment — VIABLE with caveats
**Stack:** NestJS + Next.js 15 + PostgreSQL 16 + Self-hosted Docker

---

## Executive Summary

Building a RAG-powered portfolio chatbot is **feasible** with zero-dollar APIs (Google Gemini + Groq). Stack is technically sound, with one major caveat: **Prisma doesn't natively support pgvector yet** — requires raw SQL. LangChain.js is stable and actively maintained. Vercel AI SDK works with self-hosted backends via custom endpoints. Recommendation: proceed with implementation, anticipate Prisma pgvector native support within 6 months.

---

## 1. pgvector + Prisma Compatibility

### Status: SUPPORTED (with workaround)

**Does Prisma support pgvector?**
- **Native support:** NOT YET. Coming soon, but not available in v6.14.0 (Feb 2026).
- **Workaround:** Use `Unsupported("vector")` type + `$queryRaw`/`$executeRaw` for vector operations.
- **Alternative:** Use Atlas migrations for custom vector setup (recommended for production).

**Prisma Workaround Pattern:**
```prisma
// schema.prisma
model Document {
  id        String  @id @default(cuid())
  content   String
  embedding Unsupported("vector(3072)")?
  createdAt DateTime @default(now())
}
```

**Vector Operations (Cosine Similarity):**
```typescript
// Find nearest neighbors by cosine distance (<-> operator)
const results = await prisma.$queryRaw`
  SELECT id, content, embedding
  FROM "Document"
  ORDER BY embedding <-> ${pgvector.toSql(queryVector)}::vector
  LIMIT 5
`;
```

**Insert Vector:**
```typescript
import pgvector from 'pgvector';

const embedding = pgvector.toSql([0.1, 0.2, 0.3, ...]);
await prisma.$executeRaw`
  INSERT INTO "Document" (id, content, embedding)
  VALUES (${id}, ${content}, ${embedding}::vector)
`;
```

### Docker PostgreSQL 16 + pgvector Setup

**Option 1 (Easiest): Use Pre-built Image**
```dockerfile
# docker-compose.prod.yml
services:
  postgres:
    image: pgvector/pgvector:pg16  # Pre-built with pgvector
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: portfolio_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
```

**Option 2 (Custom): Build with pgvector from Scratch**
```dockerfile
FROM postgres:16.9-alpine

# Install build tools + pgvector
RUN apt-get update && apt-get install -y \
    build-essential \
    postgresql-server-dev-16 \
    git \
    && git clone --depth 1 https://github.com/pgvector/pgvector.git /tmp/pgvector \
    && cd /tmp/pgvector \
    && make \
    && make install \
    && apt-get remove -y build-essential postgresql-server-dev-16 git \
    && rm -rf /tmp/pgvector

# Enable extension
RUN echo "shared_preload_libraries = 'vector'" >> /etc/postgresql/postgresql.conf
```

**Enable Extension on Existing DB:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Create Index for Cosine Search:**
```sql
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## 2. Google Gemini Embedding API

### Free Tier Limits (March 2026)

| Metric | Value |
|--------|-------|
| **Rate Limit** | Check console dashboard (variable tier) |
| **Daily Cap** | User-specific (view in Google AI Studio) |
| **Token Limit** | 250,000 TPM (shared across all Gemini models) |
| **Cost** | FREE (text-embedding-004 deprecated → use gemini-embedding-001) |

**Current Model:** `text-embedding-004` is DEPRECATED
**Recommended:** Use `models/embedding-001` (free tier)

### Embedding Output

- **Vector Dimensions:** 768 tokens (default, configurable)
- **Alternative Dimensions:** 1536, 3072 (no quality loss, storage trade-off)
- **For Portfolio Q&A:** 768 dimensions sufficient

### SDK Availability

**JavaScript/TypeScript:**
```bash
npm install @google/generative-ai
```

**Basic Usage:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = client.getGenerativeModel({
  model: 'models/embedding-001'
});

const result = await model.embedContent('Your text here');
const embedding = result.embedding.values; // [0.1, 0.2, ...]
```

### Caveats
- **Batch API cheaper:** $0.075/1M tokens (batch) vs $0.15 (standard)
- **Recommended approach:** Batch embeddings on content changes (CMS saves), not real-time per query
- **Rate limit vague:** Google dashboard shows tier limits; community reports vary. **Action: check your Google AI console for exact limits before shipping.**

---

## 3. Groq vs Gemini Flash for Chat LLM

### Feature Comparison

| Feature | Groq (Llama 3.3 70B) | Gemini Flash |
|---------|---------------------|-------------|
| **Free Tier Access** | Yes (no credit card) | Yes (limited tokens/day) |
| **RPM Limit** | Not published (check dashboard) | 10 RPM, 250 RPD (default free) |
| **Token Limit** | Varies by tier | 250,000 TPM shared |
| **Streaming** | ✅ Full SSE support | ✅ Full SSE support |
| **Speed** | ⚡ 276 tokens/sec (fastest) | ✅ Fast (< Groq) |
| **Vietnamese Quality** | ⚠️ Untested in benchmarks | ⚠️ Untested in benchmarks |
| **Production Reliability** | High (Groq's strength) | Very high (Google) |

### Vietnamese Language — UNRESOLVED

**Issue:** No public benchmarks comparing Vietnamese performance between Gemini Flash and Llama 3.3.
**Recommendation:** Test both with sample portfolio Q&A in Vietnamese before deciding. Quick test:
- Generate 5 test queries in Vietnamese (bio, projects, skills)
- Run on both models in free tier
- Evaluate response quality + relevance

### Recommendation: **Groq + Gemini Backup Strategy**

1. **Primary:** Groq Llama 3.3 70B (faster, free tier sufficient for hobby portfolio)
2. **Backup:** Gemini Flash (if Groq rate limit hit or downtime)
3. **Cost:** $0/month (both free tier)

**Groq Free Tier Caveats:**
- Exact RPM limits not published in docs (check console dashboard)
- Community reports vary; expect 10-30 RPM conservatively
- Suitable for portfolio chatbot (low throughput expected)

---

## 4. LangChain.js Status

### Actively Maintained ✅

| Metric | Status |
|--------|--------|
| **Latest Version** | 1.2.13 (Feb 2026) |
| **Recent Updates** | Yes (StateSchema, recovery from hallucinated tools) |
| **Stability** | LangChain 1.0 guarantees no breaking changes until 2.0 |
| **Active Development** | ✅ Ongoing (weekly commits) |
| **Support for Stack** | ✅ Full |

### Component Support

**Gemini Embeddings:**
```typescript
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'models/embedding-001'
});
```

**pgvector Integration:**
```typescript
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

const vectorStore = await PGVectorStore.initialize(
  embeddings,
  {
    connectionUrl: process.env.DATABASE_URL,
    tableName: 'documents'
  }
);

const results = await vectorStore.similaritySearch(query, 5);
```

**Chat (Groq via LangChain):**
```typescript
import { ChatGroq } from '@langchain/groq';

const chat = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  streaming: true
});
```

### Workaround: Simpler Alternative?

**Question:** Is LangChain overkill for portfolio chatbot?

**Answer:** Yes, potentially. LangChain adds abstraction layer complexity. For a simple portfolio Q&A:
- Minimal use of LangChain features (no agents, no tools, no complex chains)
- Could write custom RAG directly:
  1. Query pgvector for top-5 similar documents (raw SQL)
  2. Stuff context into Groq/Gemini prompt
  3. Stream response back

**Trade-off:** LangChain gives standardized APIs + future flexibility; custom approach lighter but less extensible. **Recommendation: Use LangChain for maintainability + future features (multi-step retrieval, etc.).**

---

## 5. Vercel AI SDK for Self-Hosted Deployment

### Can It Work Without Vercel? ✅ YES

**Key Facts:**
- AI SDK is **open source** and framework-agnostic
- Works with **any backend** that implements the Data Stream Protocol
- Self-hosted Docker: ✅ supported via custom API endpoint

### Architecture Pattern

**Frontend (Next.js):**
```typescript
import { useChat } from 'ai/react';

export function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: 'http://localhost:3001/graphql',  // Custom backend endpoint
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return (/* chat UI */);
}
```

**Backend (NestJS):**
```typescript
import { Response } from 'express';

@Post('chat')
async chat(@Req() req, @Res() res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Implement Data Stream Protocol
  // Send: data: {"type":"text-delta","text":"..."}\n\n
}
```

### Data Stream Protocol

Vercel AI SDK expects SSE format:
```
event: start
data: {...}

event: text-delta
data: {"type":"text-delta","text":"Hello"}

event: finish
data: {...}
```

### Provider Support

- ✅ Groq: Full support via LangChain integration
- ✅ Gemini: Full support via `@langchain/google-genai`
- ✅ Custom backend: Yes, via Data Stream Protocol

### NestJS + Vercel AI SDK Integration

```typescript
// chat.controller.ts
import { Observable } from 'rxjs';

@Post('chat')
@Sse()
chat(@Body() { messages }: { messages: any[] }): Observable<any> {
  return new Observable((observer) => {
    const stream = async () => {
      observer.next({ data: { type: 'start' } });

      // Get retrieval context
      const context = await this.ragService.retrieve(messages);

      // Stream chat response
      const stream = await this.chatService.streamChat(context);
      for await (const chunk of stream) {
        observer.next({ data: { type: 'text-delta', text: chunk } });
      }

      observer.next({ data: { type: 'finish' } });
      observer.complete();
    };
    stream();
  });
}
```

### Limitations

- EventSource API lacks custom header support (some proxies may block)
- Reconnection logic must be client-managed
- Behind Cloudflare Tunnel: ⚠️ potential timeout (test needed)

---

## 6. Content Indexing Strategy

### Chunking Strategy

**Recommended Approach:** Semantic chunking (best accuracy) or Recursive chunking (best balance)

**For Portfolio Content: Use Recursive + Small Chunks**

| Factor | Value |
|--------|-------|
| **Chunk Size** | 400-512 tokens |
| **Chunk Overlap** | 10-20% (40-100 tokens) |
| **Splitter** | `RecursiveCharacterTextSplitter` (LangChain default) |

**Why Small Chunks for Portfolio?**
- Portfolio Q&A is factoid-heavy (skills, project details)
- Factoid queries perform best at 256-512 tokens (2026 benchmarks)
- Smaller chunks = lower latency + lower token usage in prompts

### Implementation Example

```typescript
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitters';

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 50,  // ~10% overlap
  separators: ['\n\n', '\n', ' ', '']  // Preserve structure
});

// Split portfolio content
const portfolioContent = `
# About Kane Nguyen
...bio...

# Projects
## Project 1
...details...
`;

const chunks = await splitter.createDocuments([portfolioContent]);
```

### Content Sources

**Portfolio Content Indexing Workflow:**
1. **JSON projects** → Flatten to text (name, description, tech stack)
2. **MDX blog posts** → Extract front-matter + body
3. **Bio/About pages** → Plain text sections
4. **Re-index trigger:** Content saved via CMS → trigger webhook → re-embed changed chunks

**Schema:**
```typescript
// Document for vector store
interface PortfolioDocument {
  id: string;
  type: 'project' | 'blog' | 'bio' | 'skill';
  title: string;
  content: string;
  sourceId: string;  // ref to original (project.id, post.slug)
  metadata: {
    url: string;
    tags: string[];
    lastUpdated: Date;
  }
}
```

### Re-indexing Frequency

- **On CMS save:** Immediate re-embed changed document
- **Batch:** Daily full index refresh (optional, for consistency)
- **Incremental:** Only re-embed modified chunks (recommended)

---

## 7. Rate Limiting & Abuse Prevention

### NestJS Implementation

**Simple IP-Based Rate Limiting:**
```bash
npm install @nestjs/throttler
```

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60,        // 60 seconds
      limit: 10       // 10 requests per 60s
    }])
  ]
})
export class AppModule {}

@Controller('api')
@Throttle({ default: { limit: 10, ttl: 60 } })
export class ChatController {
  @Post('chat')
  async chat() { /* ... */ }
}
```

**Per-Route Limits:**
```typescript
@Post('chat')
@Throttle({ default: { limit: 5, ttl: 60 } })  // 5 req/min for chat
async chat() { /* ... */ }

@Post('embed')
@Throttle({ default: { limit: 100, ttl: 3600 } })  // 100 req/hour for embedding
async embed() { /* ... */ }
```

### IP Detection Behind Proxy

**Cloudflare Tunnel + Throttler:**
```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60, limit: 10 }]),
    // Trust Cloudflare IP
    HttpModule.register({
      global: true,
      // Forward headers
    })
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply((req, res, next) => {
      // Cloudflare header: CF-Connecting-IP
      req.ip = req.headers['cf-connecting-ip'] || req.ip;
      next();
    }).forRoutes('*');
  }
}
```

### Advanced Strategy: Token + IP Hybrid

```typescript
// For authenticated users (if future feature)
@Post('chat')
@UseGuards(ThrottleGuard)
@Throttle({
  default: { limit: 10, ttl: 60 },      // IP-based
  user: { limit: 50, ttl: 60 }          // User-based (future)
})
async chat(@Request() req) {
  // Groq/Gemini has separate rate limits
  // NestJS throttler prevents abuse *upstream*
}
```

### Recommended Limits for Portfolio Chatbot

| Route | Limit | Reason |
|-------|-------|--------|
| `/api/chat` | 5 req/min | Per IP, prevent spam |
| `/api/embed` | 10 req/hour | Expensive operation |
| `/graphql` | 10 req/min | General API limit |

**Notes:**
- Mobile behind shared carrier IP? Use user session (future feature)
- Cloudflare rate limiting: Consider dual-layer (Cloudflare + NestJS)
- Groq/Gemini free tier handles its own rate limiting; NestJS throttler is defense-in-depth

---

## 8. Implementation Roadmap (Summary)

### Phase 1: Foundation (Week 1-2)
- [ ] Add pgvector to Docker Compose
- [ ] Create Document schema (Unsupported type)
- [ ] Implement raw SQL functions for vector search
- [ ] Test pgvector setup locally

### Phase 2: Embeddings (Week 2)
- [ ] Integrate Google Gemini Embedding API
- [ ] Build document indexing pipeline
- [ ] Test embedding dimensions (768 recommended)
- [ ] Batch index portfolio content

### Phase 3: LLM Integration (Week 3)
- [ ] Set up Groq API key + LangChain integration
- [ ] Build RAG retrieval chain (pgvector → context → LLM)
- [ ] Test Groq + Gemini fallback strategy
- [ ] Test Vietnamese language quality

### Phase 4: Frontend (Week 3-4)
- [ ] Implement NestJS SSE endpoint
- [ ] Integrate Vercel AI SDK (useChat)
- [ ] Build chat UI component
- [ ] Test Vercel AI SDK custom endpoint

### Phase 5: Safety (Week 4)
- [ ] Implement NestJS rate limiting
- [ ] Add IP detection behind Cloudflare Tunnel
- [ ] Test abuse scenarios
- [ ] Add monitoring/logging

### Phase 6: Polish (Week 5)
- [ ] Test VN language quality across both LLMs
- [ ] Performance optimization (chunk sizes, embedding dims)
- [ ] Docs + deployment checklist
- [ ] Launch

---

## 9. Unresolved Questions

1. **Groq Free Tier Exact RPM Limits:** Documentation vague; must check console dashboard. Expect 10-30 RPM conservatively.

2. **Vietnamese Language Quality:** No public benchmarks for Gemini Flash vs Llama 3.3 on Vietnamese. Requires A/B testing with portfolio content.

3. **Vercel AI SDK + Cloudflare Tunnel:** No confirmed reports of timeout issues. **Action: test in staging with 2-min idle chat.**

4. **Prisma pgvector Native Support Timeline:** Expected "soon" but no date. Current workaround (raw SQL) is production-ready.

5. **Google Gemini Free Tier Rate Limits:** Published limits vague. **Action: check Google AI console for your tier before launch.**

6. **Re-indexing Strategy:** Is incremental (per-document) or batch (daily full) better for portfolio? Answer depends on CMS usage patterns. **Action: clarify with PM on content update frequency.**

---

## References

### Official Docs & Authoritative Sources

- [Prisma pgvector Support (ORM 6.13.0+)](https://www.prisma.io/blog/orm-6-13-0-ci-cd-workflows-and-pgvector-for-prisma-postgres)
- [Prisma Postgres Extensions](https://www.prisma.io/docs/postgres/database/postgres-extensions)
- [Google Gemini Embeddings API](https://ai.google.dev/gemini-api/docs/embeddings)
- [Google Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Groq Rate Limits Documentation](https://console.groq.com/docs/rate-limits)
- [LangChain.js Changelog](https://docs.langchain.com/oss/javascript/releases/changelog)
- [LangChain PGVectorStore](https://github.com/langchain-ai/langchainjs/blob/main/libs/langchain-community/src/vectorstores/pgvector.ts)
- [Vercel AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
- [Vercel AI SDK GitHub](https://github.com/vercel/ai)
- [NestJS Server-Sent Events](https://docs.nestjs.com/techniques/server-sent-events)
- [NestJS Throttler Rate Limiting](https://docs.nestjs.com/security/rate-limiting)

### Research & Best Practices

- [RAG Chunking Strategies 2026 Guide](https://www.firecrawl.dev/blog/best-chunking-strategies-rag)
- [PostgreSQL pgvector Setup Guide (2026)](https://calmops.com/database/postgresql/postgresql-vector-search-pgvector-complete-guide-2026/)
- [LangChain + Gemini Production RAG (2026)](https://markaicode.com/gemini-2-langchain-production-rag-pipeline/)
- [NestJS Rate Limiting (2026)](https://medium.com/@sparknp1/rate-limiting-in-nestjs-without-being-that-api-15682549d1bf)
- [RAG Chunking Benchmarks (2026)](https://blog.premai.io/rag-chunking-strategies-the-2026-benchmark-guide/)

---

**Report Status:** Complete & ready for implementation planning.
**Next Step:** Delegate to `planner` agent for detailed implementation roadmap + task breakdown.
