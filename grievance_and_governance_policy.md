# OASIS ONE — Grievance Redressal, Support, Appeals & Admin Governance Policy

**Document Version:** 1.0 (Aligned with OASIS ONE PRD v1.2 — §7.8, §10, §20 & Appendix C)  
**Effective Date:** 16 October 2026  
**Platform Operator:** OASIS  
**Registered Address:** Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018  
**Contact Phone:** +91-904-01-98-628  
**Support & Grievance Email:** Info@oasisodisha.in  

## 1. Purpose and Statutory Mandate

This Grievance Redressal, Support, Appeals & Admin Governance Policy establishes the formal procedures by which applicants and members of **OASIS ONE** can seek support, report grievances, appeal moderation or membership decisions, and escalate concerns regarding administrative conduct. It also codifies the mandatory internal governance and conflict-of-interest controls enforced upon OASIS Moderators and Super Admins under PRD v1.2 (§7.8, §10, §20) and Indian law (Rule 3(2) of the *Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021* and Section 13 of the *Digital Personal Data Protection Act, 2023*).

## 2. Designated Grievance Officer & Official Contact Channel

All formal grievances, statutory notices, data protection requests, and escalation appeals are overseen by the Designated Grievance Officer of OASIS:

- **Designation:** Grievance Officer — OASIS Administration
- **Organization:** OASIS (Odisha Startup Community — OASIS ONE)
- **Office Address:** Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018
- **Official Email:** Info@oasisodisha.in
- **Telephone:** +91-904-01-98-628

## 3. How to Submit a Support Inquiry or Grievance (`GRV-01` & `GRV-02`)

### 3.1 Universal Access Across All Account States
The **Contact OASIS** channel (`/contact`) is accessible from every authenticated page on the Platform—including to pending applicants on the **Locked Dashboard** (`pending_verification` / `pending_approval`) and to restricted members on the **Suspended Account** screen (`/suspended`)—as well as via public footer links.

### 3.2 Dual Submission Methods (Desktop & Mobile Fallback)
1. **In-App Support & Grievance Form (`POST /support/contact`):**
   - Available on both mobile and desktop browsers (ensuring reliable submission where mobile `mailto:` links may fail).
   - Accepts `{ category, subject, message }` (rate-limited to 5 submissions per hour per user to prevent abuse).
   - **Automated Case ID (`OASIS-GRV-YYYY-XXXX`):** Upon submission, the system creates a confidential `GrievanceCase` record assigned a unique per-year sequential tracking ID (e.g., `OASIS-GRV-2026-0001`), displays the Case ID immediately on screen, and sends an automated confirmation email to the submitter.
2. **Direct Email (`mailto:Info@oasisodisha.in`):**
   - Opens your default email client pre-addressed to `Info@oasisodisha.in` with a suggested subject prefix.

### 3.3 Independent Oversight Routing for Admin Misconduct (`GRV-02`)
To ensure that members can safely report abuse of authority, bias, or misconduct by an OASIS Moderator or Administrator without fear of retaliation:
- Selecting the **Admin Misconduct (`category = admin_misconduct`)** option in the Contact OASIS form automatically routes the `GrievanceCase` alert to a separate, restricted **Oversight Email Address (`OVERSIGHT_EMAIL`)** controlled by senior OASIS governance rather than the standard support inbox (`GRIEVANCE_EMAIL`).
- Grievance submissions are strictly confidential and are **never** exposed in public feeds or standard moderator queues.

### 3.4 Service Level Timelines (SLAs)
| Stage | Statutory & Platform SLA Target | Details |
| :--- | :--- | :--- |
| **1. Acknowledgement** | **Immediate** (In-App Form) / **≤ 24 Hours** (Direct Email) | Submitter receives an automated confirmation email containing the unique `OASIS-GRV-YYYY-XXXX` tracking reference. |
| **2. Urgent Safety / Doxxing / Breach Triage** | **≤ 72 Hours** | Reports involving severe harassment, non-consensual disclosure of private contact data, or personal data breaches are triaged and acted upon within 72 hours. |
| **3. Standard Grievance & Appeal Resolution** | **≤ 15 Days** | Final written resolution provided via email within 15 days of receipt, in compliance with the Indian IT Rules, 2021 and DPDP Act, 2023. |

