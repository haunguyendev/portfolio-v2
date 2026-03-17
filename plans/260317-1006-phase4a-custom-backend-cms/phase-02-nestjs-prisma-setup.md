# Phase 2: NestJS + Prisma Setup

## Overview
- **Priority:** HIGH
- **Status:** Complete
- **Effort:** 4h
- **Blocked by:** Phase 1 (monorepo must exist)

Initialize NestJS project in `apps/api/`, create Prisma schema in `packages/prisma/`, set up PostgreSQL via Docker Compose.

## Architecture

```
apps/api/                        packages/prisma/
├── src/                         ├── schema.prisma
│   ├── app.module.ts            ├── package.json
│   ├── main.ts                  ├── tsconfig.json
│   └── health/                  └── seed.ts (Phase 6)
│       ├── health.controller.ts
│       └── health.module.ts
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── Dockerfile

docker-compose.yml (root)
├── postgres (5432)
└── api (3001) — optional, dev uses nest start
```

## Implementation Steps

### 1. Create packages/prisma
- `packages/prisma/package.json` with `@prisma/client`, `prisma` as deps
- Copy full Prisma schema from brainstorm report
- `packages/prisma/tsconfig.json`
- Export generated client: `packages/prisma/index.ts` → `export * from '@prisma/client'`
- Scripts: `"generate": "prisma generate"`, `"migrate": "prisma migrate dev"`, `"studio": "prisma studio"`

### 2. Create apps/api (NestJS)
- `npx @nestjs/cli new api --directory apps/api --package-manager pnpm --skip-git`
- Or manually scaffold: `apps/api/src/main.ts`, `app.module.ts`
- Add workspace dep: `"@portfolio/prisma": "workspace:*"` in `apps/api/package.json`
- Health check endpoint: `GET /api/health` → `{ status: 'ok', timestamp }`

### 3. Docker Compose
```yaml
# docker-compose.yml (root)
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: portfolio_dev
      POSTGRES_DB: portfolio
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 4. Prisma setup
- `DATABASE_URL="postgresql://portfolio:portfolio_dev@localhost:5432/portfolio"`
- Run `pnpm --filter @portfolio/prisma generate`
- Run `pnpm --filter @portfolio/prisma migrate dev --name init`
- Verify tables created in PostgreSQL

### 5. NestJS Prisma integration
- Create `apps/api/src/prisma/prisma.service.ts` — extends PrismaClient
- Create `apps/api/src/prisma/prisma.module.ts` — Global module
- Register PrismaModule in AppModule

### 6. Update turbo.json
- Add `apps/api` tasks: `build`, `dev`, `lint`
- `dev` for api: `nest start --watch`

### 7. Verify
- `docker compose up -d` → PostgreSQL running
- `pnpm --filter api dev` → NestJS starts on port 3001
- `curl localhost:3001/api/health` → 200 OK
- Prisma Studio: `pnpm --filter @portfolio/prisma studio` → browse tables

## Related Code Files
- `packages/prisma/schema.prisma` (NEW)
- `packages/prisma/package.json` (NEW)
- `apps/api/src/**` (NEW)
- `docker-compose.yml` (NEW)
- `turbo.json` (MODIFY)
- `.env` (NEW — DATABASE_URL)

## Todo List
- [x] Create `packages/prisma/` with full schema
- [x] Create `docker-compose.yml` with PostgreSQL
- [x] Start PostgreSQL, run initial migration
- [x] Scaffold NestJS project in `apps/api/`
- [x] Create PrismaService + PrismaModule
- [x] Create health check endpoint
- [x] Update `turbo.json` for api tasks
- [x] Verify: docker compose up, nest dev, health endpoint, Prisma Studio

## Success Criteria
- PostgreSQL running via Docker, all tables created
- NestJS starts and serves health endpoint
- Prisma client generated, connects to DB
- `pnpm dev` runs both web + api concurrently

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Prisma workspace resolution | MED | Use `workspace:*` protocol, ensure generate runs before build |
| Port conflicts (3000 web, 3001 api) | LOW | Explicit port config in NestJS main.ts |
| Docker not installed | LOW | User has home server with Docker experience |
