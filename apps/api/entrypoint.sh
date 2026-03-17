#!/bin/sh
# Entrypoint cho API container
# Chạy trước khi start NestJS server:
# 1. Apply database migrations (tạo/update tables)
# 2. Seed data mặc định (admin user, tags, categories)
# 3. Start API server

set -e

echo "=== Portfolio API Entrypoint ==="

# Step 0: Generate Prisma client (prod-deps không có generated client)
echo "[0/3] Generating Prisma client..."
npx prisma generate --schema=./packages/prisma/schema.prisma

# Step 1: Run Prisma migrations
# "migrate deploy" = apply pending migrations (production-safe, không tạo migration mới)
echo "[1/3] Running database migrations..."
npx prisma migrate deploy --schema=./packages/prisma/schema.prisma

# Step 2: Seed default data (chỉ chạy nếu SEED_ON_START=true)
# upsert → chạy nhiều lần không duplicate
if [ "$SEED_ON_START" = "true" ]; then
  echo "[2/3] Seeding production data..."
  npx tsx ./packages/prisma/seed-production.ts
else
  echo "[2/3] Skipping seed (SEED_ON_START != true)"
fi

# Step 3: Start NestJS server
echo "[3/3] Starting API server..."
exec node apps/api/dist/main.js
