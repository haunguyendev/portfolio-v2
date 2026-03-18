# Phase 6: Rate Limiting, Safety & Deployment

## Context Links
- [Feasibility: Rate Limiting](../reports/researcher-260318-2012-rag-chatbot-feasibility.md#7-rate-limiting--abuse-prevention)
- [Brainstorm: Risks & Mitigations](../reports/brainstorm-260318-2024-ai-chatbot-rag-portfolio.md#risks)
- [Architecture: Docker Deployment](../visuals/rag-ai-chatbot-architecture.md#4-docker-deployment-view)

## Overview
- **Priority:** P1
- **Status:** Done
- **Estimate:** 2.5h
- **Depends On:** Phase 5 (full feature working locally)
- **Description:** Add rate limiting to chat endpoint, configure Docker for production (pgvector image, env vars, Cloudflare SSE), test end-to-end on server, and add re-index button to admin dashboard.

## Key Insights
- `@nestjs/throttler` handles IP-based rate limiting; integrates with Express middleware
- Behind Cloudflare Tunnel, real client IP is in `CF-Connecting-IP` header — must override `req.ip`
- Docker image swap (`postgres:16-alpine` → `pgvector/pgvector:pg16`) is zero-downtime on existing volumes
- Cloudflare may buffer SSE responses; `X-Accel-Buffering: no` header + Cloudflare "streaming" mode mitigate this
- Admin re-index button reuses existing admin dashboard patterns (JWT-authenticated)

## Requirements

### Functional
- Rate limit: 5 messages/minute per IP on `/api/chat`
- Rate limit: 2 requests/hour on `/api/chat/reindex` (admin only, extra safety)
- Real client IP extracted from Cloudflare headers
- Admin dashboard: "Re-index AI" button triggers `/api/chat/reindex`
- Production Docker Compose uses `pgvector/pgvector:pg16` image
- New env vars (`GOOGLE_API_KEY`, `GROQ_API_KEY`) injected in production

### Non-Functional
- Rate limit returns 429 Too Many Requests with human-readable message
- SSE streaming works through Cloudflare Tunnel without buffering
- Deployment follows existing CI/CD flow (push → GH Actions → GHCR → SSH deploy)
- No new Docker containers added

## Related Code Files

### Files to Create
| File | Purpose |
|------|---------|
| `apps/api/src/chat/guards/chat-throttle.guard.ts` | Custom throttle guard using `CF-Connecting-IP` |

### Files to Modify
| File | Change |
|------|--------|
| `apps/api/package.json` | Add `@nestjs/throttler` |
| `apps/api/src/app.module.ts` | Import `ThrottlerModule` |
| `apps/api/src/chat/chat.controller.ts` | Apply `@Throttle()` decorators |
| `docker-compose.prod.yml` | pgvector image + new env vars for API service |
| `docker-compose.yml` | pgvector image (already done in Phase 1, verify) |
| `.github/workflows/deploy.yml` | Add `GOOGLE_API_KEY`, `GROQ_API_KEY` to deploy secrets |
| `apps/web/src/components/admin/...` | Add re-index button (identify exact file) |

## Architecture

### Rate Limiting Strategy
```
Request → Cloudflare Tunnel → NestJS
           │
           ├── CF-Connecting-IP: 1.2.3.4  (real client IP)
           └── X-Forwarded-For: 1.2.3.4   (standard proxy header)

NestJS ThrottlerGuard:
  - Extract IP from CF-Connecting-IP (priority) or X-Forwarded-For
  - /api/chat: 5 req/min per IP
  - /api/chat/reindex: 2 req/hour (admin only, extra safety)
  - Returns 429 with: { statusCode: 429, message: "Too many requests. Please wait a moment." }
```

### Production Environment Variables
```env
# Add to /opt/portfolio/.env on server
GOOGLE_API_KEY=<gemini-api-key>
GROQ_API_KEY=<groq-api-key>
```

### Docker Compose Changes (Production)
```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16  # Changed from postgres:16-alpine
    # ... rest unchanged

  api:
    environment:
      # ... existing vars
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}
      GROQ_API_KEY: ${GROQ_API_KEY}
```

## Implementation Steps

### 1. Install @nestjs/throttler
```bash
cd apps/api
pnpm add @nestjs/throttler
```

### 2. Create custom throttle guard for Cloudflare IP

```typescript
// apps/api/src/chat/guards/chat-throttle.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CloudflareThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    // Cloudflare Tunnel provides real client IP
    const ip =
      req.headers['cf-connecting-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip;
    return Promise.resolve(ip);
  }
}
```

### 3. Configure ThrottlerModule in AppModule

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 60 seconds
      limit: 30,   // generous default for general API
    }]),
    // ... existing modules
  ],
})
export class AppModule {}
```

### 4. Apply rate limits to chat endpoints

```typescript
// chat.controller.ts
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { CloudflareThrottlerGuard } from './guards/chat-throttle.guard';

