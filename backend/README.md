# OASIS ONE — Backend API Platform

High-performance, secure, and privacy-first modular monolithic API powering **OASIS ONE** — the invite-only, admin-approved portal for an entrepreneur community of 650+ founders, aspiring entrepreneurs, and mentors.

---

## 1. Technical Stack

- **Runtime & Framework**: Node.js 20+, **NestJS 11** (TypeScript strict)
- **Database & ORM**: **MySQL 8** (Remote & Local Docker fallback), **Prisma ORM 6.4**
- **Authentication**:
  - Sliding sessions (`oasis_sid` cookie, 7-day max lifetime, sliding 24h refresh, SHA-256 hashed at rest)
  - Passwords: **Argon2id** (memory cost 64 MB, time cost 3, 1 thread)
  - Google OAuth 2.0 with **PKCE** (`code_challenge` / `code_verifier`)
  - Admin Multi-Factor Authentication: **TOTP** (`otplib`, QR code via `qrcode`, AES-256-GCM encrypted secrets at rest)
- **Real-Time Gateway**: **Socket.IO 4.8** (`@nestjs/websockets`, namespace `/ws`, path `/socket.io`, room-authorized)
- **Job Engine**: MySQL-backed asynchronous queue worker with atomic `claimJob`, retries, and failure backoff
- **Security & Hardening**:
  - Helmet HTTP security headers
  - Double-submit CSRF protection (`oasis_csrf` cookie + `X-CSRF-Token` header) with Origin & Referer defense
  - Rate limiting via `@nestjs/throttler` (tiered: auth, public, member, admin)
  - Append-only `audit_logs` protected by MySQL database triggers (`BEFORE UPDATE` and `BEFORE DELETE` prevent tampering)
  - Anti-CSV Formula Injection (CWE-1236) prefix sanitization (`=`, `+`, `-`, `@`)
  - Parameterized boolean-mode full-text search sanitization
- **Documentation**: OpenAPI 3.0 / Swagger UI (`/api/docs`)

---

## 2. Architecture & Modules

```
backend/
├── prisma/
│   ├── schema.prisma           # 48 MySQL Prisma models with enums & indexes
│   ├── seed.ts                 # Idempotent seed script (tags, settings, legal docs)
│   └── migrations/             # Non-destructive migrations
├── src/
│   ├── config/                 # Typed environment schema & validation (fail-fast)
│   ├── common/                 # Guards, filters, interceptors, decorators, crypto utils
│   ├── prisma/                 # PrismaService with UTC session time_zone
│   ├── realtime/               # Socket.IO gateway, session revocation, room authorization
│   ├── mail/                   # Branded HTML email templates (console & SMTP transports)
│   ├── storage/ & files/       # Local & S3-compatible driver with magic-byte validation
│   ├── jobs/                   # MySQL background worker (emails, expiries, unlocks)
│   ├── audit/                  # Tamper-evident audit logger service
│   ├── auth/                   # Password, Google OAuth PKCE, TOTP MFA, sessions
│   ├── users/ & profiles/      # Contextual serialization (self, connected, member, admin)
│   ├── applications/           # Multi-step review, applicant messaging, withdrawal
│   ├── taxonomy/ & startups/   # Sectors, expertise tags, startup autocomplete
│   ├── posts/ & achievements/  # 24h edit window, answers, reports, 24h celebrations
│   ├── connections/ & blocks/  # Rolling 24h quota, mutual blocking, mentors
│   ├── events/ & tasks/        # Concurrency capacity locks, waitlists, .ics generation
│   ├── search/                 # MySQL boolean fulltext search across people, posts, events
│   ├── support/                # Grievance cases (OASIS-GRV-YYYY-XXXX sequential)
│   ├── analytics/              # PII-free anonymous usage tracking
│   ├── admin/                  # Overview, claim locks, member governance, CSV import/export
│   └── health/                 # Public database latency and worker heartbeat
└── test/                       # Jest unit & e2e test specifications
```

---

## 3. Remote Database Safety Precautions

The default `DATABASE_URL` points to the remote database hosted at `40.192.42.60:3306/Oasis`.
**Strict Safety Protocol:**
1. **Never** run `prisma migrate reset`, `db push --force-reset`, or execute raw `DROP` / `TRUNCATE` statements.
2. Production and remote schema updates **must** use `prisma migrate deploy`.
3. The database user holds `TRIGGER` privileges. Database triggers `audit_logs_no_update` and `audit_logs_no_delete` are active to guarantee that audit logs remain append-only even if an application vulnerability exists.
4. Default collation is `utf8mb4_0900_ai_ci` to support Indic scripts, multinational names, and emoji.

---

## 4. Setup and Installation

### Prerequisites
- Node.js 20+
- pnpm 10+
- Access to MySQL 8 database

### Step-by-Step Setup

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` in `backend/`:
   ```bash
   cp .env.example .env
   ```
   Generate cryptographic keys:
   - `SESSION_SECRET`: 64-char hex string (`openssl rand -hex 32`)
   - `FIELD_ENCRYPTION_KEY`: 64-char hex string (`openssl rand -hex 32`)
   - `ADMIN_SETUP_TOKEN`: 32-char hex string (`openssl rand -hex 16`)

3. **Deploy Schema & Migrations**:
   ```bash
   pnpm --filter oasis-backend prisma:deploy
   ```

4. **Seed System Data**:
   ```bash
   pnpm --filter oasis-backend prisma:seed
   ```
   *Seeds sector tags, expertise tags, platform settings, and v1.0 legal notices.*

5. **Start Dev Server**:
   ```bash
   pnpm --filter oasis-backend start:dev
   ```
   The API will be available at: `http://localhost:4000/api/v1`
   Swagger docs: `http://localhost:4000/api/docs`

---

## 5. First-Time Administrator Bootstrap

When starting with a clean database, no administrators exist. Bootstrap the first Super Admin using the one-time bootstrap endpoint:

```bash
curl -X POST http://localhost:4000/api/v1/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<YOUR_ADMIN_SETUP_TOKEN>",
    "name": "Super Administrator",
    "email": "admin@oasis.community",
    "password": "StrongPassword123!"
  }'
```

The response returns the `otpauthUrl` and base64 `qrCode` image for TOTP MFA setup:
1. Scan the QR code with Google Authenticator or 1Password.
2. Sign in via `POST /api/v1/auth/login`.
3. Complete TOTP verification via `POST /api/v1/auth/mfa/verify` with `{ "code": "123456" }`.
4. The endpoint `/admin/setup` permanently disables itself once an administrator exists.

---

## 6. Verification and Smoke Testing

A comprehensive verification script is provided in `backend/scripts/smoke-test.mjs`. It validates:
- Health check & DB latency
- Taxonomy & legal disclosures
- First-admin bootstrap & MFA TOTP elevation
- User registration & email verification
- Admin review queue claim locking & decision approval
- Fulltext search
- WebSocket authentication & room join

Run the verification suite:
```bash
node backend/scripts/smoke-test.mjs
```

Run Jest unit tests:
```bash
pnpm --filter oasis-backend test
```

---

## 7. Connecting to the Next.js Frontend

- Next.js development server runs on `http://localhost:3000`.
- Next.js rewrites in `next.config.ts` proxy all requests from `/api/:path*` to `http://localhost:4000/api/:path*`.
- WebSockets connect directly to `http://localhost:4000/ws` with `withCredentials: true`.
- Authentication cookies (`oasis_sid`) and CSRF tokens (`oasis_csrf`) are shared across ports on `localhost`.
