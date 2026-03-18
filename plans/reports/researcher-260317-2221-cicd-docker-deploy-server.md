# Research Report: CI/CD & Docker Deploy to Self-Hosted Server

**Date:** 2026-03-17
**Sources:** 10+ articles, official docs (Portainer, GitHub, Docker)
**Context:** Next.js + NestJS monorepo, Turborepo, pnpm, Ubuntu server with Docker + Portainer CE

## Executive Summary

Research cho thấy **Portainer CE (free) KHÔNG hỗ trợ webhooks** — chỉ có Business Edition ($). Cần điều chỉnh strategy. 2 alternative tốt nhất:

1. **Portainer API deploy** — GH Actions gọi Portainer REST API để redeploy stack (CE hỗ trợ)
2. **SSH deploy** — GH Actions SSH vào server, pull image mới, restart containers

**Recommendation: SSH deploy** — đơn giản nhất, transparent, dễ debug, học được nhiều nhất.

## Key Findings

### 1. Portainer CE vs Business Edition

| Feature | CE (Free) | BE (Paid) |
|---------|-----------|-----------|
| Stack management | ✅ | ✅ |
| Stack webhooks | ❌ | ✅ |
| REST API | ✅ | ✅ |
| Git-based stacks | ❌ | ✅ |
| Auto-redeploy | ❌ | ✅ |

**Kết luận:** Portainer CE vẫn dùng được để quản lý containers qua UI, nhưng auto-deploy cần đi qua API hoặc SSH.

### 2. CI/CD Pipeline Architecture (Recommended)

```
Developer push to main
  │
  ▼
GitHub Actions CI (.github/workflows/ci.yml)
  ├── Lint
  ├── Type check
  ├── Build test
  └── (fail → stop, không deploy)
  │
  ▼
GitHub Actions Deploy (.github/workflows/deploy.yml)
  ├── Build Docker images (multi-stage)
  ├── Push to GHCR (ghcr.io)
  └── SSH into server → docker compose pull → docker compose up -d
  │
  ▼
Server pulls new images → Containers restart
  │
  ▼
Portainer UI shows updated containers (monitoring only)
```

### 3. Docker Multi-Stage Build (Monorepo + Turborepo + pnpm)

Best practice cho monorepo: dùng `turbo prune` để tạo minimal workspace cho từng app.

```
Stage 1: base        → Node alpine + pnpm
Stage 2: pruner      → turbo prune --scope=app → minimal workspace
Stage 3: installer   → pnpm install (chỉ deps cần thiết)
Stage 4: builder     → pnpm build (compile app)
Stage 5: runner      → Copy chỉ build output → minimal runtime image
```

**Lợi ích:**
- Image size nhỏ (300-500MB thay vì 1-2GB)
- Build cache hiệu quả
- Chỉ rebuild layer thay đổi

### 4. GitHub Container Registry (GHCR)

- Free cho public repos, 500MB free cho private
- Auth bằng `GITHUB_TOKEN` (tự động có trong Actions)
- Image URL: `ghcr.io/haunguyendev/portfolio-v2/web:latest`
- Login: `docker/login-action@v3` với `registry: ghcr.io`

### 5. SSH Deploy từ GitHub Actions

```yaml
# Dùng appleboy/ssh-action
- uses: appleboy/ssh-action@v1
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /opt/portfolio
      docker compose pull
      docker compose up -d --remove-orphans
      docker image prune -f
```

**GitHub Secrets cần tạo:**
- `SERVER_HOST` — IP server (192.168.1.123)
- `SERVER_USER` — haunguyendev
- `SSH_PRIVATE_KEY` — SSH private key (KHÔNG phải password)

### 6. Security Best Practices

- **KHÔNG dùng password cho SSH** — dùng SSH key pair
- **KHÔNG commit .env files** — dùng GitHub Secrets hoặc .env trên server
- `GITHUB_TOKEN` tự expire — an toàn
- GHCR images nên set private nếu repo private
- Docker socket mount (`/var/run/docker.sock`) = root access — cẩn thận

### 7. Alternative: Portainer API Deploy (CE compatible)

