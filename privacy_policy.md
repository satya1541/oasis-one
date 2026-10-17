# OASIS ONE — Privacy Notice & Data Protection Policy

**Document Type:** `privacy_notice`  
**Version:** 1.0 (Aligned with OASIS ONE PRD v1.2)  
**Effective Date:** 16 October 2026  
**Data Fiduciary:** OASIS  
**Registered Address:** Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018  
**Contact Phone:** +91-904-01-98-628  
**Grievance & Data Protection Email:** Info@oasisodisha.in  

## 1. Data Fiduciary Identity and Statutory Compliance

### 1.1 Identity of the Data Fiduciary
**OASIS**, headquartered at Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018 ("OASIS," "we," "us," or "our"), operates the **OASIS ONE** entrepreneur community portal ("Platform") and acts as the **Data Fiduciary** in respect of all digital personal data collected and processed through the Platform.

### 1.2 Applicable Indian Data Protection Framework
This Privacy Notice is drafted and published in accordance with:
1. The **Digital Personal Data Protection Act, 2023 (DPDP Act)** of the Republic of India;
2. The **Information Technology Act, 2000**, and the *Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011*; and
3. The *Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021*.

### 1.3 Core Privacy Principles
OASIS ONE is built on three foundational privacy commitments:
- **Data Minimization:** We collect only the fields strictly required to verify community membership, enable role-based discovery, run community events, and maintain security.
- **Private by Default:** Your personal phone number and email address are set to **Private** upon account creation and are never exposed to other members without your explicit configuration or connection consent.
- **Accountable Administration:** Pending applicants cannot access any member data, your personal planner tasks cannot be read by administrators, and every administrative view of private profile data is recorded in an immutable, append-only audit log.

## 2. Categories of Personal Data We Collect

We collect personal data that you voluntarily provide during registration, profile editing, community participation, and support interactions, as well as limited technical telemetry necessary to secure the Platform.

