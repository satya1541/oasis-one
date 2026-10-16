**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

# **OASIS ONE**

### **Product Requirements Document (PRD)**

One Community. Infinite Possibilities.

Version 1.2  |  15 October 2026

Prepared for product, design and engineering teams

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

## **Document Control**

|**Field**|**Details**|
|---|---|
|Product|OASIS ONE — Digital ecosystem for the OASIS entrepreneur community|
|Document|Product Requirements Document (PRD)|
|Version / status|v1.2 — Addresses roadmap–requirements alignment, migration plan for existing members, admin safeguards, privacy and legal gaps, internal contradictions, missing data-model entities and undefined product behaviors identified in independent reviews of v1.1.|
|Date|15 October 2026|
|Primary audience|Product owner, UX/UI design, engineering, QA and community administration|
|Product concept|A role-based, searchable entrepreneur community portal with admin-approved membership, community knowledge sharing, mentor discovery, events, notifications and personal planning.|

### **Change log**

|**Version**|**Date**|**Summary of changes**|
|---|---|---|
|v1.0|—|Initial draft|
|v1.1|12 October 2026|Updated platform name and brand positioning|
|v1.2|15 October 2026|Aligned roadmap to P0 requirements; added migration plan for 650+ existing members; defined or removed phantom features (Circles, Resources/Opportunities); promoted AUTH-09 to P0; added admin safeguards (MFA, bootstrap, concurrent review locks, approval rubric); expanded privacy and legal section (age gate, consent versioning, right to deletion, breach response); fixed 6 internal contradictions; added 10+ missing data-model entities; specified 30+ previously undefined product behaviors; added permission matrix and success-metric targets.|



## **Contents**

- 1. Executive Summary
- 2. Background and Problem Statement
- 3. Product Vision and Principles
- 4. Goals, Non-Goals and Success Metrics
- 5. User Roles and Permissions
- 6. Core User Journeys
- 7. Functional Requirements
- 8. Registration Data Requirements
- 9. Planner and Calendar
- 10. Admin Console
- 11. Information Architecture and Screens
- 12. Data Model (Logical)
- 13. Non-Functional Requirements
- 14. Security, Privacy and Governance
- 15. Notifications and Email
- 16. Analytics and Reporting
- 17. MVP Scope and Roadmap
- 18. Acceptance Criteria
- 19. Migration and Launch Plan
- 20. Admin Safeguards and Governance
- 21. Dependencies, Assumptions and Open Decisions
- Appendix A — Suggested MVP Navigation
- Appendix B — Product Definition
- Appendix C — Role-Permission Matrix

Brand positioning: OASIS ONE — One Community. Infinite Possibilities. The platform is the digital home for OASIS members to connect, collaborate, build and grow.

## **1. Executive Summary**

OASIS is a growing entrepreneur community that brings together aspiring entrepreneurs, startup founders and cofounders, mentors and advisors. As membership expands beyond 650 members, WhatsApp alone becomes difficult to use for structured discovery, support requests, event registrations and ongoing member engagement.

OASIS ONE will provide a single, mobile-first web destination where members can discover people and expertise, search community questions and suggestions, share achievements, find mentors, register for physical meetups, manage personal tasks and view community announcements. All membership applications must be reviewed and approved by an authorized admin before the applicant can access private portal content.

The MVP is intentionally focused. It is not intended to become a full social network, investor transaction platform or project-management suite. Its primary value is to make the community searchable, structured, trusted and easier to manage.

A dedicated migration plan (Section 19) ensures existing OASIS members transition smoothly from WhatsApp-based coordination to the portal without flooding the admin queue or losing historical knowledge.

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

## **2. Background and Problem Statement**

#### **2.1 Current context**

- OASIS grew rapidly to more than 650 members in a short period.

- The community includes aspiring entrepreneurs, startup founders/co-founders, mentors and advisors.

- The community has focused interest areas, including DeepTech, and may add more over time. These are implemented as tags and interest filters in the MVP; a formal Circles/Subgroups feature is deferred to a later release (see Section 21.3).

- Members need to find relevant people, ask for guidance, share suggestions and achievements, and discover upcoming meetups.

- Admins need a reliable way to review applicants, communicate updates, publish event registration forms and moderate member access.

#### **2.2 Problem statement**

Community information is fragmented across chat messages and groups. Useful advice is difficult to find later, relevant members are difficult to discover, event registration requires manual coordination, and administrators lack a centralized view of membership and activity.

#### **2.3 Product opportunity**

Create a searchable community workspace that supports structured discovery and engagement while keeping administration manageable as OASIS grows.

## **3. Product Vision and Principles**

Vision: OASIS ONE is the digital home for entrepreneurs to connect with the right people, access relevant guidance and participate meaningfully in the community.

- **Search first**: make people, expertise and community knowledge discoverable through one prominent search experience.

- **Approved membership**: applicants cannot access private member content until an authorized admin approves them.

- **Role-aware experience**: collect relevant information and show useful functions according to the member's role.

- **Mobile-first and low-friction**: make core tasks easy on a phone and avoid lengthy onboarding.

- **Community trust**: protect personal information, moderate content and maintain accountable admin actions.

- **Focused MVP**: launch the essential community workflows before introducing advanced AI or marketplace functionality.

- **Smooth migration**: ensure existing OASIS members can transition to the portal without disruption or data loss.

- **Defense in depth**: layer security controls so that no single failure compromises user data or admin operations.

## **4. Goals, Non-Goals and Success Metrics**

#### **4.1 Goals**

- Centralize membership, profiles, community posts, mentor discovery, event registration and notifications.

- Allow members to search for people, expertise, questions, suggestions and events.

- Give members a lightweight personal planner and calendar.

- Give admins a controlled workflow for application approval, announcements, events, content moderation and account restrictions.

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

- Reduce dependence on unstructured WhatsApp conversations for information that should be searchable or trackable.

- Successfully migrate existing 650+ members onto the portal within the first 30 days of launch.

#### **4.2 Non-goals for MVP**

- Native iOS and Android applications; the first release is a responsive web app/PWA.

- In-app private chat or video conferencing.

- Processing investments, fundraising transactions or guaranteeing funding eligibility.

- Automated AI-based mentor matching.

- Full project management, team task assignment or complex CRM.

- Automatic synchronization with Google Calendar or Outlook in the initial release.

- Formal Circles/Subgroups feature with dedicated permissions and content scoping (deferred; see Section 21.3).

#### **4.3 Success metrics**

|**Metric**|**Definition**|**Target (first 90 days)**|**Measurement approach**|
|---|---|---|---|
|Application turnaround|Time from submission to admin decision|Median ≤ 48 hours; p90 ≤ 5 days|Calculated from Application timestamps|
|Approval conversion|Approved applications / decided applications|≥ 80%|Monthly|
|Migration adoption|Existing members who complete registration within 30 days of launch|≥ 60% of pre-launch member list|One-time measurement at day 30|
|Search success|Search sessions that lead to a profile, post or event open|≥ 40% of search sessions|Event analytics|
|Connection activity|Mentor/contact requests sent and accepted|≥ 50 requests sent; ≥ 30% acceptance rate|Monthly|
|Event conversion|Registrations / event detail views|≥ 25% per event|Per event|
|Planner engagement|Members who create or complete at least one task|≥ 20% of active members|Weekly/monthly|
|Content quality|Posts reported / total posts published|< 5% report rate|Monthly|
|Member activation|Approved members who complete a profile and take one meaningful action (post, search, register for event, or send connection request) within 14 days|≥ 50% of approved members|Cohort analysis|
|Member retention|Members who log in at least once per month|≥ 40% MAU / total active members|Monthly|
|WhatsApp reduction|Community questions/requests posted on portal vs. WhatsApp|Qualitative survey at 60 and 90 days|Admin observation + optional member survey|



## **5. User Roles and Permissions**

|**Role**|**Primary purpose**|**Core permissions**|
|---|---|---|
|Aspiring Entrepreneur|Explore entrepreneurship and seek guidance|Manage own profile; search permitted content; post questions/suggestions/achievements; discover mentors; register for events; use personal planner.|
|Startup Founder / Co-Founder|Build and grow a startup|All standard member functions; publish startup profile details; seek advice and collaboration; share milestones.|
|Mentor / Advisor|Offer expertise and guidance|Manage expertise profile and availability; search members/content; receive and respond to connection or guidance requests; use planner and register for events.|
|Admin|Operate and safeguard the community|Review applications; manage members and roles; publish notifications/events; moderate posts and achievements; view reports; suspend/revoke/blacklist accounts; manage settings. Admins also retain full member capabilities under their own profile.|



Admin access must be granted by an existing authorized administrator or through the controlled initial bootstrap process defined in Section 20.1. Public registration must never allow a user to self-select Admin.

#### **5.1 Multiple capabilities**

For MVP, a user selects one primary role during registration. A user with Admin privileges also retains full member capabilities under their single account (no second account required).

The data model stores `primary_role` on the User entity and supports an `additional_roles` array. For MVP, the UI surfaces only the primary role. In a future release, a member can activate additional capabilities — for example, a founder who also mentors — without creating a duplicate account. Migration from single-role to multi-role will:
- Add a role selector in profile settings.
- Prompt for role-specific fields when a new role is activated.
- Preserve all existing data and history.

#### **5.2 Role-permission matrix**

