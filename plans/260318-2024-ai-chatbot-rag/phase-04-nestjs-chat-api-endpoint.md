# Phase 4: NestJS Chat API Endpoint (SSE)

## Context Links
- [Feasibility: Vercel AI SDK Self-Hosted](../reports/researcher-260318-2012-rag-chatbot-feasibility.md#5-vercel-ai-sdk-for-self-hosted-deployment)
- [Architecture: Query Pipeline Sequence](../visuals/rag-ai-chatbot-architecture.md#3-query-pipeline-every-user-message)

## Overview
- **Priority:** P1
- **Status:** Done
- **Estimate:** 2.5h
- **Depends On:** Phase 3 (RagService streaming)
- **Description:** Expose the RAG pipeline as a REST SSE endpoint on NestJS. The frontend (Phase 5) will use Vercel AI SDK's `useChat` hook, which expects a specific streaming protocol. Also add admin-only re-index endpoint.

## Key Insights
- **GraphQL is NOT suitable for streaming chat** — Apollo subscriptions add WebSocket complexity; SSE via REST is simpler and what Vercel AI SDK expects
- Vercel AI SDK `useChat` expects the backend to return SSE in the **AI SDK Data Stream Protocol** format
- NestJS supports SSE natively via `@Sse()` decorator or manual `res.write()` on Express response
- However, `useChat` uses POST (not GET/EventSource), so we need manual SSE response writing, not `@Sse()`
- The API already uses Express under the hood (`@nestjs/platform-express`)
- Two endpoints needed: `POST /api/chat` (public, streaming) and `POST /api/chat/reindex` (admin-only)
- CORS already configured in `main.ts` — just ensure SSE headers are set

## Requirements

### Functional
- `POST /api/chat` accepts `{ messages: [{ role, content }] }`, returns SSE stream
- Response format compatible with Vercel AI SDK Data Stream Protocol
- `POST /api/chat/reindex` triggers full re-index (admin auth required)
- Chat endpoint is public (no auth) but rate-limited (Phase 6)

### Non-Functional
- SSE connection stays alive for up to 60s (covers longest possible response)
- Proper error handling — stream error message to client, then close
- CORS headers for SSE responses
- Cloudflare Tunnel compatibility (disable response buffering)

## Related Code Files

### Files to Create
| File | Purpose |
|------|---------|
| `apps/api/src/chat/chat.controller.ts` | REST controller with SSE chat + reindex endpoints |
| `apps/api/src/chat/chat.service.ts` | Thin orchestration: validates input, calls RagService, formats SSE |

### Files to Modify
| File | Change |
|------|--------|
| `apps/api/src/chat/chat.module.ts` | Register controller + service |
| `apps/api/src/app.module.ts` | Import `ChatModule` |
| `apps/api/src/main.ts` | No changes needed (CORS already configured) |

## Architecture

### Vercel AI SDK Data Stream Protocol

The `useChat` hook sends POST requests and expects text-stream SSE response. The simplest compatible format uses the **text stream** protocol:

```
// Response headers
Content-Type: text/plain; charset=utf-8
X-Vercel-AI-Data-Stream: v1

// Response body (each line is a data part)
0:"Hello"
0:" there"
0:"! Kane"
0:" has built"
0:" 9 projects."
d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}
```

Format: `{type_code}:{json_value}\n`
- `0:` = text delta (string)
- `d:` = finish message (object)
- `e:` = error (object)

This is the **Stream Data Protocol** that `useChat` parses natively.

### Endpoint Design
```
POST /api/chat
  Body: { messages: [{ role: 'user' | 'assistant', content: string }] }
  Response: SSE text stream (Vercel AI SDK format)

POST /api/chat/reindex
  Headers: Authorization: Bearer <jwt>
  Response: { chunksIndexed: number }
```

### Cloudflare Tunnel Compatibility
Cloudflare may buffer SSE responses. Add headers to disable buffering:
```typescript
res.setHeader('X-Accel-Buffering', 'no');       // Nginx
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
```

## Implementation Steps

### 1. Create ChatService (`chat/chat.service.ts`)

Thin layer that validates input and delegates to RagService:
```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { RagService } from './rag/rag.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class ChatService {
  constructor(private ragService: RagService) {}

  async *chat(messages: ChatMessage[]): AsyncGenerator<string> {
    if (!messages?.length) {
      throw new BadRequestException('Messages array is required');
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user') {
      throw new BadRequestException('Last message must be from user');
    }

    if (lastMessage.content.length > 500) {
      throw new BadRequestException('Message too long (max 500 chars)');
    }

    // Pass history (all except last) + current question
    const history = messages.slice(0, -1);
    yield* this.ragService.query(lastMessage.content, history);
  }
}
```

### 2. Create ChatController (`chat/chat.controller.ts`)

Manual SSE response writing (not `@Sse()` because `useChat` uses POST):
```typescript
import { Controller, Post, Body, Res, UseGuards, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { IndexingService } from './rag/indexing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private indexingService: IndexingService,
  ) {}

  @Post()
  @HttpCode(200)
  async chat(
    @Body() body: { messages: { role: string; content: string }[] },
    @Res() res: Response,
  ) {
    // Set SSE headers for Vercel AI SDK compatibility
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Vercel-AI-Data-Stream', 'v1');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      for await (const token of this.chatService.chat(body.messages)) {
        // Vercel AI SDK text delta format: 0:"text"\n
        res.write(`0:${JSON.stringify(token)}\n`);
      }
      // Finish message
      res.write(`d:${JSON.stringify({ finishReason: 'stop', usage: { promptTokens: 0, completionTokens: 0 } })}\n`);
    } catch (error) {
      // Stream error to client
      res.write(`e:${JSON.stringify({ message: error.message || 'An error occurred' })}\n`);
    } finally {
      res.end();
    }
  }

  @Post('reindex')
  @UseGuards(JwtAuthGuard)
  async reindex() {
    const result = await this.indexingService.reindexAll();
    return result;
  }
}
```

### 3. Update ChatModule

```typescript
import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { RagService } from './rag/rag.service';
import { EmbeddingService } from './rag/embedding.service';
import { VectorStoreService } from './rag/vector-store.service';
import { LlmProviderService } from './rag/llm-provider.service';
import { IndexingService } from './rag/indexing.service';
import { ContentChunkerService } from './rag/content-chunker.service';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    RagService,
    EmbeddingService,
    VectorStoreService,
    LlmProviderService,
    IndexingService,
    ContentChunkerService,
  ],
})
export class ChatModule {}
```

### 4. Import ChatModule in AppModule

```typescript
// app.module.ts
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // ... existing modules
    ChatModule,
  ],
})
export class AppModule {}
```

### 5. Test with curl

```bash
# Test chat endpoint
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Tell me about Kane"}]}' \
  --no-buffer

# Expected output (streamed):
# 0:"Kane"
# 0:" Nguyen"
# 0:" is a"
# 0:" Software Engineer..."
# d:{"finishReason":"stop",...}

# Test reindex (requires JWT)
curl -X POST http://localhost:3001/api/chat/reindex \
  -H "Authorization: Bearer <jwt_token>"

# Expected: {"chunksIndexed": 55}
```

### 6. Test Vercel AI SDK compatibility

Quick test from browser console or Next.js page:
```typescript
const response = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'What projects has Kane built?' }],
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value));
}
```

## Todo List
- [ ] Create `ChatService` with input validation
- [ ] Create `ChatController` with SSE streaming endpoint
- [ ] Create `ChatController.reindex()` admin endpoint
- [ ] Update `ChatModule` to register controller + all services
- [ ] Import `ChatModule` in `AppModule`
- [ ] Test: `POST /api/chat` returns SSE stream with correct format
- [ ] Test: response includes `X-Vercel-AI-Data-Stream: v1` header
- [ ] Test: `POST /api/chat/reindex` works with JWT auth
- [ ] Test: `POST /api/chat/reindex` returns 401 without JWT
- [ ] Test: error in RAG pipeline streams error message to client
- [ ] Test: empty/invalid messages body returns 400
- [ ] Test: message length >500 chars returns 400

## Success Criteria
- `POST /api/chat` streams tokens in Vercel AI SDK format
- Stream includes `0:` text deltas followed by `d:` finish message
- Error responses use `e:` error format
- Admin reindex endpoint works behind JWT guard
- `pnpm build` succeeds in `apps/api`
- SSE response works through local dev (no buffering issues)

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Vercel AI SDK format mismatch | Frontend can't parse stream | Test with `useChat` in Phase 5; adjust format if needed |
| Cloudflare Tunnel buffers SSE | User sees all tokens at once | `X-Accel-Buffering: no` header; test in staging |
| Long response times out | Incomplete answer | Set 60s timeout; limit `maxTokens` to 1024 |
| Request body too large | Memory issues | Validate message length (500 chars) + count (max 20 messages) |

## Security Considerations
- Chat endpoint is public (intentional — visitors use it)
- Reindex endpoint protected by `JwtAuthGuard` (admin only)
- Input validation: max 500 chars per message, max 20 messages in history
- No user data stored from chat (session-only in Phase 5 frontend)
- Rate limiting added in Phase 6

## Next Steps
- Phase 5 builds the frontend chat widget using `useChat` hook connected to this endpoint
