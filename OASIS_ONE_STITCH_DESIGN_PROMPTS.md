# OASIS ONE — Design prompts for Google Stitch

Design only. No code, no backend. Use these to create the screens, then export or hand the designs to the developer together with the frontend prompt.

## How to use

1. Start a new Stitch project. Attach the OASIS logo image (`oasis-logo.png`) as a reference if Stitch lets you attach images. Place it only on navy.
2. Paste **the Style Brief** (next section) first, then paste **Screen 7: Home** and generate. Get this screen right before anything else, because it sets the look for the rest.
3. Generate the other screens one at a time. Right after Home, do Screen 7a (locked Home) and Screen 7b (unlock moment), because every new member sees them first. For each one, paste the Style Brief again (or a one-line reminder: "Same OASIS style as before") followed by the screen prompt.
4. Ask for each screen in two sizes: desktop (1440 px wide) and mobile (390 px wide).
5. When a screen drifts from the style, use a refinement prompt from the end of this file instead of regenerating from scratch.
6. If Stitch does not have Jost, use a light geometric sans such as Outfit or Poppins Light for headings, and Inter for everything else.

---

## The Style Brief (paste first, and with every screen)

```
Design a premium, calm, mobile-first web app for OASIS, the startup community of Odisha, India. It has 650+ members: aspiring entrepreneurs, startup founders, and mentors. Joining is by admin approval.

Brand
- Midnight navy #1E1F33, champagne gold #F3D3A2 used only as thin 1px hairlines and small accents, warm ivory #FBF7EE page background, white #FFFFFF cards.
- Logo: gold line-art compass star inside a ring, with "OASIS" and "Odisha · Startup Community". Use the attached logo. Always show it on a navy background, never on ivory or white.

Style
- Quiet, premium product UI in the spirit of Linear or Stripe's dashboard. Not a marketing template.
- Headings in Jost (light, geometric). Small uppercase labels with wide letter-spacing. Body and UI text in Inter.
- Cards with 16px corners and a 1px hairline border (#D9CDAE). No heavy shadows. Lots of white space. 4px spacing scale. 12-column grid, content max width 1200px.
- One icon style: thin line icons, 1.5px stroke.
- Text color #1E1F33, secondary text #656482. Status colors: success #187952, warning #B83E0B, error #B64536, info #296DAC.
- Primary button: navy fill with cream text. Secondary button: 1px outline. Filled gold is used only for small badges such as "Verified mentor".
- Navy sidebar (desktop) or navy top bar (mobile) with the logo. Ivory content area.

Navigation: exactly five destinations: Home, Community, People, Events, Planner. A search field and a notification bell sit in the top bar. A "New" button opens a small menu (Ask a question, Share an achievement, Add a task). Profile, settings and contact live in the avatar menu.

Rules
- One main action per screen. Plain everyday words. Sentence case.
- Lists on summary pages show at most 3 items with a "See all" link.
- No emoji. No gradient blobs, glowing effects, glass effects or stock illustrations. No invented statistics. No placeholder text like "Lorem ipsum" or "John Doe".
- Use believable sample content from Odisha: Bhubaneswar, Cuttack, Rourkela, Sambalpur, Berhampur.
```

---

## Public screens

### Screen 1: Landing page
```
Screen: public landing page. Desktop and mobile.
Top: a navy bar with the logo on the left, and "Log in" (text) and "Join OASIS" (button) on the right.
Hero (full-width navy): small uppercase label "ODISHA · STARTUP COMMUNITY". Headline "One Community. Infinite Possibilities." Under it: "A members-only home for Odisha's aspiring entrepreneurs, founders and mentors. Find the right people, ask better questions, meet in person." Buttons: "Join OASIS" (primary) and "Log in" (secondary). On the right, a large faint gold hairline drawing of a 12-point compass star inside a ring.
Section "Who it's for" on ivory: three simple rows, not cards. Aspiring entrepreneurs: "Test your idea and find guidance." Founders: "Share what you need and find collaborators." Mentors: "Give back to the next generation of founders."
Section "How it works": three numbered steps. 1 Apply. 2 An admin reviews your application. 3 Connect with members and join events.
One quiet line: "Every member is reviewed by an admin before they join. 650+ members."
Footer in navy: logo, "Odisha · Startup Community", links Privacy, Community guidelines, Contact.
```