See Appendix C for the full matrix. The matrix defines, for each role, the default access level (none, read, create, edit-own, edit-any, delete-own, delete-any) for every resource type (profiles, posts, events, tasks, admin functions, audit logs, etc.).

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

## **6. Core User Journeys**

#### **6.1 Registration and approval**

1. Visitor opens the portal and selects Aspiring Entrepreneur, Startup Founder/Co-Founder or Mentor/Advisor.

2. Visitor confirms they are 18 years of age or older. If the visitor cannot confirm, registration is blocked with a message explaining the age requirement.

3. Visitor completes the role-specific form, accepts the current version of the privacy notice and community guidelines (recorded with version ID and timestamp), and verifies their email address. Email verification links expire after 24 hours; an expired link shows a clear message with a resend option.

4. System creates an application with status Pending and displays an application reference page. The reference ID must be non-sequential and non-guessable (e.g., UUID or hashed identifier) to prevent status enumeration by URL manipulation.

5. Admin receives an alert and reviews the application and profile information using the approval rubric (Section 20.4).

6. Admin approves, rejects or requests additional information. The action and actor are recorded. If the admin requests additional information, the applicant is notified and can respond with the requested details (see AUTH-09, P0). The back-and-forth is tracked via the ApplicationMessage entity.

7. On approval, the account becomes active and the applicant receives a welcome notification with next steps.

8. On rejection, the applicant receives a notification with an appropriate message. Reapplication is permitted after a configurable cooling-off period (default: 30 days) or when the applicant has new information to submit.

9. Until approval, the applicant can access only public pages, registration, login and their own application-status page.

10. If the email service is unavailable during registration, the system queues the verification email and informs the user that the email may be delayed. Registration is not blocked; the application remains in an Unverified state until email verification completes.

#### **6.2 Migration for existing members**

11. Before launch, admins upload a pre-approved member list (CSV: name, email, role) to the admin console.

12. System generates unique, time-limited invite links and sends invitation emails to each member on the list.

13. Existing member clicks the invite link, completes a shortened registration form (pre-filled with known data), verifies their email and sets a password.

14. On completion, the account is activated immediately without requiring admin approval (pre-approved status).

15. Members who do not complete registration within the invite window can use the standard registration flow, where their email is matched against the pre-approved list for expedited approval.

16. See Section 19 for the full migration plan.

#### **6.3 Search and connect**

17. Member enters keywords in the global search bar.

18. Search results are grouped by People, Questions & Suggestions, and Events. Results are paginated (default 20 results per page) with a total count displayed.

19. Member opens a profile or post and reviews information the owner has chosen to make visible.

20. Member submits a connection or request-for-guidance message. Rate limit: a member may send a maximum of 10 connection requests per 24-hour rolling window. Duplicate requests to the same recipient are blocked while a prior request is pending.

21. Recipient can accept or decline; contact details are shared only according to privacy settings and consent. On acceptance, the system shares the contact information that each party has marked as "share on connection" in their privacy settings. If neither party has any shareable contact info, the acceptance notification includes a prompt to update privacy settings.

22. If the recipient does not respond within 14 days, the request expires automatically and the sender is notified. The sender may re-send after a 7-day cooldown.

23. A member can block another member. Blocked members cannot send further requests or view the blocker's full profile. Blocking is private and does not notify the blocked member.

#### **6.4 Event enrollment**

24. Admin creates an event and configures registration questions, eligibility, capacity and deadline.

25. Event is published to the member dashboard and calendar.

26. Member views details and submits the registration form.

27. System confirms registration, records the response and adds the event to the member's OASIS calendar. If capacity is full, the member is added to a waitlist and notified of their position. When a spot opens (via cancellation), the next waitlisted member is automatically promoted and notified. Race condition handling: registration uses optimistic locking; if two members register simultaneously for the last spot, one succeeds and the other is waitlisted.

28. If the admin updates event details (time, venue, etc.) after registration opens, all registered members receive an update notification with a summary of changes.

29. If the admin cancels an event, all registered and waitlisted members are notified and the event is marked as Cancelled in their calendars.

30. Admin can export the attendee list. Exports are logged in the audit trail. CSV exports use proper escaping to prevent formula injection. Export access is restricted to admins with event-management permissions.

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

## **7. Functional Requirements**

Priority definitions: P0 = required for MVP launch; P1 = desirable for MVP if capacity permits; P2 = later release.

#### **7.1 Registration, authentication and approval**

|**ID**|**Requirement**|**Priority**|**Phase**|**Acceptance criteria**|
|---|---|---|---|---|
|AUTH-01|Allow visitors to register under one of the three public roles.|P0|1|Role-specific registration form is displayed after role selection.|
|AUTH-02|Require email verification before the application can be submitted or considered complete. Verification links expire after 24 hours with a resend option.|P0|1|Unverified email cannot complete submission. Expired links show a clear resend prompt.|
|AUTH-03|Create a Pending application with a non-guessable reference ID and show a confirmation/status page.|P0|1|Applicant sees a reference and current status. Reference ID is UUID-based.|
|AUTH-04|Allow authorized admins to approve, reject or request more information. Concurrent review protection: only one admin can actively review an application at a time (claim/lock mechanism with auto-release after 15 minutes of inactivity).|P0|1|Each decision updates status and creates an audit record. Lock prevents double decisions.|
|AUTH-05|Prevent unapproved applicants from accessing member-only routes and APIs.|P0|1|Direct URL/API attempts are denied server-side.|
|AUTH-06|Send application received, decision and additional-information emails. Queue emails if the email provider is temporarily unavailable; retry with exponential backoff (max 3 retries over 24 hours).|P0|1|Correct template and status are sent to the applicant. Failed sends are logged and retried.|
|AUTH-07|Provide secure login, logout, password reset and session expiration. Password policy: minimum 8 characters, at least one uppercase, one lowercase and one digit. Session lifetime: 24 hours with sliding expiration; absolute maximum 7 days. Support email-change flow requiring verification of the new address.|P0|1|Credential recovery and session handling follow security requirements. Password policy is enforced on registration and reset.|
|AUTH-08|Support suspension, revocation and blacklist actions for admins. See Section 10.2 for enforcement rules.|P0|1|Restricted users lose access and action reason is recorded.|
|AUTH-09|Allow applicant to update requested details and resubmit via the ApplicationMessage entity. Admin can request specific information; applicant can respond with text and optional attachments.|P0|1|Back-and-forth messages are recorded. Applicant sees only applicant-facing messages, not internal admin notes.|
|AUTH-10|Enforce a minimum age of 18. Display age confirmation checkbox during registration.|P0|1|Users who do not confirm age cannot submit the registration form.|
|AUTH-11|Record the version of privacy notice and community guidelines accepted by the user, along with acceptance timestamp.|P0|1|ConsentRecord entity is created on registration. When terms are updated, members are prompted to re-accept on next login.|
|AUTH-12|Support pre-approved member registration via invite links for existing OASIS members (see Section 19).|P0|1|Pre-approved members can register without admin approval. Invite links expire after the configured window.|
|AUTH-13|Allow rejected applicants to reapply after a configurable cooling-off period (default: 30 days).|P0|1|Reapplication before the cooling period is blocked with a clear message showing the eligible date.|



#### **7.2 Member profiles and directory**

|**ID**|**Requirement**|**Priority**|**Phase**|**Acceptance criteria**|
|---|---|---|---|---|
|PROF-01|Store a profile appropriate to the member's role.|P0|1|Required fields are validated and saved.|
|PROF-02|Allow members to edit permitted profile fields after approval. Changes to role, name, or verification-relevant fields (defined as: role, full name, startup name, expertise areas, and verification evidence) are flagged for admin review before taking effect.|P0|1|Changes persist. Flagged changes show a "pending review" indicator to the member and appear in the admin review queue.|
|PROF-03|Search and filter approved profiles by name, role, industry, expertise and location. Results are paginated (default 20 per page). Include anti-scraping protection: rate-limit directory API endpoints, require authentication, and monitor for bulk-download patterns.|P0|2|Results respect visibility settings and role permissions. Rate limits return 429 status.|
|PROF-04|Provide profile visibility controls for contact details and selected fields. Default visibility: phone number = private; email = private; name = visible to members; bio = visible to members; LinkedIn = visible to members. Members can override defaults in settings.|P0|1|Private fields are not returned in search or profile APIs. Default visibility is applied on account creation.|
|PROF-05|Allow mentor profiles to list expertise, sectors, mentoring preferences, and verification status. Include a field for admin-assigned verification badge.|P0|1|Mentor filters use these fields. Verification badge is only assignable by admins.|
|PROF-06|Allow founder profiles to include startup details and current support needs. Link co-founders to a shared Startup entity to prevent duplicate profiles.|P0|1|These fields can be searched where marked visible. Co-founders see the same startup details.|

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

#### **7.3 Search and community content**

