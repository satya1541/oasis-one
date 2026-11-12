# Task: Redesign my Join / onboarding flow to match the attached prototype

## Context
I have an existing 4-step Join flow (React + Tailwind + Framer Motion): Role → Account → Role-specific details → Review & submit → pending application.
`join-flow-reference.html` is a **working visual and behaviour prototype** (plain HTML/CSS/JS). Open it in a browser and click through all steps before writing code.

Rebuild its look and motion inside my existing codebase, using my components, routing, state and styling conventions. **Do not paste the HTML in.** The reference embeds the photos as base64; use the separate files in `join-assets/`.

My Join code lives in: `[PATH TO MY JOIN PAGE / COMPONENTS]`

## Do not change
- API contract and payload for `POST /api/v1/auth/register` and `/api/v1/uploads`
- Field names: founder (`startupName, founderRole, stage, website, linkedin, description, isRegistered, uploadedEvidence`), aspiring (`ideaDomain, description, city, linkedin`), mentor (`currentCompany, jobTitle, yearsExperience, linkedin, description, supportingEvidence`)
- sessionStorage keys `oasis_reg_role`, `oasis_reg_details`, `oasis_reg_name`
- Server behaviour: `accountStatus: 'pending_approval'`, Application `status: 'pending'`, admin queue routing
- My existing display font and Tailwind theme (the prototype uses Fraunces + Instrument Sans only as stand-ins)

## Design tokens
- Background `#03080B`, text `#F5FAF6`, muted `rgba(236,241,239,.75)`
- Accent per role: founder `#88DECC`, aspiring `#A78BFA`, mentor `#F3D3A2`
- Expose the active accent as a CSS variable `--accent` on the flow root. Register it with `@property` (syntax `<color>`) and give it a `.7s` transition so every accent-coloured element morphs together.
- Easing `cubic-bezier(.2,.8,.2,1)`. Mono uppercase `10–11px` labels as already used in my UI.

## Step 1: Role selection (expanding photo panels)
Replace the current cards (and the emoji 3D deck) with three photo panels.
- **Layout:** grid of 3 columns. No selection: `1fr 1fr 1fr`. Selected panel: `3fr` and the others `.5fr` (transition `.8s`). On mobile use rows instead of columns.
- **Photos** (`join-assets/`): Founder `role-founder.webp` (position `47% 22%`), Aspiring `role-aspiring.webp` (`85% 30%`), Mentor `role-mentor.webp` (`80% 30%`).
- **Idle:** photo is grayscale + dark (`grayscale(1) brightness(.5)`), bottom gradient shade, title, one-line subtitle, 3 tag pills, empty radio ring top-right. Hover brightens slightly.
- **On select:** a full-colour copy of the photo is revealed with a circular `clip-path` expanding from the exact click point (`.9s`), settling from `scale(1.14)` to `1`. The panel gets an accent border and glow, and a soft accent radial wash floods in. The page background gets an accent glow, and stepper segment 1 fills with the accent.
- **Other panels:** collapse to slim strips showing only a vertical role name and an accent dot. Hover lifts the text colour.
- **Open panel content:** title, subtitle, "Next we'll ask for" + 3 bullets (founder: startup name and stage / website and LinkedIn / incorporation proof if you have it; aspiring: sector / problem / city; mentor: company and title / years of experience / LinkedIn), and the button **"Continue as {Role}"**.
- **Mis-click guard (important):** the Continue button is invisible and non-interactive until the expansion finishes (~800ms). Switching role resets this. This is the fix for users picking the wrong role by clicking through too fast.
- Images stay completely still: no pointer parallax, no slow zoom drift.
- A11y: group `role="radiogroup"`, each panel `role="radio"` with `aria-checked`, `tabIndex=0`, Enter/Space selects, arrow keys move selection, `aria-live` announces "Selected: …". Respect `prefers-reduced-motion` (drop transitions).
- Restore a previously saved role from `oasis_reg_role` on load.