## 4. Appeals Framework for Applicants and Members

Members and applicants may request a formal review of administrative decisions across four categories:

1. **Application Rejection Appeals (`AUTH-13`):**
   - Standard rejected applications are subject to a **30-day cooling-off period** (`canReapplyAt`) before reapplication is enabled on `/application`.
   - If you believe your application was rejected due to a verifiable misunderstanding or if you have new institutional verification evidence prior to the 30-day date, you may submit a review inquiry via **Contact OASIS** referencing your UUID Application Reference ID.
2. **Content Moderation Appeals (`POST-04`, `ACH-02`):**
   - When a post, response, or achievement is hidden or rejected, you receive a notification with the moderation reason. You may appeal within **15 days** by citing the post title/date and explaining how it complies with the Community Guidelines.
3. **Account Restriction Appeals (`ADM-03`, PRD §10.2):**
   - Members who receive a **Warning**, **Temporary Suspension**, **Account Revocation**, or **Blacklist** may view their active restriction details and appeal instructions via `/me/restrictions` (or the restriction email notice) and submit an appeal within **15 days**.
4. **Inactivity Deactivation Reactivation (`PRD §14.2`):**
   - Accounts automatically set to `deactivated` after **15 consecutive months** of no login activity are not disciplinary restrictions. Deactivated members may request prompt account reactivation at any time by contacting `Info@oasisodisha.in`.

## 5. Administrative Safeguards and Internal Governance (PRD §20 & Appendix C)

To guarantee that OASIS ONE is administered with integrity, security, and accountability, the Platform enforces the following mandatory controls in application code and database constraints:

### 5.1 Two-Tier Administrative Role Hierarchy (`ADM-07`)
Administrator privileges are strictly separated into two levels (`adminLevel`):

| Administrative Capability | Moderator (`moderator`) | Super Admin (`super_admin`) |
| :--- | :--- | :--- |
| **Application Review (`claim`, `approve`, `reject`, `request_info`)** | Permitted (Audited) | Permitted + Can override another admin's claim (Audited) |
| **Content Moderation (Posts, Responses, Achievements, Reports)** | Permitted (Audited) | Permitted (Audited) |
| **Events, Custom Registration Forms & Announcements** | Create, Edit, Publish, Cancel, Export CSV (Audited) | Create, Edit, Publish, Cancel, Delete, Export CSV (Audited) |
| **Tag & Taxonomy Management** | Read, Create, Rename, Retire | Read, Create, Rename, Retire, **Merge Tags** |
| **Member Restrictions: Warning & Temporary Suspension** | Permitted (Reason ≥ 10 chars, Audited) | Permitted (Reason ≥ 10 chars, Audited) |
| **Member Restrictions: Revocation & Permanent Blacklist** | **Prohibited (`403 FORBIDDEN`)** | **Super Admin Only** (Reason ≥ 10 chars, Audited) |
| **Member Primary Role Changes (`PATCH /admin/members/:id/role`)** | **Prohibited (`403 FORBIDDEN`)** | **Super Admin Only** (Audited) |
| **Admin Account Creation, Promotion & Deactivation** | **Prohibited (`403 FORBIDDEN`)** | **Super Admin Only** (Cannot deactivate last Super Admin) |
| **Publishing New Legal Document Versions (`POST /admin/legal`)** | **Prohibited (`403 FORBIDDEN`)** | **Super Admin Only** (Triggers global member re-acceptance) |
| **Platform Settings & Audit Log Inspection (`/admin/audit-log`)** | **Prohibited (`403 FORBIDDEN`)** | **Super Admin Only** (Read-only Audit Log) |
| **Community Analytics (`/admin/analytics`)** | Limited Operational View | Full Cohort & Funnel View (Planner data aggregate only) |

