# OASIS ONE — Frontend Build Prompt (premium UI/UX)

> Paste this into your AI coding tool (Claude Code, Cursor, etc.) with `OASIS_ONE_PRD_v1.2.md` attached and `OASIS_ONE_BRAND_KIT.zip` unzipped into `frontend/public/brand/`.
> A separate backend prompt builds the API. The contract in §9 is how the two connect.

---

## 1. Mission

You are a senior product designer and staff frontend engineer. Build the complete frontend for **OASIS ONE** — *"One Community. Infinite Possibilities."* — a mobile-first, role-based, admin-approved portal for an entrepreneur community of 650+ members (aspiring entrepreneurs, founders/co-founders, mentors/advisors, and admins).

- The attached PRD is the source of truth for behavior, fields, limits, states and permissions. Read it fully before writing code.
- This prompt is the source of truth for look and feel, structure and API wiring.
- Do **not** build a backend. Build against the contract in §9 and ship a mock mode so the whole UI is demoable on day one.
- The bar: it should feel like the UI of a well-funded product. Calm, confident, fast and distinctive. Not a template.
- **Core flow:** everyone except admins signs up (email and password, or Google), fills in all their details and lands on the dashboard. Until an admin approves them the whole dashboard is **locked**. The moment they are approved it **unlocks with a one-time animation**, live, with no refresh, because the app listens on a WebSocket (§6A).

---

## 2. Stack (fixed)

- Next.js 14+ (App Router), React 18+, TypeScript `strict`, pnpm. Project folder: `frontend/`.
- Tailwind CSS driven by CSS-variable design tokens. shadcn/ui (Radix primitives) as the base, **restyled heavily** to the brand so nothing looks like default shadcn.
- Framer Motion (animation), lucide-react (icons), TanStack Query v5 (server state), React Hook Form + Zod (forms), date-fns + date-fns-tz (time zones), cmdk (command palette), sonner (toasts), next-themes (light/dark), Recharts (admin charts), @dnd-kit (event form builder), Serwist or next-pwa (PWA).
- `socket.io-client` for realtime (§6A). MSW for mock mode. Playwright + @axe-core/playwright for tests.
- No auth tokens in localStorage. Auth is an HttpOnly cookie managed by the backend.

---

## 3. Design system

### 3.1 Concept
Derived from the OASIS logo (`brand/oasis-logo.png`): midnight indigo-navy, hairline champagne-gold linework and warm ivory. Think astrolabe or observatory: precise, quiet, premium. The logo's 12-point compass star and thin double ring are the signature motif, so lean on 1px gold hairlines, radial geometry and generous space instead of heavy shadows or fills. The community is Odisha's startup community, so the landing page and footer carry "Odisha · Startup Community". Navy is a flat deep indigo (never a gradient that drifts into purple) and gold is flat (never metallic or glossy).

### 3.2 Tokens (implement as CSS variables + Tailwind theme)

These values were sampled from the logo and then checked for WCAG 2.1 AA (22 text and UI pairs across both themes, 0 failures). If you change a value, re-run a contrast check.

```css
:root {                       /* light theme: ivory canvas, navy ink */
  --bg:#FBF7EE; --surface:#FFFFFF; --surface-2:#F4EEDF;
  --primary-soft:#ECE7D8; --accent-soft:#F6EBD3;
  --border:#D9CDAE;           /* decorative hairlines */
  --border-strong:#978E77;    /* input borders (3:1) */
  --text:#1E1F33; --muted:#656482;
  --primary:#1E1F33; --primary-hover:#303143; --on-primary:#FCF6E3;
  --accent:#86601F;           /* gold for text, icons and focus rings on light surfaces */
  --accent-fill:#E9C68C;      /* filled gold chips/badges, always with navy text */
  --success:#187952; --warning:#B83E0B; --danger:#B64536; --info:#296DAC;
  --brand-navy:#1E1F33; --brand-gold:#F3D3A2; --brand-cream:#FCF6E3;  /* logo colors, fixed in both themes */
  --radius-sm:10px; --radius-md:14px; --radius-lg:20px; --radius-xl:28px;
  --shadow-1:0 1px 2px rgb(30 31 51/.06),0 1px 1px rgb(30 31 51/.04);
  --shadow-2:0 8px 24px -8px rgb(30 31 51/.18),0 2px 6px rgb(30 31 51/.06);
  --shadow-3:0 24px 60px -20px rgb(30 31 51/.35);
}
.dark {                       /* dark theme: the logo's own navy */
  --bg:#1E1F33; --surface:#2C2C3F; --surface-2:#343547;
  --primary-soft:#3A363F; --accent-soft:#32303C;
  --border:#4B4C5C; --border-strong:#757596;
  --text:#FCF6E3; --muted:#A9A7C4;
  --primary:#E9C68C; --primary-hover:#F3D3A2; --on-primary:#1E1F33;
  --accent:#F3D3A2; --accent-fill:#E9C68C;
  --success:#5FD3A3; --warning:#FF9A5A; --danger:#FF8A7A; --info:#7DB4F0;
}
```

