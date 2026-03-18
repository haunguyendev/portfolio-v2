# ============================================
# Stage 1: BASE — Setup Node.js + pnpm
# ============================================
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate
RUN apk add --no-cache libc6-compat

# ============================================
# Stage 2: DEPS — Install dependencies
# ============================================
FROM base AS deps
WORKDIR /app

COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# ============================================
# Stage 3: BUILDER — Compile NestJS (TypeScript → JavaScript)
# ============================================
FROM base AS builder
WORKDIR /app

# Copy toàn bộ workspace (giữ nguyên pnpm symlinks)
COPY --from=deps /app ./
COPY . .

# Generate Prisma client
RUN pnpm --filter @portfolio/prisma build

# Build NestJS (output: apps/api/dist/)
RUN pnpm --filter api build

# ============================================
# Stage 4: PRODUCTION DEPS — Chỉ install production dependencies
# Loại bỏ devDeps (typescript, eslint, etc.) → image nhẹ hơn
# ============================================
FROM base AS prod-deps
WORKDIR /app

COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --prod

# ============================================
# Stage 5: RUNNER — Production runtime
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Install Chromium + fonts for Puppeteer PDF generation
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  font-noto \
  font-noto-cjk

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

# Copy production node_modules (không có devDeps)
COPY --from=prod-deps /app ./

# Copy Prisma schema + migrations + generated client (cần cho runtime + migrate)
COPY --from=builder /app/packages/prisma ./packages/prisma

# Copy compiled NestJS output
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Copy entrypoint script (migrate → seed → start)
COPY apps/api/entrypoint.sh ./entrypoint.sh

EXPOSE 3001
ENV NODE_ENV=production
ENV API_PORT=3001
# Set SEED_ON_START=true lần deploy đầu, sau đó tắt
ENV SEED_ON_START=false

# Entrypoint: migrate → seed (optional) → start server
ENTRYPOINT ["sh", "./entrypoint.sh"]