```yaml
# Dùng portainer-stack-deploy-action
- uses: cssnr/portainer-stack-deploy-action@v1
  with:
    portainer-url: https://192.168.1.123:9443
    portainer-token: ${{ secrets.PORTAINER_API_TOKEN }}
    stack-name: portfolio
    stack-file: docker-compose.prod.yml
```

**Pros:** Tận dụng Portainer UI, stack management
**Cons:** Cần expose Portainer API, thêm 1 layer complexity

## Implementation Recommendations

### Recommended Flow (SSH Deploy)

**Step 1:** Tạo Dockerfile cho web + api (multi-stage build)
**Step 2:** Tạo docker-compose.prod.yml (full production stack)
**Step 3:** Test local build trước
**Step 4:** Setup SSH key pair (server ↔ GitHub)
**Step 5:** Tạo GitHub Actions workflow (build → push GHCR → SSH deploy)
**Step 6:** Push to main → verify auto deploy

### Files cần tạo

```
.dockerignore                           # Exclude unnecessary files
apps/web/Dockerfile                     # Next.js multi-stage build
apps/api/Dockerfile                     # NestJS multi-stage build
docker-compose.prod.yml                 # Production stack
.github/workflows/deploy.yml           # CI/CD pipeline
```

### Common Pitfalls

1. **Sharp on Alpine** — cần `--platform=linux/amd64` hoặc install sharp dependencies
2. **Prisma on Docker** — cần `prisma generate` trong build stage
3. **pnpm trong Docker** — dùng `corepack enable` thay vì install global
4. **turbo prune** — output ra `out/` directory, cần COPY đúng path
5. **NEXT_PUBLIC_ vars** — phải có lúc BUILD time, không phải runtime
6. **.env trên server** — mount vào container, KHÔNG bake vào image

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                  GitHub                          │
│  ┌──────────┐    ┌──────────────┐    ┌───────┐ │
│  │   Code   │───▶│ GitHub Actions│───▶│ GHCR  │ │
│  │   Push   │    │  Build+Push  │    │ Images│ │
│  └──────────┘    └──────┬───────┘    └───────┘ │
└─────────────────────────┼───────────────────────┘
                          │ SSH
                          ▼
┌─────────────────────────────────────────────────┐
│              Ubuntu Server (192.168.1.123)        │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Next.js │  │  NestJS  │  │  PostgreSQL   │  │
│  │  :3000   │  │  :3001   │  │  :5432        │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
│  ┌──────────┐  ┌──────────┐                      │
│  │  MinIO   │  │ Portainer│                      │
│  │  :9000   │  │  :9443   │  ← monitoring only  │
│  └──────────┘  └──────────┘                      │
│                                                   │
│  docker compose pull → up -d (triggered by SSH)   │
└───────────────────────────────────────────────────┘
```

## Sources

- [Portainer Webhooks Docs](https://docs.portainer.io/user/docker/stacks/webhooks) — CE limitation confirmed
- [Docker Deployments with GH Actions + Portainer](https://dev.to/shape93/automating-docker-deployments-with-github-actions-cloudflare-tunnels-and-portainer-2phm)
- [Beginner's Guide: Build, Push, Deploy with GH Actions](https://dev.to/msrabon/beginners-guide-build-push-and-deploy-docker-image-with-github-actions-aa7)
- [Publishing Docker Images - GitHub Docs](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)
- [Turborepo + pnpm Docker Multi-Stage](https://fintlabs.medium.com/optimized-multi-stage-docker-builds-with-turborepo-and-pnpm-for-nodejs-microservices-in-a-monorepo-c686fdcf051f)
- [Portainer Stack Deploy Action](https://github.com/marketplace/actions/portainer-stack-deploy-action)
- [NestJS Turbo Monorepo](https://github.com/vndevteam/nestjs-turbo)
- [Portainer Service Webhook Action](https://github.com/newarifrh/portainer-service-webhook)

## Unresolved Questions

1. Server có public IP / domain không? Nếu chỉ có LAN IP (192.168.1.123) thì GitHub Actions không SSH được trực tiếp — cần VPN/Cloudflare Tunnel/Tailscale
2. NEXT_PUBLIC_ env vars nên bake vào image lúc build hay dùng runtime config?
3. Database migration chạy tự động trong CI hay manual?
