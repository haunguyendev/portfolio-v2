# Phase 7: Knowledge Base Management (Post-MVP)

## Context Links
- [Phase 2: Embedding & Content Indexing](phase-02-embedding-content-indexing.md) — MVP indexing pipeline this phase upgrades
- [Phase 6: Rate Limiting & Deployment](phase-06-rate-limiting-safety-deployment.md) — Admin re-index button (precursor)
- [Brainstorm: Knowledge Management Decision](../reports/brainstorm-260318-2024-ai-chatbot-rag-portfolio.md#knowledge-base-management)
- [Admin Certificates Page](../../apps/web/src/app/(admin)/admin/certificates/page.tsx) — UI pattern reference

## Overview
- **Priority:** P2 (enhancement, post-MVP)
- **Status:** Pending
- **Estimate:** 4h
- **Depends On:** Phase 6 (full chatbot deployed and working)
- **Description:** Add Knowledge Base Management to admin dashboard — toggle knowledge sources on/off, CRUD custom markdown documents, selective per-source re-indexing, and chunk preview. Upgrades the Phase 2 flat indexing to source-aware indexing with a `KnowledgeSource` model.

## Key Insights
- Existing admin dashboard has established CRUD patterns (DataTable, forms, GraphQL queries) for posts, projects, certificates — reuse same patterns
- MVP Phase 2 already stores `sourceType` + `sourceId` on embeddings — Phase 7 formalizes this into a proper relation
- Small dataset (~50-80 chunks) means selective re-index is fast; main value is UX control, not performance
- System sources (profile, skills, etc.) are seeded automatically; custom sources are user-created
- Vector search must filter by `source.enabled = true` — requires updating Phase 3's `similaritySearch()` query

## Requirements

### Functional
- **Source toggling:** Admin toggles knowledge sources on/off; disabled sources excluded from vector search
- **Custom documents:** Admin creates/edits/deletes custom markdown documents (e.g., detailed CV, tech notes)
- **Selective re-index:** Re-index a single source instead of full re-index
- **Chunk preview:** View what chunks (content + metadata) exist for each source
- **System source seeding:** On first run or migration, seed `KnowledgeSource` rows for each system source type

### Non-Functional
- Admin-only access (JWT auth, same as existing admin routes)
- No breaking changes to existing chat API or vector search
- Page load <2s for knowledge list (small dataset)

## Architecture

### Database Schema Changes

#### New Model: KnowledgeSource
```prisma
model KnowledgeSource {
  id        String     @id @default(cuid())
  name      String                            // Human-readable: "Profile", "Blog Posts", etc.
  type      SourceType                        // SYSTEM or CUSTOM
  sourceKey String     @unique               // Machine key: "profile", "skill", "blog", "custom-{id}"
  enabled   Boolean    @default(true)
  content   String?    @db.Text              // Markdown content (CUSTOM type only)
  metadata  Json?                            // Extra config (e.g., custom source description)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  embeddings Embedding[]
}

enum SourceType {
  SYSTEM
  CUSTOM
}
```

#### Updated Model: Embedding (add foreign key)
```prisma
model Embedding {
  id         String            @id @default(cuid())
  content    String
  metadata   Json              @default("{}")
  sourceType String                           // Kept for backward compat + quick filtering
  sourceId   String?
  embedding  Unsupported("vector(768)")?
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt
  // Phase 7 addition:
  knowledgeSource   KnowledgeSource? @relation(fields: [knowledgeSourceId], references: [id], onDelete: SetNull)
  knowledgeSourceId String?
}
```

#### Migration Strategy
1. Create `KnowledgeSource` table + `SourceType` enum
2. Add `knowledgeSourceId` column to `Embedding` (nullable, no breaking change)
3. Seed system sources: profile, skill, experience, project, certificate, blog, diary
4. Backfill: `UPDATE "Embedding" SET "knowledgeSourceId" = (SELECT id FROM "KnowledgeSource" WHERE "sourceKey" = "Embedding"."sourceType")`
5. Add index on `Embedding.knowledgeSourceId`

### System Source Seeds
```typescript
const SYSTEM_SOURCES = [
  { name: 'Profile',      sourceKey: 'profile',     type: 'SYSTEM' },
  { name: 'Skills',       sourceKey: 'skill',        type: 'SYSTEM' },
  { name: 'Experience',   sourceKey: 'experience',   type: 'SYSTEM' },
  { name: 'Projects',     sourceKey: 'project',      type: 'SYSTEM' },
  { name: 'Certificates', sourceKey: 'certificate',  type: 'SYSTEM' },
  { name: 'Blog Posts',   sourceKey: 'blog',         type: 'SYSTEM' },
  { name: 'Diary',        sourceKey: 'diary',        type: 'SYSTEM' },
];
```

### Backend Architecture (NestJS)

#### New Module: KnowledgeModule
```
apps/api/src/knowledge/
  knowledge.module.ts          — NestJS module
  knowledge.resolver.ts        — GraphQL resolver (CRUD + toggle + re-index)
  knowledge.service.ts         — Business logic
  dto/
    knowledge-source.input.ts  — CreateKnowledgeSourceInput, UpdateKnowledgeSourceInput
    knowledge-source.model.ts  — GraphQL object type
```

#### GraphQL Schema (code-first)
```graphql
type KnowledgeSource {
  id: String!
  name: String!
  type: SourceType!
  sourceKey: String!
  enabled: Boolean!
  content: String
  metadata: JSON
  chunkCount: Int!           # computed: count of related embeddings
  lastIndexedAt: DateTime    # computed: max(embedding.createdAt)
  updatedAt: DateTime!
}

type EmbeddingChunk {
  id: String!
  content: String!
  metadata: JSON
  sourceType: String!
  createdAt: DateTime!
}

enum SourceType { SYSTEM CUSTOM }

type Query {
  knowledgeSources: [KnowledgeSource!]!
  knowledgeSourceChunks(sourceId: String!): [EmbeddingChunk!]!
}

type Mutation {
  toggleKnowledgeSource(id: String!, enabled: Boolean!): KnowledgeSource!
  createCustomKnowledgeSource(input: CreateCustomSourceInput!): KnowledgeSource!
  updateCustomKnowledgeSource(id: String!, input: UpdateCustomSourceInput!): KnowledgeSource!
  deleteCustomKnowledgeSource(id: String!): Boolean!
  reindexKnowledgeSource(id: String!): ReindexResult!
}
```

### Changes to Existing Services

#### IndexingService (update from Phase 2)
Add `reindexSource(knowledgeSourceId: string)`:
1. Look up `KnowledgeSource` by id
2. If `SYSTEM`: delete embeddings with matching `knowledgeSourceId`, re-chunk that source type, re-embed, insert with `knowledgeSourceId`
3. If `CUSTOM`: delete embeddings with matching `knowledgeSourceId`, chunk the `content` field using `RecursiveCharacterTextSplitter`, embed, insert

#### ContentChunkerService (update from Phase 2)
Add `chunkCustomSource(source: KnowledgeSource): ContentChunk[]`:
- Split `source.content` using `RecursiveCharacterTextSplitter` (512 tokens, 50 overlap)
- Set `sourceType = source.sourceKey`, `sourceId = source.id`

#### VectorStoreService (update from Phase 3)
Update `similaritySearch()` to filter by enabled sources:
```sql
SELECT e."id", e."content", e."metadata", e."sourceType",
       1 - (e."embedding" <=> $1::vector) as similarity
FROM "Embedding" e
JOIN "KnowledgeSource" ks ON e."knowledgeSourceId" = ks."id"
WHERE ks."enabled" = true
ORDER BY e."embedding" <=> $1::vector
LIMIT $2
```

**Backward compat:** Embeddings without `knowledgeSourceId` (pre-Phase 7) are included via `LEFT JOIN ... WHERE ks."enabled" = true OR e."knowledgeSourceId" IS NULL`.

### Frontend Architecture (Admin)

#### New Pages
```
apps/web/src/app/(admin)/admin/knowledge/
  page.tsx                    — Knowledge sources list (DataTable + toggles)
  custom/
    new/page.tsx              — Create custom document form
    [id]/edit/page.tsx        — Edit custom document form
```

#### New Components
```
apps/web/src/components/admin/
  knowledge-source-table.tsx  — DataTable with toggle switches + re-index buttons
  knowledge-chunk-preview.tsx — Modal/drawer showing chunks for a source
  custom-document-form.tsx    — Markdown editor form for custom docs
```

#### UI Layout: Knowledge Sources List Page
```
+------------------------------------------------------------------+
| Knowledge Base                              [+ New Custom Doc]   |
+------------------------------------------------------------------+
| Source          | Type    | Chunks | Last Indexed | Enabled | Act |
|-----------------|---------|--------|--------------|---------|-----|
| Profile         | SYSTEM  | 1      | 2h ago       | [x]    | [R] |
| Skills          | SYSTEM  | 1      | 2h ago       | [x]    | [R] |
| Experience      | SYSTEM  | 3      | 2h ago       | [x]    | [R] |
| Projects        | SYSTEM  | 5      | 2h ago       | [x]    | [R] |
| Certificates    | SYSTEM  | 4      | 2h ago       | [x]    | [R] |
| Blog Posts      | SYSTEM  | 12     | 2h ago       | [x]    | [R] |
| Diary           | SYSTEM  | 8      | 2h ago       | [ ]    | [R] |
| My Detailed CV  | CUSTOM  | 3      | 1h ago       | [x]    |[E][R][D]|
+------------------------------------------------------------------+
| [R] = Re-index  [E] = Edit  [D] = Delete                        |
| Toggle = shadcn/ui Switch component                              |
+------------------------------------------------------------------+
```

- **Toggle switch** (shadcn/ui `Switch`) — fires `toggleKnowledgeSource` mutation
- **Re-index button** — fires `reindexKnowledgeSource` mutation, shows spinner while running
- **Chunk count** — computed field from `Embedding` count
- **Chunk preview** — click chunk count to open drawer/modal showing individual chunks
- **SYSTEM rows** — no edit/delete (only toggle + re-index)
- **CUSTOM rows** — full CRUD + toggle + re-index

## Related Code Files

### Files to Create
| File | Purpose |
|------|---------|
| `apps/api/src/knowledge/knowledge.module.ts` | NestJS module |
| `apps/api/src/knowledge/knowledge.service.ts` | Business logic: CRUD, toggle, re-index delegation |
| `apps/api/src/knowledge/knowledge.resolver.ts` | GraphQL resolver |
| `apps/api/src/knowledge/dto/knowledge-source.input.ts` | Input types |
| `apps/api/src/knowledge/dto/knowledge-source.model.ts` | GraphQL object types |
| `apps/web/src/app/(admin)/admin/knowledge/page.tsx` | Knowledge sources list |
| `apps/web/src/app/(admin)/admin/knowledge/custom/new/page.tsx` | New custom document |
| `apps/web/src/app/(admin)/admin/knowledge/custom/[id]/edit/page.tsx` | Edit custom document |
| `apps/web/src/components/admin/knowledge-source-table.tsx` | Table with toggles |
| `apps/web/src/components/admin/knowledge-chunk-preview.tsx` | Chunk preview modal |
| `apps/web/src/components/admin/custom-document-form.tsx` | Markdown editor form |
| `packages/prisma/migrations/XXXXXX_add_knowledge_source/migration.sql` | DB migration |
| `packages/prisma/seed-knowledge-sources.ts` | Seed system sources |

### Files to Modify
| File | Change |
|------|--------|
| `packages/prisma/schema.prisma` | Add `KnowledgeSource`, `SourceType` enum, update `Embedding` with FK |
| `apps/api/src/app.module.ts` | Import `KnowledgeModule` |
| `apps/api/src/chat/rag/indexing.service.ts` | Add `reindexSource(knowledgeSourceId)`, update `reindexAll()` to set FK |
| `apps/api/src/chat/rag/content-chunker.service.ts` | Add `chunkCustomSource()` method |
| `apps/api/src/chat/rag/vector-store.service.ts` | Update `similaritySearch()` to filter enabled sources |
| `apps/api/src/chat/rag/vector-store.service.ts` | Add `deleteByKnowledgeSourceId()`, `getChunksBySourceId()` |
| Admin sidebar/nav | Add "Knowledge Base" nav link |

## Implementation Steps

### 1. Prisma Schema + Migration
1. Add `SourceType` enum and `KnowledgeSource` model to `schema.prisma`
2. Add `knowledgeSourceId` FK to `Embedding` model
3. Create migration: `pnpm prisma migrate dev --create-only --name add_knowledge_source`
4. Edit migration SQL: add backfill UPDATE, add index on `knowledgeSourceId`
5. Run migration: `pnpm prisma migrate dev`

### 2. Seed System Sources
1. Create `packages/prisma/seed-knowledge-sources.ts`
2. Upsert 7 system sources (profile, skill, experience, project, certificate, blog, diary)
3. Add to Prisma seed script or run as standalone

### 3. KnowledgeModule Backend
1. Create `knowledge.module.ts` — register service + resolver, import PrismaModule
2. Create `knowledge-source.model.ts` — GraphQL ObjectType with computed `chunkCount`, `lastIndexedAt`
3. Create `knowledge-source.input.ts` — `CreateCustomSourceInput { name, content }`, `UpdateCustomSourceInput { name?, content? }`
4. Create `knowledge.service.ts`:
   - `findAll()` — list all sources with chunk counts
   - `toggle(id, enabled)` — update `enabled` field
   - `createCustom(input)` — create source with type=CUSTOM, generate sourceKey=`custom-${cuid()}`
   - `updateCustom(id, input)` — update name/content
   - `deleteCustom(id)` — delete source + cascade delete its embeddings
   - `getChunks(sourceId)` — return embeddings for preview
5. Create `knowledge.resolver.ts` — wire up queries/mutations, add `@UseGuards(GqlAuthGuard)` on all

### 4. Update Existing Services
1. **IndexingService** — add `reindexSource(knowledgeSourceId: string)`:
   - Fetch `KnowledgeSource` by id
   - Delete embeddings WHERE `knowledgeSourceId` matches
   - If SYSTEM: call existing `ContentChunkerService` method for that source type
   - If CUSTOM: split `source.content` with `RecursiveCharacterTextSplitter`
   - Embed + insert with `knowledgeSourceId` set
2. **IndexingService** — update `reindexAll()` to look up `KnowledgeSource` by sourceKey and set `knowledgeSourceId` on each embedding
3. **ContentChunkerService** — add `chunkCustomSource(source)` method
4. **VectorStoreService** — update `similaritySearch()` with JOIN filter on enabled sources
5. **VectorStoreService** — add `deleteByKnowledgeSourceId(id)`, `getChunksBySourceId(id)`

### 5. Frontend: Knowledge Sources List Page
1. Create `apps/web/src/app/(admin)/admin/knowledge/page.tsx`
2. GraphQL query for `knowledgeSources` with chunk counts
3. Use `DataTable` pattern (same as certificates page)
4. Add shadcn/ui `Switch` for enabled toggle — calls `toggleKnowledgeSource` mutation
5. Add re-index button per row — calls `reindexKnowledgeSource`, shows loading state
6. Add "New Custom Doc" button linking to create page

### 6. Frontend: Custom Document CRUD
1. Create `custom-document-form.tsx` — name input + markdown textarea (plain textarea, not TipTap; keep simple)
2. Create `new/page.tsx` — form that calls `createCustomKnowledgeSource`
3. Create `[id]/edit/page.tsx` — prefill form, calls `updateCustomKnowledgeSource`
4. Delete button on edit page or in table (confirm dialog)

### 7. Frontend: Chunk Preview
1. Create `knowledge-chunk-preview.tsx` — shadcn/ui `Dialog` or `Sheet`
2. Triggered by clicking chunk count in table
3. Calls `knowledgeSourceChunks(sourceId)` query
4. Renders list of chunk cards: content preview (truncated) + metadata + createdAt

### 8. Admin Navigation
1. Add "Knowledge Base" link to admin sidebar/nav (between existing items)
2. Use `Brain` or `Database` icon from lucide-react

### 9. Testing
1. Verify system sources seeded correctly after migration
2. Toggle a source off → verify chatbot responses exclude that source's content
3. Create custom document → re-index → verify chunks appear in preview
4. Delete custom document → verify embeddings cleaned up
5. Selective re-index → verify only that source's embeddings updated
6. Full re-index still works (backward compat)

## Todo List
- [ ] Add `KnowledgeSource` model + `SourceType` enum to Prisma schema
- [ ] Add `knowledgeSourceId` FK to `Embedding` model
- [ ] Create + run migration (with backfill SQL)
- [ ] Create seed script for 7 system sources
- [ ] Create `KnowledgeModule` (module, service, resolver, DTOs)
- [ ] Implement `findAll()` with computed chunk counts
- [ ] Implement `toggle()` mutation
- [ ] Implement CRUD for custom sources
- [ ] Implement `getChunks()` for preview
- [ ] Update `IndexingService.reindexSource()` to use `knowledgeSourceId`
- [ ] Update `IndexingService.reindexAll()` to set FK
- [ ] Add `chunkCustomSource()` to `ContentChunkerService`
- [ ] Update `VectorStoreService.similaritySearch()` to filter enabled sources
- [ ] Add `deleteByKnowledgeSourceId()` + `getChunksBySourceId()` to VectorStoreService
- [ ] Create admin knowledge sources list page
- [ ] Create custom document form component
- [ ] Create new/edit custom document pages
- [ ] Create chunk preview modal component
- [ ] Add "Knowledge Base" to admin navigation
- [ ] Test: toggle source off, verify excluded from search
- [ ] Test: CRUD custom document lifecycle
- [ ] Test: selective re-index per source
- [ ] Test: chunk preview displays correctly
- [ ] Test: backward compat — full re-index still works

## Success Criteria
- All 7 system sources visible in admin knowledge list with correct chunk counts
- Toggle source off → chatbot no longer retrieves content from that source
- Custom document CRUD works: create → re-index → chunks visible in preview → delete → chunks gone
- Selective re-index only affects targeted source (other embeddings unchanged)
- Chunk preview shows individual chunks with content + metadata
- Existing chat API + full re-index unaffected (backward compat)

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration breaks existing embeddings | Vector search fails | Nullable FK; backfill UPDATE; `LEFT JOIN` in search for legacy rows |
| Custom document too large → many chunks | Slow re-index | Warn in UI if content >10K chars; limit to 20 chunks per custom source |
| Toggle off all sources | Empty search results, bad UX | Show warning toast if all sources disabled; chatbot falls back to system prompt |
| Concurrent re-index requests | Race condition on embeddings | Disable re-index button while in progress; rate limit 2/hour (Phase 6) |

## Security Considerations
- All mutations require `GqlAuthGuard` (admin JWT)
- Custom document content sanitized before storage (strip XSS)
- Custom content is only used for embedding, never rendered as HTML
- Re-index endpoint already rate-limited from Phase 6

## Next Steps
- Consider auto-re-index when CMS content changes (webhook/event-driven) — future enhancement
- Consider import/export of custom knowledge documents
- Consider analytics: track which sources contribute most to chat answers