|**ID**|**Requirement**|**Priority**|**Phase**|**Acceptance criteria**|
|---|---|---|---|---|
|SRCH-01|Provide a prominent global search bar on the dashboard.|P0|2|Search is available from primary member pages.|
|SRCH-02|Search people, published questions/suggestions and events. Results are grouped or filterable by content type.|P0|2|Results are grouped with counts per type.|
|SRCH-03|Support keyword matching across titles, descriptions, expertise and relevant tags. Handle common spelling variants and partial matches.|P0|2|Relevant content is returned for a defined set of representative test queries (see Section 18).|
|SRCH-04|Paginate search results. Default page size: 20. Display total result count. Handle zero-result queries with suggestions (e.g., "try broader keywords" or related tags).|P0|2|Pagination controls render correctly. Zero-result state shows a helpful message.|
|SRCH-05|Log search queries (anonymized) for analytics. Track zero-result queries separately to identify taxonomy gaps.|P1|2|Admin analytics show top queries and zero-result rate.|
|POST-01|Allow members to publish a question/help request. Maximum length: 10,000 characters for description, 200 characters for title.|P0|2|Post has title, description, category, timestamps and character count validation.|
|POST-02|Allow members to share suggestions, knowledge and responses. Maximum response length: 5,000 characters.|P0|2|Members can respond to published posts.|
|POST-03|Allow members to report content. Reports include a reason category (spam, harassment, misinformation, other) and optional details.|P0|2|Report enters admin moderation queue with reason.|
|POST-04|Allow admins to hide/remove content and record a reason. Notify the content author when their content is moderated, with a generic reason (without exposing internal notes). Author may appeal via the grievance channel.|P0|2|Content is no longer visible to members. Action is logged in audit trail. Author receives notification.|
|POST-05|Support tags/categories for easier discovery. Admin-managed taxonomy with the ability to add, rename, merge and retire tags.|P1|2|Members can filter by category. Admins can manage taxonomy from admin console.|
|POST-06|Allow members to edit their own posts within 24 hours of publication. Show edit indicator and timestamp. Preserve original version for moderation purposes.|P0|2|Edited posts show "edited" badge. Original text is retained in the database.|
|POST-07|Allow members to delete their own posts. Deletion is soft-delete (content hidden, record retained for moderation/audit). Responses to a deleted post remain visible but show "original post removed."|P0|2|Deleted posts are not visible in search or feeds. Responses remain accessible.|
|POST-08|Allow members to mark their own question as "Resolved" with an optional accepted answer.|P1|2|Resolved questions show a visual indicator and the accepted answer is highlighted.|



#### **7.4 Achievements**

|**ID**|**Requirement**|**Priority**|**Phase**|**Acceptance criteria**|
|---|---|---|---|---|
|ACH-01|Allow members to submit an achievement with text (max 500 characters) and optional image (max 5 MB, JPEG/PNG only). All achievements require admin approval before publication.|P0|2|Submission is saved as Pending Review.|
|ACH-02|Allow admins to approve, reject or remove achievements. Rejection notifies the author with a reason. Approval notifies the author that their achievement is now live.|P0|2|Only approved achievements appear in the banner. Author receives notification for both approval and rejection.|
|ACH-03|Display active approved achievements in a prominent dashboard banner/carousel.|P0|2|Banner shows only items within the active window.|
|ACH-04|Expire an achievement 24 hours after admin approval (UTC clock). The 24-hour window is calculated from the `approved_at` timestamp in UTC, regardless of the viewer's timezone.|P0|2|Expired items automatically disappear from the active banner. Expiry is based on `approved_at` + 24h in UTC.|
|ACH-05|Optionally retain approved expired achievements in an archive. Archive is visible only to the achievement author and admins. Retention follows the platform data retention policy.|P1|Later|Archive visibility and retention follow member consent and policy.|



#### **7.5 Mentor discovery and connections**

|**ID**|**Requirement**|**Priority**|**Phase**|**Acceptance criteria**|
|---|---|---|---|---|
|MENT-01|Allow members to discover mentors/advisors by expertise, sector and location.|P0|2|Filters return approved mentor profiles.|
|MENT-02|Provide a Request Guidance/Connect action on eligible profiles. Eligibility: the recipient has the Mentor/Advisor role, their account is active, and they have not paused their availability. Rate limit: 10 requests per member per 24-hour rolling window. Duplicate requests to the same recipient are blocked while a prior request is pending.|P0|2|Request is recorded with sender, recipient, message and status. Rate limit is enforced.|
|MENT-03|Allow recipient to accept or decline a request. Pending requests auto-expire after 14 days. Sender may re-send after a 7-day cooldown.|P0|2|Request status is updated and both parties receive an appropriate notification. Expired requests notify the sender.|
|MENT-04|Respect profile privacy and contact-sharing preferences. On acceptance, share only the contact fields each party has marked as "share on connection." If neither party has shareable contact info, prompt both to update their settings.|P0|2|Contact details are not disclosed without the relevant permission.|
|MENT-05|Support mentor availability settings: active/paused status, maximum concurrent mentees (optional), preferred contact method.|P1|Later|Members see availability status. Paused mentors do not appear in connection-eligible results.|
|MENT-06|Allow members to block another member. Blocked members cannot send requests or view the blocker's full profile. Blocking is private.|P0|2|Block takes effect immediately. Blocked user sees a generic "profile unavailable" message.|



#### **7.6 Events and meetups**

|**ID**|**Requirement**|**Priority**|**Phase**|**Acceptance criteria**|
|---|---|---|---|---|
|EVT-01|Allow admins to create, edit, publish, cancel and archive events. Events support a visibility field: all members, specific roles, or invite-only.|P0|3|Event details and publication status are managed in admin console. Visibility field controls who can see and register.|
|EVT-02|Allow admins to configure a registration form with custom questions.|P0|3|Configured fields appear to eligible members.|
|EVT-03|Support date/time, venue or meeting link, capacity, deadline and eligibility. Online meeting links are visible only to registered members.|P0|3|Event details are visible before registration. Meeting links are hidden from non-registrants.|
|EVT-04|Allow members to register and cancel where allowed. Duplicate registrations are prevented. On cancellation, the next waitlisted member (if any) is automatically promoted.|P0|3|Duplicate registrations are prevented. Cancellation triggers waitlist promotion.|
|EVT-05|When capacity is reached, allow members to join a waitlist. Show waitlist position. Automatically promote from waitlist when spots open.|P0|3|Full-capacity events show "Join waitlist" instead of "Register." Promotion notifications are sent.|
|EVT-06|Send registration confirmation, event reminders (configurable timing: default 24h and 1h before), event-update notifications and cancellation notifications.|P0|3|Notifications follow configured timing. Updates and cancellations are sent to all registrants and waitlisted members.|
|EVT-07|Allow admins to export attendee lists. Exports use proper CSV escaping to prevent formula injection. Export actions are logged in the audit trail.|P0|3|Authorized admin can download a CSV file. Audit log records the export.|
|EVT-08|Add registered events to the member's portal calendar. If the admin reschedules or cancels, the calendar entry updates automatically.|P0|3|Event appears on the member calendar. Changes propagate in real time.|
|EVT-09|Provide .ics file download for individual events so members can add events to external calendars.|P1|3|Download link is available on the event detail page.|
|EVT-10|Track event attendance and check-ins. Admins can mark attendance from the attendee list, or provide a check-in link/code. MVP events are free of charge (paid events deferred; see Section 21.2).|P1|3|Attendance status (checked-in timestamp) is recorded and reflected in attendee CSV exports.|



OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

#### **7.7 Planner and calendar**

|**ID**|**Requirement**|**Priority**|**Phase**|**Acceptance criteria**|
|---|---|---|---|---|
|PLAN-01|Allow each member to create, edit, complete and delete personal tasks.|P0|3|Task changes persist and are visible only to the owner.|
|PLAN-02|Support task title (max 200 chars), notes (max 2,000 chars), due date/time, priority and completion status.|P0|3|Fields validate and render in task list/calendar.|
|PLAN-03|Provide day, week and month calendar views.|P0|3|Member can switch views and navigate dates.|
|PLAN-04|Show registered OASIS events in the calendar. Mentor sessions are shown only when the session-booking feature (MENT-05, P1) is implemented.|P0|3|OASIS events are visually distinguishable from personal tasks. Mentor sessions are added when available.|
|PLAN-05|Allow reminders for tasks and upcoming events. Default reminder preferences are applied on account creation; members can customize via notification settings (see NOT-03). Reminders are processed by a background job queue.|P0|3|Reminder is sent at configured time when notifications are enabled.|
|PLAN-06|Support recurring tasks, goal tracking and milestones.|P2|Later|Reserved for a later release unless prioritized.|
|PLAN-07|Integrate with Google Calendar/Outlook.|P2|Later|Not required for initial release.|



#### **7.8 Notifications and grievances**

|**ID**|**Requirement**|**Priority**|**Phase**|**Acceptance criteria**|
|---|---|---|---|---|
|NOT-01|Allow admins to publish announcements to all members or selected roles. Broadcast notifications use a per-recipient delivery record for tracking read state.|P0|2|Audience is selected before publishing and preview is available. Per-recipient read tracking works.|
|NOT-02|Provide in-app notification center and email notifications. In-app notifications support mark-as-read, mark-all-as-read, and pagination.|P0|2|Notifications are recorded and can be marked read.|
|NOT-03|Allow users to manage notification preferences. Classify notifications as essential (cannot disable: account status, security alerts, admin decisions) and non-essential (can disable: event reminders, post replies, achievement updates, weekly digest). Default preferences are applied on account creation.|P0|2|Preferences are honored. Essential notifications cannot be disabled. Default preferences are pre-set.|
|NOT-04|Notify members when someone replies to their post.|P0|2|Author receives in-app notification (and email if enabled) for each reply.|
|NOT-05|Notify members when their achievement is approved or rejected.|P0|2|Author receives notification with appropriate message.|
|NOT-06|Notify members when a content report they submitted is resolved.|P1|2|Reporter receives a generic resolution notification (without exposing moderation details).|
|GRV-01|Provide a visible Contact OASIS Administration action. On desktop, open an email composer with the configured grievance/support email, recipient and suggested subject. On mobile, offer both `mailto:` and a simple in-app contact form as fallback (since `mailto:` often fails on mobile browsers). Submissions via the in-app form generate an automated tracking Case ID (e.g., `OASIS-GRV-YYYY-XXXX`) and an immediate confirmation email to the submitter.|P0|2|Link/form is accessible from all authenticated pages. Mobile fallback form submits to support email, generates Case ID, and sends confirmation.|
|GRV-02|Avoid exposing grievance messages or contact information publicly. Grievances involving admin misconduct can be sent to a separate oversight email address configured in admin settings.|P0|2|Grievances are handled outside public feeds. Admin-misconduct route is configured separately.|



