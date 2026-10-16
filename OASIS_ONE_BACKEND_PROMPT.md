# OASIS ONE — Backend Build Prompt (NestJS + MySQL + Google login)

> Paste this into your AI coding tool (Claude Code, Cursor, etc.) with `OASIS_ONE_PRD_v1.2.md` attached.
> A separate frontend prompt builds the UI. The contract in §11 is how the two connect. Do not change it without updating both sides.

---

## 1. Mission

You are a staff backend engineer. Build the complete API for **OASIS ONE**, the admin-approved portal for an entrepreneur community of 650+ members. The PRD is the source of truth for business rules, limits, states and permissions. Read it fully first. Where the PRD suggests PostgreSQL, **use MySQL instead** (adaptations are noted below). Implement the contract in §11 exactly so the frontend connects without changes.

Priorities: correctness of access control, privacy, auditability, then features. Authorization is enforced server-side on every route and query.

---

## 2. Stack and environment

- Node 20+, **NestJS** (TypeScript strict), **Prisma ORM** with **MySQL 8**, pnpm. Project folder: `backend/`.
- Libraries (suggested): `@nestjs/config`, `@nestjs/throttler`, `helmet`, `cookie-parser`, `argon2`, `otplib` + `qrcode` (TOTP), `google-auth-library`, `nodemailer`, `zod` or `class-validator`, `multer`, `file-type`, `ics`, `csv-parse`, `web-push`, `@nestjs/swagger`, `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, `@nestjs/websockets` + `@nestjs/platform-socket.io` (Socket.IO), `@socket.io/redis-adapter` (only with Redis), Jest + supertest.
- Dev server on `http://localhost:4000`, global prefix `/api/v1`, Swagger at `/api/docs` (disabled in production).

### Environment (`backend/.env` — create it now, add `.env` to `.gitignore`, create a `.env.example` with placeholders, never print or log secret values, never hardcode them)

```
# Provided
DATABASE_URL="mysql://<user>:<password>@<host>:3306/Oasis"
GOOGLE_CLIENT_ID="<your-google-client-id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"

# Add
NODE_ENV=development
PORT=4000
FRONTEND_URL="http://localhost:3000"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/v1/auth/google/callback"
SESSION_SECRET=            # generate: openssl rand -hex 32
FIELD_ENCRYPTION_KEY=      # generate: openssl rand -hex 32  (encrypts TOTP secrets at rest)
ADMIN_SETUP_TOKEN=         # generate: openssl rand -hex 16  (one-time first-admin bootstrap)
MAIL_TRANSPORT=console     # console | smtp
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM="OASIS ONE <no-reply@example.com>"
GRIEVANCE_EMAIL=
OVERSIGHT_EMAIL=
STORAGE_DRIVER=local       # local | s3
S3_ENDPOINT=              # blank for AWS S3; set for S3-compatible providers and MinIO
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
CLAMAV_HOST=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
TEST_DATABASE_URL=         # a SEPARATE database, e.g. local Docker MySQL 8
SENTRY_DSN=
SMS_PROVIDER=console       # console | (provider to be decided)
SMS_API_KEY=
TRUST_PROXY=1              # number of proxy hops in front of the API
EMAIL_LOGO_URL=            # defaults to ${FRONTEND_URL}/brand/oasis-logo-email.png (must be a public https URL in production)
S3_REGION=                 # e.g. ap-south-1
S3_FORCE_PATH_STYLE=false  # true for MinIO and some S3-compatible providers
S3_SSE=AES256              # or aws:kms (then set S3_KMS_KEY_ID)
S3_KMS_KEY_ID=
S3_PRESIGN_TTL_SECONDS=120
REDIS_URL=                 # optional; only needed when running more than one API instance (Socket.IO adapter, throttler store)
WS_ALLOWED_ORIGINS=        # defaults to FRONTEND_URL
```

### Safety rules for the remote database
The `DATABASE_URL` points to a **remote, possibly live** server. Therefore:
1. First action: connect and report what is already in the `Oasis` database (tables, row counts). If tables exist, **do not drop or reset anything**. Introspect, tell me what you found, and adapt.
2. Never run `prisma migrate reset`, `db push --force-reset`, `DROP`/`TRUNCATE`, or any destructive statement against it without my explicit confirmation.
3. If the DB user cannot create the Prisma shadow database, use `prisma db push` in dev or set `SHADOW_DATABASE_URL`. For deployment use `prisma migrate deploy`.
4. Tests, e2e runs and seed-reset scripts run only against `TEST_DATABASE_URL` (local MySQL), never against `Oasis`.
5. If the server supports TLS, append the appropriate `sslaccept` option. Note in the README that the DB port should be firewalled to known IPs.
6. Check the database's default character set and collation. Use `utf8mb4` (for example `utf8mb4_0900_ai_ci`) for all new tables so names in any script, including Indic scripts, and emoji store correctly. Tell me if the existing default differs.
7. `prisma db push` leaves no migration history. Once I approve the schema, generate a baseline migration (`prisma migrate diff --from-empty --to-schema-datamodel --script`), commit it, and use `prisma migrate deploy` from then on.

---

## 3. Architecture

Modular monolith, one NestJS module per domain, thin controllers, logic in services, Prisma access via repositories/services. Global pipes (validation, whitelist, forbid unknown), global exception filter producing the contract's error envelope, global response interceptor producing `{ data, meta? }`.

```
backend/
  prisma/ schema.prisma, migrations/, seed.ts
  src/
    main.ts, app.module.ts
    common/        guards, decorators, filters, interceptors, pipes, utils (pagination, csv, crypto)
    config/        typed env validation (fail fast on missing vars)
    auth/          sessions, password, google, mfa, csrf, invites
    users/ applications/ profiles/ startups/ taxonomy/ legal/ consent/
    posts/ reports/ achievements/ connections/ blocks/
    events/ tasks/ calendar/ notifications/ push/ realtime/
    search/ support/ privacy/ files/ mail/ jobs/
    admin/         applications, members, restrictions, events, announcements, analytics, settings, admins, invites
    audit/ health/
```

Guards/decorators: `@Public()`, `@Auth()`, `@Member()` (active only), `@Admin()` (MFA-verified), `@AdminLevel('super_admin')`, `@CurrentUser()`. Default-deny: every route requires a guard decision, public routes are explicit.

---

## 4. Database (MySQL via Prisma)

Implement every entity in PRD §12 and the enums in §12.1, plus these additions:

`Session`, `AuthIdentity` (provider, providerUserId, userId), `VerificationToken` (email verify, password reset, email change; hashed, single-use, expiring), `LegalDocument` (type, version, body, publishedAt), `ProfileChangeRequest` (for PROF-02 flagged edits), `Setting` (key/value), `GrievanceCase` (caseId, category, status), `Job` (job queue), `EmailOutbox`, `PushSubscription`, `DataExportRequest`, `DeletionRequest`, `SearchLog`, `BlacklistIdentifier` (hashed email/phone), `Announcement`, `SearchSynonym` (optional), `EventInvitee` (invite-only events), `AnalyticsEvent`, `PhoneVerification` (hashed OTP, attempts, expiry), `UploadedFile` (owner, purpose, storage key, scan status), and join tables for tags ↔ profiles/posts/events.

