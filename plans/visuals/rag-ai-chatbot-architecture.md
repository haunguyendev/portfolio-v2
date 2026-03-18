# Diagram: RAG AI Chatbot Architecture for Portfolio

## 1. System Architecture Overview (ASCII)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PORTFOLIO WEBSITE                               │
│                                                                          │
│  ┌───────────────────────┐          ┌──────────────────────────────────┐ │
│  │   Next.js Frontend    │          │     NestJS GraphQL API           │ │
│  │                       │          │                                  │ │
│  │  ┌─────────────────┐  │  SSE     │  ┌────────────────────────────┐  │ │
│  │  │  Chat Widget    │──┼─────────►│  │  ChatModule                │  │ │
│  │  │  (useChat)      │◄─┼─────────┐│  │  ├─ ChatResolver           │  │ │
│  │  └─────────────────┘  │ Stream  ││  │  ├─ ChatService             │  │ │
│  │                       │         ││  │  └─ RAG Pipeline            │  │ │
│  │  ┌─────────────────┐  │         ││  └─────────┬──────────────────┘  │ │
│  │  │  Admin Dashboard │  │         ││            │                     │ │
│  │  │  ┌────────────┐  │  │         ││  ┌─────────▼──────────────────┐  │ │
│  │  │  │ Knowledge  │──┼──┼─────────┼┼─►│  KnowledgeModule           │  │ │
│  │  │  │ Management │  │  │         ││  │  ├─ KnowledgeResolver      │  │ │
│  │  │  └────────────┘  │  │         ││  │  ├─ KnowledgeService       │  │ │
│  │  └─────────────────┘  │         ││  │  └─ IndexingService         │  │ │
│  │                       │         ││  └────────────────────────────┘  │ │
│  │  Pages:               │         ││                                  │ │
│  │  - Home, Projects     │         ││  ┌────────────────────────────┐  │ │
│  │  - About, Blog, Diary │         ││  │  Existing Modules          │  │ │
│  └───────────────────────┘         ││  │  Posts, Projects, Certs    │  │ │
│                                    ││  └────────────────────────────┘  │ │
│                                    │└──────────────────────────────────┘ │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────┐
          │                         │                       │
          ▼                         ▼                       ▼
┌──────────────────┐  ┌──────────────────────┐  ┌────────────────────┐
│  PostgreSQL 16   │  │   Gemini Embedding   │  │   Groq / Gemini    │
│  + pgvector      │  │   API (FREE)         │  │   Flash (FREE)     │
│                  │  │                      │  │                    │
│  Tables:         │  │  text → vector       │  │  context + query   │
│  - embeddings    │  │  768 dimensions      │  │  → answer stream   │
│  - knowledge_src │  │  1500 RPM free       │  │  30 RPM free       │
│  - chat_history  │  └──────────────────────┘  └────────────────────┘
│  - existing...   │
└──────────────────┘
```

## 2. Knowledge Base Management Flow (NEW)

```mermaid
flowchart TD
    subgraph Admin["Admin Dashboard - Knowledge Management"]
        LIST["Knowledge Sources List<br/>Toggle ON/OFF per source"]
        CUSTOM["Custom Documents<br/>CRUD markdown docs"]
        PREVIEW["Preview Chunks<br/>See what chatbot knows"]
        REINDEX["Selective Re-index<br/>Per source or full"]
    end

    subgraph DB["PostgreSQL"]
        KS["knowledge_sources<br/>id, name, type, enabled,<br/>content, metadata"]
        EMB["embeddings<br/>id, content, vector(768),<br/>source_id, metadata"]
    end

    subgraph IndexPipeline["Indexing Pipeline"]
        FILTER["Filter: enabled = true"]
        CHUNK["Content Chunker"]
        EMBED["Gemini Embedding API"]
    end

    subgraph QueryPipeline["Query Pipeline"]
        QFILTER["Filter: source.enabled = true"]
        VSEARCH["Vector Similarity Search"]
        LLM["LLM Response"]
    end

    LIST -->|"Toggle"| KS
    CUSTOM -->|"Save"| KS
    REINDEX -->|"Trigger"| FILTER
    PREVIEW -->|"Read"| EMB

    FILTER -->|"Enabled sources only"| CHUNK
    CHUNK --> EMBED
    EMBED -->|"Store"| EMB
    EMB -.->|"Relation"| KS

    QFILTER -->|"WHERE enabled=true"| VSEARCH
    VSEARCH --> LLM

    style Admin fill:#e3f2fd,stroke:#1565c0
    style DB fill:#fce4ec,stroke:#c62828
    style IndexPipeline fill:#fff3e0,stroke:#ef6c00
    style QueryPipeline fill:#e8f5e9,stroke:#2e7d32