### Screen 2: Join, choose your role (step 1 of 4)
```
Screen: registration step 1 of 4. Desktop and mobile.
Small progress indicator "Step 1 of 4". Heading "How would you describe yourself?" Three large selectable cards in a row (stacked on mobile), each with a thin line icon, a title and one line:
- Aspiring entrepreneur: "I'm exploring or validating an idea."
- Founder or co-founder: "I'm building a startup."
- Mentor or advisor: "I want to guide others."
Show one card in the selected state (gold hairline border, small check). Primary button "Continue". Under it a secondary button "Continue with Google". Small text "Already a member? Log in".
```

### Screen 2b: Join, create your account (step 2 of 4)
```
Screen: registration step 2 of 4. One column, desktop and mobile.
Heading "Create your account." Fields: Full name, Email, Password with a quiet hint "At least 8 characters, with a capital letter, a small letter and a number." Primary button "Continue". Below it a divider "or" and a secondary button "Continue with Google". Small text: "We'll send a link to confirm your email."
```

### Screen 3: Join, founder details (step 3 of 4)
```
Screen: registration step 3 of 4 for a founder. One column, labels above fields, desktop and mobile.
Heading "Tell us about your startup." Fields: Startup name; Your role (select); Sector (chips to pick several: DeepTech, AI/ML, FinTech, HealthTech, AgriTech, EdTech, ClimateTech); Stage (Ideation, MVP, Launched, Early revenue, Growth); What your startup does (text area with a "0 / 1000" counter); City; Website (marked optional); Support you need (chips: Funding, Technology, Sales, Hiring, Partnerships, Legal).
Buttons: "Back" (secondary) and "Continue" (primary). Show one field with a friendly inline error: "Add a short description so mentors know how to help."
```

### Screen 4: Join, review and consent (step 4 of 4)
```
Screen: registration final step. Desktop and mobile.
Heading "Review and submit." A summary card with the person's answers in a tidy two-column list, each with an "Edit" link. Below, two checkboxes: "I confirm I am 18 years of age or older." and "I agree to the Privacy Notice and Community Guidelines." (the document names are links). Primary button "Submit application". Small text: "An admin will review your application. We usually reply within 2 days." After submitting, the member lands on the locked Home (Screen 7a).
```

### Screen 5: Log in
```
Screen: log in. Desktop: split layout. Left half navy with the logo and one sentence "Welcome back to the Odisha startup community." Right half ivory with the form: Email, Password, button "Log in", a divider "or", button "Continue with Google", link "Forgot password?", and "New here? Join OASIS". Mobile: just the form under a short navy header with the logo.
```

### Screen 6: Application status
```
Screen: application status for a person waiting for approval. Desktop and mobile.
Heading "Application received." A reference line "Reference" with the code in a monospace font and a small "Copy" button. A three-step horizontal timeline: Submitted (done), In review (current), Decision (upcoming). Text under it: "With the admins for review. We usually reply within 2 days."
Below, a card "Messages from the admins" with one admin message "Could you add a link to your LinkedIn profile?" and a text box "Write a reply" with a "Send" button. Secondary text link "Withdraw application".
```

---

## Member screens

### Screen 7: Home (dashboard). Design this first.
```
Screen: member home, simple and uncluttered. Desktop with left navy sidebar and mobile with bottom tab bar (Home, Community, People, Events, Planner).
Top bar: search field, "New" button, notification bell, avatar.
Four blocks only:
1. Greeting "Good morning, Priya" and one large search field with the placeholder "Search people, questions and events". Above it, one slim dismissible announcement bar: "Founders meetup this Saturday in Bhubaneswar. Registration closes Thursday." Beneath the search, one achievement card: "Subhashree Das closed her first pilot with a hospital group in Cuttack." with a small "Expires in 14h" label.
2. "Next up": two equal cards side by side. "Upcoming events" shows 3 items (date block, title, button Register or Registered) and a "See all" link. "My tasks" shows 3 items with tick boxes and "Add task".
3. "For you": a two-option switch "Mentors | Questions". Show 3 mentor cards (name, area of expertise, city, small gold "Verified" badge, "Request guidance" link).
4. A "Get started" card with three steps: Complete your profile, Join an event, Ask a question.
No charts. No numbers panel. The search field is the main action.
```

### Screen 7a: Home, locked (waiting for approval)
```
Screen: the same Home layout as Screen 7, but locked because the member's application is waiting for admin approval. Desktop and mobile.
Keep the navy sidebar (or bottom tab bar), the top bar and the same four blocks, but every block is locked: show calm placeholder rows (soft grey bars, no real content) with a small gold lock badge and one line, "Unlocks when an admin approves your application." Every nav item except Home shows a small lock icon. The search field is disabled.
At the top, the only live element: a "Your application" card with a 3-step timeline (Submitted done, In review current, Decision upcoming), a monospace reference code with a Copy button, the sentence "With the admins for review. We usually reply within 2 days.", and an inline "Messages from the admins" thread with a reply box. Add a slim banner: "Please verify your email so review can start." with a "Resend email" link.
Keep it reassuring, not alarming: no red, no warning icons.
```

