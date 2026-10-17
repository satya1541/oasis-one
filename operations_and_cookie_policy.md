# OASIS ONE — Platform Operations, Backup & Cookie/Acceptable Use Policy (`OPERATIONS_AND_POLICIES.md`)

**Document Version:** 1.0 (Aligned with OASIS ONE PRD v1.2 §13, §14 & Backend Specification §9, §9B)  
**Effective Date:** 16 October 2026  
**Organization:** OASIS (Odisha Startup Community — OASIS ONE)  
**Address:** Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018  
**Contact Phone:** +91-904-01-98-628  
**Official Email:** Info@oasisodisha.in  

## 1. Cookie & Local Browser Storage Policy

### 1.1 Overview and Zero-Tracking Commitment
OASIS ONE uses strictly necessary first-party cookies and local browser storage required to authenticate sessions, prevent Cross-Site Request Forgery (CSRF), complete Google OAuth 2.0 sign-in, and preserve your visual theme and registration progress. **We do not use third-party advertising cookies, cross-site tracking pixels, or behavioral profiling scripts, and we never store authentication tokens in `localStorage`.**

### 1.2 Complete Schedule of Cookies and Browser Storage
| Name / Storage Key | Type | Attributes & Security | Expiration / Lifetime | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`oasis_sid`** | First-Party Cookie | `HttpOnly`, `Secure` (prod), `SameSite=Lax` | **24 hours** sliding; **7 days** absolute maximum | Stores an opaque 32-byte session token (hashed with SHA-256 in the MySQL `Session` table) to authenticate REST (`/api/v1`) and WebSocket (`/ws`) requests. |
| **`CSRF Token Cookie`** | First-Party Cookie | Readable by same-origin JS (`GET /auth/csrf`), `Secure` (prod), `SameSite=Lax` | Session lifetime (refreshed automatically on `403 csrf`) | Double-submit token paired with the `X-CSRF-Token` request header on all non-GET state-changing API calls. |
| **`OAuth State & PKCE`** | First-Party Cookie | Signed, `HttpOnly`, `Secure` (prod), `SameSite=Lax` | **10 minutes** (cleared immediately on callback) | Binds the OAuth `state` parameter and PKCE `code_verifier` during Google Sign-In (`/api/v1/auth/google`). |
| **`Registration Draft`** | `sessionStorage` | Same-origin tab storage (non-sensitive fields only) | Cleared on registration submit or browser tab close | Preserves non-sensitive multi-step form inputs across the `/join` onboarding wizard so users do not lose work if they refresh. |
| **`Theme Preference`** | `localStorage` | Same-origin UI preference (`light` / `dark`) | Persistent until cleared by user | Remembers whether the user selected the Light Ivory (`#FBF7EE`) or Dark Brand Navy (`#1E1F33`) theme. |

## 2. Acceptable Use, Rate Limits & File Upload Security Policy

### 2.1 API & Platform Rate Limits (Enforced Server-Side)
To protect the community against brute-force attacks, spam, and directory scraping, OASIS ONE enforces the following server-side rate limits (returning HTTP `429 Too Many Requests` with `Retry-After` and `retryAfterSeconds`):

| Endpoint / Action | Rate Limit Quota | Enforcement Scope & Consequence |
| :--- | :--- | :--- |
| **Login (`POST /auth/login`)** | **5 attempts** per 15 minutes | Per IP + Email combination; failures logged in structured security logs. |
| **Registration (`POST /auth/register`)** | **3 attempts** per hour | Per IP address; protects against automated account creation and email enumeration. |
| **Forgot Password / Resend Email** | **3 requests** per hour | Per Email + IP combination; responses are constant-time and generic. |
| **Phone Verification OTP (`POST /me/phone/otp`)** | **3 per hour** / **10 per day** | Per authenticated user; OTP expires in 10 minutes and locks after **5 failed attempts**. |
| **Mentor Connection Requests (`POST /connections`)** | **10 requests** per rolling 24 hours | Per sender (counted directly from `ConnectionRequest` database rows); 14-day expiry; 7-day cooldown. |
| **Global & Directory Search (`/search`, `/profiles`)** | **60 requests** per minute | Per authenticated member; bulk-download patterns trigger anti-scraping audit alerts. |
| **Public Endpoints (`/config/public`, `/legal/*`)** | **30 requests** per minute | Per IP address. |
| **Support / Grievance (`POST /support/contact`)** | **5 requests** per hour | Per user / IP. |
| **First-Admin Bootstrap (`POST /admin/setup`)** | **5 attempts** per hour | Per IP address; permanently disabled once the first Super Admin exists. |
| **WebSocket Connections (`/ws`)** | **Max 5 concurrent sockets** | Per user; payload capped at 4 KB with per-socket event throttling and strict `Origin` checks. |

