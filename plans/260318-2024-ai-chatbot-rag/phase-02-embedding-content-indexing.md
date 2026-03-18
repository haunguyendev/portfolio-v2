# Phase 2: Embedding & Content Indexing Pipeline

## Context Links
- [Feasibility: Gemini Embedding API](../reports/researcher-260318-2012-rag-chatbot-feasibility.md#2-google-gemini-embedding-api)
- [Feasibility: Content Indexing Strategy](../reports/researcher-260318-2012-rag-chatbot-feasibility.md#6-content-indexing-strategy)
- [Architecture: Indexing Pipeline](../visuals/rag-ai-chatbot-architecture.md#2-indexing-pipeline-one-time--on-cms-update)

## Overview
- **Priority:** P1
- **Status:** Done
- **Estimate:** 3h
- **Depends On:** Phase 1 (pgvector + Embedding table)
- **Description:** Build content chunking pipeline that reads portfolio data (JSON files, DB records), splits into chunks, embeds via Gemini API, and stores vectors in pgvector.

## Key Insights
- Portfolio content is small (~50-80 chunks total); batch indexing is fast (<30s)
- Content sources: `profile.json`, `skills.json`, `experience.json`, `certificates.json`, projects (Prisma DB), blog posts (Prisma DB)
- Chunking: 400-512 tokens per chunk, 10% overlap — best for factoid Q&A
- Gemini `embedding-001` model outputs 768-dimensional vectors (free tier)
- Re-indexing: admin-triggered (NestJS CLI command or admin endpoint), not automatic

## Requirements

### Functional
- Chunk all portfolio content sources into semantically meaningful pieces
- Embed chunks via Google Gemini Embedding API
- Store embeddings in `Embedding` table with metadata (sourceType, sourceId, title, url)
- Support incremental re-indexing: delete old embeddings for a source, re-embed
- CLI command or admin-only endpoint to trigger full re-index

### Non-Functional
- Full index completes in <60s
- Handles Gemini rate limits gracefully (batch with delays)
- Content chunker is testable independently of embedding API

## Related Code Files

### Files to Create
| File | Purpose |
|------|---------|
| `apps/api/src/chat/chat.module.ts` | NestJS module registering all chat providers |
| `apps/api/src/chat/rag/content-chunker.service.ts` | Reads content sources → produces text chunks with metadata |
| `apps/api/src/chat/rag/embedding.service.ts` | Wraps Gemini Embedding API via LangChain |
| `apps/api/src/chat/rag/vector-store.service.ts` | pgvector CRUD: insert embeddings, similarity search, delete by source |
| `apps/api/src/chat/rag/indexing.service.ts` | Orchestrates: chunk → embed → store; handles re-indexing |
| `apps/api/src/chat/dto/chat-types.ts` | Shared types: `ContentChunk`, `EmbeddingDocument`, `SourceType` |

### Files to Read (Content Sources)
| Source | Location | Type |
|--------|----------|------|
| Profile | `apps/web/src/content/profile.json` | Static JSON |
| Skills | `apps/web/src/content/skills.json` | Static JSON |
| Experience | `apps/web/src/content/experience.json` | Static JSON |
| Certificates | `apps/web/src/content/certificates.json` | Static JSON |
| Projects | Prisma `Project` model | DB records |
| Blog Posts | Prisma `Post` model (type=BLOG, published=true) | DB records (JSON content) |

## Architecture

### Content Chunking Strategy

Each source type has a dedicated chunking method — no generic splitter needed for structured data. Use `RecursiveCharacterTextSplitter` only for long-form content (blog posts).

```
profile.json   → 1 chunk  (full bio + contact + stats)
skills.json    → 1 chunk  (all categories flattened)
experience.json → 1 chunk per job (company + role + highlights)
certificates   → 1 chunk per certificate
projects       → 1 chunk per project (title + desc + tech + impact)
blog posts     → 2-3 chunks per post (RecursiveCharacterTextSplitter, 512 tokens, 50 overlap)
```

### Chunk Format
```typescript
interface ContentChunk {
  content: string;        // text to embed
  sourceType: SourceType; // 'profile' | 'skill' | 'experience' | 'project' | 'certificate' | 'blog'
  sourceId: string;       // unique ref (e.g., project slug, post slug)
  metadata: {
    title: string;        // human-readable title for the chunk
    url?: string;         // link to the page on portfolio
  };
}

type SourceType = 'profile' | 'skill' | 'experience' | 'project' | 'certificate' | 'blog';
```

### Indexing Flow
```
1. ContentChunkerService.chunkAll()
   → Reads JSON files from disk (profile, skills, experience, certificates)
   → Queries Prisma for projects + published blog posts
   → Returns ContentChunk[]

2. IndexingService.reindexAll()
   → Delete all existing embeddings
   → Call ContentChunkerService.chunkAll()
   → Batch embed via EmbeddingService (chunks of 10, Gemini rate limit safety)
   → Insert into Embedding table via VectorStoreService

3. IndexingService.reindexSource(sourceType)
   → Delete embeddings WHERE sourceType = X
   → Re-chunk only that source type
   → Re-embed + insert
```

## Implementation Steps

### 1. Create shared types (`chat/dto/chat-types.ts`)
Define `ContentChunk`, `SourceType`, `EmbeddingDocument` interfaces.

### 2. Build ContentChunkerService (`chat/rag/content-chunker.service.ts`)

For JSON sources — read files using `fs.readFileSync` + `path.join`:
```typescript
// Profile chunk example
private chunkProfile(): ContentChunk[] {
  const profile = JSON.parse(
    readFileSync(join(process.cwd(), '../web/src/content/profile.json'), 'utf-8')
  );
  return [{
    content: `Kane Nguyen — ${profile.title}. ${profile.bio.full} Location: ${profile.location}. Stats: ${profile.stats.map(s => `${s.value} ${s.label}`).join(', ')}.`,
    sourceType: 'profile',
    sourceId: 'profile',
    metadata: { title: 'About Kane Nguyen', url: '/about' },
  }];
}
```

For DB sources — inject PrismaService:
```typescript
private async chunkProjects(): Promise<ContentChunk[]> {
  const projects = await this.prisma.project.findMany();
  return projects.map(p => ({
    content: `Project: ${p.title}. ${p.description} ${p.longDesc ?? ''}. Technologies: ${p.technologies.join(', ')}. Role: ${p.role ?? 'Developer'}. Team: ${p.teamSize ?? 'Solo'}. Impact: ${p.impact ?? 'N/A'}.`,
    sourceType: 'project',
    sourceId: p.slug,
    metadata: { title: p.title, url: `/projects` },
  }));
}
```

For blog posts — extract text from TipTap JSON content:
```typescript
private extractTextFromTiptap(json: any): string {
  // Recursively extract text nodes from TipTap JSON
  if (!json) return '';
  if (typeof json === 'string') return json;
  if (json.text) return json.text;
  if (json.content) return json.content.map(n => this.extractTextFromTiptap(n)).join(' ');
  return '';
}
```

Then use `RecursiveCharacterTextSplitter` for long post content:
```typescript
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 50,
});
```

**Important:** JSON content paths differ in Docker vs local dev. Use env var or resolve relative to `process.cwd()`. In Docker, web content files are baked into the web image — consider copying JSON files to a shared location during build, OR reading them at build time and storing in DB. **Simplest approach for MVP:** copy the 4 JSON files into `apps/api/src/chat/content/` at build time (or symlink). This avoids cross-container filesystem issues.

**Recommended approach:** Store content JSON files in `packages/shared/content/` so both apps can read them. Since this is a monorepo, both `apps/api` and `apps/web` can import from `packages/shared`.

### 3. Build EmbeddingService (`chat/rag/embedding.service.ts`)
```typescript
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

@Injectable()
export class EmbeddingService {
  private embeddings: GoogleGenerativeAIEmbeddings;

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'embedding-001',
    });
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    return this.embeddings.embedDocuments(texts);
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.embeddings.embedQuery(text);
  }
}
```

### 4. Build VectorStoreService (`chat/rag/vector-store.service.ts`)
Uses Prisma `$queryRaw` and `$executeRaw` for all vector operations:
```typescript
@Injectable()
export class VectorStoreService {
  constructor(private prisma: PrismaService) {}

  async insertEmbedding(chunk: ContentChunk, vector: number[]): Promise<void> {
    const vectorStr = `[${vector.join(',')}]`;
    await this.prisma.$executeRaw`
      INSERT INTO "Embedding" ("id", "content", "metadata", "sourceType", "sourceId", "embedding")
      VALUES (gen_random_uuid()::text, ${chunk.content}, ${JSON.stringify(chunk.metadata)}::jsonb,
              ${chunk.sourceType}, ${chunk.sourceId}, ${vectorStr}::vector)
    `;
  }

  async deleteBySourceType(sourceType: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM "Embedding" WHERE "sourceType" = ${sourceType}
    `;
  }

  async deleteAll(): Promise<void> {
    await this.prisma.$executeRaw`DELETE FROM "Embedding"`;
  }

  // similaritySearch method defined in Phase 3
}
```

### 5. Build IndexingService (`chat/rag/indexing.service.ts`)
```typescript
@Injectable()
export class IndexingService {
  constructor(
    private chunker: ContentChunkerService,
    private embedding: EmbeddingService,
    private vectorStore: VectorStoreService,
  ) {}

  async reindexAll(): Promise<{ chunksIndexed: number }> {
    await this.vectorStore.deleteAll();
    const chunks = await this.chunker.chunkAll();

    // Batch embed (10 at a time to respect rate limits)
    for (let i = 0; i < chunks.length; i += 10) {
      const batch = chunks.slice(i, i + 10);
      const vectors = await this.embedding.embedTexts(batch.map(c => c.content));
      for (let j = 0; j < batch.length; j++) {
        await this.vectorStore.insertEmbedding(batch[j], vectors[j]);
      }
    }
    return { chunksIndexed: chunks.length };
  }
}
```

### 6. Create ChatModule (`chat/chat.module.ts`)
Register all services. Import into `AppModule` in Phase 4.

### 7. Add environment variables
```env
# .env (local dev)
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 8. Test indexing
Run via NestJS REPL or temporary test endpoint:
```typescript
// Temporary test in main.ts or via NestJS REPL
const indexing = app.get(IndexingService);
const result = await indexing.reindexAll();
console.log(result); // { chunksIndexed: ~50-80 }
```

Verify in DB:
```sql
SELECT "sourceType", COUNT(*) FROM "Embedding" GROUP BY "sourceType";
SELECT content, metadata FROM "Embedding" LIMIT 5;
```

## Todo List
- [ ] Create `apps/api/src/chat/dto/chat-types.ts` with shared types
- [ ] Decide on content file sharing strategy (packages/shared vs copy)
- [ ] Build `ContentChunkerService` — JSON file readers
- [ ] Build `ContentChunkerService` — DB readers (projects, posts)
- [ ] Build `ContentChunkerService` — TipTap JSON text extractor
- [ ] Build `ContentChunkerService` — `chunkAll()` orchestrator
- [ ] Build `EmbeddingService` with Gemini embedding-001
- [ ] Build `VectorStoreService` — insert + delete methods
- [ ] Build `IndexingService` — `reindexAll()` with batching
- [ ] Create `ChatModule` registering all providers
- [ ] Add `GOOGLE_API_KEY` to `.env` and `.env.example`
- [ ] Test: run full index, verify ~50-80 chunks in DB
- [ ] Test: verify embeddings are 768-dimensional vectors
- [ ] Test: no regression on existing API endpoints

## Success Criteria
- `reindexAll()` completes without errors
- `Embedding` table has 50-80 rows covering all source types
- Each embedding is a 768-dimensional vector
- Metadata contains title + url for each chunk
- Execution time <60s for full index
- Existing API endpoints unaffected

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini API rate limit during batch embed | Index fails | Batch 10 at a time with 1s delay between batches |
| TipTap JSON structure varies | Missing blog content | Defensive parsing; skip chunks with empty content |
| Content file path differs in Docker | Chunks missing | Use `packages/shared` or env var for content path |
| `GOOGLE_API_KEY` not set | Service crash | Validate env on startup; log warning if missing |

## Security Considerations
- `GOOGLE_API_KEY` stored in `.env` (never committed)
- Indexing endpoint (Phase 4) must be admin-only (`@UseGuards(JwtAuthGuard)`)
- Embedded content is public portfolio data — no PII risk

## Phase 7 Upgrade Note
> **MVP (this phase)** uses simple `sourceType` string field on Embedding for source tracking and `reindexAll()` for full re-indexing. **Phase 7** introduces a `KnowledgeSource` model with foreign key relation to Embedding, enabling per-source toggling, custom documents, selective re-indexing, and filtered vector search. The `IndexingService.reindexSource(sourceType)` method here is forward-compatible with Phase 7's selective re-index.

## Next Steps
- Phase 3 adds `similaritySearch()` to `VectorStoreService` and builds the RAG query chain
- Phase 7 upgrades indexing to source-aware with `KnowledgeSource` model
