# OASIS ONE — Data Breach & Security Incident Response Plan (`INCIDENT_RESPONSE.md`)

**Document Version:** 1.0 (Aligned with OASIS ONE PRD v1.2 §13, §14.4 & Backend Specification §6, §9, §9A, §9B)  
**Effective Date:** 16 October 2026  
**Organization:** OASIS (Odisha Startup Community — OASIS ONE)  
**Incident Response Headquarters:** Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018  
**Emergency Incident & Grievance Contact:** Info@oasisodisha.in | +91-904-01-98-628  

## 1. Purpose and Scope

This Data Breach and Security Incident Response Plan fulfills the mandatory pre-launch requirement in **OASIS ONE PRD v1.2 §14.4** and **Backend Specification §6 / §13 (`docs/INCIDENT_RESPONSE.md`)**. It defines the operational procedures for detecting, containing, investigating, recovering from, and reporting any security incident or personal data breach affecting the OASIS ONE web application, NestJS API (`/api/v1`), Socket.IO gateway (`/ws`), MySQL 8 database (`Oasis`), or S3-compatible private object storage.

## 2. Incident Response Team & Contact Directory

| Role | Responsibility | Contact Channel |
| :--- | :--- | :--- |
| **Incident Commander (Super Admin Lead)** | Overall authority for containment decisions, secret rotation, maintenance mode activation, and regulatory sign-off. | Info@oasisodisha.in / +91-904-01-98-628 |
| **Grievance & Data Protection Officer** | Drafts and dispatches mandatory 72-hour breach notifications to affected members, the Data Protection Board of India, and CERT-In. | Info@oasisodisha.in (`GRIEVANCE_EMAIL` / `OVERSIGHT_EMAIL`) |
| **Platform Engineering Lead** | Executes session revocations, firewall rules, MySQL point-in-time recovery (RPO 1h / RTO 4h), S3 bucket isolation, and patch deployment. | Internal Engineering Pager / Sentry Alert Channel |

## 3. Automated Detection & Security Monitoring Triggers

OASIS ONE emits structured JSON logs (Pino) with request correlation IDs and integrates with Sentry (`SENTRY_DSN`) and health probes (`GET /api/v1/health`). An incident triage is triggered immediately upon any of the following events:

1. **Authentication & MFA Anomalies:**
   - Spikes in `401 UNAUTHENTICATED`, `403 FORBIDDEN (details.reason = "csrf")`, or `429 RATE_LIMITED` on `/auth/login`, `/auth/mfa/verify`, or `/admin/setup`.
   - Any failed or unauthorized attempt to invoke Super Admin endpoints (`/admin/admins`, `/admin/settings`, `/admin/legal`, `/admin/audit-log`) or WebSocket handshakes rejected due to `WS_ALLOWED_ORIGINS` mismatch.
2. **Anti-Scraping & Bulk Data Access Alerts (`PROF-03`, `ADM-05`):**
   - High-velocity pagination or automated scraping signatures on `GET /profiles`, `GET /mentors`, or `GET /search`.
   - Unusual volume of administrator private profile views or attendee CSV exports (`GET /admin/events/:id/export.csv`) recorded in `AuditLog`.
3. **File Upload & Malware Alerts (`§9B`):**
   - Any ClamAV virus detection alert (`CLAMAV_HOST`) or repeated magic-byte vs. MIME-type spoofing attempts on `POST /uploads` or `POST /achievements`.
4. **Database & Infrastructure Alerts:**
   - Any attempt to execute `UPDATE` or `DELETE` against `AuditLog` (which triggers MySQL `SIGNAL SQLSTATE '45000'`).
   - Slow queries exceeding `1,000 ms`, unexpected MySQL connection spikes, or S3 bucket permission changes.

## 4. Incident Severity Classification

| Severity Level | Definition & Examples | Initial Response SLA |
| :--- | :--- | :--- |
| **SEV-1 (Critical — Confirmed Personal Data Breach or Admin Compromise)** | Unauthorized access to or exfiltration from the MySQL `Oasis` database or private S3 bucket; compromise of a `super_admin` or `moderator` account; exposure of `SESSION_SECRET`, `FIELD_ENCRYPTION_KEY`, `GOOGLE_CLIENT_SECRET`, or S3 IAM credentials. | **Immediate (< 30 minutes)** |
| **SEV-2 (High — Active Exploitation or Scraping Attempt)** | Compromised member account scraping directory profiles; active credential-stuffing or DDoS attack; bypassed rate limit or CSRF check; malware upload when ClamAV is degraded. | **< 2 hours** |
| **SEV-3 (Moderate — Security Control or Service Degradation)** | Temporary SMTP mail outage (`EmailOutbox` backlog), SMS OTP gateway failure, background job worker stall (`Job` dead-letter spike), or expired TLS certificate warning. | **< 8 hours** |

## 5. Five-Phase Incident Response Procedure