### 2.2 File Upload & Storage Security Standards (`POST /uploads`)
Every file uploaded to OASIS ONE is processed in memory (`multer`), validated against both its declared MIME type and binary magic bytes (`file-type`), scanned by **ClamAV** antivirus (failing closed in production), and stored in a private S3 bucket with server-side encryption (`AES256` / KMS):

| Upload Purpose | Allowed Formats (MIME + Magic Bytes) | Maximum File Size | Access & Retention Rule |
| :--- | :--- | :--- | :--- |
| **`profile_photo`** | `image/jpeg`, `image/png` | **2 MB** | Served to authenticated members via short-lived signed token (`GET /files/:signedToken`, 120s TTL) according to profile visibility. |
| **`achievement` Image** | `image/jpeg`, `image/png` | **5 MB** | Moderated before publication; displayed on active banner for 24h UTC after approval. |
| **`application_attachment` / `verification_evidence`** | `application/pdf`, `image/jpeg`, `image/png` | **10 MB** | Strictly private to the applicant and reviewing admins. Rejected application files are purged after **90 days**. |
| **Orphaned Uploads (`status = pending`)** | Any allowed type | Per purpose | Automatically deleted from S3 and DB after **24 hours** if not attached to a record (`orphan_file_cleanup`). |

## 3. Platform Operations, Backup & Service Level Policy (`docs/OPERATIONS.md` — PRD §13)

### 3.1 Availability, Performance & Maintenance Windows
- **Uptime Target:** **99.5% monthly availability** (excluding scheduled maintenance windows).
- **Performance Target:** **p95 latency < 2.5 seconds** for dashboard and search endpoints under expected load (up to 2,000 concurrent users).
- **Scheduled Maintenance Windows:** Planned database or infrastructure maintenance is scheduled during low-traffic windows (**Sundays between 02:00 AM and 04:00 AM IST / UTC+05:30**) with advance in-app announcement notice where downtime exceeds 5 minutes.

### 3.2 Database Backup, RPO/RTO, and Restore Drill Protocol
1. **Backup Schedule (MySQL 8 `Oasis` Database):**
   - **Daily Full Backups:** Automated full logical/physical snapshots taken daily at **01:00 AM IST**, encrypted at rest (`AES-256`), and replicated to an off-server backup vault.
   - **Hourly Incremental Backups & Binlog Archiving:** Continuous binary log (`binlog`) streaming / hourly incremental snapshots enabling Point-in-Time Recovery (PITR).
2. **Recovery Objectives:**
   - **Recovery Point Objective (RPO):** **≤ 1 hour** (maximum potential data loss window in a catastrophic storage failure).
   - **Recovery Time Objective (RTO):** **≤ 4 hours** (maximum time to restore full production service).
3. **Mandatory Pre-Launch & Quarterly Restore Drill:**
   - Provision an isolated staging MySQL 8 instance (`TEST_DATABASE_URL` or staging environment);
   - Restore the latest daily full backup and replay incremental binlogs to a target UTC timestamp;
   - Verify row counts across `User`, `Application`, `Profile`, `Post`, `Event`, and `AuditLog`, verify `utf8mb4` character integrity, and confirm the `AuditLog` append-only triggers (`BEFORE UPDATE` / `BEFORE DELETE`) remain active;
   - Record the drill completion time and verification outcome in the operations log.

### 3.3 Observability, Health Checks & Email Reliability
- **Health Endpoint:** `GET /api/v1/health` reports live MySQL connectivity and background job worker status (`Job` queue heartbeat).
- **Structured Logging & Alerting:** Pino JSON logs capture request IDs, slow queries (`> 1,000 ms`), auth failures, and rate-limit hits; Sentry (`SENTRY_DSN`) tracks unhandled exceptions without capturing PII or secrets.
- **Email Delivery & Bounce Handling:** Outbound emails from `Info@oasisodisha.in` (or configured transactional domain) enforce **SPF, DKIM, and DMARC**. Temporary SMTP failures queue in `EmailOutbox` with exponential backoff (**max 3 retries over 24 hours**); permanent bounces are flagged in `NotificationDelivery` (`status = bounced`) for admin review.