### 5.2 Controlled Admin Bootstrap and Offboarding (`PRD §20.1` & `§20.2`)
1. **First-Admin Bootstrap (`POST /admin/setup`):** The initial Super Admin account can only be created when **zero** admin accounts exist in the database and requires the one-time environment secret `ADMIN_SETUP_TOKEN`, strong password setup, and immediate TOTP MFA enrollment. Once the first Super Admin is created, `/admin/setup` is permanently disabled.
2. **Subsequent Admin Creation (`POST /admin/admins`):** Only an authenticated, MFA-verified Super Admin can create or promote another administrator, issuing a single-use password setup link and forcing TOTP enrollment on first sign-in.
3. **Last Super Admin Protection:** The Platform requires at least one active Super Admin at all times. Any attempt by the sole remaining Super Admin to demote or deactivate their own account is blocked server-side.
4. **Admin Offboarding:** When an administrator or moderator steps down, a Super Admin revokes their admin status (`PATCH /admin/admins/:id`), which immediately invalidates their admin sessions, converts the account to a standard member (or deactivates it), and automatically releases all application review claims held by that administrator.

### 5.3 Mandatory Multi-Factor Authentication (`ADM-01`)
Every Moderator and Super Admin must enroll in **TOTP Multi-Factor Authentication** (`otplib` QR + 8 hashed single-use backup codes, with the TOTP secret AES-256 encrypted at rest using `FIELD_ENCRYPTION_KEY`). Even after signing in via password or Google OAuth, an administrator's session remains `mfaVerified = false` and is blocked (`403 MFA_REQUIRED`) from every `/admin/*` endpoint and the `admins` WebSocket room until a valid TOTP code is verified (`POST /auth/mfa/verify`).

### 5.4 Strict Conflict-of-Interest Blocks (`PRD §20.3`)
The backend enforces server-side guards preventing self-dealing by administrators:
1. **No Self-Role or Self-Restriction Modification:** An administrator cannot modify their own `primaryRole`, `adminLevel`, or issue/resolve a restriction (`warning`, `suspension`, `revocation`, `blacklist`) on their own account (`ADM-03`).
2. **No Self-Application Decisions:** An administrator cannot claim, approve, or reject their own membership application.
3. **No Self-Content Moderation:** An administrator cannot approve their own achievement submission or resolve a content report filed against their own post, response, or profile.

### 5.5 Concurrent Application Review Claim Locking (`PRD §20.4` & `§20.5`)
To prevent two administrators from reviewing or issuing conflicting decisions on the same applicant simultaneously:
- Opening an application calls `POST /admin/applications/:id/claim`, acquiring an atomic database lock (`claimed_by`, `claimed_at`) and broadcasting `admin.application.claim` over WebSockets to all online admins.
- The reviewing administrator's browser sends a 60-second heartbeat to renew the lock while active.
- If no action is taken for **15 minutes**, the lock automatically expires (`claim_auto_release` job) so the application is never stranded.
- Submitting a decision (`POST /admin/applications/:id/decision`) requires holding the active claim and records the **6-Point Approval Rubric** evaluation alongside the decision reason.

### 5.6 Immutable 3-Year Append-Only Audit Log (`ADM-05`)
Every administrative action—including application claims, claim overrides, approvals, rejections, info requests, role changes, warnings, suspensions, revocations, blacklistings, post/response hides and restores, achievement decisions, mentor verification badge changes, profile-change decisions, taxonomy merges, legal document publications, settings changes, event CSV exports, and views of private member profile data—is recorded in `AuditLog`.
- Each entry captures `actor_id`, `action`, `target_type`, `target_id`, `reason`, `ip_address`, `timestamp` (UTC), and structured `metadata`.
- The `AuditLog` table is protected by MySQL `BEFORE UPDATE` and `BEFORE DELETE` triggers (`SIGNAL SQLSTATE '45000'`) and a write-only application service so that **no user, including a Super Admin, can modify or delete audit history**. Audit logs are retained for **3 years**.