### Screen 7b: The unlock moment (storyboard)
```
Design a storyboard of 4 frames showing the one-time moment when the member is approved and the dashboard unlocks. Same OASIS style.
Frame 1: the locked Home with placeholders, a gold hairline starting to sweep across the top bar and the compass star glowing softly in the centre.
Frame 2: the lock badges opening and fading one by one, left to right and top to bottom.
Frame 3: the placeholders cross-fading into real content (events, tasks, mentor cards).
Frame 4: the unlocked Home with a calm headline "You're in, Priya. Welcome to OASIS." and the Get started card gently highlighted.
No confetti, no fireworks, no emoji. Quiet and premium.
```

### Screen 8: Search results
```
Screen: search results for "agritech". Desktop and mobile.
Top: the search field with the query. Tabs "People 12", "Questions 8", "Events 2". Result list for People: avatar, name, role chip, city, one line of expertise. Show "12 results" above the list and pagination at the bottom.
Also show the empty state for a query with no results: "No matches for 'quantum farming'. Try a broader word, or browse by sector." with chips DeepTech, AgriTech, FinTech.
```

### Screen 9: Community
```
Screen: community feed of questions and suggestions. Desktop and mobile.
Heading "Community". Primary button "Ask a question". Filter chips: All, DeepTech, AgriTech, Funding, Hiring, Legal. List of posts (each a card): title, two lines of preview, author name with role chip, city, time, number of replies, a small "Resolved" label on one. Keep it to 6 posts with different text lengths.
```

### Screen 10: Question detail
```
Screen: a single question. Desktop and mobile.
Title "How did you find your first three pilot customers?" Author Rakesh Panda, founder, Bhubaneswar. Body of three short paragraphs. Under it "4 replies". Each reply: author, role chip, text, time. One reply has a small "Accepted answer" label. A text box "Write a reply" with a counter and button "Reply". A small "Report" link. Author controls: "Edit" (available for 24 hours) and "Mark as resolved".
```

### Screen 11: People (mentors tab and mentor profile)
```
Screen: People page with three tabs: Mentors, Directory, My connections. Show the Mentors tab. Desktop and mobile.
Left filters (a sheet on mobile): Expertise, Sector, City. Grid of 6 mentor cards: avatar with a thin double gold ring, name, "Mentor" chip, small gold "Verified" badge on some and a quiet outlined "Unverified" on one, expertise line, city, button "Request guidance".
Also design the mentor profile page: large header, short bio, expertise chips, sectors, "Available" status, how they like to be contacted, and one primary button "Request guidance". Contact details are not shown. A small note: "Contact details are shared only after they accept."
```

### Screen 12: Request guidance (dialog)
```
Screen: a dialog over the mentor profile. Title "Ask Dr. Ananya Behera for guidance". A text box "Introduce yourself and say what you need help with" with a counter. Small text "You can send 10 requests per day. 8 left." Buttons "Cancel" and "Send request". Also show the error state: "You already have a request waiting with Dr. Behera."
```

### Screen 13: My connections
```
Screen: My connections tab. Three sub-tabs: Incoming, Outgoing, Active. Show Incoming with two requests: person, short message, "Expires in 9 days", buttons "Accept" and "Decline". Show Active with one connection and the contact details they chose to share (email and LinkedIn), plus a note "Phone not shared".
```

### Screen 14: Events list
```
Screen: events. Desktop and mobile. Heading "Events". Cards, each with a date block (month and day), title, venue and city, a thin capacity bar "42 of 60 places", and a button. Show one full event with a "Join waitlist" button and one already registered with a quiet "Registered" state. Sample events: "Founders meetup, Bhubaneswar", "DeepTech demo night, Rourkela", "Mentor office hours, online".
```

### Screen 15: Event detail and registration
```
Screen: event detail page with a registration panel. Date, time, venue, short description, host. Registration panel (side panel on desktop, bottom sheet on mobile) with the questions the admin set: "Dietary preference" (select), "What do you want from this evening?" (short text). Button "Register". Also show the registered state with "Add to calendar" and "Cancel registration", and the waitlist state "You're 3rd on the waitlist. We'll tell you if a place opens." The online meeting link appears only after registering.
```

### Screen 16: Planner
```
Screen: planner with a calendar. Desktop and mobile. Toggle Day / Week / Month (show Month). OASIS events appear as gold-outlined chips, personal tasks as navy-outlined chips, deadlines with a small flag icon. A side list "My tasks" with tick boxes, due dates and priority dots, and a quick add field "Add a task and press Enter". Everything here is private to the member; show a small lock note "Only you can see your tasks."
```