```

## 3. Indexing Pipeline (with Source Management)

```mermaid
flowchart TD
    subgraph SystemSources["SYSTEM Sources (from code/CMS)"]
        P["profile.json<br/>Bio, Contact, Social"]
        S["skills.json<br/>Tech Skills"]
        E["experience.json<br/>Work History"]
        C["certificates.json<br/>Credentials"]
        PJ["Projects<br/>via GraphQL API"]
        B["Blog Posts<br/>MDX Content"]
        D["Diary Entries<br/>MDX Content"]
    end

    subgraph CustomSources["CUSTOM Sources (from Admin)"]
        CD1["Custom Doc 1<br/>e.g. Detailed CV"]
        CD2["Custom Doc 2<br/>e.g. Tech Learning"]
        CDN["Custom Doc N<br/>e.g. Career Goals"]
    end

    subgraph Filter["Source Filter"]
        CHECK{"source.enabled<br/>== true?"}
    end

    subgraph Chunking["Chunking Strategy"]
        CH["Content Chunker<br/>400-512 tokens<br/>10-20% overlap"]
    end

    subgraph Embedding["Embedding"]
        GE["Google Gemini<br/>text-embedding-001<br/>768 dimensions<br/>FREE"]
    end

    subgraph Storage["Vector Storage"]
        PG["PostgreSQL 16 + pgvector"]
        TB["embeddings table:<br/>id, content, vector(768),<br/>source_id, metadata"]
    end

    SystemSources --> CHECK
    CustomSources --> CHECK
    CHECK -->|"YES"| CH
    CHECK -->|"NO: skip"| SKIP["Skipped"]
    CH --> GE
    GE -->|"vector[768]"| PG
    PG --> TB

    style SystemSources fill:#e8f5e9,stroke:#2e7d32
    style CustomSources fill:#e1f5fe,stroke:#0277bd
    style Filter fill:#fff9c4,stroke:#f9a825
    style Chunking fill:#fff3e0,stroke:#ef6c00
    style Embedding fill:#e3f2fd,stroke:#1565c0
    style Storage fill:#fce4ec,stroke:#c62828
```

## 4. Query Pipeline (with Source Filtering)

```mermaid
sequenceDiagram
    actor User as Visitor
    participant FE as Next.js<br/>Chat Widget
    participant API as NestJS<br/>ChatResolver
    participant RAG as RAG Service
    participant EMB as Gemini<br/>Embedding API
    participant PG as PostgreSQL<br/>pgvector
    participant LLM as Groq/Gemini<br/>Flash LLM

    User->>FE: "What projects has Kane built?"
    FE->>API: POST /api/chat (SSE)

    Note over API: Rate limit check<br/>5 msg/min per IP

    API->>RAG: processQuery(message)

    RAG->>EMB: embed("What projects has Kane built?")
    EMB-->>RAG: vector[768]

    RAG->>PG: SELECT e.content, e.metadata<br/>FROM embeddings e<br/>JOIN knowledge_sources ks<br/>ON e.source_id = ks.id<br/>WHERE ks.enabled = true<br/>ORDER BY e.embedding <=> query_vec<br/>LIMIT 5
    PG-->>RAG: Top 5 relevant chunks<br/>(only from enabled sources)

    Note over RAG: Build prompt:<br/>System: "You are Kane's AI assistant..."<br/>Context: {5 retrieved chunks}<br/>Question: {user message}

    RAG->>LLM: streamText(prompt)

    loop Streaming Response
        LLM-->>RAG: token chunk
        RAG-->>API: SSE chunk
        API-->>FE: SSE chunk
        FE-->>User: Render incrementally
    end

    Note over API: Save to chat_history
```

## 5. Admin Knowledge Management UI (ASCII Wireframe)

```
┌─────────────────────────────────────────────────────────┐
│  Admin > Knowledge Base                    [Re-index All]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  SYSTEM SOURCES                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Source           │ Chunks │ Last Index  │ Status  │    │
│  ├──────────────────┼────────┼─────────────┼─────────┤    │
│  │ Profile & Bio    │   1    │ 2 hours ago │ [✅ ON] │    │
│  │ Skills           │   4    │ 2 hours ago │ [✅ ON] │    │
│  │ Experience       │   3    │ 2 hours ago │ [✅ ON] │    │
│  │ Projects         │   8    │ 2 hours ago │ [✅ ON] │    │
│  │ Blog Posts       │  12    │ 2 hours ago │ [✅ ON] │    │
│  │ Diary Entries    │   6    │ 2 hours ago │ [❌ OFF]│    │
│  │ Certificates     │   5    │ 2 hours ago │ [✅ ON] │    │
│  └──────────────────┴────────┴─────────────┴─────────┘    │
│                                                          │
│  CUSTOM DOCUMENTS                          [+ Add New]   │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Document         │ Chunks │ Last Index  │ Actions │    │
│  ├──────────────────┼────────┼─────────────┼─────────┤    │
│  │ Detailed CV      │   3    │ 1 day ago   │ [✏️][🗑]│    │
│  │ Tech Learning    │   2    │ 3 days ago  │ [✏️][🗑]│    │
│  │ Career Goals     │   1    │ 1 week ago  │ [✏️][🗑]│    │
│  └──────────────────┴────────┴─────────────┴─────────┘    │
│                                                          │
│  CHUNK PREVIEW (click source to view)                    │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Source: Projects > Portfolio V2                    │    │
│  │ ─────────────────────────────────────────────     │    │
│  │ "Kane built Portfolio V2, a full-stack personal   │    │
│  │  website using Next.js 15, NestJS, GraphQL,       │    │
│  │  PostgreSQL, and Docker. Features include CMS     │    │
│  │  admin dashboard, blog system, and AI chatbot..." │    │
│  │                                                    │    │
│  │ Tokens: 487 | Vector dims: 768 | Similarity: N/A  │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 6. Selective Re-index Flow (ASCII)

