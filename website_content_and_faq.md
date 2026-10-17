# OASIS ONE — Website Public Copy, About OASIS, Contact Info & Migration FAQ

**Document Version:** 1.0 (Aligned with OASIS ONE PRD v1.2 & Frontend Specification §3, §5.1, §19.2)  
**Effective Date:** 16 October 2026  
**Organization:** OASIS (Odisha Startup Community)  
**Platform Name:** OASIS ONE — *"One Community. Infinite Possibilities."*  
**Address:** Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018  
**Phone:** +91-904-01-98-628  
**Email:** Info@oasisodisha.in  

## 1. Official Company & Contact Information Block

Use the following standardized contact and legal entity details across the website footer, `/about`, `/contact`, legal headers, transactional email footers, and Google Cloud OAuth consent screen configuration:

| Field | Official Value |
| :--- | :--- |
| **Organization / Legal Name** | OASIS |
| **Platform / Product Name** | OASIS ONE |
| **Brand Tagline** | One Community. Infinite Possibilities. |
| **Community Identity Line** | Odisha · Startup Community |
| **Registered / Office Address** | Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018 |
| **Support, Legal & Grievance Email** | Info@oasisodisha.in |
| **Official Contact Phone** | +91-904-01-98-628 |
| **Minimum Membership Age** | 18 years or older |
| **Jurisdiction** | Bhubaneswar, Odisha, India |

## 2. Landing Page Copy (`/`)

### 2.1 Hero Section
- **Eyebrow (`0.18em` uppercase tracking):** `ODISHA · STARTUP COMMUNITY`
- **Headline:** `One Community. Infinite Possibilities.`
- **Lead Paragraph:** `OASIS ONE is the admin-approved digital workspace for 650+ aspiring entrepreneurs, startup founders, and mentors across Odisha. Search people and expertise, ask real building questions, connect with mentors, join meetups, and keep your startup milestones moving.`
- **Primary Action Button:** `Apply to Join` (`/join`)
- **Secondary Action Button:** `Sign In` (`/login`)
- **Stat Strip:** `650+ Members in Odisha's Startup Community · Vetted Profiles · Searchable Knowledge · Direct Mentor Discovery`

### 2.2 Three Role Cards ("Built for Every Stage of Your Journey")
1. **Aspiring Entrepreneur**
   - *Subtitle:* Exploring an idea or preparing to build.
   - *Body:* Validate your early direction, learn from founders who have built from Bhubaneswar, Cuttack, Rourkela, Sambalpur, and Berhampur, ask practical questions, and find mentors across product, technology, and go-to-market.
   - *Action:* `Join as an Aspiring Entrepreneur`
2. **Startup Founder / Co-Founder**
   - *Subtitle:* Building, launching, and scaling a venture.
   - *Body:* Publish your startup profile, link with your co-founders under one company record, seek targeted help across funding, hiring, sales, and legal compliance, and share 24-hour milestone achievements with the community.
   - *Action:* `Join as a Founder`
3. **Mentor / Advisor**
   - *Subtitle:* Offering domain expertise and structured guidance.
   - *Body:* Share your functional and sector experience while keeping your personal phone number and email private by default. Set your availability at your own pace and accept guidance requests when there is a clear fit.
   - *Action:* `Join as a Mentor`

### 2.3 How It Works ("Three Calm Steps to Join")
1. **1. Apply with Your Role:** Pick your role—Aspiring Entrepreneur, Startup Founder, or Mentor—confirm you are 18+, and fill in your profile using email or Google sign-in.
2. **2. Reviewed by Community Admins:** Land straight on your locked dashboard with a live status tracker and admin message thread while our team reviews your application (typically within 2 days).
3. **3. Unlock & Connect:** The moment an admin approves your application, your dashboard unlocks live—opening global search, community Q&A, mentor requests, events, and your personal planner.

### 2.4 Trust, Privacy & Governance Section ("Why OASIS ONE Is Different from a Chat Group")
- **Approved Membership Only:** No anonymous spam or public scraping. Every profile is reviewed by an administrator before gaining access to member directories, discussions, or events.
- **Private by Default:** Your phone number and email address start private. You choose which profile fields members can see and which contact details are shared when a mentor connection is accepted.
- **Searchable Community Memory:** Useful technical advice, legal pointers, and grant leads stay organized by sector and expertise tags instead of disappearing into thousands of chat messages.
- **Accountable Administration:** Every administrative decision, moderation action, and private profile review is recorded in an immutable audit log.

