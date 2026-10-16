# Design System: OASIS ONE — Odisha Startup Community

## 1. Visual Theme & Atmosphere
A quiet, authoritative, and deeply refined interface inspired by navigational astrolabes, astronomical observatories, and calm editorial instruments. Designed exclusively for 650+ founders, aspiring entrepreneurs, and mentors across Odisha (Bhubaneswar, Cuttack, Rourkela, Sambalpur, Berhampur). The visual atmosphere carries the quiet confidence of Stripe's internal tools and Linear's product UI: restrained white space, 1px champagne-gold hairlines, midnight indigo-navy structural chrome, and warm ivory reading grounds. It communicates high trust, verified membership, and enduring institutional gravity without ever veering into marketing fluff or AI-generated design clichés.

- **Density:** 5 (Daily App Balanced — generous breathing room, disciplined 4px rhythm)
- **Variance:** 6 (Offset Asymmetric — structured grids punctuated by deliberate editorial focal points)
- **Motion:** 5 (Fluid & Dignified — 150–250ms ease-out transitions, subtle spring physics, slow 60s compass star rotation)

---

## 2. Color Palette & Roles
All color pairings are mathematically calibrated and validated against WCAG 2.1 AA standards (minimum 4.5:1 for body text, 3:1 for large display and UI controls).

### Base Brand Neutrals
- **Midnight Navy** (`#1E1F33`) — Structural chrome, navigation sidebars, hero containers, and primary CTA fills. Flat deep indigo, never drifting into purple.
- **Warm Ivory Canvas** (`#FBF7EE`) — Primary background for member applications and readable content views.
- **Pure Surface White** (`#FFFFFF`) — High-elevation card surfaces, dialog boxes, and floating drawers.
- **Surface Level 2** (`#F4EEDF`) — Secondary surface, subtle contrast tiles, and active tab containers.
- **Deep Navy Ink** (`#1E1F33`) — Primary typography on ivory and white surfaces (14.2:1 contrast ratio).
- **Muted Slate Ink** (`#656482`) — Secondary typography, metadata, timestamps, and input labels (5.2:1 contrast ratio).
- **Hairline Sand Border** (`#D9CDAE`) — 1px structural hairline borders on cards, table dividers, and subtle separators.
- **Strong Input Border** (`#978E77`) — High-contrast 1px interactive form field boundaries (3.1:1 contrast).

### Accents & Signifiers
- **Champagne Gold** (`#F3D3A2`) — Logo motif color and 1px hairline accents on Midnight Navy surfaces. Strictly used as delicate lines and subtle marks; never as heavy background fills.
- **Antique Gold** (`#86601F`) — Text accents, inline icons, focus indicators, and interactive links on Ivory/White surfaces (meets 4.6:1 WCAG AA).
- **Gold Accent Fill** (`#E9C68C`) — Reserved exclusively for high-significance pill badges (e.g., "Verified Mentor", "Accepted Answer"), always rendered with Deep Navy (`#1E1F33`) typography.
- **Brand Cream** (`#FCF6E3`) — High-contrast text and icon color placed exclusively over Midnight Navy.

### Semantic Status Colors
- **Success Forest** (`#187952`) — Application approved, connected status, accepted answers, task completed.
- **Warning Ochre** (`#B83E0B`) — Application pending review, quota nearing limit, expiry countdown. Never confused with gold.
- **Danger Crimson** (`#B64536`) — Errors, rejection, suspension, destructive actions.
- **Info Azure** (`#296DAC`) — Active announcements, helpful context tips, link references.

---

## 3. Typographic Architecture
Typography reflects geometric precision paired with neutral product clarity.

- **Display & Headlines:** `Jost` (Weights: 300 Light, 400 Regular, 500 Medium) — Geometric sans-serif matching the classical wide-set lettering of the OASIS star compass. Headlines use sentence case with tight letter-spacing (-0.02em).
- **Eyebrows & Section Labels:** `Jost` (Weight: 500 Medium) — Uppercase with wide tracking (+0.18em) for categorical tags, section headers, and the "ODISHA · STARTUP COMMUNITY" brand lockup.
- **Body & Interactive UI:** `Inter` (Weights: 400 Regular, 500 Medium, 600 Semi-Bold) — Neutral, highly legible body copy, button labels, tabular data, and form fields. Line height fixed to 1.6 for comfortable reading.
- **Monospace & Reference Codes:** `JetBrains Mono` (Weights: 400 Regular, 500 Medium) — For non-guessable application reference IDs (`OASIS-APP-2026-X94B`), case tickets, timestamps, and numeric counters.

---

## 4. Component Stylings & Interaction Rules

### Brand Lockup & Logo Rules
- **Rule 1:** The OASIS compass logo (`oasis-logo.png` / `oasis-mark.png`) is gold-on-navy line art. It MUST ALWAYS sit on a Midnight Navy (`#1E1F33`) background. It is NEVER placed directly on ivory or white.
- **Variants:**
  1. `full`: Ring + 12-point star + "OASIS" + "Odisha · Startup Community" (min-width 160px).
  2. `mark`: Ring + 12-point compass star only (min-width 24px, max-width 48px).
  3. `wordmark`: Compass mark + "OASIS" in Jost uppercase (+0.18em tracking) + small gold "ONE" badge.
- **Clear Space:** Minimum clearance equal to the height of the letter "O" in OASIS on all four sides.

