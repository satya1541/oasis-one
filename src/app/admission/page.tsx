import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { DocsShell } from "@/components/layout/DocsShell";
import { DocsPageHeader } from "@/components/layout/DocsPageHeader";

export const metadata: Metadata = {
  title: "Admission Protocol & Verification Standards | OASIS Odisha",
  description:
    "Learn how admission to OASIS works. Our 3-step verification protocol guarantees high trust, privacy, and zero spam for Odisha's startup founders and mentors.",
  alternates: {
    canonical: "/admission",
  },
  keywords: [
    "OASIS Admission Protocol",
    "Join OASIS Odisha",
    "Startup Vetting Odisha",
    "Odisha Founder Application",
    "Odisha Startup Verification",
    "Founder Community Admission",
  ],
  openGraph: {
    title: "Admission Protocol & Verification Standards | OASIS Odisha",
    description:
      "Learn how admission to OASIS works. Our 3-step verification protocol guarantees high trust and zero spam.",
    url: "https://oasisodisha.in/admission",
    type: "website",
  },
};

export default function AdmissionPage() {
  const steps = [
    {
      step: "01",
      title: "Submit Application Dossier",
      timing: "Takes ~3 minutes",
      icon: Send,
      summary: "Tell us about your venture concept, current traction, and what support you seek or offer.",
      details: [
        "Select your primary ecosystem role: Aspiring Entrepreneur, Founder, or Mentor",
        "Provide your verified email and phone number (authenticated via SMS OTP)",
        "Share your startup summary, problem statement, or domain advisory background",
        "Optionally attach pitch decks, prototypes, or LinkedIn profile links",
      ],
    },
    {
      step: "02",
      title: "Human Admin Verification",
      timing: "Median turnaround < 48 hours",
      icon: UserCheck,
      summary: "Admissions personnel manually review your credentials and alignment with the community.",
      details: [
        "Sign directly into your Locked Dashboard immediately upon submitting",
        "Real-time status tracking with a unique reference UUID for transparency",
        "Two-way dashboard messaging if admissions staff need brief clarifications",
        "Expedited 24-hour review track for recognized WhatsApp community members",
      ],
    },
    {
      step: "03",
      title: "Sanctuary Live Unlock",
      timing: "Instant real-time sync",
      icon: Sparkles,
      summary: "Upon approval, your entire portal unlocks live without needing to refresh.",
      details: [
        "Receive your verified node badge (e.g. 'Verified Founder · ODISHA NODE #042')",
        "Immediate full access to the 650+ verified founder & mentor directory",
        "Participate in high-signal community Q&A and RSVP to closed-door Demo Nights",
        "Send structured connection requests with guaranteed privacy masking",
      ],
    },
  ];

  const standards = [
    {
      title: "What We Look For",
      items: [
        "Authentic connection to Odisha (resident, alumni, or building in the state)",
        "Genuine builder intent — from early hypothesis to scaling operations",
        "Clear articulation of the problem being solved or expertise offered",
        "Commitment to high-trust, respectful, and constructive peer discussions",
      ],
      boxClass: "bg-emerald-50/70 border-emerald-200",
      titleClass: "text-emerald-900",
      iconClass: "text-emerald-700",
      icon: CheckCircle2,
    },
    {
      title: "What We Disqualify",
      items: [
        "Automated scrapers, lead generation bots, or marketing spam accounts",
        "Cryptocurrency hype, speculative schemes, or get-rich-quick promotions",
        "Unsolicited sales pitching or aggressive commercial agency prospecting",
        "Misrepresented credentials or impersonation of institutional leaders",
      ],
      boxClass: "bg-rose-50/70 border-rose-200",
      titleClass: "text-rose-900",
      iconClass: "text-rose-700",
      icon: AlertTriangle,
    },
  ];

  return (
    <DocsShell>
      <article className="space-y-10 text-[15px] leading-7 text-gray-700">
        <DocsPageHeader
          title="Admission Protocol & Verification Standards"
          meta="Three Steps to Verified Membership"
          subtitle="Admission is exclusively by application to preserve high community integrity and mutual trust. Every member is vetted by hand."
        />

        <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
          <Link
            href="/join"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors"
          >
            Start Application
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/who-its-for"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            View Membership Tiers
          </Link>
        </div>

        <section id="admission-steps" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
            1. Step-by-Step Admission Process
          </h2>
          <p className="text-sm text-gray-600">
            From submission to live unlock, every step is built for speed and radical transparency.
          </p>

          <div className="space-y-4">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-5 sm:p-6 rounded-lg border border-gray-200 bg-white space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                        STEP {item.step}
                      </span>
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#4F46E5]" />
                        <span>{item.title}</span>
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-gray-500">{item.timing}</span>
                  </div>

                  <p className="text-sm text-gray-700">{item.summary}</p>

                  <ul className="space-y-1.5 pt-2 border-t border-gray-100 text-xs sm:text-sm text-gray-700">
                    {item.details.map((d, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section id="review-principles" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
            2. Admission Standards &amp; Review Principles
          </h2>
          <p className="text-sm text-gray-600">
            Why our approval process maintains the highest founder trust in Odisha.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standards.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className={`p-5 rounded-lg border ${s.boxClass} space-y-3`}>
                  <div className={`flex items-center gap-2 font-semibold text-sm ${s.titleClass}`}>
                    <Icon className={`w-4 h-4 ${s.iconClass}`} />
                    <span>{s.title}</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    {s.items.map((it, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className={`font-bold ${s.iconClass}`}>•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section id="whatsapp-preapproved" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
            3. Pre-Approved WhatsApp Community Members
          </h2>
          <div className="p-5 rounded-lg bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <strong className="text-sm font-semibold text-gray-900 block">
                Already in the OASIS WhatsApp Group?
              </strong>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                If you received a 14-day invite token via email, click it to activate your membership instantly. If your invite link expired, simply apply at{" "}
                <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200">
                  /join
                </code>{" "}
                using your recognized email for expedited 24-hour verification.
              </p>
            </div>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors shrink-0"
            >
              Read Migration FAQ &rarr;
            </Link>
          </div>
        </section>

        <section id="begin-application" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
            4. Begin Your 3-Minute Admission Dossier
          </h2>
          <div className="p-5 rounded-lg bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              No long essays or complex questionnaires. Simple, high-signal information so our admissions team can verify your cohort.
            </p>
            <Link
              href="/join"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors shrink-0"
            >
              Start Application at /join
            </Link>
          </div>
        </section>
      </article>
    </DocsShell>
  );
}
