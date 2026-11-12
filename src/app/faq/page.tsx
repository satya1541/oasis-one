import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { DocsShell } from "@/components/layout/DocsShell";
import { DocsPageHeader } from "@/components/layout/DocsPageHeader";

export const metadata = {
  title: "Frequently Asked Questions & Member Migration FAQ",
  description:
    "Official questions, answers, and WhatsApp pre-launch member migration guide for Odisha's 650+ startup founders and mentors on OASIS.",
  alternates: {
    canonical: "/faq",
  },
  keywords: [
    "OASIS FAQ",
    "Odisha Startup FAQ",
    "Join OASIS Odisha",
    "Odisha Founder Community",
    "Startup Odisha Mentorship",
    "WhatsApp community migration OASIS",
  ],
  openGraph: {
    title: "Frequently Asked Questions & Member Migration FAQ · OASIS",
    description:
      "Official questions, answers, and WhatsApp pre-launch member migration guide for Odisha's 650+ startup founders and mentors on OASIS.",
    url: "https://oasisodisha.in/faq",
    type: "website",
  },
};

const FAQ_SECTIONS = [
  {
    id: "general-membership",
    category: "1. General & Membership",
    items: [
      {
        q: "Who is eligible to join OASIS?",
        a: "OASIS welcomes natural persons who are 18 years of age or older and actively participating in or supporting Odisha's entrepreneurial ecosystem as an Aspiring Entrepreneur, Startup Founder / Co-Founder, or Mentor / Advisor. Every application is reviewed by our administration team to maintain high trust and peer relevance.",
      },
      {
        q: "Why is my dashboard locked immediately after signing up?",
        a: "When you complete registration, you sign straight into your Locked Dashboard so you can track your application in real time, copy your reference UUID, and message reviewing admins. To protect member privacy, directory profiles, community posts, and events remain locked until an administrator approves your application. Once approved, your dashboard unlocks live without needing to refresh.",
      },
      {
        q: "How long does application approval take?",
        a: "Once you verify your email address, our administrators review applications with a median turnaround of within 48 hours (and within 5 days during high-volume periods). Pre-approved existing WhatsApp community members registering after an invite link expires receive expedited review within 24 hours.",
      },
      {
        q: "Can I be both a Startup Founder and a Mentor?",
        a: "During registration, please choose the single primary role (Founder or Mentor) that best represents how you want to participate first. Founders can already share expertise and answer community questions, and we are adding multi-role profile switching in an upcoming update so you will never need a second account.",
      },
    ],
  },
  {
    id: "whatsapp-migration",
    category: "2. WhatsApp Transition & Existing Member Migration",
    items: [
      {
        q: "Why did OASIS launch OASIS, and are our WhatsApp groups closing?",
        a: "No, our WhatsApp groups are not closing! WhatsApp remains a great space for quick, informal chat. However, with 650+ members, important questions, mentor introductions, startup profiles, and event RSVPs quickly get lost in chat scroll. OASIS is our permanent, searchable home for member profiles, structured Q&A, mentor connections, event registrations, and 24-hour achievements.",
      },
      {
        q: "I am already in the OASIS WhatsApp community. How do I join without waiting for approval?",
        a: "We have imported our pre-launch member list into OASIS. Check your email for an invitation from OASIS containing your personal /invite/[token] link (valid for 14 days). Clicking that link opens a pre-filled form and activates your account immediately—no approval wait required. If your 14-day link has expired, simply sign up at /join using the same email address, and our system will automatically flag your application for Expedited 24-Hour Approval.",
      },
    ],
  },
  {
    id: "privacy-mentorship-security",
    category: "3. Privacy, Mentorship & Security",
    items: [
      {
        q: "Are my phone number and email address visible to other members?",
        a: "No. By default, both your phone number and your email address are Private. Other approved members can only see the fields you mark visible (such as your name, role, city, bio, and LinkedIn link). In Settings → Privacy, you can customize visibility for every field, preview how others see your profile, and choose which contact details are shared when a mentor connection is accepted.",
      },
      {
        q: "How do Mentor connection requests work?",
        a: "Approved members can browse mentors by sector, expertise, and city, and send a guidance request with a message (up to 10 requests per 24 hours). Mentors have 14 days to accept or decline. Neither person's private contact information is revealed until the mentor clicks Accept, at which point the Platform shares only the contact fields each person enabled under 'Share on Connection.'",
      },
      {
        q: "Can administrators see my personal tasks and deadlines in the Planner?",
        a: "No. All tasks and funding/opportunity deadlines you add to your Personal Planner (/planner) are strictly private to your account. Administrators cannot read your task titles or notes; they only see anonymous, aggregate usage totals across the whole platform.",
      },
      {
        q: "How do I download my data, delete my account, or contact OASIS Administration?",
        a: "In Settings → Data & Account, you can request a complete JSON file of your data (ready within 48 hours) or permanently delete your account (which immediately hides your profile and purges your personal data within 30 days). For any support question, appeal, or grievance, click Contact OASIS in your account menu or reach out to Info@oasisodisha.in.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <DocsShell>
      {/* ── Schema.org FAQPage Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_SECTIONS.flatMap((sec) =>
              sec.items.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.a,
                },
              })),
            ),
          }),
        }}
      />

      <article className="space-y-9 text-[15px] leading-7 text-gray-700">
        <DocsPageHeader
          title="Frequently Asked Questions"
          meta="Community Knowledge & Migration Guide · 650+ Members"
          subtitle="Everything you need to know about joining OASIS, our WhatsApp pre-launch member migration, privacy guarantees, mentor requests, and community governance."
        />

        {FAQ_SECTIONS.map((sec) => (
          <section key={sec.id} id={sec.id} className="scroll-mt-24 space-y-4">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
              {sec.category}
            </h2>

            <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
              {sec.items.map((item, i) => (
                <div key={i} className="p-4 sm:p-5 space-y-1.5">
                  <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">
                    {item.q}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section id="migration-help" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
            4. Need Help With Your Account or Invite Link?
          </h2>
          <div className="p-5 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              If your 14-day WhatsApp community invite link expired or if you have questions regarding your application status, reach out to our administration team directly:
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#4F46E5]" />
                <a href="mailto:Info@oasisodisha.in" className="text-[#4F46E5] hover:underline">
                  Info@oasisodisha.in
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#4F46E5]" />
                <a href="tel:+919040198628" className="text-[#4F46E5] hover:underline">
                  +91-904-01-98-628
                </a>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-[#4F46E5] text-white font-medium text-xs sm:ml-auto hover:bg-[#4338CA] transition-colors"
              >
                Contact OASIS Form &rarr;
              </Link>
            </div>
          </div>
        </section>
      </article>
    </DocsShell>
  );
}