Rules for using the tokens:
- **Chrome is always brand navy.** The sidebar, the top brand bar, the landing hero, the auth brand panel and the footer use `--brand-navy` with `--brand-gold` hairlines in both themes, so the supplied logo is used unmodified.
- **Gold on light surfaces.** The raw logo gold is only 1.3:1 on ivory, so it is decorative there (hairlines). For text, icons and focus rings on light surfaces use `--accent`, a deeper antique gold derived from the logo gold.
- **Warning is orange on purpose.** It must never be confused with gold. Always pair status colors with an icon and a text label.

### 3.3 Typography (via `next/font`)
- Display and headings: **Jost** (geometric sans, weights 300–500), matching the light, wide-set lettering in the logo. Use uppercase with about 0.18em tracking for eyebrows, labels and the "OASIS" wordmark text. Use sentence case with tight tracking for headlines and big numbers.
- UI/body: **Inter** (or Geist).
- Mono: **JetBrains Mono** for reference IDs, case IDs and codes.
- Scale: 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 64. Body 16px with 1.6 line height. Use light weights only at 22px and above.

### 3.4 Surfaces and components
- Cards: 16–20px radius, 1px hairline border (`--border`), soft layered shadow in the light theme, no shadow and a lighter surface in the dark theme. On hover or focus, an optional 1px gold hairline (`--brand-gold` on navy surfaces, `--accent` on light). No heavy drop shadows.
- Primary button: filled `--primary` (navy in the light theme, champagne gold in the dark theme) with `--on-primary` text. Secondary: 1px outline. Filled gold (`--accent-fill`) is for highlights only: verified-mentor badges, achievement cards, featured items. Everywhere else gold is a hairline, an icon or a text accent.
- Role identity: avatar with a thin ring per role (Aspiring = ivory hairline, Founder = gold hairline, Mentor = double gold hairline with a tiny star notch). Role chip beside the name.
- Mentor verification: gold shield badge for verified; muted outlined "Unverified" chip otherwise.
- Inputs: 48px tall, floating or top labels, inline validation, live character counters wherever the PRD gives a limit.
- Skeleton loaders (shimmer) for every data view. Never a bare spinner on a page; the small inline loading indicator is the logo's compass star turning slowly.
- Empty states: custom illustrations built from the logo's motif (the 12-point star, concentric rings, compass ticks) in gold hairlines, drawn in code, with one sentence of guidance and one clear action.
- Data tables (admin): sticky header, dense rows, column filters, keyboard navigable, row actions in a menu.
- Texture: a very subtle grain overlay and a soft radial glow of lighter navy behind hero areas. No stock photos. Generate artwork as SVG/CSS.

### 3.5 Motion
- 150–250ms ease-out for micro-interactions. Spring for sheets and drawers.
- Page transitions: fade + 8px rise. List items stagger in once, not on every re-render.
- Shared-layout animation for tab underlines and the active-nav pill.
- Achievement banner: auto-advancing carousel with progress bar. It pauses on hover and focus.
- Brand motion: on the landing hero the compass star draws in (stroke-dashoffset, about 1.2s) and then rotates very slowly (one turn per 60s). The active nav item is marked by a 1px gold hairline that slides between items.
- Always respect `prefers-reduced-motion` (disable parallax, stagger, autoplay and the star rotation).

### 3.6 Avoid
Gradients that drift into purple (brand navy stays a flat deep indigo), glossy or metallic gold effects (gold is flat hairline and fill), recoloring, stretching, outlining or adding effects to the logo, generic "AI SaaS" hero styling, emoji as icons, lorem ipsum, default shadcn look, cramped mobile layouts, tiny tap targets (< 44px), and modals where a page or drawer would do.

### 3.7 Logo and brand assets
The company logo is supplied (gold line art on navy: a ring, a 12-point compass star, "OASIS" and "Odisha · Startup Community"). Unzip `OASIS_ONE_BRAND_KIT.zip` into `frontend/public/brand/` and use the files unmodified.

