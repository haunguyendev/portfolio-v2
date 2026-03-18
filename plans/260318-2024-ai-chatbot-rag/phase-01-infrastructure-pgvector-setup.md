# Phase 1: Infrastructure & pgvector Setup

## Context Links
- [Feasibility: pgvector + Prisma](../reports/researcher-260318-2012-rag-chatbot-feasibility.md#1-pgvector--prisma-compatibility)
- [Architecture: Docker Deployment View](../visuals/rag-ai-chatbot-architecture.md#4-docker-deployment-view)

## Overview
- **Priority:** P1 (foundation for all other phases)
- **Status:** Done
- **Estimate:** 2h
- **Description:** Swap PostgreSQL Docker image to pgvector-enabled, create Prisma migration for vector extension + embeddings table, install backend dependencies.

## Key Insights
- `pgvector/pgvector:pg16` is a drop-in replacement for `postgres:16-alpine` — same base, adds vector extension
- Prisma lacks native pgvector support; use `Unsupported("vector(768)")` type + `$queryRaw`
- HNSW index preferred over IVFFlat for small datasets (<1K vectors) — no training step needed
- Existing data volumes remain compatible; pgvector extension enabled via migration SQL

## Requirements

### Functional
- PostgreSQL supports `CREATE EXTENSION vector`
- Embeddings table stores: id, content, metadata (JSONB), source_type, source_id, embedding vector(768)
- Raw SQL helper functions for insert + similarity search

### Non-Functional
- Zero downtime for existing services during migration
- Local dev + production Docker Compose both updated
- Prisma schema stays clean; vector ops via `$queryRaw`

## Related Code Files

### Files to Modify
| File | Change |
|------|--------|
| `docker-compose.yml` | `postgres:16-alpine` → `pgvector/pgvector:pg16` |
| `docker-compose.prod.yml` | Same image swap |
| `packages/prisma/schema.prisma` | Add `Embedding` model with `Unsupported("vector(768)")` |
| `apps/api/package.json` | Add `pgvector`, `@langchain/community`, `langchain`, `@langchain/core`, `@langchain/google-genai`, `@langchain/groq` |
| `apps/api/src/app.module.ts` | Import `ChatModule` |

### Files to Create
| File | Purpose |
|------|---------|
| `packages/prisma/migrations/XXXXXX_add_pgvector_embeddings/migration.sql` | Enable extension + create table + HNSW index |

## Architecture

### Embeddings Table Schema
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "Embedding" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "content"    TEXT NOT NULL,
  "metadata"   JSONB DEFAULT '{}',
  "sourceType" TEXT NOT NULL,       -- 'profile' | 'skill' | 'experience' | 'project' | 'certificate' | 'blog'
  "sourceId"   TEXT,                -- reference to original record
  "embedding"  vector(768),
  "createdAt"  TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- HNSW index for cosine similarity (best for small datasets, no training)
CREATE INDEX "Embedding_embedding_idx" ON "Embedding"
  USING hnsw ("embedding" vector_cosine_ops);
```

### Prisma Model
```prisma
model Embedding {
  id         String   @id @default(cuid())
  content    String
  metadata   Json     @default("{}")
  sourceType String
  sourceId   String?
  embedding  Unsupported("vector(768)")?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## Implementation Steps

### 1. Swap Docker PostgreSQL image
```yaml
# docker-compose.yml AND docker-compose.prod.yml
services:
  postgres:
    image: pgvector/pgvector:pg16   # was: postgres:16-alpine
```

### 2. Install backend dependencies
```bash
cd apps/api
pnpm add pgvector langchain @langchain/core @langchain/community @langchain/google-genai @langchain/groq
```

### 3. Add Prisma schema model
Add the `Embedding` model to `packages/prisma/schema.prisma` (see Architecture section above).

### 4. Create migration with raw SQL
Since Prisma can't auto-migrate `Unsupported` types, create migration manually:
```bash
cd packages/prisma
pnpm prisma migrate dev --create-only --name add_pgvector_embeddings
```
Then replace auto-generated SQL with the full SQL from Architecture section (includes `CREATE EXTENSION` + `CREATE INDEX`).

### 5. Run migration
```bash
pnpm prisma migrate dev
```

### 6. Verify pgvector works
```bash
# Connect to local postgres and test
psql -h localhost -U postgres -d portfolio -c "SELECT '[1,2,3]'::vector;"
```

## Todo List
- [ ] Swap Docker image in `docker-compose.yml`
- [ ] Swap Docker image in `docker-compose.prod.yml`
- [ ] Install npm packages in `apps/api`
- [ ] Add `Embedding` model to Prisma schema
- [ ] Create + edit migration SQL (extension + table + HNSW index)
- [ ] Run migration locally, verify table exists
- [ ] Test vector insert + cosine similarity query via psql
- [ ] Verify existing services still work (no regression)

## Success Criteria
- `docker compose up` starts postgres with pgvector extension enabled
- `SELECT '[1,2,3]'::vector;` returns valid vector
- `Embedding` table exists with HNSW index
- Existing Prisma models unaffected; API starts without errors
- `pnpm build` succeeds in `apps/api`

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Volume incompatibility after image swap | Data loss | Both images use same PG16 data format; backup before switching |
| Prisma migration fails on `Unsupported` type | Blocks phase | Use `--create-only` + manual SQL editing |
| pgvector extension not available | Blocks phase | `pgvector/pgvector:pg16` pre-bundles it; verify with `\dx` |

## Security Considerations
- No new API surface exposed in this phase
- Embedding data is derived from public content (no secrets stored)
- Database credentials unchanged

## Next Steps
- Phase 2 depends on this: embedding service will write to `Embedding` table
