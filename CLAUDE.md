# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (in `frontend/`)
```bash
npm run dev        # Vite dev server on :5173 (proxies /api → :4000)
npm run build      # tsc + vite build — must pass before deploying
npm run lint       # ESLint with --max-warnings 0 (zero-tolerance)
```

### Backend (in `backend/`)
```bash
npm run dev        # tsx watch src/index.ts — hot reload on :4000
npm run build      # tsc only (no emit to check types)
npm run db:push    # prisma db push (dev schema)
npm run db:studio  # Prisma Studio UI
npm run db:seed    # Run seed.ts directly
```

### Deploy to Vercel
```bash
npx vercel --prod --yes
# Then ALWAYS update the alias:
npx vercel alias set <new-url>.vercel.app philix-finance.vercel.app
```
Every deploy runs `build.sh` which: generates Prisma client, pushes schema to Neon, seeds, builds Vite, and bundles the API via esbuild into `.vercel/output/`.

### Type-checking
```bash
cd frontend && npx tsc --noEmit   # Frontend types
cd backend  && npx tsc --noEmit   # Backend types
```

## Architecture

### Monorepo Layout
```
/                   ← root package.json (backend deps only — used by Vercel)
/api/index.ts       ← Vercel serverless entry (imports backend/src/app)
/build.sh           ← Vercel build script (Prisma → Vite → esbuild bundle)
/backend/           ← Express API (TypeScript, Prisma, Neon PostgreSQL)
/frontend/          ← React 19 SPA (Vite, TailwindCSS, Zustand)
```

### Two Prisma Schemas
- `backend/prisma/schema.prisma` — local dev (SQLite, file: dev.db)
- `backend/prisma/schema.prod.prisma` — production (PostgreSQL/Neon, used by Vercel)
- Prisma client is generated into `backend/generated/prisma/` (not `node_modules`)
- Always add new models to **both** schema files
- `build.sh` runs `prisma db push --accept-data-loss` on every deploy — safe for additive migrations

### Dual-Auth System
Two completely separate auth flows sharing the same Express app:

**Staff auth** (`/api/auth/*`)
- JWT stored as `philix_staff_token` in localStorage (raw JWT string)
- Use this token directly as `Bearer <token>` in Authorization header
- Backend middleware: `authenticate` in `backend/src/middleware/auth.ts`
- Frontend store: `useAuthStore` in `frontend/src/store/auth.ts`

**Client portal auth** (`/api/portal/auth/*`)
- JWT stored as `philix_portal_token` in localStorage
- Backend middleware: `authenticatePortal` in `backend/src/middleware/portalAuth.ts`
- Frontend store: `useClientAuthStore` in `frontend/src/store/clientAuth.ts`
- **Critical**: Never mix these tokens — `philix-auth-v3` (Zustand JSON blob) is NOT a valid Bearer token

### Frontend Routing
- `/` → Staff dashboard (requires `useAuthStore.isAuthenticated`)
- `/portal/*` → Client portal (requires `useClientAuthStore`)
- `/login` → `UnifiedLoginPage` — auto-detects staff vs client from email domain (`@philixfinance.com` = staff)
- All routes in `frontend/src/App.tsx`; staff routes wrapped in `MainLayout`, portal routes in `ClientPortalLayout`

### API Proxy
- Local dev: `vite.config.ts` proxies `/api` → `http://localhost:4000`
- Production: Vercel routes `^/api/(.*)` → serverless function at `api/index.ts`
- Frontend code always uses relative `/api/...` paths — never hardcode port 4000

### Backend Route Structure
All routes are mounted in `backend/src/app.ts`. Pattern:
- Staff routes: `app.use("/api/<resource>", routeModule)` — use `authenticate` middleware internally
- Portal routes: `app.use("/api/portal/<resource>", routeModule)` — use `authenticatePortal` internally
- `// @ts-nocheck` is used on newer route files (leave, meetings, compliance, procurement, assets) to avoid Prisma type issues with new models

### Two AI Endpoints
Both in `backend/src/routes/ai.ts`:
- `POST /api/ai/chat` — **client portal AI** (`claude-sonnet-4-6`, 2000 tokens). Uses `portalAuth` (local middleware in ai.ts). System prompt includes full client profile + loan history + product knowledge. Parses `<<APPLY_LOAN:{...}>>` marker to trigger loan applications from chat.
- `POST /api/ai/staff-chat/stream` — **staff Enterprise AI** (`claude-opus-4-8`, 8000 tokens, SSE). Uses `authenticate`. Streams via `text/event-stream`.

### Collateral Engine
`backend/src/lib/collateralEngine.ts` (also mirrored at `frontend/src/lib/collateralEngine.ts`) — deterministic scoring: ownership (20pts), marketability (20pts), condition (15pts), liquidity (20pts), age (10pts), documentation (15pts) = 100 total. Computes FSV (forced-sale value), LTV ratio, and risk category.

### Email System
`backend/src/lib/mailer.ts` — dual-provider:
- If `RESEND_API_KEY` set → uses Resend SDK; `fromEmail` must use `RESEND_FROM` env var (default: `onboarding@resend.dev`)
- Otherwise → falls back to nodemailer SMTP
- Resend sandbox restriction: without domain verification, can only send to account owner email
- `result.error` must be checked explicitly (Resend SDK never throws on send failure)

### State Management
Zustand stores in `frontend/src/store/`:
- `auth.ts` — staff session (persisted)
- `clientAuth.ts` — client portal session (persisted)
- `loanApplicationStore.ts` — portal loan applications (syncs from `GET /api/portal/applications`)
- `toastStore.ts` — global toast notifications

### Brand / UI
- Primary gold: `#C9A227` | Dark navy: `#0B1F3A` | Deepest dark: `#070F1C`
- Font: Clash Grotesk (loaded via CSS)
- Logo component: `frontend/src/components/ui/PhilixLogo.tsx` — SVG, variants `"full"` | `"icon"`, sizes `sm/md/lg/xl`, prop `onDark`
- Staff UI uses dark theme (`bg-[#0B1F3A]`, `bg-[#070F1C]`)
- Portal UI uses Tailwind slate dark theme (`bg-slate-950`, `bg-slate-800`)

### Environment Variables
Required (backend will exit if missing in production):
- `JWT_SECRET` — 32+ chars
- `JWT_REFRESH_SECRET` — 32+ chars, different from above
- `DATABASE_URL` — Neon PostgreSQL connection string
- `ANTHROPIC_API_KEY` — for both AI endpoints
- `RESEND_API_KEY` + `RESEND_FROM` — for email (or `SMTP_*` vars)
- `FRONTEND_URL` — for CORS allowlist

### Cron Jobs
`backend/src/jobs/paymentReminders.ts` — started in `index.ts` via `startCronJobs()`. Runs daily to send payment reminders and check document expiry.

### Operations Pages (newer, use `// @ts-nocheck`)
Leave, Meetings, Compliance, Procurement, Assets — all have:
- Prisma models in `schema.prod.prisma` (appended, not migrated)
- Backend routes under `backend/src/routes/<name>.ts`
- Frontend pages under `frontend/src/pages/<Name>Page.tsx`
- Use `localStorage.getItem("philix_staff_token")` directly for auth header (not the Zustand store)