| Data Category | Specific Fields Collected | Required vs. Optional | Default Visibility & Access Scope |
| :--- | :--- | :--- | :--- |
| **1. Common Identity & Account Data** | Full name, email address (unique identifier), password hash (`Argon2id`/`bcrypt`) or Google OAuth identity (`AuthIdentity`: `provider`, `providerUserId`), age confirmation checkbox (18+), configured time zone (`timeZone`). | **Required** for all applicants and members. | **Full Name & Role:** Visible to approved members.<br>**Email Address:** **Private by default** (configurable in Settings). |
| **2. Common Contact & Profile Data** | Phone number (verified via SMS OTP), City and State/Country, profile photo (JPEG/PNG ≤ 2 MB), short introduction/bio (≤ 500 chars), areas of interest (taxonomy tags + optional free text ≤ 200 chars), LinkedIn or website URL (`https://`). | **City/State, Bio, Interests:** Required.<br>**Phone, Photo, LinkedIn/Website:** Optional. | **Phone Number:** **Private by default**.<br>**City/State, Bio, Interests, Photo, LinkedIn:** Visible to approved members (user-configurable). |
| **3. Aspiring Entrepreneur Fields** | Business idea or area of interest (≤ 500 chars, optional), preferred sectors/industries, skills and experience (≤ 1,000 chars), current stage (`Exploring`, `Idea Validation`, `Planning`, `Pre-MVP`), guidance needed/challenges (≤ 1,000 chars), collaboration interests (≤ 500 chars, optional). | **Sectors, Skills, Stage, Guidance Needed:** Required for `aspiring_entrepreneur`.<br>**Idea, Collaboration:** Optional. | Visible to approved members according to your field-level privacy settings. |
| **4. Startup Founder / Co-Founder Fields** | Startup/Company name (≤ 100 chars, linked to `Startup`), role in startup (`CEO`, `CTO`, `COO`, `Co-Founder`, or custom ≤ 50 chars), industry/sector, startup stage (`Ideation`, `MVP`, `Launched`, `Early Revenue`, `Growth/Scaling`), product/service summary (≤ 1,000 chars), company website (`https://`, optional), startup location, support needed, expertise/support offered (≤ 500 chars, optional). | **All fields Required** for `founder` except Website and Expertise Offered (Optional). | Visible to approved members according to your field-level privacy settings. Co-founders link to a shared `Startup` record. |
| **5. Mentor / Advisor Fields** | Current role & organization (≤ 100 chars, optional), years of experience (`1–3`, `3–5`, `5–10`, `10–15`, `15+`), areas of expertise, industries/sectors supported, mentoring topics & preferred stages, availability & contact approach (≤ 500 chars), availability status (`active`/`paused`), max concurrent mentees (optional), LinkedIn URL (optional), verification evidence/references (PDF/JPEG/PNG ≤ 10 MB or text, optional). | **Experience, Expertise, Sectors, Topics, Availability Approach:** Required for `mentor`.<br>**Current Role, LinkedIn, Verification Evidence:** Optional. | Profile fields visible to approved members.<br>**Verification Evidence:** **Strictly Private** (accessible only to reviewing admins via short-lived signed URLs). |
| **6. Application & Migration Records** | `Application` snapshot, UUID reference ID, `status`, `ApplicationMessage` thread & attachments (≤ 10 MB), `InviteLink` pre-approved email/name/role, `ProfileChangeRequest` records for flagged edits. | Generated during onboarding, migration, or flagged profile edits. | Accessible only to the applicant/member and authorized reviewing administrators. Internal admin notes (`isInternalNote`) are never shown to applicants. |
| **7. Community Content & Connections** | Questions & Suggestions (`title` ≤ 200 chars, `body` ≤ 10,000 chars, `original_body` on edit), Responses (≤ 5,000 chars), Achievements (≤ 500 chars + image ≤ 5 MB), `ConnectionRequest` messages, `MemberBlock` records, `ContentReport` filings, `GrievanceCase` submissions. | Created voluntarily when participating on the Platform. | Published posts/responses/approved achievements are visible to approved members. Connection messages are private to sender/recipient. Blocks, reports, and grievances are confidential. |
| **8. Events & Personal Planner Data** | `EventRegistration` custom form responses, waitlist position, check-in timestamp (`checked_in_at`). Personal `Task` and `deadline` items (`title` ≤ 200 chars, `notes` ≤ 2,000 chars, `due_at`, `priority`, `status`, `reminder_at`). | Created when registering for events or adding personal tasks. | **Event Registrations:** Visible to the registrant and authorized event admins.<br>**Personal Planner Tasks:** **Strictly Private to Owner** (never accessible to other members or admins). |
| **9. Consent, Security & Analytics Logs** | `ConsentRecord` (document type, version, timestamp, IP), `Session` (SHA-256 token hash), `AuditLog` (actor, action, target, reason, IP, timestamp), `SearchLog` (anonymized query text + zero-result flag, **no user ID**), `AnalyticsEvent` (`search_result_open`, `event_view`, `profile_view`, `connect_click` — **no free text or PII**), `PushSubscription` (Web Push endpoint/keys). | Collected automatically for security, consent proof, and aggregate analytics. | Restricted to system security, automated background jobs, and Super Admin audit inspection. |

## 3. Purposes of Processing and Lawful Basis

Under Sections 4, 6, and 7 of the **Digital Personal Data Protection Act, 2023**, we process your personal data based on your **free, specific, informed, unconditional, and unambiguous Consent** (recorded in `ConsentRecord`) and for **legitimate safety and governance uses**:

1. **Identity Verification & Membership Vetting:** Verifying your email address and optional phone number (via OTP), checking against hashed `BlacklistIdentifier` records to prevent repeat abuse, and reviewing your application against the OASIS 6-Point Approval Rubric.
2. **Role-Aware Directory & Search:** Allowing approved, authenticated members to discover peers, co-founders, and mentors by name, role, startup sector, expertise tags, and city/location (`GET /profiles`, `GET /mentors`, `GET /search`).
3. **Community Knowledge Sharing & Milestone Celebration:** Publishing your questions, suggestions, responses, and moderator-approved 24-hour achievement banners to the member community.
4. **Facilitating Consent-Based Mentor Connections:** Delivering guidance requests to active mentors and disclosing **only** the contact details each party has designated as `shareOnConnection` upon mutual acceptance (`POST /connections/:id/accept`).
5. **Event Management & Waitlist Automation:** Processing event registrations, dynamically promoting waitlisted members when seats open, displaying online meeting links exclusively to registered attendees, and managing event check-ins.
6. **Personal Task Planning & Notifications:** Storing your private tasks and funding deadlines, rendering them in your time zone on your OASIS Calendar, and dispatching essential and preference-controlled notifications via in-app alerts, email, and Web Push.
7. **Platform Security, Moderation & Regulatory Compliance:** Enforcing rate limits, detecting automated scraping, scanning uploaded files for malware, investigating content reports and grievances, and maintaining an immutable 3-year `AuditLog`.

