# Deployment Guide

## Architecture Overview

```
Push to main
  → GitHub Actions: build Docker images (web + api)
    → Push to GHCR (ghcr.io/haunguyendev/portfolio-v2)
      → SSH via Cloudflare Tunnel → server
        → docker compose pull + up -d
          → Live at portfolio.haunguyendev.xyz
```

## Infrastructure

### Server
- **Platform:** Proxmox VE → VM 101 (Ubuntu)
- **LAN IP:** 192.168.1.123
- **User:** haunguyendev
- **Deploy path:** `/opt/portfolio/`

### Cloudflare Tunnel
- **Tunnel name:** portfolio-server
- **Tunnel ID:** `a822eac2-2e80-4ec9-8ebd-40b8d678b702`
- **Config:** `/etc/cloudflared/config.yml`
- **Service:** `cloudflared` (systemd, auto-start on reboot)

### Subdomains

| Subdomain | Service | Port |
|-----------|---------|------|
| `deploy.haunguyendev.xyz` | SSH | 22 |
| `portfolio.haunguyendev.xyz` | Next.js (web) | 3000 |
| `portfolio-api.haunguyendev.xyz` | NestJS (api) | 3001 |
| `portfolio-portainer.haunguyendev.xyz` | Portainer UI | 9443 |

### Docker Images (GHCR)
- `ghcr.io/haunguyendev/portfolio-v2/web:latest`
- `ghcr.io/haunguyendev/portfolio-v2/api:latest`

## CI/CD Pipeline

### Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deploy.yml` | Push to main (code changes) | Build → push GHCR → SSH deploy |
| `release-please.yml` | Push to main | Auto version bump + changelog PR |

### GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `SERVER_HOST` | Cloudflare Tunnel hostname (deploy.haunguyendev.xyz) |
| `SERVER_USER` | SSH username (haunguyendev) |
| `SSH_PRIVATE_KEY` | ed25519 private key for SSH auth |

### Deploy Workflow Steps

1. **Build & Push Images** (~8-11min first, ~3-5min cached)
   - Checkout code
   - Login GHCR (auto `GITHUB_TOKEN`)
   - Build web image (multi-stage, Next.js standalone)
   - Build api image (multi-stage, NestJS)
   - Push both to GHCR with `:latest` + `:sha` tags
   - GHA cache enabled (`type=gha`)

2. **Deploy to Server** (~1min)
   - Install cloudflared on GHA runner
   - Setup SSH config with ProxyCommand
   - SSH → `docker login ghcr.io` → `docker compose pull` → `docker compose up -d`
   - Prune old images

## Docker Setup

### Production Stack (`docker-compose.prod.yml`)

```
Services:
├── postgres (16-alpine, healthcheck, persistent volume)
├── minio (S3-compatible storage, ports 9000/9001)
├── minio-init (auto-create bucket)
├── api (GHCR image, entrypoint: migrate → seed → start)
└── web (GHCR image, Next.js standalone)
```

### Dockerfiles

**Web (`apps/web/Dockerfile`)** — 4 stages:
1. `base` — Node 20 alpine + pnpm
2. `deps` — Install all dependencies (with `.npmrc` for shamefully-hoist)
3. `builder` — Prisma generate → Velite build → Next.js build (standalone)
4. `runner` — Copy build output with `--chown=nextjs:nodejs`, run as non-root

**API (`apps/api/Dockerfile`)** — 5 stages:
1. `base` — Node 20 alpine + pnpm
2. `deps` — Install all dependencies
3. `builder` — Prisma generate → NestJS build
4. `prod-deps` — Install production-only dependencies
5. `runner` — Copy prod deps + build output, entrypoint script

### API Entrypoint (`apps/api/entrypoint.sh`)

```
Container start
  → [0] prisma generate (prod-deps don't have generated client)
  → [1] prisma migrate deploy (apply pending migrations)
  → [2] Seed (if SEED_ON_START=true): admin user + categories + tags
  → [3] Start NestJS server
```

