import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  FileText,
  UserCheck,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Send,
  Eye,
  Key,
} from "lucide-react";

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
      border: "border-emerald-500/30",
      accent: "text-emerald-400",
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
      border: "border-rose-500/30",
      accent: "text-rose-400",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-[#F3D3A2]/30 selection:text-[#1E1F33]">
      <PublicHeader activeRoute="admission" />

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#151624] via-[#1E1F33] to-[#181928] text-[var(--brand-cream)] px-4 sm:px-8 lg:px-12 pt-14 pb-18 sm:pt-20 sm:pb-24 border-b border-[var(--brand-gold)]/20">
        <div
          className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(243,211,162,0.1)_0%,transparent_70%)] blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-[1240px] mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[var(--brand-gold)]/25 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
              ADMISSION PROTOCOL &amp; STANDARDS
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-light text-[var(--brand-cream)] tracking-tight max-w-4xl mx-auto leading-tight">
            Three Steps to Verified Membership
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[var(--brand-cream)]/75 max-w-2xl mx-auto leading-relaxed">
            Admission is exclusively by application to preserve high community integrity and mutual trust. Every member is vetted by hand.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="gold" className="rounded-full px-8 shadow-md" asChild>
              <Link href="/join">Start Application</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6 border-white/20 text-[var(--brand-cream)] hover:bg-white/5" asChild>
              <Link href="/who-its-for">View Membership Tiers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Steps Timeline ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-20 space-y-20">
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-semibold">
              STEP-BY-STEP ADMISSION PROCESS
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[var(--text)]">
              How Your Application is Evaluated
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              From submission to live unlock, every step is built for speed and radical transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="card-luxury p-7 sm:p-8 rounded-3xl border border-[var(--border)] flex flex-col justify-between hover:border-[var(--brand-gold)]/40 transition-all duration-300 space-y-6 relative"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-4xl font-light text-[var(--brand-gold)]">
                        {item.step}
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-[#1E1F33] border border-[#F3D3A2]/25 flex items-center justify-center text-[#F3D3A2]">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-medium text-[var(--text)]">
                        {item.title}
                      </h3>
                      <span className="text-xs font-mono text-[var(--brand-gold)] block mt-1">
                        {item.timing}
                      </span>
                      <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed mt-2.5">
                        {item.summary}
                      </p>
                    </div>

                    <ul className="space-y-2.5 pt-2 border-t border-[var(--border)] text-xs text-[var(--text)]">
                      {item.details.map((d, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Admissions Criteria Comparison ─────────────────────────── */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-semibold">
              COMMUNITY CURATION
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[var(--text)]">
              Admission Standards &amp; Review Principles
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              Why our approval process maintains the highest founder trust in Odisha.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {standards.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className={`p-7 sm:p-8 rounded-3xl bg-[var(--surface)] border ${s.border} space-y-5`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${s.accent}`} />
                    <h3 className="font-display text-xl font-medium text-[var(--text)]">
                      {s.title}
                    </h3>
                  </div>

                  <ul className="space-y-3 text-xs sm:text-sm text-[var(--text)]">
                    {s.items.map((it, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                        <span className={`font-bold ${s.accent}`}>•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── WhatsApp Community Migration Notice ────────────────────── */}
        <div className="rounded-3xl p-7 sm:p-9 bg-[var(--surface-2)] border border-[var(--brand-gold)]/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--brand-gold)]">
              <Sparkles className="w-4 h-4" />
              <span>PRE-APPROVED MEMBER NOTICE</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-medium text-[var(--text)]">
              Already in the OASIS WhatsApp Group?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              If you received a 14-day invite token via email, click it to activate your membership instantly. If your invite link expired, simply apply at <code className="text-[#88DECC] font-mono">/join</code> using your recognized email for expedited 24-hour verification.
            </p>
          </div>

          <Button variant="gold" className="rounded-full px-6 shrink-0 shadow-md" asChild>
            <Link href="/faq">Read Migration FAQ →</Link>
          </Button>
        </div>

        {/* ── Final Call to Action ──────────────────────────────────── */}
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#1E1F33] via-[#23243A] to-[#1E1F33] border border-[var(--brand-gold)]/30 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand-gold)]/10 border border-[var(--brand-gold)]/30 flex items-center justify-center text-[var(--brand-gold)] mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-light text-[var(--brand-cream)] tracking-tight">
            Begin Your 3-Minute Admission Dossier
          </h2>
          <p className="text-xs sm:text-sm text-[var(--brand-cream)]/75 max-w-xl mx-auto leading-relaxed">
            No long essays or complex questionnaires. Simple, high-signal information so our admissions team can verify your cohort.
          </p>
          <div className="pt-2">
            <Button size="lg" variant="gold" className="rounded-full px-8 shadow-lg" asChild>
              <Link href="/join">Start Application at /join</Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