```
┌─────────────────── SELECTIVE RE-INDEX ───────────────────┐
│                                                          │
│  Trigger: Admin clicks [Re-index] on specific source     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Step 1: DELETE existing chunks                    │    │
│  │         WHERE source_id = selected_source         │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         ▼                                │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Step 2: READ latest content                       │    │
│  │         SYSTEM → read from JSON/API/MDX           │    │
│  │         CUSTOM → read from knowledge_sources.content│   │
│  └──────────────────────┬───────────────────────────┘    │
│                         ▼                                │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Step 3: CHUNK content                             │    │
│  │         RecursiveCharacterTextSplitter            │    │
│  │         400-512 tokens, 10-20% overlap            │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         ▼                                │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Step 4: EMBED chunks via Gemini API               │    │
│  │         Batch: 5-10 chunks per request            │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         ▼                                │
│  ┌──────────────────────────────────────────────────┐    │
│  │ Step 5: INSERT new embeddings                     │    │
│  │         WITH source_id = selected_source          │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  Total time: ~2-5 seconds per source                     │
└──────────────────────────────────────────────────────────┘
```

## 7. Docker Deployment View

```mermaid
flowchart TB
    subgraph Server["Ubuntu Server - Proxmox VM (192.168.1.123)"]
        subgraph Docker["Docker Compose"]
            WEB["web<br/>Next.js 15<br/>:3000<br/>+ Chat Widget<br/>+ Admin Knowledge UI"]
            API["api<br/>NestJS GraphQL<br/>:3001<br/>+ ChatModule<br/>+ KnowledgeModule<br/>+ RAG Service"]
            DB["postgres<br/>pgvector/pgvector:pg16<br/>:5432"]
            MINIO["minio<br/>S3 Storage<br/>:9000"]
        end

        WEB -->|"GraphQL + SSE"| API
        API -->|"Prisma ORM<br/>+ raw SQL for vectors"| DB
        API -->|"Media files"| MINIO
    end

    subgraph External["External Services (FREE)"]
        GEM_E["Google Gemini<br/>Embedding API"]
        GEM_L["Google Gemini Flash<br/>OR Groq Llama 3.3<br/>LLM Chat API"]
    end

    subgraph CF["Cloudflare"]
        TUNNEL["Cloudflare Tunnel"]
        DNS["DNS: haunguyendev.xyz"]
    end

    API -->|"HTTPS"| GEM_E
    API -->|"HTTPS + Streaming"| GEM_L
    DNS --> TUNNEL --> WEB & API

    style Server fill:#f3e5f5,stroke:#7b1fa2
    style External fill:#e8f5e9,stroke:#2e7d32
    style CF fill:#fff3e0,stroke:#ef6c00
```

## 8. New Files to Create (Updated)

```
apps/api/src/
  ├── chat/                              ← CHAT MODULE
  │   ├── chat.module.ts
  │   ├── chat.controller.ts             ← REST SSE endpoint
  │   ├── chat.service.ts
  │   ├── rag/
  │   │   ├── rag.service.ts             ← RAG orchestration
  │   │   ├── content-chunker.service.ts ← Content → chunks
  │   │   ├── embedding.service.ts       ← Gemini Embedding API
  │   │   └── vector-store.service.ts    ← pgvector queries
  │   └── dto/
  │       ├── chat-input.dto.ts
  │       └── chat-response.dto.ts
  │
  └── knowledge/                         ← KNOWLEDGE MODULE (Phase 7)
      ├── knowledge.module.ts
      ├── knowledge.resolver.ts          ← GraphQL CRUD
      ├── knowledge.service.ts           ← Business logic
      ├── indexing.service.ts            ← Selective re-index
      └── dto/
          ├── knowledge-source.input.ts
          └── custom-document.input.ts

apps/web/src/
  ├── components/
  │   └── chat/                          ← CHAT WIDGET
  │       ├── chat-widget.tsx            ← Floating bubble + panel
  │       ├── chat-messages.tsx          ← Message list
  │       ├── chat-input.tsx             ← Input field
  │       └── chat-bubble.tsx            ← Individual message
  │
  └── app/(admin)/admin/
      └── knowledge/                     ← ADMIN KNOWLEDGE PAGE (Phase 7)
          ├── page.tsx                   ← Source list + toggles
          ├── documents/
          │   ├── new/page.tsx           ← Create custom doc
          │   └── [id]/edit/page.tsx     ← Edit custom doc
          └── components/
              ├── source-table.tsx       ← System sources table
              ├── document-table.tsx     ← Custom docs table
              └── chunk-preview.tsx      ← Preview chunks panel

packages/prisma/schema.prisma           ← Add KnowledgeSource + Embedding models
```
