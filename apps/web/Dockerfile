# ============================================
# Stage 1: BASE — Setup Node.js + pnpm
# Dùng Alpine Linux (nhẹ ~5MB thay vì ~900MB Ubuntu)
# ============================================
FROM node:20-alpine AS base
# corepack = tool có sẵn trong Node.js, dùng để enable pnpm
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate
# libc6-compat cần cho một số native modules (sharp, prisma)
RUN apk add --no-cache libc6-compat

# ============================================
# Stage 2: DEPS — Install dependencies
# Chỉ copy lockfile + package.json → cache layer này
# Khi code thay đổi nhưng deps không đổi → Docker skip stage này
# ============================================
FROM base AS deps
WORKDIR /app

# Copy workspace config files (pnpm cần tất cả package.json trong monorepo)
# .npmrc chứa shamefully-hoist=true → flatten node_modules (cần cho @prisma/client)
COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/shared/package.json ./packages/shared/

# Install ALL dependencies (dev + prod) vì cần devDeps để build
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 3: BUILDER — Build the Next.js app
# Compile TypeScript → JavaScript, optimize cho production
# ============================================
FROM base AS builder
WORKDIR /app

# Copy toàn bộ node_modules workspace (giữ nguyên pnpm symlinks)
COPY --from=deps /app ./

# Copy source code (overwrite package.json nhưng giữ node_modules)
COPY . .

# Generate Prisma client (cần trước khi build)
RUN pnpm --filter @portfolio/prisma build

# Build Velite content trước (MDX → JSON)
# Chạy riêng để đảm bảo .velite/ files sẵn sàng trước Next.js build
RUN cd apps/web && npx velite build

# NEXT_PUBLIC_ vars phải có lúc BUILD time
# Sẽ được truyền qua docker build --build-arg
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_SITE_NAME="Kane's Portfolio"
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME}

# Build Next.js app (output: apps/web/.next/)
# VELITE_STARTED=1 → ngăn next.config.ts trigger velite lần 2 (race condition)
# Next.js standalone mode → output nhỏ gọn, không cần node_modules
ENV NEXT_TELEMETRY_DISABLED=1
ENV VELITE_STARTED=1
RUN pnpm --filter web build

# ============================================
# Stage 4: RUNNER — Production runtime
# Chỉ copy build output → image siêu nhẹ
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Không chạy bằng root (bảo mật)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Next.js standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy velite content (MDX compiled output)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.velite ./apps/web/.velite

# Set user (không chạy root)
USER nextjs

# Next.js lắng nghe port 3000
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Chạy Next.js standalone server
CMD ["node", "apps/web/server.js"]