### Buttons & Interactive Controls
- **Primary Button:** Midnight Navy (`#1E1F33`) fill with Brand Cream (`#FCF6E3`) text. 44px min touch target, 12px rounded corners, 1px subtle hairline edge. Tactile 1px depression on active press.
- **Secondary Button:** Transparent background, 1px Hairline Sand (`#D9CDAE`) border, Deep Navy (`#1E1F33`) text. Subtle Ivory hover fill (`#F4EEDF`).
- **Accent Action (Guidance Request / Mentor Connect):** Deep Navy surface with 1px Antique Gold hairline border and Antique Gold icon.
- **Focus Rings:** 2px solid Antique Gold (`#86601F`) with 2px offset. Never suppress browser focus outlines.

### Cards & Surfaces
- **Geometry:** 16px border-radius (`rounded-2xl`), 1px solid Hairline Sand (`#D9CDAE`) border.
- **Shadow:** Ultra-soft ambient layered whisper shadow (`box-shadow: 0 1px 2px rgba(30, 31, 51, 0.05), 0 8px 24px -8px rgba(30, 31, 51, 0.08)`).
- **Hover State:** Hairline border subtly transitions to Antique Gold (30% opacity) with a gentle 2px vertical lift. No heavy fuzzy drop-shadows.

### Inputs & Forms
- **Field Height:** 48px standard height, crisp white background, 1px Strong Input border (`#978E77`), 10px rounded corners.
- **Labels:** Crisp label positioned above the input in Muted Slate (`#656482`) at 13px weight 500.
- **Focus State:** 1px border shift to Midnight Navy with a subtle 3px Antique Gold focus halo (`rgba(134, 96, 31, 0.15)`).
- **Validation:** Clear, friendly inline error copy rendered below the input with an alert icon in Danger Crimson (`#B64536`).
- **Counters:** Live character counters (`0 / 1000`) in JetBrains Mono at 12px.

### Badges & Role Enclosures
- **Aspiring Entrepreneur:** Crisp Ivory fill (`#F4EEDF`), Deep Navy text, 1px Hairline border (`#D9CDAE`).
- **Founder / Co-founder:** Midnight Navy fill (`#1E1F33`), Brand Cream text (`#FCF6E3`), 1px subtle border.
- **Mentor / Advisor:** Dual hairline ring around avatar; gold verified badge (`#E9C68C` fill, `#1E1F33` text).
- **Unverified Mentor:** Muted outlined badge with 1px dashed border.

---

## 5. Layout & Navigation Architecture

### Grid & Max Width
- **Grid:** 12-column responsive layout with 24px gutters. Content container strictly capped at 1200px maximum width.
- **Spacing Scale:** Strict 4px rhythm (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).

### Navigation Structure
- **Five Core Destinations:** Exactly five top-level routes across the entire portal:
  1. `Home` (`/dashboard`)
  2. `Community` (`/community`)
  3. `People` (`/people` — Mentors, Directory, My Connections)
  4. `Events` (`/events`)
  5. `Planner` (`/planner` & Calendar)
- **Desktop Chrome (≥1024px):** Fixed Midnight Navy sidebar on the left with the OASIS logo at the top, vertical navigation with 1px gold active indicators, top utility bar with global search (`⌘K`), quick-action `New` dropdown, notifications bell, and user avatar menu.
- **Mobile Chrome (<1024px):** Sticky Midnight Navy top bar with compact `<BrandLockup variant="mark">`, plus fixed bottom tab bar with the 5 core destinations. Multi-column cards collapse cleanly to single-column vertical feeds.

---

## 6. Motion Philosophy & Micro-Interactions
- **Physics Engine:** Spring physics with `stiffness: 120, damping: 20` for dialog drawers, slide-overs, and popovers.
- **Micro-Transitions:** 150–250ms cubic-bezier(0.16, 1, 0.3, 1) for button states, tabs, and chip toggles.
- **Signature Star Motion:** On the public hero, the 12-point compass star draws in via SVG stroke-dashoffset (1.2s ease-out) and rotates continuously at 1 turn per 60 seconds (disabled if `prefers-reduced-motion` is active).
- **Performance:** Hardware-accelerated transitions utilizing `transform` and `opacity` exclusively. Never animate layout dimensions (`width`, `height`, `top`, `left`).

---

## 7. Explicit Anti-Patterns (Banned AI Slop)
- ❌ **NO Emojis:** Never use emojis in place of clean, 1.5px stroke Lucide vector icons.
- ❌ **NO Generic SaaS Hero Blobs:** No purple or magenta neon glowing spheres, blurred mesh gradients, or 3D floating cylinders.
- ❌ **NO Overuse of Glassmorphism:** No backdrop-blur frosted glass everywhere. Maintain solid, high-contrast structural surfaces.
- ❌ **NO 3-Column Identical Feature Cards:** Feature rows must use varied hierarchy, asymmetrical split layouts, or numbered progression.
- ❌ **NO Marketing Jargon:** Banned words include *"supercharge", "unleash", "elevate", "seamless", "next-gen", "paradigm shift"*. Use plain, dignified words: *"Ask a question", "Find a mentor", "Apply to join"*.
- ❌ **NO Invented Statistics or Fake Logos:** No fake partner walls or invented metrics. The sole verified metric is **650+ members**.
- ❌ **NO Placeholder Text:** No *"Lorem Ipsum"*, *"John Doe"*, or *"Acme Corp"*. Use authentic Odisha context: Bhubaneswar, Cuttack, Rourkela, Sambalpur, Berhampur.
- ❌ **NO Inter for Large Headlines:** Headings use geometric `Jost` matching the brand star typography.