## 3. About OASIS Page Copy (`/about`)

### 3.1 Our Story
**OASIS** began with a clear conviction: builders in Odisha deserve a closely connected, generous community where someone starting out in Bhubaneswar, Rourkela, Cuttack, Sambalpur, or Berhampur can reach the right founder or mentor without barriers. In a short span, our community grew past **650+ aspiring entrepreneurs, startup founders, co-founders, mentors, and advisors** spanning DeepTech, AI/ML, FinTech, HealthTech, AgriTech, EdTech, ClimateTech, SaaS, D2C/E-commerce, and Hardware/Manufacturing.

As our membership expanded, coordinating solely over WhatsApp meant valuable answers were lost within hours, finding a mentor with specific domain experience took manual guesswork, and organizing physical meetups required scattered spreadsheets. **OASIS ONE** was built to solve that—giving the OASIS community a quiet, structured, mobile-first digital home while preserving the warmth and trust that brought us together.

### 3.2 What You Can Do on OASIS ONE
- **Search First:** Find members, startups, mentors, answered questions, and upcoming events from one unified search bar (`⌘K` / `Ctrl+K`).
- **Ask & Share in Community:** Post questions and suggestions up to 10,000 characters, filter by sector or expertise tag, and mark accepted answers as **Resolved**.
- **Celebrate 24-Hour Achievements:** Share product launches, grants, pilots, and milestones in the moderated 24-hour dashboard banner.
- **Discover Mentors & Connect Safely:** Filter mentors by expertise and startup stage, and request guidance without exposing private contact info until a connection is accepted.
- **Join Physical & Online Events:** Register for OASIS meetups with instant capacity tracking, automatic waitlist promotion, `.ics` calendar downloads, and registrant-only meeting links.
- **Plan Your Work Privately:** Track your personal startup tasks and funding deadlines in a private day/week/month planner that not even administrators can read.

## 4. Onboarding, Locked Dashboard & System State Copy (Frontend §3.8 & §5)

Use this exact, plain-language microcopy across onboarding and system screens:

| Screen / State | Exact UI Copy |
| :--- | :--- |
| **Age Gate Unchecked Error (`/join`)** | *"You must be 18 or older to join OASIS ONE. Please confirm your age to continue."* |
| **Duplicate Email on Register (`409 CONFLICT`)** | *"This email already has an account. Sign in to check your application, or reset your password if you forgot it."* |
| **Unverified Email Banner (Locked Dashboard)** | *"Please verify your email address. We've sent a verification link to your inbox—our admins will begin reviewing your application as soon as your email is confirmed."* |
| **Email Service Delayed Notice (`AUTH-06`)** | *"We've saved your application. Our email service is taking a little longer than usual—your verification link is queued and will arrive shortly."* |
| **Locked Dashboard Status Card (`pending`)** | *"With the admins for review. We usually reply within 2 days."* |
| **Locked Dashboard Status Card (`info_requested`)** | *"The admins need a little more information. Please review their message below and update your details."* |
| **Locked Control Tooltip / Popover** | *"Unlocks when an admin approves your application."* |
| **One-Time Approval Unlock Headline** | *"You're in, {firstName}. Welcome to OASIS."* |
| **Expired Invite Link Fallback (`/invite/[token]`)** | *"This invitation link has expired. Please complete the standard registration form using the same email address—we'll match it to our member list for expedited 24-hour approval."* |
| **Rejected Application Screen (`/application`)** | *"We aren't able to approve your application right now. You can submit a new application with updated details starting on {canReapplyAt}."* |
| **Suspended Account Page (`/suspended`)** | *"Your account is temporarily suspended until {expiresAt}. Reason: {reason}. If you believe this was a mistake, you can contact OASIS Administration below to appeal."* |
| **Inactivity Deactivated Login Notice (`deactivated`)** | *"Your account was deactivated after 15 months of inactivity. Please contact OASIS Support at Info@oasisodisha.in and we'll help reactivate your profile."* |
| **Blocked / Unavailable Profile View** | *"This profile is unavailable."* |
| **PWA Offline Page** | *"You're offline right now. Reconnect to the internet to access OASIS ONE."* |

