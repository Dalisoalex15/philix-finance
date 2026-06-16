# Philix Finance — Setup Guide

## Quick Start (Frontend Demo — No Database Needed)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Staff Login: http://localhost:3000/staff/login  
Client Portal: http://localhost:3000/portal/login

---

## Full Stack Setup — Option A: PostgreSQL Direct

### Step 1 — Install PostgreSQL on Windows

1. Download from https://www.postgresql.org/download/windows/
   - Choose **PostgreSQL 16** (current stable)
   - During install: set the **superuser password** to anything you like (e.g. `postgres123`)
   - Keep default port **5432**
   - Click through the rest of the wizard

2. After install, open **pgAdmin** (installed alongside PostgreSQL) or open **SQL Shell (psql)** from Start Menu.

3. Run these SQL commands to create the Philix database:

```sql
CREATE USER philix WITH PASSWORD 'philix_secret';
CREATE DATABASE philix_finance OWNER philix;
GRANT ALL PRIVILEGES ON DATABASE philix_finance TO philix;
```

### Step 2 — Set Up Backend

```bash
cd backend
# The .env file already exists with correct defaults
npm install          # Already done if you ran it before
npm run db:push      # Push schema → creates all tables in PostgreSQL
npm run db:seed      # Creates all staff + client demo accounts
npm run dev          # Start API on http://localhost:4000
```

### Step 3 — Start Frontend

```bash
cd frontend
npm run dev          # http://localhost:3000
```

---

## Full Stack Setup — Option B: Docker (Easier)

### Step 1 — Install Docker Desktop

Download from https://www.docker.com/products/docker-desktop/
- Choose **Windows** installer
- After install, start Docker Desktop and wait for it to fully load (whale icon in taskbar)

### Step 2 — Start Everything

```bash
# From the root of the project (where docker-compose.yml is)
docker-compose up -d postgres     # Start only the database

# Wait ~10 seconds for PostgreSQL to be ready, then:
cd backend
npm run db:push
npm run db:seed
npm run dev

# In another terminal:
cd frontend
npm run dev
```

---

## Login Credentials (After Seeding)

### Staff Portal — http://localhost:3000/staff/login

| Role | Email | Password |
|------|-------|----------|
| CEO / Super Admin | daliso@philixfinance.com | philix@CEO2025 |
| Manager | chileshe@philixfinance.com | philix@Mgr2025 |
| Loan Officer | patricia@philixfinance.com | philix@LO2025 |
| Collections | inonge@philixfinance.com | philix@Col2025 |
| Accountant | chanda@philixfinance.com | philix@Acc2025 |

### Client Portal — http://localhost:3000/portal/login

| Name | Email | Password |
|------|-------|----------|
| Mwansa Tembo | mwansa.tembo@email.com | Client@123 |
| Grace Mwale | grace.mwale@email.com | Client@456 |

### Demo Mode (No Database Required)

All portals work with mock data — no setup needed.
- Staff demo passwords: shown on the login page (click to fill)
- Client demo password: `client123`

---

## Email Setup (SMTP — Free via Gmail)

1. Enable 2-Step Verification on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an App Password for "Mail"
4. Edit `backend/.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=abcd efgh ijkl mnop   ← your 16-char app password
SMTP_FROM="Philix Finance <noreply@philixfinance.com>"
```

---

## Role Permissions

| Role | Access |
|------|--------|
| SUPER_ADMIN (CEO) | Full access — all pages, all settings, all reports |
| MANAGER | Everything except system settings and branch management |
| LOAN_OFFICER | Clients, loans, collateral, repayments, calculator |
| COLLECTIONS_OFFICER | Collections, recovery, write-offs, restructuring |
| ACCOUNTANT | Accounting, cashbook, expenses, bank reconciliation |

---

## API Endpoints

Base URL: `http://localhost:4000/api`

### Staff Auth
- `POST /auth/login` — email + password
- `POST /auth/register` — create staff account
- `POST /auth/refresh` — refresh access token

### Client Portal Auth
- `POST /portal/auth/register` — client self-registration
- `POST /portal/auth/login` — client login
- `POST /portal/auth/logout` — invalidate refresh token
- `POST /portal/auth/refresh` — refresh client access token

### Client Portal (requires Bearer token)
- `GET/PATCH /portal/me` — view/update profile
- `POST /portal/me/change-password`
- `GET/POST /portal/applications` — loan applications
- `GET /portal/applications/:id`
- `GET/POST /portal/kyc` — KYC documents
- `GET /portal/notifications` — inbox
- `POST /portal/notifications/mark-read`
- `DELETE /portal/notifications/:id`

---

## Project Structure

```
philix-finance/
├── frontend/           React 19 + TypeScript + Tailwind + Vite
│   ├── src/
│   │   ├── pages/      All staff pages + portal pages
│   │   ├── components/ Shared UI components + layouts
│   │   ├── store/      Zustand auth stores
│   │   └── lib/        API service + email templates
│   └── public/         Logo SVGs
├── backend/            Express + TypeScript + Prisma
│   ├── src/
│   │   ├── routes/     Staff routes + portal/ client routes
│   │   ├── middleware/ Auth, error handling, rate limiting
│   │   └── lib/        Prisma client, mailer, audit log
│   └── prisma/
│       ├── schema.prisma   Full database schema
│       └── seed.ts         Demo data seeder
└── docker-compose.yml  Full stack Docker setup
```