## 4. Granular Privacy Controls and Confidentiality Safeguards

### 4.1 Field-Level Visibility Controls (`PATCH /me/privacy`)
You have complete control over how other approved members view your profile:
- In **Settings → Privacy**, you can toggle the visibility of individual contact and profile fields and inspect a live **"How others see you"** preview.
- You can independently configure which contact fields (such as email address or verified phone number) are shared when a mentor connection request is accepted (`shareOnConnection`).
- If your account is revoked or deleted, any contact details previously shared through accepted connection requests are **immediately revoked** on the Platform (connected members see *"contact info no longer available"*).

### 4.2 Private Member Blocking (`POST /blocks`)
When you block another member, the Platform immediately hides your full profile from that user (and theirs from you), excludes both accounts from each other's search results, and blocks connection requests between you, without notifying the blocked user.

### 4.3 Strict Isolation of Unapproved Applicants
Until an administrator approves an application, the applicant's account remains locked (`pending_verification` or `pending_approval`). Locked accounts are blocked at the API guard layer (`403 ACCOUNT_STATE`) from querying any member profile, directory, search, post, mentor, or event endpoint.

### 4.4 Privacy of Personal Planner Tasks
Your personal tasks and tracked deadlines (`Task` entity) are strictly isolated to your `owner_id`. No API endpoint allows another member, Moderator, or Super Admin to read the titles or notes of your personal tasks. Administrator analytics (`GET /admin/analytics`) compute only aggregate, de-identified task creation and completion counts.

### 4.5 Mandatory Audit Logging of Administrative Access (`ADM-05`)
While Moderators and Super Admins may access private profile fields or verification evidence when necessary to review an application, investigate a report, or export an event attendee list (`GET /admin/events/:id/export.csv`), every such access or export automatically writes a permanent, non-editable record to the `AuditLog` capturing the administrator's identity, the target user, the action, the reason, the IP address, and the UTC timestamp.

## 5. Data Security and Technical Safeguards

In accordance with Section 8(5) of the DPDP Act, 2023, OASIS implements rigorous technical and organizational security measures:
1. **Cryptographic Protection:**
   - All network communication is encrypted via **TLS (HTTPS and WSS)**.
   - User passwords are hashed using **Argon2id** (or bcrypt with cost factor ≥ 12).
   - Administrator TOTP MFA secrets are encrypted at rest using **AES-256** (`FIELD_ENCRYPTION_KEY`).
   - Session tokens, verification tokens, password reset tokens, phone OTPs, and pre-approved migration invite tokens are stored **exclusively as cryptographic hashes** in the database.
2. **Cookie & Request Security:**
   - Authentication uses an HttpOnly, Secure (in production), `SameSite=Lax` cookie (`oasis_sid`). Zero authentication tokens are ever stored in browser `localStorage` or exposed in URL query strings.
   - All state-changing HTTP requests require a valid double-submit CSRF header (`X-CSRF-Token`) and pass strict `Origin`/`Referer` allow-list validation.
   - WebSocket handshakes (`/ws`) validate both the `oasis_sid` session cookie and the `Origin` header against `WS_ALLOWED_ORIGINS` to prevent Cross-Site WebSocket Hijacking, and real-time events transmit only entity IDs and state signals—never private content payloads.
3. **Private Object Storage & Malware Scanning:**
   - All file uploads (`profile_photo` ≤ 2 MB, `achievement` image ≤ 5 MB, `application_attachment` / `verification_evidence` ≤ 10 MB) are validated against both declared MIME types and file magic bytes, and scanned for malware using **ClamAV**.
   - Files are stored in a **private S3-compatible bucket** with public access blocked, ACLs disabled, and server-side encryption (`AES256` or AWS KMS) enabled.
   - Original filenames are stripped in favor of randomized UUID storage keys (`uploads/{purpose}/{userId}/{uuid}.{ext}`). Files are served exclusively through short-lived, per-user signed tokens (`GET /files/:signedToken`, defaulting to a 120-second presigned TTL with `Cache-Control: private, no-store`).
4. **Database & Backup Resilience:**
   - Production data is stored in MySQL 8 (`utf8mb4`) with parameterized queries and sanitized full-text search inputs to prevent SQL injection.
   - Automated daily full backups and hourly incremental backups are maintained with a Recovery Point Objective (**RPO**) of **1 hour** and a Recovery Time Objective (**RTO**) of **4 hours**.

## 6. Data Retention and Automated Purge Schedule