#### **7.9 Admin and moderation**

|**ID**|**Requirement**|**Priority**|**Phase**|**Acceptance criteria**|
|---|---|---|---|---|
|ADM-01|Provide a separate, protected admin console. Require MFA (TOTP-based) for all admin accounts.|P0|1|Only authorized admin accounts with MFA can access it.|
|ADM-02|Show application queues by status and allow search/filter. Support claim/lock mechanism for concurrent review (see AUTH-04).|P0|1|Admin can identify pending and aging applications. Claimed applications show the reviewer's name.|
|ADM-03|Manage members, roles, restrictions and account status. An admin cannot modify their own role or restrictions (requires another admin).|P0|1|Changes take effect immediately or within the defined session invalidation window. Self-modification is blocked.|
|ADM-04|Manage posts, achievements, events, forms and announcements.|P0|2–3|Admin can publish, edit, hide, cancel or archive relevant items.|
|ADM-05|Maintain a comprehensive audit log for: approvals, rejections, role changes, restrictions, content moderation actions, settings changes, data exports, views of private member data and admin account changes.|P0|1|Log records actor, action, target, target type, timestamp, reason, IP address and metadata. Logs are append-only and cannot be modified or deleted by any user, including super admins.|
|ADM-06|Provide basic community analytics.|P1|3|Admin sees registrations, member counts, event enrollment and content reports.|
|ADM-07|Support multiple admin permission levels: Super Admin (full access including admin management) and Moderator (content moderation and member management only; cannot manage other admins, settings or audit logs).|P0|1|Permission levels are configurable. Moderators cannot access Super Admin functions.|
|ADM-08|Admin taxonomy management: add, rename, merge and retire tags/categories used in posts, profiles and events.|P1|2|Changes to taxonomy propagate to existing content using the affected tags.|



## **8. Registration Data Requirements**

Only collect data needed for community operation. Fields marked optional should not block submission.

#### **8.1 Common fields for all applicants**