@Controller('chat')
export class ChatController {
  @Post()
  @UseGuards(CloudflareThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })  // 5 req/min
  async chat(@Body() body, @Res() res) {
    // ... existing implementation
  }

  @Post('reindex')
  @UseGuards(JwtAuthGuard, CloudflareThrottlerGuard)
  @Throttle({ default: { limit: 2, ttl: 3600000 } })  // 2 req/hour
  async reindex() {
    // ... existing implementation
  }
}
```

### 5. Handle 429 response gracefully on frontend

Add error handling in the chat panel:
```typescript
// chat-panel.tsx — useChat options
const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
  api: `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
  onError: (err) => {
    // useChat handles errors; display in UI
    console.error('Chat error:', err.message);
  },
});

// Show error in UI
{error && (
  <div className="mx-4 mb-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
    {error.message.includes('429')
      ? 'Too many messages. Please wait a moment and try again.'
      : 'Something went wrong. Please try again.'}
  </div>
)}
```

### 6. Update production Docker Compose

```yaml
# docker-compose.prod.yml
services:
  postgres:
    image: pgvector/pgvector:pg16  # Updated

  api:
    environment:
      # ... existing vars
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}
      GROQ_API_KEY: ${GROQ_API_KEY}
```

### 7. Add env vars to server

SSH to server and add to `/opt/portfolio/.env`:
```bash
ssh deploy.haunguyendev.xyz
echo 'GOOGLE_API_KEY=your_key_here' >> /opt/portfolio/.env
echo 'GROQ_API_KEY=your_key_here' >> /opt/portfolio/.env
```

### 8. Update GitHub Actions secrets

Add `GOOGLE_API_KEY` and `GROQ_API_KEY` as repository secrets if CI/CD needs them for testing. For deployment, they're read from server `.env` — no CI changes needed unless build-time validation is added.

### 9. Add admin re-index button

Identify the admin dashboard component and add a button:
```typescript
// In admin dashboard component (find exact location)
const handleReindex = async () => {
  setReindexing(true);
  try {
    const client = await getAuthenticatedGqlClient();
    // Use REST endpoint directly (not GraphQL)
    const res = await fetch(`${API_URL}/api/chat/reindex`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    toast.success(`Re-indexed ${data.chunksIndexed} chunks`);
  } catch (err) {
    toast.error('Re-index failed');
  } finally {
    setReindexing(false);
  }
};
```

### 10. Test SSE through Cloudflare Tunnel

Deploy to staging/production and test:
```bash
curl -X POST https://portfolio-api.haunguyendev.xyz/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Tell me about Kane"}]}' \
  --no-buffer
```

If Cloudflare buffers the response (all tokens arrive at once):
- Check Cloudflare Dashboard → Rules → Transform Rules → set `X-Accel-Buffering: no` for API routes
- Or add a Cloudflare Worker to disable buffering for `/api/chat`

### 11. Run initial re-index on production

After first deploy:
```bash
curl -X POST https://portfolio-api.haunguyendev.xyz/api/chat/reindex \
  -H "Authorization: Bearer <admin_jwt>"
```

