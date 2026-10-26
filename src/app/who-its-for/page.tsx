import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Compass,
  Rocket,
  Award,
  CheckCircle2,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  MapPin,
  Lock,
  Building,
  Target,
  Layers,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Who It's For · Membership Tiers & Cohorts | OASIS Odisha",
  description:
    "Explore OASIS membership cohorts: Aspiring Entrepreneurs, Startup Founders, and Mentors across Odisha. Discover peer roundtables, mentorship, and ecosystem capital.",
  alternates: {
    canonical: "/who-its-for",
  },
  keywords: [
    "OASIS Membership",
    "Odisha Startup Founders",
    "Startup Mentors Odisha",
    "Aspiring Entrepreneurs Bhubaneswar",
    "Startup Odisha Cohorts",
    "Founder Network India",
  ],
  openGraph: {
    title: "Who It's For · Membership Tiers & Cohorts | OASIS Odisha",
    description:
      "Explore OASIS membership cohorts: Aspiring Entrepreneurs, Startup Founders, and Mentors across Odisha.",
    url: "https://oasisodisha.in/who-its-for",
    type: "website",
  },
};

export default function WhoItsForPage() {
  const cohorts = [
    {
      id: "aspiring",
      role: "Aspiring Entrepreneurs",
      badgeVariant: "aspiring" as const,
      badgeText: "Ideation & Validation",
      icon: Compass,
      audience: "Student innovators, researchers, engineers & pre-incorporation builders",
      headline: "Validate your problem statement before burning capital.",
      description:
        "Designed for those turning research, domain insights, or early concepts into viable enterprises. Get direct feedback from serial operators who have built in Odisha and across India.",
      benefits: [
        "Test customer hypotheses in closed-door peer roundtables",
        "Match with complementary technical or business co-founders",
        "Navigate Startup Odisha Ideation Grants and college incubator pathways",
        "Receive honest code & architecture critiques without public exposure",
      ],
      commitments: "Active participation in community discussions and commitment to building ethical, scalable ventures.",
    },
    {
      id: "founders",
      role: "Founders & Co-Founders",
      badgeVariant: "founder" as const,
      badgeText: "Building & Scaling",
      icon: Rocket,
      audience: "Seed, Pre-Series A, and bootstrapped startup operators with active ventures",
      headline: "Execute faster with high-signal, unvarnished peer intelligence.",
      description:
        "The core engine of OASIS. Connect with founders who understand state procurement, rural distribution, angel syndicate dynamics, and regional hiring nuances.",
      benefits: [
        "Unfiltered community Q&A on grants, taxation, pilots, and IP protection",
        "Closed-door Demo Nights with Odisha Angel Network & national venture funds",
        "Vetted introductions to enterprise pilots across Odisha's industrial corridor",
        "Direct referrals to reliable engineering, design, and legal talent",
      ],
      commitments: "Must be actively building or operating a registered entity or early prototype in or connected to Odisha.",
    },
    {
      id: "mentors",
      role: "Mentors & Advisors",
      badgeVariant: "verified-mentor" as const,
      badgeText: "Verified Advisory",
      icon: Award,
      audience: "Seasoned operators, CXOs, technology leaders, angel investors & exited founders",
      headline: "Give back to Odisha's future on your terms with total privacy.",
      description:
        "We protect mentor time and mental bandwidth. Phone numbers and email addresses remain strictly private by default, and incoming connection requests are rate-limited.",
      benefits: [
        "Strictly enforced maximum 10 connection requests/day inbound quota",
        "Private-by-default contact details protected from scrapers and cold pitches",
        "Pre-screened founder dossiers so every interaction is high-context",
        "Invitations to host curated masterclasses and judge ecosystem demo days",
      ],
      commitments: "Commitment to providing constructive, non-commercial advice to rising founders.",
    },
  ];

  const comparison = [
    { feature: "Verified Profile in Ecosystem Directory", aspiring: true, founder: true, mentor: true },
    { feature: "Access to Community Q&A & Resource Knowledgebase", aspiring: true, founder: true, mentor: true },
    { feature: "RSVP to Offline Roundtables & Demo Nights", aspiring: "Select Events", founder: true, mentor: true },
    { feature: "Founder-to-Founder Closed Channels", aspiring: false, founder: true, mentor: false },
    { feature: "Direct 1-on-1 Mentor Connection Requests", aspiring: "Quota: 3/mo", founder: "Quota: 10/mo", mentor: "Inbound Only" },
    { feature: "Investor Syndicate Introductions", aspiring: "Pitch Clinics", founder: true, mentor: true },
    { feature: "Privacy-Protected Contact Masking", aspiring: true, founder: true, mentor: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-[#F3D3A2]/30 selection:text-[#1E1F33]">
      <PublicHeader activeRoute="who-its-for" />

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#151624] via-[#1E1F33] to-[#181928] text-[var(--brand-cream)] px-4 sm:px-8 lg:px-12 pt-14 pb-18 sm:pt-20 sm:pb-24 border-b border-[var(--brand-gold)]/20">
        <div
          className="absolute -top-32 left-1/3 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(243,211,162,0.1)_0%,transparent_70%)] blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-[1240px] mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[var(--brand-gold)]/25 backdrop-blur-md">
            <Users className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
              MEMBERSHIP TIERS &amp; COHORTS
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-light text-[var(--brand-cream)] tracking-tight max-w-4xl mx-auto leading-tight">
            Built for Every Phase of the Venture Journey in Odisha
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[var(--brand-cream)]/75 max-w-2xl mx-auto leading-relaxed">
            OASIS is an invitation and application-only network uniting 650+ aspiring entrepreneurs, early-stage operators, and verified advisors into one high-trust ecosystem.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="gold" className="rounded-full px-7 shadow-md" asChild>
              <Link href="/join">Apply to Your Cohort</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6 border-white/20 text-[var(--brand-cream)] hover:bg-white/5" asChild>
              <Link href="/admission">Explore Admission Protocol</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Main Cohort Deep Dives ──────────────────────────────────── */}
      <main className="flex-1 max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-20 space-y-16">
        <div className="space-y-12">
          {cohorts.map((cohort, idx) => {
            const Icon = cohort.icon;
            return (
              <div
                key={cohort.id}
                id={cohort.id}
                className="card-luxury p-7 sm:p-10 rounded-3xl border border-[var(--border)] hover:border-[var(--brand-gold)]/40 transition-all duration-300 space-y-6 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#1E1F33] border border-[#F3D3A2]/30 flex items-center justify-center text-[#F3D3A2] shrink-0 shadow-sm">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="font-display text-2xl sm:text-3xl font-medium text-[var(--text)]">
                          {cohort.role}
                        </h2>
                        <Badge variant={cohort.badgeVariant}>{cohort.badgeText}</Badge>
                      </div>
                      <p className="text-xs text-[var(--muted)] font-mono mt-1">
                        COHORT #{idx + 1} · {cohort.audience}
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="rounded-full shrink-0 border-[var(--brand-gold)]/40 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/10" asChild>
                    <Link href={`/join?role=${cohort.id}`}>
                      Apply as {cohort.role.split(" ")[0]} →
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-5 space-y-3">
                    <h3 className="text-lg font-medium text-[var(--text)] leading-snug">
                      {cohort.headline}
                    </h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      {cohort.description}
                    </p>
                    <div className="pt-2">
                      <span className="text-xs font-mono text-[var(--brand-gold)] block mb-1">MEMBERSHIP COMMITMENT:</span>
                      <p className="text-xs text-[var(--muted)] italic leading-relaxed">
                        "{cohort.commitments}"
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-7 bg-[var(--surface-2)]/60 rounded-2xl p-6 border border-[var(--border)] space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
                      KEY COHORT CAPABILITIES
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {cohort.benefits.map((benefit, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2.5 text-xs text-[var(--text)] leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Side-by-Side Matrix ────────────────────────────────────── */}
        <section className="space-y-6 pt-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-semibold">
              FEATURE COMPARISON
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[var(--text)]">
              Cohort Access Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              How features and permissions are calibrated to safeguard trust and bandwidth.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="w-full text-left text-xs text-[var(--text)]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                  <th className="py-3.5 px-4 sm:px-6 font-semibold">Platform Capability</th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold text-center text-[#F3D3A2]">Aspiring</th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold text-center text-[#88DECC]">Founder</th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold text-center text-amber-300">Mentor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {comparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-[var(--text)]">{row.feature}</td>
                    <td className="py-3.5 px-4 sm:px-6 text-center text-[var(--muted)]">
                      {typeof row.aspiring === "boolean" ? (
                        row.aspiring ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-white/20">—</span>
                      ) : (
                        row.aspiring
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center text-[var(--muted)]">
                      {typeof row.founder === "boolean" ? (
                        row.founder ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-white/20">—</span>
                      ) : (
                        row.founder
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center text-[var(--muted)]">
                      {typeof row.mentor === "boolean" ? (
                        row.mentor ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-white/20">—</span>
                      ) : (
                        row.mentor
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────── */}
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#1E1F33] via-[#23243A] to-[#1E1F33] border border-[var(--brand-gold)]/30 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand-gold)]/10 border border-[var(--brand-gold)]/30 flex items-center justify-center text-[var(--brand-gold)] mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-light text-[var(--brand-cream)] tracking-tight">
            Find Your Place in Odisha's Premier Sanctuary
          </h2>
          <p className="text-xs sm:text-sm text-[var(--brand-cream)]/75 max-w-xl mx-auto leading-relaxed">
            Every application is evaluated by admissions personnel within 48 hours to preserve the integrity of our verified community.
          </p>
          <div className="pt-2">
            <Button size="lg" variant="gold" className="rounded-full px-8 shadow-lg" asChild>
              <Link href="/join">Start 3-Minute Application</Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