## Steps 2–4: split layout that fits ONE screen (desktop ≥ 761px)
- Flow root: `height: 100svh`, flex column, `overflow: hidden`. Stepper + step label on top, then a grid `5fr / 6fr` with a 20px gap that fills the remaining height. **No page scroll on desktop.**
- **Left hero** (full height, rounded 28px, accent border + glow): the chosen role's photo in colour, still. Bottom gradient shade plus accent radial. Entrance: `clip-path: circle(0% → 150% at 50% 45%)`, 1s.
  - Contents: role chip with a "Change" link (returns to Step 1, selection kept), a headline per step:
    - Step 2: founder "Your venture, in front of the right people." / aspiring "Every company starts with an idea like yours." / mentor "Your experience, where it matters most." (plus the role's 3 tags)
    - Step 3: founder "Show us what you're building." / aspiring "Tell us where your idea starts." / mentor "Show us the experience founders will lean on."
    - Step 4: "Almost there."
  - Steps 3–4 also show a **live profile card** (accent avatar with the initial, name, auto-generated headline such as "Founder / CEO @ Startup", a progress bar and "X of Y required answers"). It updates as the user types. Headline fallbacks: "Founder @ Your startup", "Mentor @ Your organisation", "Aspiring entrepreneur · {sector}".
- **Right form sheet** (glass, padding 24–36px): 2-column grid, `12px 14px` gap. Short inputs take half width. Chips, toggle, textarea and file upload span both columns. Buttons are pinned to the bottom (`margin-top:auto`). Add a fallback `overflow:auto` with the scrollbar hidden.
- **Compact sizing:** inputs ~44px tall, chips `13px`, textarea 64px (no resize), upload is a single row, the 20-character counter sits in the label row. At `max-height: 820px`, hide the lead paragraph and tighten padding.
- **Polish:** fields enter with a staggered fade-up (55ms apart). Focus gives a `0 0 0 4px` accent ring at 16% opacity. The primary button has an arrow icon and a light gloss sweep on hover. Invalid fields shake once and show an inline error.
- **Mobile (< 761px):** single column, hero becomes a 170px banner (chip + headline only), and the page may scroll.

### Step 2: Account
Continue with Google (wire to my real OAuth, not the demo fill), Full name, Email, Password with show/hide and a 4-bar strength meter. If signed in with Google, hide the password and show "Use a password instead".

### Step 3: Role-specific details
Use my existing field set and validation. Required fields and rules:
- URL must start with `https://`; LinkedIn must match `linkedin.com/in/...` (required for founder and mentor, optional but validated for aspiring); descriptions need 20+ characters; selects and chips are required where the architecture says so.
- Founder "Company status" toggle uses short labels **Registered / Early stage**. The small text beside the label changes ("Pvt Ltd, LLP, MSME or DPIIT" vs "MVP or website proof"), and so does the upload hint.
- City uses my existing Google Places `LocationAutocomplete` (the prototype's datalist is only a stand-in).
- File upload: accept PDF/PNG/JPG up to 10 MB, drag and drop supported, and a list of files with status and Remove. **Drive the status from the real `/api/v1/uploads` response** (scanning → verified or the server's rejection reason). The prototype's 1.1s timer is fake.

### Step 4: Review and submit
Sections for Account and Details with **Edit** links back to Steps 2 and 3, rows compact with long answers clamped to 2 lines, and 3 compliance checkboxes (accuracy, Terms and Privacy, committee review). Submit stays disabled until all three are ticked. The headline is shown only in the hero card.

### Submitted
Centered card: animated check (SVG stroke draw), "Application submitted", "We'll email {email}…", a pulsing "Pending review · {ref}" pill, a 3-item timeline (Received ✓ / Committee review (current) / Access). Clear the three sessionStorage keys on success.

## Stepper
Four segments. Step N fills segments 1..N with the accent. Label "Step N of 4 · N×25%". Before any role is picked, segment 1 is 35% filled in neutral.

## Prototype stubs to replace with real code
1. Google button fills demo data → real OAuth
2. Upload "scan" is a timer → real upload status
3. `submitApplication()` only logs and waits 1.3s → real `POST /api/v1/auth/register` with the existing atomic payload; handle errors (re-enable the button, show the message)
4. City datalist → `LocationAutocomplete`

## Suggested order of work
1. Add `join-assets/` images to the project's public/static folder; set up the tokens and `--accent` handling.
2. Step 1 panels (including the Continue guard and keyboard support).
3. Shared split-layout shell + hero (with live profile card) for Steps 2–4.
4. Step 2, then Step 3 (data-driven field config per role), then Step 4 and the success screen.
5. QA against the checklist below.

## Acceptance checklist
- [ ] Choosing a role is unmistakable (photo colour, expansion, accent, button text) and Continue cannot be clicked until the panel settles.
- [ ] Switching role mid-way updates the accent, photo and button correctly.
- [ ] Steps 2–4 show no vertical scrollbar at 1366×768 and 1920×1080.
- [ ] Photos never move with the pointer or drift on their own.
- [ ] Refresh keeps the role and typed details; success clears them.
- [ ] Keyboard-only run-through works; reduced-motion mode has no large motion.
- [ ] Payload sent to the backend is byte-for-byte what my current implementation sends.