Or use the admin dashboard button.

### 12. Validate env vars on API startup

Add validation in `main.ts` or `ChatModule`:
```typescript
// chat.module.ts — onModuleInit
@Module({ ... })
export class ChatModule implements OnModuleInit {
  onModuleInit() {
    const required = ['GOOGLE_API_KEY', 'GROQ_API_KEY'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length) {
      console.warn(`⚠️ Chat module: missing env vars: ${missing.join(', ')}. Chat feature will be disabled.`);
    }
  }
}
```

## Todo List
- [ ] Install `@nestjs/throttler` in `apps/api`
- [ ] Create `CloudflareThrottlerGuard` with CF-Connecting-IP extraction
- [ ] Configure `ThrottlerModule` in `AppModule`
- [ ] Apply `@Throttle(5/min)` to `POST /api/chat`
- [ ] Apply `@Throttle(2/hour)` to `POST /api/chat/reindex`
- [ ] Add error display for 429 in frontend `ChatPanel`
- [ ] Update `docker-compose.prod.yml` — pgvector image + env vars
- [ ] Add `GOOGLE_API_KEY` and `GROQ_API_KEY` to server `.env`
- [ ] Add env var validation in `ChatModule.onModuleInit()`
- [ ] Add admin re-index button to dashboard
- [ ] Deploy to production
- [ ] Run initial re-index on production
- [ ] Test: 6th message in 1 minute returns 429
- [ ] Test: SSE streams correctly through Cloudflare Tunnel
- [ ] Test: admin re-index button works
- [ ] Test: chat widget works end-to-end on production URL
- [ ] Test: Vietnamese question returns Vietnamese response

## Success Criteria
- Rate limiter blocks 6th request within 60s (returns 429)
- Frontend shows friendly "too many messages" error on 429
- Production chat streams responses through Cloudflare Tunnel
- Admin can trigger re-index from dashboard
- All existing features (blog, projects, admin) unaffected
- `docker compose up` works on server with new pgvector image
- Chat answers portfolio questions accurately on production

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Cloudflare buffers SSE | User sees delayed bulk response | `X-Accel-Buffering: no` header; test in staging |
| pgvector image pull fails on server | DB won't start | Pre-pull image: `docker pull pgvector/pgvector:pg16` |
| API keys exposed in logs | Security breach | Never log API keys; use env vars only |
| Rate limit too aggressive | Bad UX for legitimate users | Start at 5/min; increase if real users complain |
| Existing postgres volume incompatible | Data loss | Same PG16 data format; backup volume before deploy |

## Security Considerations
- API keys stored in server `.env` file only (not in git, not in CI logs)
- Rate limiting prevents abuse + protects free tier quotas
- Cloudflare IP extraction prevents rate limit bypass via proxy headers
- Admin reindex behind JWT + rate limit (defense in depth)
- Chat endpoint validates input length (500 chars max) + message count (max 20)
- No user data persisted from chat conversations

## Deployment Checklist
1. [ ] Backup production database volume
2. [ ] Pre-pull `pgvector/pgvector:pg16` on server
3. [ ] Add env vars to server `/opt/portfolio/.env`
4. [ ] Push code → GH Actions builds new images
5. [ ] SSH to server → `docker compose pull && docker compose up -d`
6. [ ] Verify DB starts with pgvector: `docker exec portfolio_postgres psql -U postgres -c "SELECT extversion FROM pg_extension WHERE extname='vector'"`
7. [ ] Run Prisma migration: `docker exec portfolio_api npx prisma migrate deploy`
8. [ ] Trigger re-index via admin dashboard or curl
9. [ ] Test chat on `https://portfolio.haunguyendev.xyz`
10. [ ] Monitor for errors in `docker logs portfolio_api`

## Next Steps (Post-MVP, Future)
- Chat history persistence in DB (optional)
- Analytics: track popular questions
- Auto-detect language (Vietnamese vs English)
- CAPTCHA if abuse increases
- Incremental re-indexing (per-document instead of full)
- Markdown rendering in chat responses