### Screen 17: Notifications
```
Screen: notifications page. Grouped by day (Today, Yesterday). Each row: small icon, one sentence, time, unread dot. Examples: "Rakesh Panda replied to your question." "Your achievement is live on the home page." "Founders meetup was moved to 6:30 pm." Buttons "Mark all as read".
```

### Screen 18: Settings, privacy tab
```
Screen: settings with tabs Profile, Privacy, Notifications, Security, Blocked members, Data and account. Show Privacy. A list of profile fields (Name, Email, Phone, LinkedIn, Bio) each with a toggle "Visible to members" and a second toggle "Share when I accept a connection". Right side: a live preview card "How others see you". Phone and email are off by default.
```

### Screen 19: Contact OASIS
```
Screen: contact page. Heading "Contact OASIS". Short intro "Questions, feedback or a concern? We'll reply by email." Fields: Topic (General, Account, Content, A concern about an admin), Subject, Message. Button "Send". Success state: "Thanks. Your case number is OASIS-GRV-2026-0142. We've emailed you a copy."
```

---

## Admin screens

Admin screens may be a little denser than member screens, but still clean.

### Screen 20: Admin overview
```
Screen: admin overview. Navy sidebar with: Overview, Applications, Members, Posts and reports, Achievements, Events, Announcements, Tags, Analytics, Settings. Main area: a list "Needs your attention" with rows such as "7 applications waiting, oldest 3 days", "2 reports to review", "1 achievement to approve", each with a button. Beside it, four small numbers: Members, Pending, Upcoming events, Reports. No charts.
```

### Screen 21: Application review
```
Screen: reviewing one application. Split view. Left: applicant details (name, role, city, startup, links, answers). Right: "Messages" thread with a clearly different "Admin only" notes box, a checklist "Looks genuine, Role matches, Profile is complete, Profile link works, Fits OASIS, No red flags", and a sticky bottom bar with "Approve", "Ask for more information", "Reject" (a reason is required). A small banner at top: "You're reviewing this application. Locked to you for 15 minutes."
```

### Screen 22: Event builder
```
Screen: create an event. Sections: Details (title, description, date and time, venue or link), Who can see it (All members, Selected roles, Invite only), Places (capacity, waitlist on/off, registration deadline), Registration questions (a list of questions the admin can add, reorder and mark required). Buttons "Save draft" and "Publish".
```

### Screen 23: Members and restrictions
```
Screen: members table with search and filters (role, status). Columns: name, role, city, joined, status. Open a side panel for one member with actions "Warn", "Suspend", "Revoke access", "Blacklist". Each action asks for a reason (at least 10 characters) and explains in one sentence what will happen to that person's posts and event places.
```

---

## Dark mode and states

### Screen 24: Dark version of Home
```
Create the dark version of the Home screen. Background navy #1E1F33, cards #2C2C3F, text cream #FCF6E3, secondary text #A9A7C4. Primary button gold #E9C68C with navy text. Keep the gold hairlines. Same layout and content.
```

### Screen 25: System pages
```
Design three simple pages in the same style: (1) "Your account is paused" with the reason, how to appeal, and a "Contact OASIS" button. (2) "This link has expired" with a "Send a new link" button. (3) "You're offline" with the logo on navy and one sentence. Each has one clear action.
```

---

## Refinement prompts (use when a screen drifts)

- "Make this simpler. Remove anything that is not essential. Keep at most 3 items per list and one main button."
- "Make it feel more premium: more white space, thinner borders, fewer colors. Keep gold only as hairlines and one small accent."
- "This looks generic. Remove decorative gradients and icons in circles. Match the OASIS style: navy, ivory, gold hairlines, the compass star motif."
- "Use plain words. Rewrite all labels and empty states in short, calm sentences. No marketing words."
- "Fix contrast: all text must be easy to read. Use #1E1F33 for text and #656482 for secondary text on light backgrounds."
- "Keep the same style as the Home screen: same sidebar, same card style, same fonts, same spacing."
- "Show the mobile version at 390 px wide with a bottom tab bar: Home, Community, People, Events, Planner."
- "Replace placeholder text with believable Odisha sample content: Bhubaneswar, Cuttack, Rourkela, Sambalpur."

## When the designs are done

Give the exported designs (and the logo files) to the developer or coding tool together with `OASIS_ONE_FRONTEND_PROMPT.md`. The frontend prompt keeps the same colors, fonts and rules, and tells the coding tool to follow the designs for layout.