## 5. Frequently Asked Questions (Public FAQ & Pre-Launch WhatsApp Migration FAQ — PRD §19.2)

### General & Membership Questions

**1. Who is eligible to join OASIS ONE?**  
OASIS ONE welcomes individuals who are **18 years of age or older** and actively participating in or supporting the entrepreneurial community as an **Aspiring Entrepreneur**, **Startup Founder / Co-Founder**, or **Mentor / Advisor**. Every application is reviewed by our administrators to keep the community trusted and relevant.

**2. Why is my dashboard locked immediately after signing up?**  
When you complete registration, you sign straight into your **Locked Dashboard** so you can track your application in real time, copy your reference ID, and reply if our administrators ask for additional details. To protect member privacy, directory profiles, community posts, and events remain locked until an administrator approves your application. Once approved, your dashboard unlocks live without needing to refresh the page.

**3. How long does application approval take?**  
Once you verify your email address, our administrators review applications with a median turnaround of **within 48 hours** (and within 5 days during high-volume periods). Pre-approved existing members registering after their invite link expires receive expedited review within **24 hours**.

**4. Can I be both a Startup Founder and a Mentor?**  
During registration, please choose the single primary role (`Founder` or `Mentor`) that best represents how you want to participate first. Founders can already share expertise and answer community questions, and we are adding multi-role profile switching in an upcoming update so you will never need a second account.

### WhatsApp Transition & Existing Member Migration (`PRD §19.2`)

**5. Why did OASIS launch OASIS ONE, and are our WhatsApp groups closing?**  
No, our WhatsApp groups are not closing! WhatsApp remains a great space for quick, informal conversation. However, with **650+ members**, important questions, mentor introductions, startup profiles, and event RSVPs quickly get lost in chat scroll. **OASIS ONE** is now our permanent, searchable home for member profiles, structured Q&A, mentor connections, event registrations, and 24-hour achievements.

**6. I am already in the OASIS WhatsApp community. How do I join without waiting for approval?**  
We have imported our pre-launch member list into OASIS ONE. Check your email for an invitation from OASIS ONE containing your personal `/invite/[token]` link (valid for **14 days**). Clicking that link opens a pre-filled form and activates your account **immediately**—no approval wait required. If your 14-day link has expired, simply sign up at `/join` using the same email address, and our system will automatically flag your application for **Expedited 24-Hour Approval**.

### Privacy, Mentorship & Security Questions

**7. Are my phone number and email address visible to other members?**  
**No.** By default, both your phone number and your email address are **Private**. Other approved members can only see the fields you mark visible (such as your name, role, city, bio, and LinkedIn link). In **Settings → Privacy**, you can customize visibility for every field, preview how others see your profile, and choose which contact details are shared when a mentor connection is accepted.

**8. How do Mentor connection requests work?**  
Approved members can browse mentors by sector, expertise, and city, and send a guidance request with a message (up to 10 requests per 24 hours). Mentors have 14 days to accept or decline. Neither person's private contact information is revealed until the mentor clicks **Accept**, at which point the Platform shares only the contact fields each person enabled under *"Share on Connection."*

**9. Can administrators see my personal tasks and deadlines in the Planner?**  
**No.** All tasks and funding/opportunity deadlines you add to your Personal Planner (`/planner`) are strictly private to your account. Administrators cannot read your task titles or notes; they only see anonymous, aggregate usage totals across the whole platform.

**10. How do I download my data, delete my account, or contact OASIS Administration?**  
In **Settings → Data & Account**, you can request a complete JSON file of your data (ready within 48 hours) or permanently delete your account (which immediately hides your profile and purges your personal data within 30 days). For any support question, appeal, or grievance, click **Contact OASIS** in your account menu or reach us directly:
- **Email:** Info@oasisodisha.in
- **Phone:** +91-904-01-98-628
- **Address:** Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018
