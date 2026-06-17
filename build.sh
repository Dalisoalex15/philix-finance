#!/bin/bash
set -e
npm install --prefix backend
npx prisma generate --schema=backend/prisma/schema.prod.prisma
npx prisma db push --schema=backend/prisma/schema.prod.prisma --accept-data-loss
npx tsx backend/prisma/seed.ts || true
npm install --prefix frontend
npm run build --prefix frontend