- **Files:** `oasis-logo.png` (full lockup), `oasis-mark.png` (ring and star only), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon.ico`, `favicon-32.png`, `favicon-16.png`, `og-image.png` (1200×630), `oasis-logo-email.png`. See `brand/README.md`.
- **Always on navy.** The logo has no light-background version. Place it only on brand-navy surfaces (see the chrome rule in §3.2), never directly on ivory or white.
- **`<BrandLockup>` component** with variants: `full` (the supplied PNG, minimum 160px wide; below that the tagline is unreadable), `mark` (ring and star, minimum 24px) and `wordmark` (mark + "OASIS" set in Jost uppercase with 0.18em tracking + a small gold "ONE" tag). Clear space around the logo equals the height of the "O" in OASIS. Never recolor, stretch, rotate or add effects.
- **Rendering:** use `next/image` with explicit width and height, with `priority` on the landing and auth pages. The PNG is 1024px, so cap its displayed size at about 480px until a vector (SVG) master is supplied, then swap it in behind the same component.
- **Wire-up:** favicons and `apple-touch-icon` in `<head>`, manifest icons (192, 512, maskable 512), `og:image` and `twitter:image` pointing at `og-image.png` with `summary_large_image`.
- **Product name:** the logo says "OASIS" and the product is "OASIS ONE". Default: show the logo as supplied and use "OASIS ONE" as the product name in page titles and in the `wordmark` variant. Keep the name in one constant so it can change.

### 3.8 Simplicity and craft rules (this must not look like generated UI)

**Simple for the member**
- Every screen answers one question: "What is this page for, and what do I do next?" One primary action per screen. Everything else is secondary or tucked into a menu.
- Show less. If removing an element would not hurt a member, remove it. Lists on summary pages show at most 3 items with a "See all" link. Members never see charts, KPIs or metrics.
- Plain words: "Ask a question", "Find a mentor", "My tasks", "Events". No jargon ("ecosystem", "synergy", "leverage", "touchpoint"). Explain every state in a sentence ("With the admins for review. We usually reply within 2 days.").
- Only five main destinations (§4). Everything else is a tab inside a page or in the avatar menu.
- Forms: one column, labels above fields, only the fields the PRD requires on each step, visible progress, and errors that say how to fix the problem.
- Empty states say what to do next in one sentence and one button.

**Craft, not a template**
- Hold a strict system: a 4px spacing scale (4/8/12/16/24/32/48/64), one radius family (§3.2), one icon set (lucide) at one stroke width (1.5) in two sizes (16 and 20), a 12-column grid with a 1200px maximum content width, and the same card anatomy everywhere (title row, content, optional footer link).
- At most two font weights on a screen. Build hierarchy from size, spacing and the muted color, not from bold everywhere or boxes inside boxes.
- Separate things with whitespace and hairlines, not with shadows and colored blocks. Use gold sparingly: at most one filled-gold element per viewport.
- Motion only where §3.5 defines it.
- Style reference in spirit: quiet product UI like Linear, Stripe's dashboard or Things. Not a landing-page template.

**Banned (these are the tells of generated UI)**
- Centered gradient hero blobs, glowing orbs, neon, glassmorphism everywhere, mesh-gradient backgrounds, floating 3D shapes, stock illustrations.
- Rows of three identical icon-in-a-circle cards with generic headings, bento grids with no content reason, "Trusted by" walls of invented logos.
- Emoji, sparkle icons, "AI-powered" badges, fake testimonials, invented statistics. The only real number on the landing page is 650+ members.
- Marketing clichés: "Unlock", "Supercharge", "Elevate", "Seamless", "Revolutionize", "Empower", "Next-gen", "Game-changer", "the future of…", and exclamation marks.
- Lorem ipsum, "John Doe", "Acme", "Example Inc", and rows of identical cards.

**Voice and real content**
- Calm, direct and warm, as if written by someone who knows this community. Sentence case, short sentences. Examples: "Ask the community a question." "Your application is with the admins. We usually reply within 2 days." "You're registered. We'll remind you the day before."
- Mock data must feel real: Odisha places (Bhubaneswar, Cuttack, Rourkela, Sambalpur, Berhampur), plausible Indian names, believable startups and DeepTech topics, realistic dates, and varied text lengths.
- Write every label, empty state, error message and email yourself. Never leave default library text.

**Self-review before calling a screen done**
- Screenshot every key page at 360px and 1440px in both themes. For each, answer: What is this page for? What is the one thing to do? Is that clear within 5 seconds? What can I delete?
- Squint test: the hierarchy must still be visible when the page is blurred. Alignment test: every edge sits on the grid.
- Fix anything that could belong to any SaaS site. It should look like OASIS: navy, gold hairlines, the star motif, Odisha.

---

## 4. Layout and navigation

- **Desktop (≥1024px):** collapsible left sidebar in brand navy with the logo at the top (icon + label), top bar with the global search field (⌘K / Ctrl+K opens a command palette), a **New** menu (Ask a question, Share an achievement, Add a task), a notification bell with unread badge, and the avatar menu (profile and settings, My connections, Contact OASIS, theme, sign out).
- **Mobile:** sticky bottom tab bar with the same five destinations as desktop: Home, Community, People, Events, Planner. A "+" button in the top bar opens the same New menu. The avatar menu holds profile and settings, My connections, Contact OASIS and theme.
- **Member nav (simplified from PRD Appendix A to five destinations):** Home (dashboard), Community (questions, suggestions, achievements), People (tabs: Mentors, Directory, My connections), Events, Planner & Calendar. Global search and the notification bell live in the top bar. Profile/settings, Contact OASIS and sign-out live in the avatar menu. Routes: `/dashboard`, `/community`, `/people`, `/events`, `/planner`, `/search`, `/notifications`, `/settings`, `/contact`.
- **Admin console:** a separate route group `/admin` with its own denser "console" layout (a deeper `--brand-navy` background variant, left nav, breadcrumb, command palette). Nav per PRD §10.1.
- Layout must hold at 360px width with no horizontal scroll. 16px gutters.

---

## 5. Screens (build all; behavior and fields per the PRD)

### 5.1 Public
- **Landing:** immersive brand-navy hero (Jost headline "One Community. Infinite Possibilities.", an "ODISHA · STARTUP COMMUNITY" eyebrow, the supplied logo, and a large faint copy of the logo's 12-point star in gold hairlines that draws in and slowly rotates, with gentle parallax), live-feeling stat strip (650+ members), three role cards, "How it works" (Apply → Get approved → Connect), trust section (approved membership, privacy controls), FAQ, footer (logo, "Odisha · Startup Community", versioned Privacy and Community Guidelines links).
- **Join:** role picker as three large cards (hover tilt, keyboard selectable). Then a **multi-step wizard**: Role → Account (email/password or **Continue with Google**) → role-specific form (PRD §8.2 / 8.3 / 8.4 exactly: fields, enums, limits, required flags) → Age confirmation + consent (links to versioned documents) → Review & submit. Step progress indicator, per-step validation, draft kept in `sessionStorage` (non-sensitive fields only). If age is not confirmed, block with a respectful explanation. Detect the browser time zone and send it as `timeZone`. The optional photo (≤2 MB) and mentor verification evidence (≤10 MB, PDF/JPEG/PNG) upload first through `POST /uploads` and are then referenced by id. A phone number, if entered, is saved unverified and verified later by OTP in Settings. After submitting, the member is signed in and goes straight to the **locked dashboard** (§5.2), where a banner asks them to verify their email. If the API answers `409`, the email already has an account: say so plainly ("This email already has an account.") and offer Log in and Reset password. With **Google**, the member picks a role, continues with Google, and returns to `/register/complete`, which shows the same role-specific form, age confirmation and consent (the Account step is skipped; name and email come from Google).
- **Login**, **Forgot/Reset password**, **Verify email** (expired link state with Resend, queued-email notice), **Invite landing** (`/invite/[token]`: pre-filled shortened form, expired-invite fallback message).
- **Static legal pages** (versioned privacy notice and community guidelines fetched from the API).

### 5.2 Locked dashboard (signed in, waiting for approval)
Everyone except admins can sign up, fill in all their details and land here. It is the real member layout (sidebar, top bar and the four dashboard blocks of §5.3) in **locked mode**, so the member sees what is coming and nothing looks empty or broken.

- **What is live:**
  1. A status card at the top: a three-step timeline (Submitted → In review → Decision), the reference ID in mono with a Copy button, and one sentence of status ("With the admins for review. We usually reply within 2 days.").
  2. The admin message thread inline ("Messages from the admins", composer, attachment, optimistic send). New admin messages arrive live.
  3. When information is requested: a banner ("The admins need a little more information.") and an **Edit my details** form (the role-specific fields, saved with `PATCH /applications/me`).
  4. When the email is unverified: a banner with **Resend verification email**, explaining that review starts once the email is verified.
  5. **Withdraw application**, with a confirmation step.
  6. Contact OASIS and sign out in the avatar menu.
- **What is locked:** the search field, the announcement and achievement slots, Upcoming events, My tasks, For you, the Get started card, the "New" menu, the notification bell and every nav item except Home. Locked blocks keep their real layout and show **static placeholder content drawn by the frontend** (generic skeleton rows with a small lock badge and one sentence: "Unlocks when an admin approves your application."). Never fetch member data in locked mode, and never hide real data behind a CSS blur: the API returns nothing to pending users, so there is nothing to leak and no 403s to handle.
- **Locked controls:** nav items and buttons show a lock icon, stay focusable, use `aria-disabled="true"`, and open a small popover on click or Enter ("Available after approval") instead of navigating. Screen readers hear "Locked until your application is approved".
- **Routing:** in locked mode only `/dashboard`, `/application` (the full status page with the same content as the status card), `/contact` and public pages are reachable. Any other member route redirects to `/dashboard`.
- **Rejected or withdrawn:** go to `/application`, which shows the decision, the reapply-eligible date and a Reapply action (not the locked dashboard).
- **Live updates:** approval, a request for information, new admin messages and a decision all appear without a refresh over the WebSocket (§6A). If the socket is down, poll `/auth/me` every 30 seconds while locked.

#### Unlock animation (plays once, on approval)
- **Trigger:** `GET /auth/me` returns `accountStatus=active` and `showUnlockAnimation=true`. This happens either live (the `account.status_changed` event arrives while the member is on the page and the client refetches `/auth/me`) or on their next sign-in if they were away. The server remembers it, so it plays **once per member, on any device**. Call `POST /me/unlock-seen` as soon as the animation starts, and use a `BroadcastChannel` so a second open tab does not play it as well.
- **Sequence (about 2.5 s in total):**
  1. The page dims slightly while the compass star from the logo draws itself once and turns a quarter turn, with a gold hairline sweeping across the top bar.
  2. The lock badges on the nav items and blocks release in a staggered spring, left to right and top to bottom, 40 ms apart.
  3. The placeholders cross-fade into the real content, which was prefetched while the animation ran.
  4. A calm headline fades in, "You're in, Priya. Welcome to OASIS.", and the **Get started** card is gently highlighted.
  It never blocks the page: Esc, any click or a visible Skip link ends it immediately.
- **Reduced motion:** no sweep, rotation or stagger. Do a single 200 ms cross-fade and show the same welcome headline (it still counts as seen).
- **After it:** the normal member app, with notifications, search and navigation fully enabled. Never replay it, including on refresh, on another device, or after a later suspension and restoration.
- **Dev and mock mode:** a dev-only page `/dev/unlock` flips the mock account to approved and resets the seen flag, so the animation can be replayed during development only.

### 5.3 Member
- **Dashboard (Home)** — deliberately simple. It keeps the PRD §11.1 priorities but compresses them into four calm blocks:
  1. **Greeting and search:** a time-of-day greeting ("Good morning, Priya") and one large search field ("Search people, questions and events"). Above it, only when they exist: a single slim, dismissible announcement bar (`GET /announcements/active`) and one achievement card at a time ("expires in 14h", auto-advancing, hidden when there are none).
  2. **Next up:** two equal cards side by side (stacked on mobile). **Upcoming events** shows at most 3 (date block, title, Register or Registered). **My tasks** shows at most 3 due soon (tick to complete, inline "Add task").
  3. **For you:** one section with a two-option switch, Mentors | Questions, showing at most 3 cards each (Questions come from `GET /posts?feed=relevant`).
  4. **Get started** card on the first visit only: three steps (complete your profile, join an event, ask a question) that disappears once done.

  No charts, counters or notification feed on this page (notifications live in the bell). The search field is the one primary action. Every block has a title, at most 3 items, a "See all" link and a one-sentence empty state with a button. On mobile the blocks stack in PRD order: search, announcement, achievement, events, For you, tasks.
- **Search:** results grouped into People / Questions & Suggestions / Events with counts, filter chips, pagination (20/page) and total count. Zero-result state with suggestion chips. ⌘K palette offers quick jumps and recent searches.
- **Directory and profile:** filterable people grid/list (role, sector, expertise, location). Profile page shows only fields the owner made visible. Fields hidden by privacy never render, not even as empty placeholders. Actions: **Request guidance/Connect appears only on active mentor/advisor profiles** (use `viewer.canConnect` and `viewer.connectionStatus` from the API and show Pending / Connected states), plus Block and Report on any profile. A blocked viewer sees a generic "profile unavailable" page.
- **Community:** feed of questions and suggestions with category/tag filters, "Resolved" indicator, post detail with responses, edit-within-24h with "edited" badge, delete (own), report, mark resolved/accepted answer. Character counters (title 200 / body 10,000 / response 5,000).
- **Achievements:** submit form (≤500 chars, optional JPEG/PNG ≤5 MB) with a "pending review" state. "My achievements" list showing status.
- **Mentors:** discovery with expertise/sector/location filters, verified badge, availability. **Connect modal** with message, shows remaining quota (10 per 24h) and a clear message on duplicate-pending or rate-limit (use `retryAfterSeconds`).
- **My Connections:** tabs Incoming / Outgoing / Active. Accept/decline/cancel. Shows shared contact info only after acceptance, plus a prompt to update privacy settings when nothing is shareable. Expiry countdown on pending requests (14 days).
- **Events:** list (cards with date block, capacity meter, waitlist badge), detail page with registration drawer rendering the admin-configured dynamic form, "Join waitlist" when full with position display, cancel registration, Add to calendar (.ics). Meeting link only appears after registration.
- **Planner and calendar:** day / week / month views built in-house with date-fns. OASIS events (gold) and personal tasks (navy/ivory outline) are visually distinct. Task quick-add (Enter to add), edit drawer, priority, due date/time, reminder, complete with satisfying check animation. Tasks are private. A task can be marked as a **Deadline** (funding or opportunity deadline, PRD §9.1) through `kind`, shown with a flag icon. Keyboard shortcuts (T = today, ←/→ navigate, N = new task).
- **Notifications:** popover + full page, grouped by day, unread dot, mark-as-read / mark-all-read, pagination.
- **Settings** (tabs): Profile (edit; fields flagged for review show a "pending review" chip; phone number with OTP verification; for mentors, an availability control: active/paused, optional max mentees, preferred contact method), **Privacy** (field-level visibility toggles with a live "how others see you" preview and share-on-connection toggles), **Notifications** (essential items shown locked with a lock icon and tooltip; a Web Push toggle that registers the service worker and calls `POST /me/push-subscription`; a weekly-digest toggle that is off by default), **Security** (change password, change email with verification, and a list of active sessions with sign-out per session via `/me/sessions`), **Blocked members**, **Data & account** (request JSON export with status, delete account with typed-confirmation).
- **Contact OASIS:** accessible from every authenticated page. Offers a `mailto:` link and an in-app form (fallback on mobile). Shows the generated Case ID (`OASIS-GRV-YYYY-XXXX`) on success. Option to route an admin-misconduct concern.
- **Terms re-acceptance gate:** if `pendingConsents` is non-empty, show a non-dismissible re-accept modal (versioned documents) before anything else.

### 5.4 Admin console (`/admin`)
- **Login → MFA:** TOTP setup (QR + manual key) on first login; code entry on later ones. Nothing in `/admin` renders until MFA is verified.
- **Overview:** a "Needs your attention" list (applications waiting, reports to review, aging items), each row one click from action, plus at most four small numbers. No charts here; those live in Analytics.
- **Applications:** queue with status tabs, search, aging indicators, an **Expedited** chip for pre-approved-list matches (24h target) and claimed-by chips. **Review screen** is a split pane: applicant data and verification links on the left; on the right the message thread, private internal notes (visually distinct, "admin only"), the **approval rubric checklist** (PRD §20.4) and a sticky decision bar (Approve / Reject / Request info with required reason). **Claim banner** shows the lock, calls `claim` on open and every 60s as a heartbeat, and shows a 15-minute inactivity countdown. A Super Admin can override another admin's claim.
- **Members:** table with filters, member detail, role change (Super Admin only), restrictions (warning / suspension / revocation / blacklist) with required reason (≥10 chars) and clear consequence copy per PRD §10.2. Mentor verification badge control. Pending profile-change reviews.
- **Posts & Reports:** moderation queue for posts and responses, reason categories, resolve or dismiss with notes, hide/restore with reason (`/admin/posts/:id/...` and `/admin/responses/:id/...`).
- **Achievements:** queue with image preview, approve, reject or remove (reason).
- **Events:** list, **event builder** (details, visibility: all/roles/invite-only (invite-only shows an invitee picker), capacity, waitlist toggle, deadline, drag-to-reorder custom form fields), registrations tab with waitlist and check-in, CSV export button (shows that exports are audited).
- **Announcements:** composer with audience selector and live preview.
- **Taxonomy:** add, rename, merge, retire tags.
- **Migration:** CSV upload with a validation preview (duplicates, bad emails) before confirming. Invite list with status, resend, and an adoption progress bar toward the 60% target.
- **Analytics:** charts per PRD §16. Planner data is aggregate only.
- **Audit log** (Super Admin): filterable, read-only table. **Settings** and **Admin users** (Super Admin): cooling-off days, grievance/oversight emails, rubric, retention, age gate. Creating an admin sends a set-password link, and MFA enrolment is forced at first sign-in.
- **Legal documents** (Super Admin): list versions and publish a new privacy notice or community guidelines version, which triggers the re-accept gate for every member.
- Moderators must not see Super-Admin-only nav items or actions. Hide them in the UI **and** handle 403s gracefully (the backend is the real gatekeeper).

### 5.5 System states (all must exist and look designed)
Suspended page (shows the reason and the appeal route from `GET /me/restrictions`), inactivity-deactivated message, revoked/blacklisted message on login, expired invite, expired verification link, session-expired dialog, offline page (PWA), 404, 500, rate-limited (toast with live countdown from `retryAfterSeconds`), conflict/duplicate messages.

---

## 6. Routing and auth state machine

Fetch `GET /auth/me` once at the root (TanStack Query, shared). Route by state:

| State | Destination |
|---|---|
| Not signed in | Public routes only; protected routes redirect to `/login?next=` |
| `applicationStatus=not_started` (a new Google user who has not filled in their details) | `/register/complete` |
| `accountStatus` is `pending_verification` or `pending_approval`, and `applicationStatus` is `pending` or `info_requested` | `/dashboard` in **locked mode** (§5.2); an unverified email only adds a banner |
| `applicationStatus` is `rejected` or `withdrawn` | `/application` (decision, reapply date, Reapply action) |
| `accountStatus=active` | member app; if `pendingConsents` → blocking modal first; then, if `showUnlockAnimation`, play the unlock animation once (§5.2) |
| Navigating to `/admin/*` with `mfaVerified=false` (admins can still use the member app without MFA) | `/admin/mfa` |
| `suspended` | `/suspended` |
| `revoked` / `blacklisted` / `deactivated` | `/login` with a clear message (deactivated means inactivity; contact support) |

Use Next.js middleware only for coarse redirects. Admin-only accounts can have `primaryRole=null`; render them in the member shell without a role chip. `/verify-email` is only the landing page for the emailed link (and the resend action); it is never a gate. Real authorization is the backend's job. Handle API `401` (→ login), `403 ACCOUNT_STATE` (→ route by `details.status`), `403 MFA_REQUIRED` (→ `/admin/mfa`) globally in the API client.

**Google sign-in:** the "Continue with Google" button simply does `window.location.href = '/api/v1/auth/google'` (append `?invite=<token>` on invite pages and `&next=` when relevant). Never handle Google secrets or tokens in the frontend. The backend redirects back to `/auth/callback`, which calls `/auth/me` and routes per the table above.

---

## 6A. Realtime (WebSocket)

Use WebSockets wherever a member or admin would otherwise have to refresh. The protocol is in the contract (§9): Socket.IO, path `/socket.io`, namespace `/ws`, cookie-authenticated, and events are signals that carry ids only.

- **Client:** `lib/realtime/` holds one shared `socket.io-client` instance. Connect after `/auth/me` succeeds (for locked applicants too), disconnect on sign-out, use `withCredentials: true` and automatic reconnection with backoff. The URL comes from `NEXT_PUBLIC_WS_URL`: in development `http://localhost:4000` (Next.js rewrites do not proxy WebSockets), in production the same origin, with the reverse proxy forwarding `/socket.io/`.
- **Pattern:** a small event map turns each server event into TanStack Query invalidations, so REST stays the source of truth. Never put event payload data straight into the UI. Components subscribe through a `useRealtime(event, handler)` hook, and rooms such as `post:{id}` and `event:{id}` are joined on mount and left on unmount with `room.join` and `room.leave`.
- **Where it is used:**

| Event | What the UI does |
|---|---|
| `account.status_changed` | Refetch `/auth/me`. Approval plays the unlock animation (§5.2); rejection or a request for information updates the status card. |
| `application.message` | Refresh the message thread (applicant and admin sides). |
| `notification.new` | Bell badge and list update instantly, with a small toast. |
| `connection.updated` | Refresh My connections and the badge. |
| `event.updated` | Refresh the event (capacity meter, waitlist position, cancelled banner). A waitlist promotion shows a toast. |
| `post.response_added` | On an open question, show a "1 new reply" pill that loads it on click. |
| `achievement.live`, `announcement.new` | Refresh the dashboard slots. |
| `legal.updated` | Refetch `/auth/me` and show the re-accept gate. |
| `session.revoked` | Clear caches and go to `/login` with the reason. |
| `admin.application.new`, `admin.application.claim`, `admin.counts` | Live queue, "being reviewed by Anita" chips, sidebar counts and a small toast. |

- **Not realtime:** search, forms, uploads, analytics and everything else stay plain REST.
- **Resilience:** on reconnect, refetch the active queries (events may have been missed). While the socket is down, poll `/auth/me` every 30 s when locked and `/notifications/unread-count` every 60 s otherwise. The admin console shows a small connection dot (green, amber while reconnecting, red).
- **Mock mode:** `lib/mocks/realtime.ts` provides an in-memory emitter with the same `useRealtime` API, plus a dev-only panel at `/dev/realtime` to fire any event, so every live behavior can be tested without a backend.
- No sounds. Respect `prefers-reduced-motion` for toasts and pills.

---

## 7. Accessibility, performance, quality

- WCAG 2.1 AA. Visible focus rings, full keyboard navigation, semantic landmarks, labelled form controls, `aria-live` for toasts and async results, focus trapping and return in dialogs and drawers, 44px minimum tap targets, no color-only meaning.
- Chrome/Edge 90+, Firefox 90+, Safari 15+. Test iOS Safari behavior (viewport units, safe-area insets, `position: sticky`).
- Performance: LCP < 2.5s on mid-range mobile. Use `next/image`, route-level code splitting, lazy-load admin and chart bundles, prefetch on hover, virtualize long lists, keep initial JS lean.
- All timestamps render in the member's `timeZone` (fallback to browser time zone).
- Optimistic updates for tasks, reads, accept/decline and responses, with rollback on error.
- PWA: manifest with the supplied icons (192, 512, maskable 512), `theme_color` and `background_color` `#1E1F33`, "Add to Home Screen", and a branded offline page (navy, logo, one sentence). No offline data for MVP.
- Content is escaped by default. Never use `dangerouslySetInnerHTML` with user content.
- Public pages: proper metadata, an Open Graph image, a sitemap, and `robots` rules that exclude `/admin` and member routes.
- Branding: the logo, palette and typography are final inputs (§3.7). The domain is still pending, so never hardcode it.

---

## 8. Suggested structure

```
frontend/
  src/
    app/
      (public)/            landing, join, login, invite/[token], legal/[type]
      (applicant)/         application, verify-email, register/complete
      (member)/            dashboard, search, community, mentors, connections,
                           events, planner, notifications, settings, contact
      (admin)/admin/       mfa, overview, applications, members, reports,
                           achievements, events, announcements, taxonomy,
                           migration, analytics, audit-log, settings, admins
      auth/callback/       Google return route
      dev/                 dev-only pages: /dev/unlock, /dev/realtime (never in production builds)
    components/ui/         restyled primitives
    components/            feature components (cards, banners, calendar, forms)
    lib/api/               typed client, endpoint modules, zod schemas, error types
    lib/auth/              session hook, route guards
    lib/realtime/          socket client, useRealtime hook, event-to-query map
    lib/mocks/             MSW handlers + realistic seed data (Odisha cities, believable people and startups, DeepTech topics; see §3.8)
    styles/                tokens.css, globals.css
  tests/                   playwright + axe
  public/brand/            supplied logo kit (unzipped); also manifest, offline page
```

---

## 9. API integration

Build a typed API layer in `lib/api/` that mirrors the contract below exactly (one module per resource, Zod-validated responses, a single `ApiError` class carrying `code`, `fields`, `retryAfterSeconds`). Attach `X-CSRF-Token` to every non-GET request. Always `credentials: 'include'`.

- `NEXT_PUBLIC_USE_MOCKS=true` → MSW serves the contract with realistic seed data, so the full UI works without a backend. Include seed accounts for each state (pending applicant, info-requested, active member per role, moderator, super admin, suspended).
- `NEXT_PUBLIC_USE_MOCKS=false` → real backend. In `next.config.js`, add rewrites: `/api/:path*` → `${API_URL}/api/:path*` (default `API_URL=http://localhost:4000`) so cookies stay first-party and CORS is not needed in the browser. The WebSocket is the exception: it connects through `NEXT_PUBLIC_WS_URL` (§6A).
- Env: `NEXT_PUBLIC_APP_URL`, `API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_USE_MOCKS`.
- The API client refreshes the CSRF token once and retries when it gets `403 FORBIDDEN` with `details.reason = "csrf"`.
- Uploads: send files to `POST /uploads` (`purpose` = profile_photo | application_attachment | verification_evidence) and pass the returned ids to the endpoint that needs them.
- Analytics: a tiny fire-and-forget `lib/analytics.ts` posts `{ name, props }` to `POST /analytics/events` for `search_result_open`, `event_view`, `profile_view` and `connect_click`. Never send free text or personal data, and never block the UI on it.

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

If you need an endpoint or field that is not in the contract, add it to a `lib/api/CONTRACT_CHANGES.md` file (method, path, request/response shape, reason) instead of silently inventing it. The backend will reconcile from that file.

---

## 10. Order of work

1. Project setup, tokens, fonts, theme (light/dark), primitives, layout shells (public / member / admin), mock mode.
2. Landing, Join wizard, Login, Google button, verify-email, invite flow, the locked dashboard mode with the application status card and thread, the auth state machine, the realtime client, and the unlock animation (testable at `/dev/unlock`).
3. Dashboard, search + command palette, directory/profile, privacy and settings.
4. Community feed, post detail, achievements banner, mentors, connections.
5. Events, planner/calendar, notifications.
6. Admin console (MFA, applications review, members, moderation, events builder, announcements, taxonomy, migration, analytics, audit log, settings).
7. Polish pass: empty/error states, motion, a11y audit, performance, PWA, Playwright + axe tests, and the slop review in §3.8 on every key page.

Show me the design system page (`/design`, dev-only: tokens, logo lockups, buttons, cards, inputs, badges, skeletons, empty states, dark mode) after step 1 before continuing.

---

## 11. Definition of done

- [ ] Every PRD screen in §11 exists, is responsive from 360px up, and works in light and dark mode.
- [ ] Every list has loading, empty and error states. Every form has inline validation and character counters where the PRD sets limits.
- [ ] Auth state machine (§6) works for all account states. Google button, invite flow and expired-link states are handled.
- [ ] Rate limits (429), duplicates (409) and validation errors (422) surface clearly with the backend's messages.
- [ ] Private fields never render when the API omits them. Admin-only UI never appears for non-admins.
- [ ] axe-core reports zero serious/critical violations on key pages. Keyboard-only walkthrough of registration, search, connect, event registration and task creation passes.
- [ ] Mock mode and real-backend mode both run with `pnpm dev`. `pnpm build`, `pnpm lint` and `pnpm typecheck` pass.
- [ ] Uploads, phone OTP, the sessions list, the restrictions page and the analytics tracker all call contract endpoints (no invented routes).
- [ ] The supplied logo is used unmodified and only on brand navy. Every token pair passes WCAG AA in light and dark (the 22 pairs in §3.2 were pre-verified; re-check if you change a value).
- [ ] Dashboard has at most four blocks, at most 3 items per block and one primary action, and a first-time user can say what to do next within 5 seconds.
- [ ] Navigation has exactly five main destinations. No banned pattern from §3.8 appears anywhere, all copy and mock data are written by hand, and the self-review in §3.8 is done for every key page.
- [ ] A new user (email or Google) signs up, fills in all details and lands on the locked dashboard. Locked mode fetches no member data, locked controls are focusable with `aria-disabled`, and every other member route redirects to `/dashboard`.
- [ ] Approval unlocks the dashboard live over the WebSocket with the one-time animation (including Skip and reduced motion), and it never replays after a refresh, in another tab or on another device.
- [ ] Realtime works for every row of the §6A table, reconnects cleanly, falls back to polling, and has a mock-mode emitter.
- [ ] README explains setup, env vars, mock mode, and how to switch to the real backend.