We retain personal data only for the periods strictly necessary for the purposes described in this Notice, enforced by automated background jobs (`retention_purge`, `orphan_file_cleanup`, `inactive_warning`, `inactive_deactivate`, `account_deletion`):

| Data Type | Retention Period | Disposition / Purge Mechanism |
| :--- | :--- | :--- |
| **Active Member Account & Profile** | Duration of active membership + **30 days** following a deletion request | Deactivated and hidden from search immediately upon deletion request; profile, tasks, preferences, and S3 files permanently purged within 30 days. |
| **Authored Community Posts & Responses** | Duration of platform operation (Anonymized on account deletion) | Upon account deletion or revocation, authorship is anonymized to **"Former Member"** so community Q&A threads remain coherent (unless full content deletion is specifically requested via the Grievance Officer). |
| **Rejected Membership Applications** | **90 days** after the rejection timestamp | Permanently deleted from the database along with all associated S3 attachment objects (`retention_purge` job). |
| **Unattached / Orphaned File Uploads** | **24 hours** from upload timestamp | Pending uploads not attached to a profile, application, or achievement within 24 hours are automatically purged (`orphan_file_cleanup` job). |
| **Personal Data Export Files (`exports/`)** | **7 days** from export generation | Downloadable JSON export files expire and are automatically deleted from S3 after 7 days. |
| **Content Moderation Reports (`ContentReport`)** | **1 year** after report resolution (`resolved_at`) | Retained for moderation pattern analysis, then permanently purged (`retention_purge` job). |
| **Administrative Audit Logs (`AuditLog`)** | **3 years** from event timestamp | Retained in append-only storage for security and regulatory compliance; actor IDs of deleted accounts are anonymized. |
| **Blacklist Identifiers (`BlacklistIdentifier`)** | Duration of blacklist + appeal window | Only non-reversible cryptographic hashes (`SHA-256`) of verified email and verified phone are retained for community safety, then purged per policy. |
| **Inactive Member Accounts (No Login)** | **12 months** (Warning) / **15 months** (Deactivation) | Automated warning email sent at 12 months of inactivity; if no login occurs by 15 months, `account_status` is set to `deactivated` (reactivable via Support). |

## 7. Your Rights as a Data Principal under the DPDP Act, 2023

As a Data Principal under the Digital Personal Data Protection Act, 2023, you may exercise the following rights free of charge through your **Settings** panel or by contacting our Grievance Officer:

### 7.1 Right to Access Information and Data Portability (`POST /me/data-export`)
You have the right to obtain a summary and machine-readable copy of all personal data we process about you, along with a record of your consents.
- Navigate to **Settings → Data & Account → Request Data Export** (`POST /me/data-export`).
- Our background worker (`data_export_build`) compiles a complete **JSON archive** containing your profile, privacy settings, authored posts, responses, achievements, personal planner tasks, event registrations, connection history, and notification preferences within **48 hours**.
- Once ready, you receive a notification to download the archive via a single-use, short-lived signed link (`GET /me/data-export/:id`).

### 7.2 Right to Correction, Completion, and Updating (`PATCH /me/profile`)
You have the right to correct inaccurate or misleading personal data, complete incomplete data, and update your profile, email address, verified phone number, time zone, and visibility preferences at any time via **Settings → Profile** and **Settings → Security**. (Edits to role, full name, startup name, expertise areas, or mentor verification evidence undergo moderator verification via `ProfileChangeRequest` before replacing your public values.)

### 7.3 Right to Erasure / Account Deletion (`POST /me/delete-account`)
You have the right to request erasure of your personal data and permanent closure of your account via **Settings → Data & Account → Delete Account**:
1. **Immediate Deactivation:** Your account is immediately deactivated, active sessions are terminated, and your profile is removed from all search and directory results.
2. **30-Day Complete Purge:** Within **30 days**, our `account_deletion` job permanently deletes your profile, personal tasks, notification preferences, connection records, and all S3 files you uploaded.
3. **Immediate Revocation of Shared Contacts & Registrations:** Any contact information previously shared with mentors/mentees via accepted connections is immediately revoked, and any upcoming event registrations are cancelled.
4. **Thread Anonymization:** Your community posts and responses are re-attributed to **"Former Member"** so other members' replies are preserved. If you require complete erasure of specific posts you authored, please include that request in a message to the Grievance Officer (`Info@oasisodisha.in`), and we will remove them unless retention is mandated by law.