### Phase 1: Triage & Containment (0 – 2 Hours)
1. **Session & Socket Termination (`session.revoked`):**
   - For compromised member or admin accounts, immediately delete their rows in the `Session` table and emit `session.revoked` to room `user:{id}` over the `/ws` WebSocket gateway to disconnect all active sockets immediately.
   - Apply an immediate account `suspension` or `revocation` (`POST /admin/members/:id/restrictions`) or revoke admin privileges (`PATCH /admin/admins/:id`, which automatically releases held application claims).
2. **Secret & Key Rotation:**
   - If `SESSION_SECRET` is compromised: rotate `SESSION_SECRET` in environment configuration and truncate the `Session` table to force global re-authentication.
   - If `FIELD_ENCRYPTION_KEY` is compromised: rotate the key, invalidate all admin `mfa_secret` records, and require all Moderators and Super Admins to re-enroll TOTP MFA before accessing `/admin/*`.
   - If S3 IAM credentials are compromised: deactivate the IAM access key immediately in AWS/S3 console and rotate `S3_ACCESS_KEY` and `S3_SECRET_KEY` (all presigned download URLs expire within `S3_PRESIGN_TTL_SECONDS = 120` seconds).
3. **Network & Database Isolation:**
   - Block attacking IP ranges at the reverse proxy (Nginx/Caddy) or cloud firewall.
   - Verify that MySQL port `3306` is firewalled exclusively to the application server IP and that TLS connections are enforced.

### Phase 2: Forensic Preservation & Scope Assessment (2 – 24 Hours)
1. **Preserve Immutable Evidence:**
   - Take an immediate read-only snapshot of the MySQL database, the append-only `AuditLog` table, Pino structured application logs, reverse-proxy access logs, and S3 server access logs.
   - **Never** run destructive database commands (`DROP`, `TRUNCATE`, `migrate reset`) on the production `Oasis` database.
2. **Determine Affected Data Principals & Fields:**
   - Query `AuditLog`, `Session`, and `UploadedFile` logs to identify the exact set of affected `user_id` records, time window of unauthorized access, and specific data categories exposed (e.g., whether private email/phone fields, application attachments, or connection records were accessed).

### Phase 3: Eradication & Recovery (Within RTO of 4 Hours)
1. **Patch & Harden:** Fix the root software or configuration vulnerability, run the full automated verification suite (`pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`), and deploy the patched build.
2. **Database Point-in-Time Restore (If Data Integrity Was Affected):**
   - Restore from the latest daily full backup and replay hourly incremental MySQL binlogs up to the exact second prior to the unauthorized modification.
   - **Recovery Targets (PRD §13):** Recovery Point Objective (**RPO**) ≤ **1 hour**; Recovery Time Objective (**RTO**) ≤ **4 hours**.

### Phase 4: Mandatory 72-Hour Breach Notification (PRD §14.4 & Indian Law)
In the event of a confirmed personal data breach, OASIS will execute the following notifications **within 72 hours** of confirmation:

1. **Notification to Affected Members (≤ 72 Hours — PRD §14.4):**
   - Dispatch an essential, non-opt-out email and in-app notification to every affected user containing:
     - **Description of the Breach:** When the incident occurred, when it was discovered, and what happened in clear, plain language;
     - **Data Involved:** Exact categories of personal data affected (e.g., name, email address, phone number, profile details, or uploaded files);
     - **Containment & Remediation Actions:** Steps OASIS has taken to secure the Platform and prevent recurrence;
     - **Recommended Member Actions:** Specific protective steps for the member (such as changing their password via `/auth/change-password`, reviewing active sessions in **Settings → Security**, or being alert to phishing);
     - **Grievance Officer Contact:** Direct contact details for the OASIS Grievance Officer (`Info@oasisodisha.in`, `+91-904-01-98-628`, Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha 751018).
2. **Notification to the Data Protection Board of India (DPDP Act, 2023):**
   - Submit the statutory breach intimation under Section 8(6) of the Digital Personal Data Protection Act, 2023 to the Data Protection Board of India with full incident particulars and mitigation details.
3. **Notification to CERT-In (IT Act Directions):**
   - For qualifying cyber security incidents under the CERT-In Directions of 28 April 2022 (under Section 70B of the Information Technology Act, 2000), report the incident to the Indian Computer Emergency Response Team (`incident@cert-in.org.in`) within the mandated statutory window (6 hours for qualifying infrastructure incidents, with follow-up forensic details within 72 hours).

### Phase 5: Post-Incident Audit & Continuous Improvement (Within 7 Days)
1. **Permanent Audit Log Record (`PRD §14.4`):** Record a comprehensive incident entry in the append-only `AuditLog` detailing the incident timeline, affected entity counts, notification timestamps, and remediation actions completed.
2. **Post-Mortem & Drill Verification:** Conduct a blameless technical post-mortem, update rate limits or guards as needed, and verify backup restore readiness as documented in `docs/OPERATIONS.md`.