|**Field**|**Required**|**Notes**|
|---|---|---|
|Full name|Yes|Displayed name; allow later correction (flagged for admin review).|
|Email address|Yes|Must be verified; unique account identifier.|
|Phone number|Optional|Verify via OTP if collected; visibility is private by default.|
|City and state/country|Yes|Used for local discovery and physical meetups.|
|Profile photo|Optional|Max 2 MB, JPEG/PNG. User-controlled visibility.|
|Short introduction|Yes|Brief profile summary. Max 500 characters.|
|Areas of interest|Yes|Multi-select from admin-managed taxonomy plus optional free text (max 200 chars).|
|LinkedIn / website|Optional|Validate URL format (must start with https://).|
|Age confirmation|Yes|Checkbox: "I confirm I am 18 years of age or older." Must be checked to submit.|
|Consent and community guidelines|Yes|Explicit acceptance of the current version of privacy notice and community rules. Version ID and timestamp recorded.|

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

#### **8.2 Aspiring Entrepreneur fields**

|**Field**|**Required**|**Type / Control**|**Validation & Notes**|
|---|---|---|---|
|Business idea / Area of interest|Optional|Text (single line)|Max 500 chars. Optional if idea is not yet finalized.|
|Preferred sectors/industries|Yes|Multi-select|Selected from admin-managed taxonomy.|
|Skills and experience|Yes|Textarea|Max 1,000 chars. Details domain or technical background.|
|Current stage|Yes|Single-select|Enum: Exploring, Idea Validation, Planning, Pre-MVP.|
|Guidance needed / Challenges|Yes|Textarea|Max 1,000 chars. Specific guidance sought from community/mentors.|
|Collaboration interests|Optional|Textarea|Max 500 chars. Specific co-founder or project collaboration interests.|

#### **8.3 Startup Founder / Co-Founder fields**

|**Field**|**Required**|**Type / Control**|**Validation & Notes**|
|---|---|---|---|
|Startup / Company name|Yes|Text (single line)|Max 100 chars. Links to or creates a Startup entity.|
|Role in startup|Yes|Single-select / Text|Select: CEO, CTO, COO, Co-Founder, or custom role (max 50 chars).|
|Industry / Sector|Yes|Multi-select|Selected from admin-managed taxonomy.|
|Startup stage|Yes|Single-select|Enum: Ideation, MVP, Launched, Early Revenue, Growth/Scaling.|
|Product / Service summary|Yes|Textarea|Max 1,000 chars. Clear description of value proposition.|
|Company website|Optional|URL|Must start with https://. Valid URL syntax enforced.|
|Startup location|Yes|Text (single line)|City and State/Country.|
|Support needed|Yes|Multi-select|Select from: Funding, Technology, Sales, Hiring, Partnerships, Legal/Compliance, Other.|
|Expertise / Support offered|Optional|Textarea|Max 500 chars. Areas where the founder can assist other members.|

When two or more founders register with the same startup name, the system suggests linking to the existing Startup entity. Admins can manually merge duplicate Startup records.

#### **8.4 Mentor / Advisor fields**

|**Field**|**Required**|**Type / Control**|**Validation & Notes**|
|---|---|---|---|
|Current role & organization|Optional|Text (single line)|Max 100 chars. (e.g., VP of Product at XYZ).|
|Years of experience|Yes|Single-select|Enum: 1–3, 3–5, 5–10, 10–15, 15+ years.|
|Areas of expertise|Yes|Multi-select|Selected from admin-managed taxonomy.|
|Industries / Sectors supported|Yes|Multi-select|Selected from admin-managed taxonomy.|
|Mentoring topics & preferred stages|Yes|Multi-select|Select topics and founder stages (Ideation, MVP, Early Revenue, Scaling).|
|Availability & contact approach|Yes|Textarea|Max 500 chars. Cadence, office hours, or preferred channel.|
|LinkedIn / Professional profile URL|Optional|URL|Recommended for verification; must start with https://.|
|Verification evidence / References|Optional|File / Text|Max 10 MB PDF/JPEG or text reference. Admin reviews and assigns verification badge.|

#### **8.5 Admin fields and permissions**

Admin accounts are created or promoted by an authorized Super Admin, or through the initial bootstrap process (Section 20.1). Admin profile fields include name, email, permission level (Super Admin / Moderator), MFA status and active status. Admin credentials and privileges must never be granted through public self-registration.

## **9. Planner and Calendar**

#### **9.1 Calendar sources**

|**Item type**|**Created by**|**Visibility**|**Can member edit?**|
|---|---|---|---|
|Personal task|Member|Private to owner|Yes, owner only|
|OASIS event|Admin|Members according to event visibility field|No; member can register/cancel where permitted|
|Funding or opportunity deadline|Member manually|Private to owner|Yes, owner only|

Note: Mentor sessions and Goals/Milestones are deferred. Mentor sessions will appear in the calendar when the session-booking feature (MENT-05) is implemented. Goals and milestones are P2 (PLAN-06) and will be added in a later release.

#### **9.2 Task fields**

- Task title (max 200 characters) and optional notes (max 2,000 characters)

- Due date and optional time

- Priority: low, normal, high

- Status: open, completed, archived

- Reminder date/time and notification preference

- Created/updated timestamps

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

#### **9.3 Reminder behavior**

- Use the member's configured time zone; default to the browser/device time zone during onboarding if no preference is set.

- Reminders are processed by a background job queue (e.g., BullMQ, Agenda, or equivalent). The tech baseline must include a job scheduler.

- Do not send reminders for deleted, completed or cancelled items unless a policy explicitly requires a final status notice.

- If a reminder cannot be delivered (email bounce), retain the task and show the due date in the portal; do not imply guaranteed email delivery. Log the delivery failure.

- Reminders use the member's notification preferences from NOT-03. Until a member customizes their preferences, the system-default preferences apply (all non-essential notifications enabled).

- The weekly summary can be introduced after the core planner is stable; it should be opt-in or configurable.

## **10. Admin Console**

#### **10.1 Main navigation**

- Overview

- Applications

- Members

- Posts & Reports

- Achievements

- Events & Registration Forms

- Announcements & Notifications

- Tag & Taxonomy Management

- Admin Users & Permissions

- Analytics

- Audit Log

- Settings (including grievance email configuration, branding, age gate, data retention)

#### **10.2 Member restriction rules**

- **Warning**: record the issue and notify the member where appropriate. Warnings are visible to the member and to admins reviewing the member's profile.

- **Suspension**: temporarily block member access until a configured end date or admin review. Suspended members see a message explaining the suspension and how to appeal. Specify what happens to their active content: posts remain visible but locked (no new responses); event registrations are held.

- **Revocation**: deactivate access to the portal. Revoked members cannot log in. Their content (posts, responses) is soft-hidden (not visible to other members but retained in the database for moderation/legal purposes). Contact details shared via accepted connection requests are no longer accessible.

- **Blacklist**: block the account from access and flag attempts to re-register using matching verified identifiers (email, phone if collected). The system also flags registrations with matching full names from the same city as potential matches (admin reviews flagged registrations manually; this is advisory, not auto-blocking). Blacklisted user data is retained for the minimum period required by the data retention policy and any applicable legal obligations, then purged.

- Every restrictive action must require a reason (min 10 characters), be logged in the audit trail and be limited to authorized admins. An admin cannot take restrictive action against themselves.

- Provide a review/appeal route: the restriction notification includes the community support email. For serious cases (harassment, safety), the notification may omit specific details to protect reporters.

#### **10.3 Application review fields**

- Applicant identity and selected role.

- Role-specific profile data and verification indicators.

- Application status, submission date and last updated date.

- Admin decision: approve, reject or request more information.

- Approval rubric checklist (see Section 20.4).

- Private internal notes (visible only to admins, never to the applicant), applicant-facing messages, decision reason and audit history.

- ApplicationMessage thread (admin ↔ applicant back-and-forth for additional information).

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

## **11. Information Architecture and Screens**

|**Area**|**Screens / pages**|
|---|---|
|Public|Landing page; About OASIS; Join / register (with age confirmation); Login; Forgot password; Privacy notice (versioned); Community guidelines (versioned).|
|Applicant|Role-specific registration; email verification (with resend and expiry handling); application submitted; application status (with message thread for additional info); additional-information response.|
|Member|Dashboard; global search/results (with pagination and zero-result state); member profile/directory; post detail (with edit/delete for own posts); create question/suggestion; submit achievement; mentor profile/request; my connections (active connections, incoming/outgoing requests, shared contact info); events list/detail/registration (with waitlist); notifications; planner/calendar; my tasks; profile/settings (with privacy and notification preferences); contact admin.|
|Admin|Admin login (with MFA); overview; application queue/review (with claim/lock); member list/detail; roles and restrictions; post/report moderation; achievement queue; event builder/registrations/waitlist; announcement composer; tag/taxonomy manager; analytics; audit log; settings (including branding, grievance email, data retention, age gate).|



#### **11.1 Dashboard priority**

The member dashboard should prioritize: (1) global search, (2) current announcements/notifications, (3) active achievement banners, (4) upcoming events, (5) mentor discovery and relevant community content, and (6) planner tasks due soon.

"Relevant community content" on the dashboard is determined by: posts matching the member's areas of interest, posts from members in the same city, and most-recent posts. This is a simple tag-and-recency-based approach, not a recommendation engine.

The layout should remain usable on small screens.

## **12. Data Model (Logical)**

|**Entity**|**Key fields / relationships**|
|---|---|
|User|id, email (unique), password_hash, primary_role, additional_roles[], account_status (enum: pending_verification, pending_approval, active, suspended, revoked, blacklisted), mfa_enabled, mfa_secret, created_at, last_login_at, time_zone|
|Application|id, user_id, submitted_profile_snapshot, status (enum: pending, approved, rejected, info_requested, withdrawn), submitted_at, reviewed_by, claimed_by, claimed_at, reviewed_at, decision_reason|
|ApplicationMessage|id, application_id, author_id, author_type (enum: admin, applicant), body, attachments[], is_internal_note (boolean; true = admin-only), created_at|
|ConsentRecord|id, user_id, document_type (enum: privacy_notice, community_guidelines), document_version, accepted_at, ip_address|
|Profile|user_id, name, location (city, state, country), bio (max 500), profile_photo_url, profile_visibility_settings (JSON: field-level visibility map), contact_preferences (JSON: share_on_connection fields), role-specific attributes|
|Startup|id, name, industry, stage, product_summary, website, location, created_by, created_at|
|StartupMember|id, startup_id, user_id, role_in_startup|
|ExpertiseTag|id, name, category, status (enum: active, retired), created_by, created_at; many-to-many relationships with profiles and posts|
|Post|id, author_id, type (enum: question, suggestion), title (max 200), body (max 10000), category, status (enum: published, hidden, deleted), is_resolved (boolean), resolved_answer_id, original_body (retained on edit), edited_at, created_at, updated_at|
|PostResponse|id, post_id, author_id, body (max 5000), status (enum: published, hidden, deleted), created_at|
|Achievement|id, author_id, title, description (max 500), media_url, media_type, status (enum: pending_review, approved, rejected, expired, archived), submitted_at, approved_at, expires_at (= approved_at + 24h), rejection_reason|
|ConnectionRequest|id, sender_id, recipient_id, message, status (enum: pending, accepted, declined, expired, cancelled), created_at, responded_at, expires_at (= created_at + 14d)|
|MemberBlock|id, blocker_id, blocked_id, created_at|
|Event|id, title, description, start_at, end_at, venue_or_link, meeting_link (visible only to registrants), capacity, waitlist_enabled (boolean), registration_deadline, visibility (enum: all_members, specific_roles, invite_only), visible_to_roles[], status (enum: draft, published, cancelled, archived, completed), created_by, updated_at|
|EventFormField|id, event_id, field_label, field_type, required, options, display_order|
|EventRegistration|id, event_id, user_id, responses (JSON), status (enum: registered, waitlisted, cancelled, promoted), waitlist_position, checked_in_at, registered_at, cancelled_at|
|Task|id, owner_id, title (max 200), notes (max 2000), due_at, priority (enum: low, normal, high), status (enum: open, completed, archived), reminder_at, created_at, updated_at|
|Notification|id, type, title, body, delivery_channel (enum: in_app, email, both), created_at|
|NotificationDelivery|id, notification_id, recipient_id, read_at, delivered_at, delivery_status (enum: pending, sent, failed, bounced)|
|NotificationPreference|id, user_id, notification_type, channel_email (boolean), channel_in_app (boolean), is_essential (boolean; essential prefs cannot be disabled)|
|ContentReport|id, reporter_id, target_type (enum: post, response, achievement, profile), target_id, reason_category (enum: spam, harassment, misinformation, other), reason_detail, status (enum: pending, reviewed, resolved, dismissed), resolved_by, resolved_at, resolution_notes|
|Restriction|id, user_id, type (enum: warning, suspension, revocation, blacklist), reason, issued_by, issued_at, expires_at (for suspensions), resolved_at, resolved_by|
|AuditLog|id, actor_id, action, target_type, target_id, reason, ip_address, timestamp, metadata (JSON)|
|InviteLink|id, email, name, pre_approved_role, token (unique, non-guessable), status (enum: pending, used, expired), registered_user_id (nullable), created_at, expires_at, used_at|

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

This is a logical model, not a finalized database schema. Engineering should define constraints, indexes, deletion/retention behavior and migration strategy during technical design.

### **12.1 Enum reference**

For clarity, the following status enums are defined:

|**Entity**|**Status values**|
|---|---|
|User.account_status|pending_verification, pending_approval, active, suspended, revoked, blacklisted|
|Application.status|pending, approved, rejected, info_requested, withdrawn|
|Post.status|published, hidden, deleted|
|Achievement.status|pending_review, approved, rejected, expired, archived|
|ConnectionRequest.status|pending, accepted, declined, expired, cancelled|
|Event.status|draft, published, cancelled, archived, completed|
|EventRegistration.status|registered, waitlisted, cancelled, promoted|
|Task.status|open, completed, archived|
|ContentReport.status|pending, reviewed, resolved, dismissed|
|Restriction.type|warning, suspension, revocation, blacklist|
|ExpertiseTag.status|active, retired|
|InviteLink.status|pending, used, expired|



## **13. Non-Functional Requirements**

|**Category**|**Requirement**|
|---|---|
|Responsive UX|Support modern mobile, tablet and desktop browsers. Minimum supported: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+. Core flows should work without horizontal scrolling.|
|Performance|Target p95 under 2.5 seconds for common dashboard and search requests under expected MVP load (up to 2,000 concurrent users), excluding slow third-party services.|
|Availability|Initial target of 99.5% monthly uptime after launch, subject to hosting and operational budget. Define maintenance windows.|
|Accessibility|WCAG 2.1 AA compliance is a requirement, not an aspiration. Automated accessibility testing (e.g., axe-core) must be integrated into CI/CD. Manual keyboard and screen-reader testing required before launch.|
|Scalability|Support growth from hundreds to several thousand members without changing core architecture.|
|Maintainability|Use modular services, documented APIs (with versioning strategy: URL-based, e.g., /api/v1/), automated tests (target ≥ 70% code coverage), code review and environment-based configuration.|
|Observability|Capture application errors, failed email/notification jobs, slow queries (> 1s), authentication failures, rate-limit hits and security-relevant events. Use structured logging.|
|Backup and recovery|Automated database backups (daily full, hourly incremental). RPO: 1 hour. RTO: 4 hours. Test recovery procedure before launch.|
|Localization/time zones|Store all timestamps in UTC. Render dates in the member's configured time zone (stored in User entity).|
|File handling|Restrict uploads: profile photos max 2 MB (JPEG, PNG); achievement images max 5 MB (JPEG, PNG); application attachments max 10 MB (PDF, JPEG, PNG). Scan uploads with ClamAV or equivalent cloud-based antivirus before storage. Store files in private object storage (e.g., S3 with signed URLs). No user-accessible public URLs for uploaded files.|
|PWA behavior|Support "Add to Home Screen" with app manifest. Offline: show a branded offline page with a message. No offline data access for MVP. Push notifications via Web Push API for in-app notification delivery on mobile.|
|Job queue|Background job processing for: email sending, reminder scheduling, achievement expiry, invite link expiry, connection request expiry, waitlist promotion. Use a persistent job queue (e.g., BullMQ with Redis, or PostgreSQL-based queue).|



#### **13.1 Suggested technical baseline**

|**Layer**|**Suggested baseline**|
|---|---|
|Frontend|Next.js / React, responsive web app with PWA manifest|
|Backend API|NestJS / Node.js with API versioning (URL-based: /api/v1/)|
|Database|PostgreSQL with proper indexing and migration strategy|
|Authentication|Secure session or token-based authentication with email verification, password reset, MFA (TOTP) for admins and configurable session lifetimes|
|Search|PostgreSQL full-text search initially; dedicated search engine (e.g., Meilisearch, Typesense) only if volume or relevance needs justify it|
|Media|Object storage (S3-compatible) with signed URLs and access controls|
|Email|Transactional email provider (e.g., AWS SES, Resend, Postmark) with delivery/failure logging, retry queue, SPF/DKIM/DMARC configuration|
|Job queue|BullMQ with Redis, or pg-boss for PostgreSQL-native queuing|
|Hosting/operations|Managed or cloud-hosted deployment, TLS everywhere, automated backups, application monitoring (e.g., Sentry), uptime monitoring, and separate staging/production environments|

These are recommendations, not fixed vendor commitments. Confirm stack, hosting and service costs before implementation.

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

## **14. Security, Privacy and Governance**

#### **14.1 Security requirements**

- Enforce authorization on every protected backend route and data query; hiding a button is not access control.

- Use bcrypt (cost factor ≥ 12) or Argon2id for password hashing. Protect sessions with HttpOnly, Secure, SameSite cookies. Use cryptographically random tokens for password reset (expire after 1 hour, single-use).

- Require MFA (TOTP) for all admin accounts. MFA setup is mandatory during admin account creation or promotion.

- Implement CSRF protection on all state-changing endpoints (double-submit cookie or synchronizer token pattern).

- Set Content Security Policy (CSP) headers to mitigate XSS. Use strict CSP: no inline scripts, no eval.

- Rate-limit login (5 attempts per 15 minutes per IP+email), registration (3 per hour per IP), search (60 per minute per user), public endpoints (30 per minute per IP), and connection requests (10 per 24 hours per user). Return 429 with Retry-After header.

- Use server-side validation on all inputs. Apply output encoding (HTML entity encoding for all user-generated content rendered in HTML).

- Restrict file uploads by type (whitelist MIME types), size (see Section 13) and scan with antivirus. Store in private object storage; serve via signed, time-limited URLs.

- Configure SPF, DKIM and DMARC for the sending domain. Monitor for email bounces and delivery failures.

- Keep admin audit logs for approvals, rejections, role changes, suspensions, blacklisting, content moderation, settings changes, data exports and private data access. Audit logs are append-only.

#### **14.2 Privacy requirements**

- Collect the minimum data needed; explain purpose and visibility at collection time.

- Default phone numbers and personal contact details to private; give users explicit visibility controls with field-level granularity.

- Publish versioned privacy notice and community guidelines. Record each user's acceptance with version ID and timestamp in the ConsentRecord entity. When documents are updated, prompt members to re-accept on next login.

- Define data retention periods:

|**Data type**|**Retention period**|**Notes**|
|---|---|---|
|Active member data|Duration of membership + 30 days after deletion request|Includes profile, posts, tasks|
|Rejected applications|90 days after rejection|Then permanently deleted|
|Content reports|1 year after resolution|For pattern analysis|
|Audit logs|3 years|Regulatory compliance; append-only|
|Blacklist records|Duration of blacklist + appeal period|Legal basis: legitimate interest in community safety|
|Inactive accounts (no login)|12 months of inactivity → warning email; 15 months → deactivation|Member can reactivate by logging in within the warning period|

- Avoid publicly displaying grievance communications or internal moderation notes.

- When a member's account is revoked or deleted:
  - Posts and responses they authored are anonymized (author shown as "Former Member") but content is retained unless the member requests full content deletion.
  - Contact details previously shared via accepted connections are immediately revoked (recipients see "contact info no longer available").
  - Personal tasks are permanently deleted.
  - Event registrations are cancelled.
  - Profile is removed from search and directory.

#### **14.3 Right to deletion and data export**

- Members can request account deletion from their profile settings. Deletion is processed within 30 days.
- On deletion request, the system: anonymizes authored content, permanently deletes personal data (profile, tasks, preferences, contact details), retains audit log entries (with actor anonymized), and sends a confirmation email.
- Members can request a data export (JSON format) of their personal data: profile, posts, responses, tasks, event registrations, connection history and notification preferences. Export is available as a downloadable file within 48 hours of request.

#### **14.4 Breach response**

- Define and document an incident response plan before production launch.
- In the event of a confirmed data breach: notify affected users within 72 hours with a description of the breach, the data involved, and recommended actions. Notify relevant regulatory authorities as required by applicable law. Document the incident, response timeline and remediation in the audit log.

#### **14.5 Minimum age**

- The platform requires users to be 18 years of age or older.
- Registration includes a mandatory age confirmation checkbox.
- If the community operates in India, confirm obligations under the Digital Personal Data Protection (DPDP) Act, 2023 with legal counsel before launch. If members may be under 18, verifiable parental consent mechanisms are required.

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

## **15. Notifications and Email**

|**Trigger**|**Recipient**|**Channel**|**Essential?**|**Priority**|
|---|---|---|---|---|
|Application submitted|Applicant|Email + status page|Yes|P0|
|New application|Admin group|In-app + email|Yes|P0|
|Application decision (approve/reject)|Applicant|Email|Yes|P0|
|More information requested|Applicant|Email + status page|Yes|P0|
|Applicant responded to info request|Reviewing admin|In-app + email|Yes|P0|
|New announcement|Target audience|In-app; email if selected|Yes|P0|
|Event registration confirmation|Registrant|In-app + email|No|P0|
|Event reminder (24h and 1h before)|Registrant|Per preference|No|P0|
|Event updated (time/venue change)|Registrants + waitlist|In-app + email|Yes|P0|
|Event cancelled|Registrants + waitlist|In-app + email|Yes|P0|
|Waitlist promotion|Promoted member|In-app + email|Yes|P0|
|Connection request received|Recipient|In-app|No|P0|
|Connection request accepted/declined|Sender|In-app|No|P0|
|Connection request expired|Sender|In-app|No|P0|
|Someone replied to your post|Post author|Per preference|No|P0|
|Achievement approved|Author|In-app|No|P0|
|Achievement rejected|Author|In-app + email|Yes|P0|
|Task reminder|Task owner|Per preference|No|P0|
|Moderation/restriction action|Affected member|Email|Yes|P0|
|Content report resolved|Reporter|In-app|No|P1|
|Account suspension warning|Member|Email|Yes|P0|
|Inactive account warning (12 months)|Member|Email|Yes|P0|
|Terms/privacy notice updated|All members|In-app (re-accept prompt)|Yes|P0|
|Invite link (migration)|Existing member|Email|Yes|P0|



Notification templates should be editable where practical, branded consistently and avoid including sensitive profile or grievance information.

**Email reliability**: configure SPF, DKIM and DMARC. Monitor bounce rates. Failed email sends are retried with exponential backoff (max 3 retries over 24 hours). Permanently bounced addresses are flagged for admin review.

## **16. Analytics and Reporting**

- **Membership**: total active members, role distribution, applications by status, approval turnaround (median and p90), migration adoption rate.

- **Engagement**: active members (DAU, WAU, MAU), profile completion rate, searches performed, zero-result search rate, posts created, responses created and connection requests (sent, accepted, declined, expired).

- **Events**: views, registrations, cancellations, waitlist joins, capacity utilization and attendance where tracked.

- **Planner**: tasks created/completed and reminder delivery status, aggregated to avoid exposing private task content to admins.

- **Moderation**: reports received, time to resolution (median and p90), content removed and account restrictions issued.

- **Privacy**: admin analytics must not reveal private planner details or private contact fields without a legitimate, authorized reason.

## **17. MVP Scope and Roadmap**

|**Release**|**Scope**|**P0 Requirements Covered**|**Exit condition**|
|---|---|---|---|
|Phase 0 — Discovery/design|Confirm roles, fields, community rules, privacy approach (including age gate and consent versioning), wireframes, taxonomy, email provider, approval rubric, admin bootstrap process and migration plan.|—|Stakeholders approve PRD, UX flows, permission matrix and acceptance criteria.|
|Phase 1 — MVP foundation|Authentication (with password policy, session management, email-change flow), role-specific registration (with age confirmation), email verification, pending status, admin approval (with claim/lock and rubric), protected member access, profiles, directory, admin console (with MFA), admin permission levels (Super Admin + Moderator), audit logging, member restrictions (suspend/revoke/blacklist), pre-approved member import and invite links, standalone transactional email service, consent recording.|AUTH-01 to AUTH-13, PROF-01, PROF-02, PROF-04, PROF-05, PROF-06, ADM-01 to ADM-03, ADM-05, ADM-07|End-to-end registration, approval, migration import and restriction tests pass.|
|Phase 2 — Community & connections|Global search (with pagination, zero-result handling, anti-scraping), questions/suggestions/responses (with edit, delete, resolved marker), achievement submissions and 24-hour banners, mentor discovery and connection requests (with rate limits, expiry, blocking), notifications (with preference management and all P0 triggers), content reporting and moderation, tag/taxonomy management, grievance contact.|SRCH-01 to SRCH-04, POST-01 to POST-07, ACH-01 to ACH-04, MENT-01 to MENT-04, MENT-06, NOT-01 to NOT-05, GRV-01, GRV-02, ADM-04, PROF-03|Members can publish, discover and moderate content; mentor connections work; notifications deliver correctly.|
|Phase 3 — Events and planner|Admin event/form builder (with visibility, waitlist, .ics download), registration (with waitlist and promotion), attendance tracking, event update/cancellation notifications, reminders (using job queue), personal tasks and day/week/month calendar, basic analytics.|EVT-01 to EVT-08, PLAN-01 to PLAN-05, ADM-06 (plus EVT-09, EVT-10 P1)|Event and task workflows pass acceptance tests. Job queue processes reminders reliably.|
|Phase 4 — Stabilize and launch|Security testing (penetration test), accessibility audit (WCAG 2.1 AA with axe-core + manual testing), backup/recovery drill, monitoring setup, admin training, migration execution (invite emails sent, support plan), member onboarding materials, breach-response plan finalization.|—|Release checklist approved. Recovery drill passed. Production monitoring active. Migration invites sent.|
|Later releases|Advanced analytics, mentor appointment scheduling (MENT-05), external calendar sync (PLAN-07), .ics download (EVT-09), AI recommendations, recurring goals (PLAN-06), private messaging, Circles/Subgroups, post voting, achievement archive (ACH-05), search-result ranking improvements, paid events.|P1/P2 items|Prioritize from member feedback and usage data.|

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

Delivery dates and team estimates are intentionally not specified; they depend on the final UX, engineering capacity, integrations and acceptance of the scope.

**Scope note**: the MVP contains approximately 55 P0 requirements across 4 phases. If the team determines this exceeds capacity, the product owner must prioritize and explicitly defer items with documented rationale — not silently drop them.

## **18. Acceptance Criteria**

#### **18.1 Registration and approval**

- A new visitor can select one of the three public roles, confirm they are 18+, accept the current privacy notice and guidelines, complete the relevant form and verify their email.

- An expired email verification link shows a clear message with a resend option.

- After submission, the application is marked Pending, a non-guessable reference ID is generated and the applicant receives confirmation.

- An admin can claim an application (locking it from other admins), approve, reject or request more information, and see an audit record of the decision.

- When additional information is requested, the applicant can respond. The back-and-forth is visible as a message thread. Internal admin notes are never visible to the applicant.

- An unapproved applicant cannot access the member directory, posts, event registration or planner by manually entering a protected URL or calling the API directly.

- A rejected applicant cannot reapply before the cooling-off period expires.

#### **18.2 Migration**

- An admin can upload a CSV of pre-approved members and the system generates invite links.

- A pre-approved member can register via invite link without admin approval.

- An expired invite link falls back to the standard registration flow with expedited approval.

#### **18.3 Profiles and search**

- An approved member can log in, complete their profile and search approved members and published content.

- Search results are paginated. Zero-result queries show a helpful message.

- A member's private fields (phone, email by default) are not returned in search results or profile API responses unless the viewer has accepted-connection access.

- Profile visibility defaults are applied on account creation (phone = private, email = private).

- Co-founders registering with the same startup name are prompted to link to the existing Startup entity.

#### **18.4 Content**

- A member can submit a question or suggestion (within character limits), and another member can respond; reported content reaches the moderation queue with a reason category.

- A member can edit their own post within 24 hours; the post shows an "edited" indicator and the original text is retained.

- A member can delete their own post; responses remain visible with "original post removed."

- An admin can hide/remove content, record a reason, and the content author is notified.

- An approved achievement appears in the dashboard banner and automatically expires 24 hours after approval (UTC).

- The achievement author is notified on both approval and rejection.

#### **18.5 Connections**

- A member can discover a mentor and send a connection/guidance request without automatically exposing private contact information.

- A member cannot send more than 10 connection requests in a 24-hour window.

- A duplicate request to the same recipient is blocked while a prior request is pending.

- A request not responded to within 14 days expires and the sender is notified.

- A member can block another member, preventing further requests and full profile visibility.

#### **18.6 Events**

- An admin can create an event with custom form fields, visibility settings, capacity and waitlist, publish it, view registrations and export the attendee list (with formula-injection-safe CSV).

- A member can register for an event and see it on their portal calendar.

- When capacity is reached, a member can join the waitlist. When a spot opens, the next waitlisted member is promoted and notified.

- When an admin updates or cancels an event, all registrants and waitlisted members are notified and their calendars update.

- Online meeting links are visible only to registered members.

#### **18.7 Planner**

- A member can create, edit, complete and delete a private task; another member cannot view that task.

- Task reminders are delivered according to the member's notification preferences.

#### **18.8 Admin and security**

- An admin must set up MFA before accessing the admin console.

- An admin can issue a warning, suspend, revoke or blacklist a member, and the access restriction is enforced server-side. A reason is required.

- An admin cannot modify their own role or take restrictive action against themselves.

- The audit log records all admin actions and is append-only.

- Admin permission levels (Super Admin / Moderator) control access to admin functions.

#### **18.9 Grievance and support**

- A member can reach the configured OASIS support/grievance email from the portal. On mobile, the in-app contact form is available as a fallback.

#### **18.10 General**

- The portal works on Chrome 90+, Firefox 90+, Safari 15+ and Edge 90+, on both mobile and desktop.

- Key forms display clear validation and error messages.

- WCAG 2.1 AA automated tests pass. Keyboard navigation and screen-reader testing are completed.

#### **18.11 Search test queries**

Define a minimum set of 20 representative test queries covering:
- Name search (partial and full)
- Expertise/skill keyword search
- Industry/sector filter
- Location-based search
- Question/suggestion keyword search
- Event title search
- Tag-based filtering

Each query must return relevant results (precision ≥ 80% for the top 10 results) or an appropriate zero-result message.

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

## **19. Migration and Launch Plan**

#### **19.1 Migration strategy**

OASIS has 650+ existing members who currently use WhatsApp for community coordination. The portal must successfully transition these members without:
- Flooding the admin approval queue
- Losing community trust during the transition
- Creating a "ghost town" effect if adoption is slow

#### **19.2 Pre-launch preparation**

1. **Member list compilation**: Admins compile a CSV of existing members (name, email, role). This list is reviewed and cleaned (remove duplicates, verify emails) before import.

2. **Pre-approved import**: Admins upload the CSV to the admin console. The system creates InviteLink records for each entry with status = pending.

3. **Communication plan**: Announce the portal launch on WhatsApp groups 2 weeks before, 1 week before and on launch day. Include a FAQ document addressing: why the portal exists, what changes, what stays the same, and how to register.

4. **Support readiness**: Designate 2–3 admins/moderators to handle registration issues during the first 2 weeks.

#### **19.3 Launch sequence**

1. **Week 0 (launch day)**: Send invite emails to all pre-approved members with unique, time-limited registration links (default expiry: 14 days). Invite email includes a direct link, brief instructions and a support contact.

2. **Week 1–2**: Monitor adoption rate daily. Send a reminder email to members who haven't registered. Post daily reminders in WhatsApp groups with registration stats ("X of 650 members have joined!").

3. **Week 3–4**: Final reminder to non-registered members. After invite expiry, remaining members can use the standard registration flow; their email is matched against the pre-approved list for expedited (24-hour) admin approval.

4. **Week 5+**: Evaluate migration adoption against the 60% target. If below target, conduct a brief survey to identify barriers.

#### **19.4 WhatsApp transition**

- WhatsApp groups remain active as a supplementary channel during and after launch.
- Portal becomes the source of truth for: profiles, posts/questions, events, achievements and tasks.
- Encourage members to post questions/suggestions on the portal instead of WhatsApp by: pinning a message in WhatsApp groups redirecting to the portal, and having admins respond to WhatsApp questions with "great question — please post this on OASIS ONE so the answer is searchable!"
- Track WhatsApp reduction qualitatively via admin observation and optional member survey at 60 and 90 days.

#### **19.5 Historical knowledge migration**

- For MVP, historical WhatsApp content is not automatically imported.
- Admins may manually curate and post the most valuable Q&A and resources from WhatsApp as "pinned" or "featured" posts on the portal during the first 30 days.
- A future release may support bulk content import if demand justifies it.

## **20. Admin Safeguards and Governance**

#### **20.1 Admin bootstrap (first admin creation)**

The very first admin account is created during initial platform deployment using a secure setup process:

1. During first deployment, the system checks if any admin account exists.
2. If no admin exists, the system displays a one-time setup page (accessible only from the server's local network or via a time-limited setup token set as an environment variable).
3. The setup page requires: full name, email, password (meeting policy), and MFA setup (TOTP).
4. On completion, the account is created as Super Admin and the setup route is permanently disabled.
5. All subsequent admin accounts are created by existing Super Admins through the admin console.

#### **20.2 Admin offboarding**

- When an admin leaves the organization, a Super Admin must revoke their admin privileges.
- Revoking admin privileges converts the account to a standard member (if applicable) or deactivates it.
- All active application claims held by the departing admin are released.
- The action is recorded in the audit log.
- The system must always have at least one active Super Admin. If the last Super Admin attempts to deactivate their own account, the action is blocked with a message.

#### **20.3 Conflict of interest**

- An admin cannot approve or reject their own application (not applicable in normal flow, but relevant if an admin is demoted and reapplies).
- An admin cannot take moderation action on their own posts, achievements or content reports.
- An admin cannot take restrictive action (warning, suspension, revocation, blacklist) against themselves.
- All admin actions are logged with actor ID; patterns of self-serving actions can be audited.

#### **20.4 Application approval rubric**

Admins must evaluate applications against a standardized checklist (configurable in admin settings):

|**Criterion**|**Check**|
|---|---|
|Identity plausibility|Name, email and profile photo (if provided) appear genuine|
|Role alignment|Selected role matches the information provided (e.g., a "Founder" has a startup name and description)|
|Profile completeness|Required fields are filled with substantive content (not placeholder text)|
|Professional presence|LinkedIn or website (if provided) is accessible and consistent with the application|
|Community fit|Introduction and interests align with OASIS community purpose|
|No red flags|No indicators of spam, fraud, duplicate accounts or previous blacklisting|

The rubric is advisory, not a scoring system. Admins record their decision reason, which the audit log retains.

#### **20.5 Concurrent review protection**

- When an admin opens an application for review, the application is "claimed" (locked) to that admin.
- Other admins see the claim indicator and the claiming admin's name.
- The claim auto-releases after 15 minutes of inactivity (no actions on the application page).
- An admin can manually release a claim.
- A Super Admin can override another admin's claim if needed (logged in audit trail).

OASIS ONE PRD • v1.2 • 15 October 2026

**OASIS  |  COMMUNITY PORTAL  |  PRODUCT REQUIREMENTS**

## **21. Dependencies, Assumptions and Open Decisions**

#### **21.1 Assumptions**

- The initial product is a responsive web portal/PWA, not separate native apps.

- There are three public registration roles and one privileged Admin role (with Super Admin and Moderator levels).

- All member applications require admin approval before private access is granted, except pre-approved members imported via the migration process.

- WhatsApp remains a supplementary communication channel; the portal becomes the source of truth for searchable profiles, posts, events and tasks.

- The support/grievance email address will be supplied by OASIS before launch. A separate oversight email for admin-misconduct complaints will also be configured.

- The platform requires users to be 18 years of age or older.

- Funding opportunities are discoverable through member expertise, posts and any admin-published listings; the MVP does not promise funding or verify every external opportunity automatically.

- The team includes or has access to: a product owner (for priority decisions), at least 2 designated admins (for launch-week support) and legal counsel (for privacy notice and DPDP Act review).

#### **21.2 Decisions to finalize before development**

|**Decision**|**Recommended default**|**Status**|
|---|---|---|
|Application rejection cooldown|30 days before reapplication is permitted|Recommended; confirm with stakeholders|
|Mentor verification|Admin review of profile and professional links; verification badge assigned by admin. Unverified mentors are labeled "Unverified" in search results.|Recommended|
|Achievement moderation|All achievements require admin approval before the banner is published. No auto-approve mode for MVP.|Decided (v1.2)|
|Achievement archive|Retain in archive only under the published retention/consent policy.|Recommended|
|Search visibility|Only approved, published content and profile fields explicitly marked visible.|Decided (v1.2)|
|Admin roles|Super Admin (full access) and Moderator (content and member management only).|Decided (v1.2)|
|Calendar reminders|In-app and email reminders; user-configurable timing and time zone. Default preferences applied on account creation.|Decided (v1.2)|
|Grievance handling|Email-based with mobile fallback form for MVP; add a secure case-management module only if volume requires it.|Recommended|
|External calendar sync|Defer until the portal's own calendar is stable. Provide .ics download as an interim solution.|Recommended|
|Branding|Finalize logo, color palette, typography and domain before UI implementation.|Pending|
|Paid events|Not supported in MVP. If needed, add payment integration in a later release.|Decided (v1.2)|
|DPDP Act compliance|Confirm current obligations with legal counsel before launch.|Pending — blocker|
|Content policy|Draft and publish a content policy covering: prohibited content, fraudulent funding claims, investor solicitation rules and moderation appeal process.|Pending — blocker|

#### **21.3 Deferred features**

The following features are explicitly deferred and should not be designed into the MVP architecture unless doing so has negligible cost:

|**Feature**|**Why deferred**|**When to reconsider**|
|---|---|---|
|Circles / Subgroups|Requires dedicated permissions, content scoping and admin management. MVP uses tags/interests to approximate topic grouping.|When membership exceeds 2,000 or community requests formal sub-communities|
|Resources / Opportunities|Needs a dedicated entity, publisher workflow and admin tooling. MVP handles these as regular posts tagged with a "Resource" or "Opportunity" category.|When admins need structured opportunity publishing (e.g., funding calls with deadlines)|
|In-app messaging|Significant infrastructure (WebSocket, message storage, moderation). Connections share contact info instead.|When member survey shows strong demand or WhatsApp dependency is not reduced|
|AI-based mentor matching|Requires usage data, matching algorithm and trust calibration.|After 6+ months of mentor-connection data|
|Post voting / reputation|Needs thoughtful design to avoid gamification and bias.|After community content patterns are understood|

## **Appendix A — Suggested MVP Navigation**

|**Member navigation**|**Admin navigation**|
|---|---|
|Dashboard|Overview|
|Search|Applications|
|Community|Members|
|Mentors|Posts & Reports|
|My Connections|Achievements|
|Events|Events & Forms|
|Planner & Calendar|Announcements|
|Notifications|Tags & Taxonomy|
|My Profile / Settings|Analytics & Audit Log|
|Contact OASIS|Settings & Admin Permissions|



## **Appendix B — Product Definition**

OASIS ONE — One Community. Infinite Possibilities.

OASIS ONE is a role-based, admin-approved digital community designed to help entrepreneurs discover relevant people and knowledge, ask for support, celebrate milestones, join events and organize their entrepreneurial work in one searchable, trusted environment.

## **Appendix C — Role-Permission Matrix**

|**Resource**|**Aspiring Entrepreneur**|**Founder / Co-Founder**|**Mentor / Advisor**|**Moderator (Admin)**|**Super Admin**|
|---|---|---|---|---|---|
|Own profile|Read, Edit|Read, Edit|Read, Edit|Read, Edit|Read, Edit|
|Other profiles (visible fields)|Read|Read|Read|Read|Read, Edit-any|
|Other profiles (private fields)|None|None|None|Read (with audit)|Read (with audit)|
|Posts|Create, Read, Edit-own, Delete-own|Create, Read, Edit-own, Delete-own|Create, Read, Edit-own, Delete-own|Read, Edit-any, Hide, Delete-any|Read, Edit-any, Hide, Delete-any|
|Post responses|Create, Read, Edit-own, Delete-own|Create, Read, Edit-own, Delete-own|Create, Read, Edit-own, Delete-own|Read, Edit-any, Hide, Delete-any|Read, Edit-any, Hide, Delete-any|
|Achievements|Create, Read-own|Create, Read-own|Create, Read-own|Read-all, Approve, Reject, Remove|Read-all, Approve, Reject, Remove|
|Events|Read, Register|Read, Register|Read, Register|Read, Create, Edit, Cancel, Archive|Read, Create, Edit, Cancel, Archive|
|Event registrations|Create-own, Cancel-own, Read-own|Create-own, Cancel-own, Read-own|Create-own, Cancel-own, Read-own|Read-all, Export|Read-all, Export|
|Personal tasks|CRUD-own|CRUD-own|CRUD-own|CRUD-own|CRUD-own|
|Connection requests|Send, Read-own|Send, Read-own|Send, Receive, Read-own|Send, Read-own|Send, Read-own, Read-all (with audit)|
|Content reports|Create|Create|Create|Read, Resolve, Dismiss|Read, Resolve, Dismiss|
|Announcements|Read|Read|Read|Create, Edit, Read|Create, Edit, Delete, Read|
|Applications|None|None|None|Read, Review (claim), Decide|Read, Review (claim), Decide|
|Member management|None|None|None|Read, Warn, Suspend|Read, Warn, Suspend, Revoke, Blacklist, Change-role|
|Admin users|None|None|None|None|Create, Edit, Deactivate|
|Audit log|None|None|None|None|Read|
|Settings|None|None|None|None|Read, Edit|
|Tag taxonomy|None|None|None|Read, Create, Edit|Read, Create, Edit, Delete, Merge|
|Analytics|None|None|None|Read (limited)|Read (full)|
|Data export (member's own)|Read-own|Read-own|Read-own|Read-own|Read-own|



Notes:
- "Edit-own" = can edit only resources they created.
- "Edit-any" = can edit any resource of that type.
- "With audit" = access is logged in the audit trail.
- "CRUD-own" = Create, Read, Edit, Delete for own resources only.
- Moderators cannot manage other admins, audit logs or platform settings.

OASIS ONE PRD • v1.2 • 15 October 2026