### Key Dockerfile Gotchas
- **`.npmrc` must be copied** — `shamefully-hoist=true` required for `@prisma/client` resolution
- **`VELITE_STARTED=1`** — Prevents race condition (next.config.ts triggers velite again with `clean:true`)
- **`--chown=nextjs:nodejs`** — ISR cache writes need file ownership by non-root user
- **`prisma generate` in entrypoint** — Runner stage uses prod-deps which don't have generated client

## Environment Variables

### Server `.env` (`/opt/portfolio/.env`)

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<random>
POSTGRES_DB=portfolio

# API
JWT_SECRET=<random-32-char>
CORS_ORIGIN=https://portfolio.haunguyendev.xyz

# Auth
BETTER_AUTH_SECRET=<random-32-char>
BETTER_AUTH_URL=https://portfolio.haunguyendev.xyz

# Public (also baked at build time)
NEXT_PUBLIC_SITE_URL=https://portfolio.haunguyendev.xyz
NEXT_PUBLIC_SITE_NAME=Kane's Portfolio

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=<random>
MINIO_BUCKET=portfolio-media

# Seed (true for first deploy only)
SEED_ON_START=false
```

### Build-time Args (Dockerfile)
- `NEXT_PUBLIC_SITE_URL` — Baked into Next.js at build time via `ARG`
- `NEXT_PUBLIC_SITE_NAME` — Baked into Next.js at build time via `ARG`

## SSH Access

### From local machine
```bash
# Quick access (after adding to ~/.ssh/config)
ssh portfolio

# Or full command
ssh -o ProxyCommand="cloudflared access ssh --hostname deploy.haunguyendev.xyz" \
    -i ~/.ssh/github-deploy haunguyendev@deploy.haunguyendev.xyz
```

### SSH Config (`~/.ssh/config`)
```
Host portfolio
  HostName deploy.haunguyendev.xyz
  User haunguyendev
  IdentityFile ~/.ssh/github-deploy
  ProxyCommand cloudflared access ssh --hostname %h
```

## Manual Deploy Commands

On server (`/opt/portfolio/`):
```bash
# Pull and restart
docker compose -f docker-compose.prod.yml pull web api
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# View logs
docker logs portfolio_api -f
docker logs portfolio_web -f

# Restart specific service
docker compose -f docker-compose.prod.yml restart api

# Run migrations manually
docker exec -it portfolio_api npx prisma migrate deploy --schema=./packages/prisma/schema.prisma

# Seed manually
docker exec -it portfolio_api npx tsx ./packages/prisma/seed-production.ts

# Check DB
docker exec -it portfolio_postgres psql -U postgres -d portfolio
```

## Rollback

```bash
# On server — rollback to specific image sha
docker compose -f docker-compose.prod.yml pull web api
# Edit compose to use specific tag: ghcr.io/.../web:<sha>
docker compose -f docker-compose.prod.yml up -d
```

Or re-run a previous GitHub Actions workflow from the Actions tab.

## Monitoring

- **Portainer:** https://portfolio-portainer.haunguyendev.xyz
- **Logs:** `docker logs <container-name> -f`
- **Health:** `curl https://portfolio-api.haunguyendev.xyz/api/health`

## Troubleshooting

### GHCR `unauthorized` on pull
Server needs to login: `docker login ghcr.io -u haunguyendev`
Deploy workflow handles this automatically.

### ISR cache write permission denied
Ensure Dockerfile uses `--chown=nextjs:nodejs` on all COPY commands in runner stage.

### Prisma client not initialized
Entrypoint runs `prisma generate` before server start. If still fails, check `packages/prisma` was copied correctly.

### Cloudflare Tunnel not connecting
```bash
sudo systemctl status cloudflared
sudo systemctl restart cloudflared
```

### Container crash loop
```bash
docker logs <container> --tail 50
# Check entrypoint errors, missing env vars, DB connection
```