Schema changes beyond PRD §12 (the PRD is silent or incomplete on these): add `deactivated` to `User.account_status` (inactivity deactivation, PRD §14.2); make `primary_role` nullable for admin-only accounts; add `User.phone` and `phone_verified_at`; add `Task.kind` (`task | deadline`, PRD §9.1); add `Application.expedited` (boolean); add `User.unlock_animation_pending` (boolean, default false; set true by an approval decision, cleared by `POST /me/unlock-seen`). Store invite tokens and email/password/phone verification tokens **hashed**.

MySQL adaptations:
- IDs: UUID strings (`@db.Char(36)`) for anything exposed by URL (applications, invites, files). Never expose sequential IDs for those.
- Long text → `@db.Text` / `@db.MediumText`. Use `Json` columns for visibility maps, form responses and metadata. Timestamps `DateTime(3)`, stored/treated as **UTC**. **Never use `NOW()` or `CURRENT_TIMESTAMP` in raw SQL** (they follow the DB server's time zone, which would break claim timeouts, expiries and quotas). Use `UTC_TIMESTAMP(3)` or pass a JS `Date` as a bound parameter, and set the connection session time zone to UTC.
- Full-text search: `@@fulltext` indexes (enable the `fullTextIndex` preview feature if your Prisma version requires it) on Profile (name, bio, role text), Post (title, body), Event (title, description). Query with `$queryRaw` using `MATCH ... AGAINST (? IN BOOLEAN MODE)`; **always use bound parameters (tagged `$queryRaw`) and strip boolean-mode operators (`+ - < > ( ) ~ * " @`) from user input before building the AGAINST string**; append `*` for prefix matching and fall back to `LIKE` for tokens shorter than the InnoDB minimum token size. Add indexes on all FK/filter columns (status, role, location, start_at, created_at).
- **Audit log append-only:** add a raw-SQL migration creating `BEFORE UPDATE` and `BEFORE DELETE` triggers on `AuditLog` that `SIGNAL SQLSTATE '45000'`. If the DB user lacks `TRIGGER` privilege, say so and enforce append-only at the application layer (no update/delete code paths, separate write-only service) and document the gap.
- Anything needing transactions/locks (event capacity, claims, quota) uses InnoDB transactions; `SELECT … FOR UPDATE` via `$queryRaw` where needed.
- Seed (`prisma/seed.ts`, idempotent): sectors (DeepTech, AI/ML, FinTech, HealthTech, AgriTech, EdTech, ClimateTech, SaaS, D2C/E-commerce, Hardware/Manufacturing), expertise tags (Funding, Sales, Marketing, Product, Technology, Hiring, Partnerships, Legal/Compliance, Operations), post categories (Question, Suggestion, Resource, Opportunity), default `Setting` rows, initial `LegalDocument` v1 for privacy notice and community guidelines (placeholder text clearly marked for legal review). Dev-only demo data behind a flag.

---

## 5. Authentication and sessions

- **Sessions:** opaque random 32-byte token in HttpOnly cookie `oasis_sid` (SameSite=Lax, Secure in production). Store only a SHA-256 hash in `Session`. Lifetime 24h sliding, absolute max 7 days. Destroy all sessions on suspension, revocation, blacklist, password change and role change. Admin routes require a session flagged `mfaVerified`.
- **CSRF:** double-submit token. `GET /auth/csrf` sets a readable cookie and returns the value. Require `X-CSRF-Token` on all non-GET requests (except the OAuth callback, which is GET).
- **Passwords:** argon2id. Policy ≥8 chars with upper, lower, digit. Reset tokens expire in 1h and are single-use. Constant-time responses on forgot-password (never reveal whether an email exists).
- **Email verification:** link expires in 24h. Resend endpoint. If mail is down, queue it and let registration proceed in an unverified state (PRD §6.1). Forgot-password and resend-verification responses must be **generic** (never reveal whether an email is registered). Registration is the one exception (see §6, sign-up flow): a duplicate email returns `409`, because the new user is signed in straight away.
- **Email change:** verification link goes to the *new* address before the change applies.
- **MFA (admins):** TOTP via `otplib`. Secret encrypted at rest with `FIELD_ENCRYPTION_KEY`. Mandatory at admin creation/promotion. Generate 8 single-use backup codes (hashed). Admin sessions stay `mfaVerified=false` until a valid code is submitted. `POST /auth/mfa/verify` accepts either `{ code }` or `{ backupCode }`. New admins (created by a Super Admin through `POST /admin/admins`, or promoted from member) receive a set-password link (same token flow as reset) and are forced through TOTP enrolment at first sign-in. Admin-only accounts have `primaryRole=null`, `applicationStatus=approved` and a minimal profile.
- **Rate limits** (return 429 + `Retry-After` + `retryAfterSeconds`): login 5 / 15 min per IP+email, registration 3 / hour per IP, search 60 / min per user, public endpoints 30 / min per IP, connection requests 10 / rolling 24h per user (count from DB), directory endpoints throttled with bulk-download pattern detection (log + audit). Also: forgot-password 3 / hour per email+IP, resend-verification 3 / hour, phone OTP 3 / hour and 10 / day per user (max 5 wrong attempts per code), support contact 5 / hour, `/admin/setup` 5 / hour per IP. The default throttler store is in-memory (it resets on restart and is not shared across instances), so use a Redis or database store if you run more than one instance.
- **Security headers:** helmet with strict CSP, `trust proxy` configurable, strict CORS allow-list from `FRONTEND_URL` (credentials on). Server-side validation on every input, whitelist DTOs, output encoding, upload whitelist. Also check the `Origin`/`Referer` header on every state-changing request against the allow-list (defense in depth next to CSRF tokens), cap JSON bodies at 1 MB, and set `trust proxy` correctly (`TRUST_PROXY`) so rate limits and audit-log IPs use the real client address behind the Next.js proxy.

### Google login (Authorization Code flow with PKCE)
1. `GET /auth/google`: create `state` + PKCE verifier, store them in a short-lived signed HttpOnly cookie, 302 to Google (scopes: `openid email profile`). Accept optional `invite` and `next`. **Validate `next` as a same-origin relative path** (prevent open redirects).
2. `GET /auth/google/callback`: verify state, exchange the code, **verify the ID token** (audience = `GOOGLE_CLIENT_ID`, issuer, expiry) and require `email_verified=true`. Reject otherwise.
3. Find `AuthIdentity(google, sub)`. If missing, find a user by email: link only if that user's email is verified. Otherwise create a new `User` with `emailVerified=true`, no password, `accountStatus=pending_verification` and `applicationStatus=not_started`, prefilling name and avatar from the ID token. **Google sign-in can never create or promote an admin.** Admins exist only through `/admin/setup` or `/admin/admins`; an admin who signs in with Google (same verified email) still needs TOTP.
4. Create the session, then 302 to `${FRONTEND_URL}/auth/callback`. The frontend calls `/auth/me` and routes. Never put tokens or user data in the redirect URL.
5. A new Google user is signed in straight away and the frontend sends them to `/register/complete` to fill in the role form, age confirmation and consent (`POST /auth/register/complete`). That sets `applicationStatus=pending` and `accountStatus=pending_approval` (their email is already verified), and they land on the locked dashboard (§6). If an `invite` token matches the Google email, they finish via `POST /invites/:token/accept` and become `active` immediately, with no unlock animation.
6. Blocked states (suspended / revoked / blacklisted) apply identically to Google logins. Admins signing in with Google still require TOTP.
7. Never log or expose `GOOGLE_CLIENT_SECRET`. Document that the redirect URI(s) `http://localhost:3000/api/v1/auth/google/callback` (and `http://localhost:4000/api/v1/auth/google/callback` as a fallback, plus the production URL) must be registered in the Google Cloud Console for this client ID, or Google returns `redirect_uri_mismatch`.
8. README section "Google Cloud setup": (a) create or reuse a Google Cloud project; (b) configure the OAuth consent screen as **External** with only the scopes `openid`, `email` and `profile`, and add the app name, support email, privacy-notice and terms URLs and the authorized domain; (c) create an OAuth client of type **Web application** and add the exact redirect URIs (no wildcards; localhost and the production domain are separate entries); (d) before launch set Publishing status to **In production**. In Testing, access is capped at 100 listed test users unless the app asks only for basic scopes, and those users see a testing warning. The app name and logo appear on the consent screen only after Google's brand verification; check in the console what that needs.
9. Optional: copy the Google avatar into S3 once at first sign-in (only from `*.googleusercontent.com` over https, max 2 MB, magic-byte check, no redirects followed) so the app never hot-links Google. If you skip this, use an initials avatar.

---

## 6. Business rules to implement (PRD is authoritative; key numbers repeated here)

**Applications & registration**
- Roles on register: `aspiring_entrepreneur | founder | mentor` only. Never allow self-selecting admin.
- **Sign-up flow (everyone except admins):** `POST /auth/register` (email and password, with the full role form, age confirmation and consent), or Google sign-in followed by `POST /auth/register/complete`, creates the account **and signs the user in immediately**. Registering with an email that already exists returns `409 CONFLICT` with a friendly message (the trade-off for going straight to the dashboard; protected by the registration rate limit; add Turnstile or hCaptcha if abuse appears). Admins can never self-register.
- **Locked state:** until approval the user has `accountStatus` `pending_verification` (email not yet verified) or `pending_approval`, and `applicationStatus` `pending` or `info_requested`. They may call only `public` and `auth` endpoints (their application, messages, uploads, support contact, sessions, `/auth/me`, legal and config); every `member` endpoint returns `403 ACCOUNT_STATE`. The locked dashboard needs no member data, so nothing private is ever sent to a pending user. An application enters the admin review queue only once the email is verified (Google users are already verified).
- **Approval:** the decision transaction sets `accountStatus=active`, `applicationStatus=approved` and `User.unlock_animation_pending=true`. After commit it emits `account.status_changed` to `user:{id}`, creates the in-app notification and queues the welcome email. `/auth/me` returns `showUnlockAnimation=true` while that flag is set and the account is active; `POST /me/unlock-seen` clears it (idempotent). The flag is never set for invite-activated members, admins or existing members, so only people who waited for approval see the animation, once, on any device.
- The register payload includes the browser `timeZone`; optional `photoFileId` and `evidenceFileIds` come from `POST /uploads` (purposes `profile_photo`, `application_attachment`, `verification_evidence`; same type, size and antivirus rules as §9). A phone number is saved **unverified**. Verification is by OTP through `POST /me/phone/otp` and `POST /me/phone/verify` (PRD §8.1), with the SMS provider behind a `SmsService` interface and a `console` driver in dev; hash OTPs and expire them after 10 minutes. Only verified phones are used for blacklist matching.
- Age confirmation required (18+). Consent records the `LegalDocument` version + timestamp + IP per document. Re-accept required when a new version is published (`pendingConsents` in `/auth/me`).
- Application reference ID is a UUID. Statuses per §12.1. Applicant sees only applicant-facing `ApplicationMessage`s (`isInternalNote=false`); internal notes never leak through any applicant endpoint.
- **Claim/lock:** atomic `UPDATE … WHERE claimed_by IS NULL OR claimed_at < UTC_TIMESTAMP(3) - INTERVAL 15 MINUTE OR claimed_by = :me`. Calling `claim` again by the same admin renews it (heartbeat). Release on decision, manual release, or the auto-release job. A Super Admin may override (audited). Decisions require holding the claim.
- Decision: approve → `active` + welcome notification. Reject → reason + cooling-off (`Setting.cooling_off_days`, default 30) → `canReapplyAt`; reapply before then is blocked with the eligible date. Request-info → email + status page, applicant replies via messages (AUTH-09).
- Rubric (PRD §20.4) is stored with the decision; it is advisory.
- Rejected and withdrawn applicants keep `accountStatus=pending_approval` with `applicationStatus=rejected|withdrawn`. Applicants may `PATCH /applications/me` (only while `info_requested`) and `POST /applications/me/withdraw`. `Application.expedited=true` is set for expired-invite and pre-approved-list matches and shown in the admin queue.
- Blacklist check at registration: hashed email/phone match = block; same full name + same city = advisory flag shown to admins (no auto-block).
- Rejected applications are purged after 90 days (job).

**Profiles & privacy**
- Defaults at creation: phone private, email private, name/bio/LinkedIn visible to members. Field-level `visibility` JSON map + `shareOnConnection` set.
- One serializer per viewer context (`self`, `member`, `connected`, `admin`). Private fields must not appear in any search/profile/directory response. Admins viewing private data → audit log entry.
- Flagged fields (role, full name, startup name, expertise areas, verification evidence) create `ProfileChangeRequest` instead of applying immediately. The old value stays public until a moderator approves.
- Founders at the same startup link to one `Startup` (suggest by name; admins can merge duplicates).
- Mentor verification badge is admin-assignable only. Unverified mentors are labeled in results.
- Mentor availability (`active | paused`, optional max concurrent mentees, preferred contact method) lives on the mentor profile and is edited through `PATCH /me/profile`, which also accepts `timeZone`. Paused mentors are excluded from connect-eligible results.
- Every profile response includes `viewer: { canConnect, connectionStatus (none | pending_out | pending_in | connected), isBlocked }` so the UI never has to guess. `canConnect` is true only for active, non-paused mentors whom the viewer has not blocked, who have not blocked the viewer, and with whom there is no pending request.

**Posts, reports, achievements**
- Title ≤200, body ≤10,000, response ≤5,000. Edit own post within 24h, keep `original_body`, set `edited_at`. Delete = soft delete; responses stay with "original post removed" semantics. Resolve marks an optional accepted answer. `GET /posts?feed=relevant` implements PRD §11.1: posts matching the member's interest tags, then posts from members in the same city, then most recent (tags and recency only, no ML).
- Reports: reason categories spam | harassment | misinformation | other → moderation queue. Admin hide/restore requires a reason, notifies the author (generic reason), is audited. Reporter notified on resolution (P1). Reports can target posts, responses, achievements or profiles. Admins resolve or dismiss with notes and can hide or restore posts and responses (`/admin/posts/:id/hide`, `/admin/responses/:id/hide`). Profile reports are resolved through member restrictions.
- Achievements: text ≤500, optional JPEG/PNG ≤5 MB, always `pending_review`. On approval set `approved_at` and `expires_at = approved_at + 24h` (UTC). The `/achievements/active` query filters by time at read-time (do not depend on the expiry job). Notify the author on approve and reject. Admins can also remove an approved achievement early (`decision: remove`).

**Connections, blocks**
- Recipient must be an active mentor/advisor who has not paused availability. 10 requests per rolling 24h per sender. Duplicate pending to same recipient → 409. Pending requests expire after 14 days (read-time + job); sender may re-send after a 7-day cooldown.
- On accept, share only the contact fields each side marked "share on connection". If nothing is shareable, the response flags it so the UI can prompt.
- Blocking is private, immediate, and hides full profiles both ways; the blocked user gets a generic "profile unavailable". Blocked users cannot send requests.

**Events**
- Admin CRUD, visibility (`all_members | specific_roles | invite_only`), capacity, waitlist, deadline, dynamic `EventFormField`s. `meetingLink` is returned only to registered members. Invite-only events are visible and registrable only to users in `EventInvitee`, managed with `PUT /admin/events/:id/invitees` (this mechanism is my assumption, because the PRD does not define how invitations work). Registration is rejected after `registration_deadline`. A job marks events `completed` after `end_at`.
- Register inside a transaction that locks the event row: capacity left → `registered`, else `waitlisted` with position. Prevent duplicates. Cancel → promote the next waitlisted member in the same transaction and notify.
- Update/cancel notifies all registered + waitlisted members (updates include a change summary). Calendar reflects changes via `/me/calendar`.
- Attendee CSV: authorized admins only, **formula-injection-safe** (prefix cells starting with `= + - @ \t \r` with `'`), audited. Check-in sets `checked_in_at`. `.ics` per event.
- Reminders at 24h and 1h (per user preference) via jobs. Events are free in MVP.

**Tasks / calendar**
- Private to the owner (title ≤200, notes ≤2,000, priority, status, reminder, and `kind` = `task | deadline` for manually tracked funding/opportunity deadlines per PRD §9.1). Never return another user's task; admins cannot read task content (analytics are aggregate only). No reminders for completed/deleted/cancelled items.

**Notifications**
- Implement all triggers in PRD §15. Broadcasts fan out to `NotificationDelivery` rows in batches via a job. Essential notifications (account status, security, admin decisions, event updates/cancellations, waitlist promotion, terms updates) ignore opt-out. Default `NotificationPreference` rows are created on account creation, including a non-essential `weekly_digest` preference that is **off by default** (PRD §9.3: opt-in; the digest job itself can ship after the core planner). `GET /announcements/active` returns announcements targeted at the viewer's role that have not expired. In-app + email + optional Web Push.

**Admin, restrictions, governance**
- Permissions per Appendix C. Moderator: review/decide applications, moderate content, warn/suspend, manage events/announcements/taxonomy (read/create/edit). Super Admin: everything incl. revoke/blacklist, role changes, admin users, settings, audit log.
- Restriction reason ≥10 chars. Suspension: posts stay visible but locked, event registrations held, auto-lift at `expires_at` via job. Revocation: cannot log in, content soft-hidden, shared contact info revoked. Blacklist: store hashed identifiers, retain per policy.
- An admin cannot modify their own role/restrictions, cannot act on their own content, cannot decide their own application. The last active Super Admin cannot be demoted/deactivated. Offboarding releases all claims.
- **Legal documents:** Super Admins publish new `LegalDocument` versions through `POST /admin/legal`. Publishing sets the new current version, makes `pendingConsents` non-empty for every member, and sends the "terms updated" notification (the re-accept gate).
- **Taxonomy:** create, rename and retire are allowed for moderators. Merge (Super Admin) reassigns every profile, post and event relation to the target tag and then retires the source.
- **Bootstrap:** `POST /admin/setup` works only while zero admins exist and requires `ADMIN_SETUP_TOKEN`. It creates the first Super Admin (name, email, password, TOTP enrolled) and then permanently disables itself.
- Audit every action in PRD §7.9 ADM-05 (actor, action, target type/id, reason, IP, timestamp, metadata). Include admin views of private data and all exports.

**Migration (existing 650+ members)**
- `POST /admin/invites/import` accepts CSV (name, email, role). Validate, dedupe (by email), return a preview/report of rows accepted vs rejected, then create `InviteLink` rows with non-guessable tokens (default 14-day expiry, `Setting`-driven) and queue invite emails. `POST /invites/:token/accept` activates the account immediately (pre-approved). Expired invite → standard registration, but an email match against the list marks the application for **expedited approval** (flag + 24h target shown in the admin queue).

**Support / grievance**
- `POST /support/contact` creates a `GrievanceCase` with ID `OASIS-GRV-YYYY-XXXX` (per-year sequence), emails `GRIEVANCE_EMAIL` (or `OVERSIGHT_EMAIL` when `category=admin_misconduct`) and sends a confirmation to the submitter. Never expose cases publicly.

**Privacy**
- Data export (JSON of profile, posts, responses, tasks, registrations, connections, preferences) built by a job, ready within 48h, downloadable once via a signed link. Account deletion: the account is deactivated and hidden from search immediately, and data is purged or anonymized within 30 days. Anonymize authored content ("Former Member"), delete profile/tasks/preferences, cancel registrations, revoke shared contacts, keep audit rows with the actor anonymized, send confirmation.
- Retention jobs per PRD §14.2: rejected apps 90d, content reports 1y after resolution, audit logs 3y, inactivity warning at 12 months and deactivation at 15. Deactivation sets `account_status=deactivated`. Logging in during the 12–15 month warning window clears the warning; after deactivation, reactivation goes through the support contact.
- Breach-response plan stub in `docs/INCIDENT_RESPONSE.md`.

**Analytics**
- `POST /analytics/events` (members) records `{ name, props }` for `search_result_open`, `event_view`, `profile_view` and `connect_click`, with no free text or personal data. `GET /admin/analytics` computes every metric in PRD §4.3 and §16: application turnaround (median and p90), approval conversion, 14-day activation, MAU, search success, zero-result rate, event conversion, report rate and migration adoption. Planner statistics are aggregate only.

---

## 7. Search

`GET /search` returns `{ people, posts, events }` each with `items`, `total`, and `counts`, paginated (default 20). Only active members, published content and fields marked visible. Exclude blocked relationships. Support partial/prefix matches, accent-insensitive matching, tag matches and the synonym table. Zero results → return `suggestions` (closest tags + popular tags). Log anonymized queries (no user ID) with a zero-result flag to `SearchLog`. Ship a fixture set of 20 representative queries (PRD §18.11) as a test.

---

## 8. Background jobs (MySQL-backed queue; BullMQ is optional if Redis is available)

`Job` table with type, payload, `runAt`, attempts, status, `lockedAt`/`lockedBy`. A worker loop claims jobs with `SELECT … FOR UPDATE SKIP LOCKED` (MySQL 8; fall back to an optimistic `UPDATE … LIMIT 1` claim on older versions) with retry and exponential backoff and a dead-letter state. Job types: `send_email` (retry: max 3 over 24h), `task_reminder`, `event_reminder`, `announcement_fanout`, `achievement_expiry`, `invite_expiry`, `connection_expiry`, `claim_auto_release`, `suspension_lift`, `inactive_warning`, `inactive_deactivate`, `retention_purge`, `data_export_build`, `account_deletion`, `orphan_file_cleanup`. All jobs must be idempotent. Failures are logged with structured context.

---

## 9. Mail, files, observability

- **Mail:** `MAIL_TRANSPORT=console` prints emails to the log in dev (never include secrets or tokens in production logs). `smtp` uses nodemailer. Branded HTML + text templates for every notification in PRD §15, with no sensitive profile or grievance content. Brand them with the supplied logo: 600px wide, a brand-navy (`#1E1F33`) header band containing `oasis-logo-email.png` (a 480px image displayed at 240px, loaded from the absolute public URL in `EMAIL_LOGO_URL`), an ivory (`#FBF7EE`) body with navy text (`#1E1F33`), a champagne-gold (`#E9C68C`) button with navy text, a gold hairline divider, and a footer line "Odisha · Startup Community". Set explicit background colors on every block so dark-mode mail clients do not invert the design, use web-safe font fallbacks (Jost will not load in most inboxes), and always include a plain-text alternative. Log delivery status in `NotificationDelivery`/`EmailOutbox`; flag permanent bounces for admin review.
- **Files:** `StorageService` interface with `local` (development only) and `s3` (production) drivers; see §9B. Whitelist by MIME **and** magic bytes. Limits: profile photo 2 MB (JPEG/PNG), achievement 5 MB (JPEG/PNG), application attachment 10 MB (PDF/JPEG/PNG). Virus scan via ClamAV when `CLAMAV_HOST` is set (fail closed in production). Private storage only, served through `GET /files/:signedToken` (short-lived, per-user signed tokens).
- **Observability:** structured JSON logs (pino), request IDs, slow-query log (>1s), auth-failure and rate-limit-hit logging, `/api/v1/health` (DB + job worker status).
- All timestamps UTC. Pagination defaults 20, max 50.
- **Operations:** write `docs/OPERATIONS.md` covering daily full plus hourly incremental MySQL backups (binlog / point-in-time recovery), target RPO 1 hour and RTO 4 hours, a documented restore drill, uptime and Sentry (`SENTRY_DSN`) setup, and maintenance-window guidance (PRD §13). Do not claim backups exist unless they are actually configured; if you cannot configure them from here, list that as an open item.

---

## 9A. Realtime (WebSocket)

Use WebSockets wherever a member or admin would otherwise have to refresh. The protocol (path, namespace, rooms, event names, payloads) is in the contract (§11). Implement it exactly.

- **Stack:** a NestJS gateway (`@WebSocketGateway({ namespace: '/ws' })`) on Socket.IO in `src/realtime/`, attached to the same HTTP server and port as the API.
- **Handshake auth:** parse the `oasis_sid` cookie and validate the session exactly as the HTTP guard does. Reject on a missing or expired session, and reject when the `Origin` header is not in `WS_ALLOWED_ORIGINS` (this blocks cross-site WebSocket hijacking, because cookies are sent automatically). No token in the query string. Mark the socket with the session's `mfaVerified` flag.
- **Rooms and permissions:** on connect join `user:{id}` and `role:{role}`; join `members` only when `accountStatus=active`; join `admins` only for MFA-verified admins. `room.join` is checked against the same rules as REST: `post:{id}` and `event:{id}` only for active members who may see that item, `application:{id}` only for its owner or an admin. Ignore unknown events.
- **Locked applicants get a socket too.** A pending applicant joins only `user:{id}`, `role:{role}` and their own `application:{id}`. That is how they receive the approval signal and admin messages without refreshing.
- **Signals only:** emit ids and types, never private content. The client refetches over REST, so permissions are enforced in one place.
- **Emit after commit:** write `RealtimeService.emit(room, event, payload)` and call it only after the database transaction has committed. Emit from services (approval, rejection, request-info, message sent, notification created, connection changes, event capacity and waitlist, post response, achievement approved, announcement, legal version published, restrictions) and from jobs.
- **Force logout:** when a session is destroyed (suspension, revocation, blacklist, password change, role change, sign-out of one session) emit `session.revoked` and disconnect that user's sockets.
- **Limits:** max 5 sockets per user, a handshake rate limit per IP, payloads capped at 4 KB, a per-socket event rate limit, ping/pong heartbeat. Log connect and disconnect counts, never payloads.
- **Admin counts:** recompute and emit `admin.counts` (debounced to one per 2 seconds) when the application, report or achievement queues change.
- **Scaling:** one API instance works as is. With more than one, set `REDIS_URL` and use the Socket.IO Redis adapter; the job worker must emit through the same adapter (or run inside the API process). State which you chose in the README.

---

## 9B. S3 file storage

Production storage is S3 (AWS S3 or any S3-compatible service) behind the `StorageService` interface; the `local` driver is for development only. No bucket details have been provided yet: read them from env and list any missing values in the README.

- **SDK and config:** `@aws-sdk/client-s3` v3. A blank `S3_ENDPOINT` means AWS; set it for S3-compatible providers and MinIO, with `S3_FORCE_PATH_STYLE=true` where required. Credentials come only from env (or the instance role when running on AWS). Fail fast at startup if `STORAGE_DRIVER=s3` and the bucket is unreachable.
- **Bucket (document in the README):** private, Block Public Access on, default encryption (`S3_SSE`), ACLs disabled (bucket owner enforced), versioning optional, and a lifecycle rule that aborts incomplete multipart uploads after 1 day and expires `exports/` after 7 days. No browser CORS is needed with this design.
- **Least-privilege IAM:** give the app its own IAM user or role that allows only `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` and `s3:AbortMultipartUpload` on `arn:aws:s3:::<bucket>/*`.
- **Upload path (keeps the contract):** the browser sends multipart to `POST /uploads` (or `/achievements`, `/me/profile/photo`). The API holds the file in memory (size-limited by `multer`), checks MIME and magic bytes, scans with ClamAV when configured, and only then writes it to S3. Presigned direct-to-S3 uploads are deliberately not used, because they would skip the validation and the scan.
- **Keys:** `uploads/{purpose}/{userId}/{uuid}.{ext}` (extension from the detected type, never the original file name) and `exports/{userId}/{uuid}.json`. Set `ContentType` from the detected type and `ServerSideEncryption` from `S3_SSE`. Record key, size, detected type, SHA-256 and scan status in `UploadedFile`, with `status` = `pending | attached | deleted`.
- **Download path:** `GET /files/:signedToken` verifies the per-user, short-lived token, then answers `302` to a presigned S3 GET URL valid for `S3_PRESIGN_TTL_SECONDS` (default 120 s), with `Cache-Control: private, no-store`. Serve non-image files with `Content-Disposition: attachment`. Never store or return bucket URLs.
- **Cleanup:** the `orphan_file_cleanup` job deletes `pending` uploads older than 24 hours. The retention and deletion jobs delete the S3 objects too: rejected-application attachments at 90 days, and every object a user owns on account deletion. Data exports are written to `exports/` and expire after 7 days.
- **Tests:** run the S3 driver tests against MinIO (add it to `docker-compose.yml`), never against the real bucket.

---

## 10. Testing

- Jest unit tests for services (rules above), supertest e2e for the critical flows, running against `TEST_DATABASE_URL`: register → verify → application → claim → decision; Google callback (mock the token exchange); invite import → accept; privacy serializers (private fields never leak); rate limits; claim concurrency; event last-seat race and waitlist promotion; achievement expiry boundary; blacklist; CSV formula injection; audit append-only; RBAC matrix from Appendix C (table-driven).
- Also test: WebSocket handshake rejected without a cookie, with an expired session and with a bad `Origin`; `account.status_changed` reaches only the approved user's room; a non-admin cannot join `admins` and a pending user cannot join `members`; `room.join` authorization; `session.revoked` disconnects sockets; `showUnlockAnimation` is true once after approval and false after `/me/unlock-seen` (and never set for invite or admin accounts); a pending user gets `403 ACCOUNT_STATE` on every member endpoint (table-driven); S3 upload, download redirect and delete against MinIO.
- Target ≥70% coverage on services. CI script: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e`.

---

## 11. API contract

Implement exactly. Generate OpenAPI from it and keep Swagger in sync.

<!-- API-CONTRACT-START -->
## Shared API contract (identical in the frontend and backend prompts)

**Conventions**
- Base path `/api/v1`. JSON (multipart only for uploads and CSV import). Timestamps are ISO-8601 UTC; the UI renders them in the member's time zone.
- Auth is an HttpOnly session cookie `oasis_sid` (SameSite=Lax; Secure in production). No tokens in localStorage. Every state-changing request sends header `X-CSRF-Token` (value from `GET /auth/csrf`). A CSRF failure returns `403 FORBIDDEN` with `details.reason = "csrf"`; the client refreshes the token once and retries.
- Success: `{ "data": ... }`. Lists also return `"meta": { "page", "pageSize", "total", "totalPages" }` (default pageSize 20, max 50).
- Error: `{ "error": { "code", "message", "fields"?, "details"?, "retryAfterSeconds"? } }` with codes `UNAUTHENTICATED` 401 · `FORBIDDEN` 403 · `ACCOUNT_STATE` 403 (`details.status` = pending_verification | pending_approval | suspended | revoked | blacklisted | deactivated) · `MFA_REQUIRED` 403 · `NOT_FOUND` 404 · `CONFLICT` 409 · `VALIDATION_FAILED` 422 (`fields` = per-field messages) · `RATE_LIMITED` 429 (also sets `Retry-After`).
- Role values: `aspiring_entrepreneur` | `founder` | `mentor`. Admin level: `super_admin` | `moderator`.
- `GET /auth/me` returns `{ id, email, emailVerified, name, avatarUrl, primaryRole (null for admin-only accounts), accountStatus, applicationStatus (not_started | pending | info_requested | approved | rejected | withdrawn), adminLevel, mfaVerified, timeZone, pendingConsents: [{ type, version }], showUnlockAnimation (boolean) }`. `showUnlockAnimation` is true, once, after an admin approves the member, until `POST /me/unlock-seen` is called (it drives the one-time unlock animation). Until approval the account is **locked**: `accountStatus` is `pending_verification` or `pending_approval` and `applicationStatus` is `pending` or `info_requested`. A locked user may call only endpoints marked public or auth; every member endpoint returns `403 ACCOUNT_STATE`. Rejected and withdrawn applicants keep `accountStatus=pending_approval`. The frontend routes by `accountStatus` + `applicationStatus`.
- Profile responses include `viewer: { canConnect, connectionStatus (none | pending_out | pending_in | connected), isBlocked }`.
- Files are uploaded first with `POST /uploads` (returns `{ id }`) and referenced by id (`photoFileId`, `evidenceFileIds`, `attachments`). `POST /achievements` also accepts its image as multipart.
- Google sign-in: the browser navigates to `/api/v1/auth/google` (optional `?invite=<token>&next=/path`). The backend completes OAuth and 302s to `${FRONTEND_URL}/auth/callback`; the frontend then calls `/auth/me` and routes.
- The frontend proxies `/api/*` to the backend (Next.js rewrites) so cookies stay first-party.

**Realtime (WebSocket)**
- Socket.IO, path `/socket.io`, namespace `/ws`. Production: same origin, with the reverse proxy forwarding `/socket.io/` to the API. Development: the client connects to `NEXT_PUBLIC_WS_URL` (default `http://localhost:4000`) with credentials. Next.js rewrites are not used for WebSockets.
- The handshake is authenticated by the `oasis_sid` cookie, and its `Origin` header must be on the allow-list or it is rejected. Locked applicants can connect too. Max 5 sockets per user.
- Events are signals: they carry ids and a type, never private content. The client reacts by refetching through REST, which stays the only place where authorization and data live. The server emits only after the database change has committed.
- Rooms joined automatically: `user:{id}`, `role:{role}`, `members` (active members only) and `admins` (MFA-verified admins only). On request with `room.join { room }` (ack `{ ok }`, authorized server-side): `post:{id}` and `event:{id}` (active members), `application:{id}` (its owner or an admin). `room.leave { room }` leaves.
- After a reconnect the client refetches its active queries. While the socket is down the client polls `/auth/me` every 30 s when locked and `/notifications/unread-count` every 60 s otherwise.

```
SERVER -> CLIENT EVENT      PAYLOAD                                   ROOM
account.status_changed      { accountStatus, applicationStatus }      user:{id}      approval, rejection, info requested, suspension
application.message         { applicationId }                         user:{id}, application:{id}
notification.new            { id, type }                              user:{id}
connection.updated          { connectionId, status }                  user:{id}
event.updated               { eventId, change }                       event:{id}     change = details | capacity | cancelled | waitlist_promoted (promotion also goes to user:{id})
post.response_added         { postId, responseId }                    post:{id}
achievement.live            { achievementId }                         members
announcement.new            { announcementId }                        role:{role}
legal.updated               {}                                        members
session.revoked             { reason }                                user:{id}      the server then disconnects the socket
admin.application.new       { applicationId }                         admins
admin.application.claim     { applicationId, claimedBy | null }       admins
admin.counts                { pendingApplications, openReports, pendingAchievements }   admins
```

**Endpoints** (access: public · auth = any signed-in user, including applicants and restricted accounts · member = active account · admin = MFA-verified admin · super = Super Admin)

```
SYSTEM
GET    /health                                   public   DB + job worker status

AUTH & ONBOARDING
GET    /auth/csrf                                public
GET    /auth/google                              public   start Google OAuth (302)
GET    /auth/google/callback                     public   finish OAuth, set session, 302 to frontend
POST   /auth/register                            public   email+password; role form, timeZone, age confirmation, consent versions, optional photoFileId / evidenceFileIds; signs the user in (locked until approved); 409 CONFLICT if the email is already registered
POST   /auth/register/complete                   auth     finish registration for a Google-created user (role form, age, consent); sets the application to pending
POST   /auth/verify-email                        public   { token }
POST   /auth/resend-verification                 public   { email }
POST   /auth/login                               public   { email, password }
POST   /auth/logout                              auth
GET    /auth/me                                  auth
POST   /auth/forgot-password                     public
POST   /auth/reset-password                      public
POST   /auth/change-password                     member   { currentPassword, newPassword }
POST   /auth/change-email                        member
POST   /auth/confirm-email-change                member
POST   /auth/mfa/setup                           auth     admins only; returns otpauth URI + QR data
POST   /auth/mfa/verify                          auth     admins only; { code } or { backupCode }
GET    /invites/:token                           public   validate invite, return prefill
POST   /invites/:token/accept                    public   shortened registration for pre-approved members (password or existing Google session)
GET    /legal/:type/current                      public   privacy_notice | community_guidelines
GET    /config/public                            public   support email, min age, current legal versions
GET    /taxonomy/tags?category=                  public   active tags

ACCOUNT & SECURITY
GET    /me/restrictions                          auth     own warnings / suspension / appeal info (powers the suspended page)
GET    /me/sessions                              auth     active sessions
DELETE /me/sessions/:id                          auth     sign out one session
POST   /me/unlock-seen                           auth     clears showUnlockAnimation (idempotent); call when the unlock animation starts
POST   /me/phone/otp                             member   send OTP to the phone on file
POST   /me/phone/verify                          member   { code }
POST   /uploads                                  auth     multipart; purpose = profile_photo | application_attachment | verification_evidence; returns { id }

APPLICATION
GET    /applications/me                          auth     status, reference id, canReapplyAt
PATCH  /applications/me                          auth     update requested details (only while info_requested)
GET    /applications/me/messages                 auth     applicant-facing thread only
POST   /applications/me/messages                 auth     { body, attachments? }
POST   /applications/me/withdraw                 auth
POST   /applications/me/reapply                  auth

PROFILES
GET    /profiles?q&role&sector&expertise&location&page    member   directory
GET    /profiles/:id                             member
GET    /me/profile    PATCH /me/profile          member   includes timeZone and mentor availability
PATCH  /me/privacy                               member   field visibility + share-on-connection
POST   /me/profile/photo                         member
GET    /startups/suggest?name=                   auth

SEARCH
GET    /search?q&type=people|posts|events&page   member   grouped results with counts

POSTS
GET    /posts?category&tag&status&feed=relevant|recent&page   member
POST   /posts                                    member
GET    /posts/:id                                member
PATCH  /posts/:id                                member   own, within 24h
DELETE /posts/:id                                member   own, soft delete
GET    /posts/:id/responses                      member
POST   /posts/:id/responses                      member
PATCH  /posts/:id/responses/:rid  DELETE         member   own
POST   /posts/:id/resolve                        member   { acceptedResponseId? }
POST   /reports                                  member   { targetType, targetId, reasonCategory, reasonDetail? }

ACHIEVEMENTS
GET    /achievements/active                      member   approved and < 24h old
GET    /achievements/mine                        member
POST   /achievements                             member   multipart: text + optional image

ANNOUNCEMENTS
GET    /announcements/active                     member   announcements targeted at the viewer's role

MENTORS & CONNECTIONS
GET    /mentors?expertise&sector&location&page   member
POST   /connections                              member   { recipientId, message }
GET    /connections?box=incoming|outgoing|active member
POST   /connections/:id/accept | /decline | /cancel   member
GET    /blocks    POST /blocks    DELETE /blocks/:userId   member

EVENTS & CALENDAR
GET    /events?status&page                       member
GET    /events/:id                               member   meetingLink only if registered
POST   /events/:id/register                      member   { responses }
DELETE /events/:id/register                      member
GET    /events/:id/ics                           member
GET    /me/calendar?from&to                      member   registered events + own tasks

TASKS
GET    /tasks?status&kind&from&to    POST /tasks member   kind = task | deadline
PATCH  /tasks/:id    DELETE /tasks/:id           member

NOTIFICATIONS
GET    /notifications?page   GET /notifications/unread-count   member
POST   /notifications/:id/read   POST /notifications/read-all  member
GET    /me/notification-preferences   PUT same   member
POST   /me/push-subscription                     member

SUPPORT, PRIVACY, ANALYTICS, FILES
POST   /support/contact                          auth     { category, subject, message } -> { caseId }
POST   /me/consents                              member   re-accept updated documents
POST   /me/data-export    GET /me/data-export/:id   member
POST   /me/delete-account                        member
POST   /analytics/events                         member   { name, props } fire-and-forget; no free text or PII
GET    /files/:signedToken                       auth     private file via signed URL

ADMIN (prefix /admin)
GET    /admin/overview
GET    /admin/applications?status&page    GET /admin/applications/:id   list items carry `expedited`
POST   /admin/applications/:id/claim             also the heartbeat; call every 60 s while reviewing
POST   /admin/applications/:id/release
POST   /admin/applications/:id/decision          { decision: approve|reject|request_info, reason, rubric }
POST   /admin/applications/:id/messages          { body, isInternalNote }
GET    /admin/members?q&role&status&page    GET /admin/members/:id
PATCH  /admin/members/:id/role                   super
POST   /admin/members/:id/restrictions           { type, reason, expiresAt? }   blacklist/revocation = super
POST   /admin/restrictions/:id/resolve
PATCH  /admin/members/:id/mentor-verification
GET    /admin/profile-changes    POST /admin/profile-changes/:id/decision
GET    /admin/reports    POST /admin/reports/:id/resolve     { outcome: resolved|dismissed, notes }
POST   /admin/posts/:id/hide | /restore         { reason }
POST   /admin/responses/:id/hide | /restore     { reason }
GET    /admin/achievements?status    POST /admin/achievements/:id/decision   { decision: approve|reject|remove, reason }
GET    /admin/events    POST /admin/events    PATCH /admin/events/:id
POST   /admin/events/:id/publish | /cancel | /archive
PUT    /admin/events/:id/form
PUT    /admin/events/:id/invitees                { userIds }   invite-only events
GET    /admin/events/:id/registrations
POST   /admin/events/:id/registrations/:regId/check-in
GET    /admin/events/:id/export.csv
GET    /admin/announcements    POST /admin/announcements
POST   /admin/taxonomy/tags    PATCH /admin/taxonomy/tags/:id    POST /admin/taxonomy/tags/:id/merge   merge = super
POST   /admin/invites/import (multipart CSV)    GET /admin/invites    POST /admin/invites/:id/resend
GET    /admin/startups    POST /admin/startups/merge
GET    /admin/analytics                          moderator = limited, super = full
GET    /admin/audit-log                          super
GET    /admin/legal    POST /admin/legal         super   publish a new document version (triggers re-accept)
GET    /admin/settings    PUT /admin/settings    super
GET    /admin/admins    POST /admin/admins    PATCH /admin/admins/:id    super   create or promote; sends a set-password link
POST   /admin/setup                              public, one-time bootstrap; only while no admin exists; needs setup token
```
<!-- API-CONTRACT-END -->

If the frontend repo contains `lib/api/CONTRACT_CHANGES.md`, reconcile it: implement requested additions, then fold them into this contract and tell me what changed.

---

## 12. Connecting to the frontend

- Frontend dev: `http://localhost:3000`, proxying `/api/*` → `http://localhost:4000` (Next.js rewrites). Cookies are therefore first-party and the browser never needs CORS. Still configure a strict CORS allow-list for direct calls and tools.
- **WebSockets are not proxied by Next.js rewrites.** In development the client connects straight to `http://localhost:4000` (cookies are shared across ports on localhost, and the CORS and `WS_ALLOWED_ORIGINS` allow-lists must include the frontend origin with credentials). In production a reverse proxy (Nginx or Caddy) must forward both `/api/` and `/socket.io/` (with the `Upgrade` and `Connection` headers) to the API on the same origin.
- Provide a `docker-compose.yml` for a **local** MySQL 8 (used by tests and by anyone without access to the remote DB), but default `DATABASE_URL` to the provided remote DB.
- Run `pnpm prisma generate`, apply the schema to the dev DB non-destructively, run `pnpm seed`, `pnpm start:dev`.
- Smoke test the integration end-to-end and report results: (1) `GET /api/v1/health`; (2) Google login round trip → `/auth/me`; (3) email register → verify (console mail) → pending application → admin bootstrap via `/admin/setup` → MFA → claim → approve → the waiting applicant's open socket receives `account.status_changed`, `/auth/me` shows `showUnlockAnimation=true` once, and `POST /me/unlock-seen` clears it; (4) invite import → accept (no animation); (5) upload a profile photo and download it through `/files/:signedToken` against MinIO or S3.

---

## 13. Order of work

1. Safety check of the remote DB (§2), project scaffold, env validation, Prisma schema + migration, seed.
2. Common layer (envelope, errors, guards, CSRF, rate limits), mail, jobs, audit.
3. Auth (password, sessions, verification, Google sign-in and sign-up, MFA), legal/consent, admin bootstrap, S3 storage and uploads, realtime gateway (handshake and rooms).
4. Applications + admin review (claim/lock), the approval flow with the unlock flag and realtime events, members/restrictions, invites/migration.
5. Profiles/privacy/startups/taxonomy, search.
6. Posts/reports/achievements, connections/blocks, notifications/push.
7. Events/waitlist/CSV/ics, tasks/calendar, support, privacy export/deletion, analytics, retention jobs.
8. Tests, Swagger, README, `docs/INCIDENT_RESPONSE.md`, final smoke test.

Ask me before: any destructive DB action, changing the contract, or skipping a P0 requirement. If a P0 must be deferred, list it with the reason instead of dropping it silently.

---

## 14. Definition of done

- [ ] Every endpoint in §11 is implemented, validated, authorized by default-deny guards, and documented in Swagger.
- [ ] Google login works end-to-end and respects account states. Admin access needs password/Google **and** TOTP.
- [ ] Private fields, internal notes, other users' tasks and meeting links never leak (covered by tests).
- [ ] Rate limits, claim locking, event capacity race, achievement 24h expiry, connection expiry/cooldown and CSV injection protection are tested.
- [ ] Audit log records all required actions and cannot be modified or deleted through the app (and by trigger where permitted).
- [ ] Jobs are idempotent and retried. Emails queue when the provider is down.
- [ ] Phone OTP, uploads, sessions, restrictions, announcements and analytics endpoints exist exactly as in the contract, and `/health` is public.
- [ ] No raw SQL uses `NOW()` or `CURRENT_TIMESTAMP`. Full-text queries are parameterized and operator-sanitized.
- [ ] A new user (email or Google) can register, fill in all details and land on the locked dashboard; a pending user gets `403 ACCOUNT_STATE` on every member endpoint; approval flips the account, emits the realtime event and sets `showUnlockAnimation` once.
- [ ] The WebSocket handshake enforces the session cookie and the Origin allow-list, rooms are authorized server-side, and events carry no private content.
- [ ] Uploads and downloads go through S3 with a private bucket, magic-byte checks, short-lived signed URLs and cleanup jobs (verified against MinIO).
- [ ] No secrets in code, logs or git. `.env.example` is complete. README covers setup, env, DB safety, Google redirect URIs, and the first-admin bootstrap.

---

## 15. Decisions I still owe you (do not block on these)

Use the stated default, flag it in the README, and ask me:
- SMTP provider and the `MAIL_FROM` domain (SPF/DKIM/DMARC). Default: console transport.
- SMS provider for phone OTP. Default: console driver.
- DPDP Act review, final privacy notice and content policy. These are **launch blockers** (PRD §21.2); ship clearly marked placeholder text.
- The grievance and oversight email addresses.
- The domain, and whether the product is shown as "OASIS" or "OASIS ONE" in the UI and emails. The logo and palette are supplied; a vector (SVG) master and a navy-on-ivory logo variant are still wanted.
- Assumptions I added where the PRD is silent: how invite-only events pick invitees, the `deactivated` account status, and admin-only accounts with a null role.
- S3 bucket name, region and credentials, and whether it is AWS S3 or an S3-compatible provider. Default: local driver in development.
- Registration returns `409` for an existing email so people can go straight to the dashboard. The stricter alternative is verify-first (generic response, session only after the emailed link is clicked).
- Rejected applicants see the application status page with a Reapply action rather than the locked dashboard.