### 7.4 Right to Withdraw Consent
Where our processing is based on your consent, you may withdraw your consent at any time with the same ease with which it was given—either by adjusting granular toggles in **Settings → Privacy** and **Settings → Notifications**, or by deleting your account. Withdrawal of consent does not affect the lawfulness of processing conducted prior to withdrawal.

### 7.5 Right to Nominate (Section 14, DPDP Act 2023)
You have the right to nominate any other individual who shall, in the event of your death or incapacity, exercise your rights as a Data Principal under this Privacy Notice and the DPDP Act, 2023. To register or update a nominee, please send a signed request from your registered email address to `Info@oasisodisha.in` with the subject line `"DPDP Act Nomination Registration"`.

### 7.6 Right to Grievance Redressal (Section 13, DPDP Act 2023)
You have the right to readily available grievance redressal provided by OASIS in respect of any act or omission regarding the performance of our obligations in relation to your personal data or the exercise of your rights. If you are unsatisfied with the resolution provided by our Grievance Officer, or if your grievance is not resolved within the statutory timeline, you have the right to approach the **Data Protection Board of India**.

## 8. Cookies, Local Browser Storage, and Third-Party Sub-Processors

### 8.1 Strictly Necessary First-Party Cookies Only
OASIS ONE does **not** use third-party advertising trackers, behavioral profiling pixels, or cross-site tracking cookies. We use only strictly necessary first-party cookies and storage:
1. **`oasis_sid` (HttpOnly Session Cookie):** Authenticates your active session (`SameSite=Lax`, `Secure` in production, 24h sliding / 7d max expiry).
2. **`CSRF` Cookie:** A readable double-submit token sent back in the `X-CSRF-Token` header on state-changing requests to prevent Cross-Site Request Forgery.
3. **`OAuth State & PKCE` Cookie:** A short-lived, signed HttpOnly cookie created during `/api/v1/auth/google` and cleared upon callback completion.
4. **`sessionStorage` (Onboarding Drafts Only):** Non-sensitive fields entered in the multi-step registration wizard (`/join`) are temporarily held in your browser's `sessionStorage` so you do not lose progress between steps, and are cleared upon submission or tab closure.
5. **Theme Preference (`next-themes`):** Stores your choice of Light (`#FBF7EE` Ivory) or Dark (`#1E1F33` Brand Navy) UI theme.

### 8.2 Categories of Third-Party Sub-Processors
We never sell, rent, or trade your personal data. We share data solely with vetted infrastructure sub-processors strictly as needed to operate the Platform:
- **Cloud Hosting & Managed Database Provider:** Hosts the MySQL 8 database and application servers (with TLS and firewall restrictions).
- **Private Object Storage Provider:** AWS S3 (e.g., `ap-south-1` Mumbai region) or S3-compatible storage for encrypted file storage.
- **Transactional Email Provider (SMTP):** Delivers verification links, application updates, event reminders, and security alerts (with SPF, DKIM, and DMARC authentication).
- **SMS Gateway Provider:** Delivers 10-minute verification OTPs to members who opt to verify their phone number.
- **Google LLC (Optional):** Processes OAuth 2.0 authentication (`openid`, `email`, `profile` scopes) only when you explicitly choose *"Continue with Google"*.
- **Error & Uptime Monitoring (Sentry):** Captures sanitized application stack traces and performance metrics without logging passwords, tokens, or private message bodies.

## 9. Personal Data Breach Notification

OASIS maintains a formal **Data Breach & Incident Response Plan** (`docs/INCIDENT_RESPONSE.md`). In the event of a confirmed personal data breach affecting your data:
1. We will notify affected users via email and in-app notice within **72 hours** of confirmation, detailing the nature of the breach, the categories of personal data affected, the mitigation steps taken, and recommended actions you can take to protect yourself.
2. We will notify the **Data Protection Board of India** and **CERT-In** within statutory timelines as required under the DPDP Act, 2023 and the Information Technology Rules.

## 10. Designated Grievance & Data Protection Officer

For any questions regarding this Privacy Notice, to exercise your Data Principal rights, or to file a privacy grievance, please use the in-app **Contact OASIS** form (`/contact`) or reach our Grievance Officer directly:

- **Designation:** Grievance & Data Protection Officer — OASIS ONE
- **Organization:** OASIS (Odisha Startup Community)
- **Address:** Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018
- **Email:** Info@oasisodisha.in
- **Phone:** +91-904-01-98-628
- **Response SLA:** Automated Case ID (`OASIS-GRV-YYYY-XXXX`) issued immediately upon in-app submission (or acknowledgement within 24 hours via email); full resolution within **15 days** of receipt.
