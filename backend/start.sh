#!/bin/sh
# Resilient startup script for Render deployment
set -e

echo "=== Philix Finance Backend Starting ==="

echo "1. Running Prisma schema push..."
npx prisma db push --schema=./prisma/schema.prod.prisma --accept-data-loss
echo "   Schema push complete."

echo "2. Running seed (upsert — safe to run multiple times)..."
npx tsx prisma/seed.ts || echo "   Seed skipped (may already be seeded)"

echo "3. Starting API server..."
exec npx tsx src/index.ts
