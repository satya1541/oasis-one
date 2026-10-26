import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Sparkles,
  Search,
  MessageSquare,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  EyeOff,
  Flame,
  Zap,
  Award,
  Layers,
  Heart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "The Sanctuary Experience · Quiet Focus for Builders | OASIS Odisha",
  description:
    "Explore the OASIS sanctuary experience. An ad-free, signal-first platform for Odisha's 650+ startup founders, mentors, and operators.",
  alternates: {
    canonical: "/experience",
  },
  keywords: [
    "OASIS Experience",
    "Founder Sanctuary Odisha",
    "Ad-Free Startup Community",
    "Bhubaneswar Tech Founders",
    "Odisha Startup Platform",
    "Founder Workspace Odisha",
  ],
  openGraph: {
    title: "The Sanctuary Experience · Quiet Focus for Builders | OASIS Odisha",
    description:
      "Explore the OASIS sanctuary experience. An ad-free, signal-first platform for Odisha's 650+ startup founders.",
    url: "https://oasisodisha.in/experience",
    type: "website",
  },
};

export default function ExperiencePage() {
  const pillars = [
    {
      title: "Radical Signal-to-Noise Ratio",
      description:
        "No sponsored ads, no engagement algorithms, and no vanity metrics. Discussions are categorized into actionable problem spaces: Grants, Pilots, Hiring, and Co-founder matching.",
      icon: Zap,
    },
    {
      title: "Private-by-Default Architecture",
      description:
        "Your contact details remain shielded from crawlers and cold prospecting. Members interact through role-aware permissions, protected connection quotas, and DPDP Act compliance.",
      icon: Lock,
    },
    {
      title: "Odisha-Specific Ecosystem Depth",
      description:
        "Access ground-truth insights tailored to Odisha: state incubation schemes, angel syndicates, mining/industrial procurement pilots, and regional engineering talent.",
      icon: Layers,
    },
    {
      title: "Peer-Level Accountability",
      description:
        "Because every participant is authenticated with verified real-world identities, interactions are polite, substantive, and collaborative rather than transactional.",
      icon: ShieldCheck,
    },
  ];

  const tools = [
    {
      name: "Verified Directory",
      tagline: "Precision Search Across Odisha's Builders",
      description: "Filter founders by venture stage (Ideation, Pre-Seed, Growth) and sector tags (Agri, DeepTech, Climate, HealthTech).",
      icon: Users,
    },
    {
      name: "Structured Discussions",
      tagline: "High-Signal Q&A Without Noise",
      description: "Ask detailed questions on grant paperwork, pilot contracts, and architectural decisions. Vetted answers earn founder endorsements.",
      icon: MessageSquare,
    },
    {
      name: "Closed-Door Events",
      tagline: "Demo Nights & Investor Roundtables",
      description: "Curated in-person sessions in Bhubaneswar, Cuttack, and regional academic incubators with real-time attendee caps.",
      icon: Calendar,
    },
    {
      name: "Capped Mentorship",
      tagline: "Respectful, High-Context Advice",
      description: "Send pre-screened guidance requests. Mentors are protected by a strict quota of 10 inbound requests per day.",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-[#F3D3A2]/30 selection:text-[#1E1F33]">
      <PublicHeader activeRoute="experience" />

      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#151624] via-[#1E1F33] to-[#181928] text-[var(--brand-cream)] px-4 sm:px-8 lg:px-12 pt-14 pb-18 sm:pt-20 sm:pb-24 border-b border-[var(--brand-gold)]/20">
        <div
          className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(243,211,162,0.1)_0%,transparent_70%)] blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-[1240px] mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[var(--brand-gold)]/25 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
              THE SANCTUARY PHILOSOPHY
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-light text-[var(--brand-cream)] tracking-tight max-w-4xl mx-auto leading-tight">
            A Quiet, Focused Workspace for Serious Builders
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[var(--brand-cream)]/75 max-w-2xl mx-auto leading-relaxed">
            Designed with precision and restraint. No ads, no algorithmic attention traps, and no unsolicited marketing. Just the high-caliber network you need to advance your enterprise.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="gold" className="rounded-full px-8 shadow-md" asChild>
              <Link href="/join">Apply to Join</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6 border-white/20 text-[var(--brand-cream)] hover:bg-white/5" asChild>
              <Link href="/login">Member Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Interactive Interface Mockup ────────────────────────────── */}
      <main className="flex-1 max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-20 space-y-20">
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-semibold">
              PLATFORM PREVIEW
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[var(--text)]">
              The Member Portal at a Glance
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              A bespoke dark luxury interface tailored for deep focus and effortless connection.
            </p>
          </div>

          <div className="relative mx-auto max-w-5xl rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-[#1E1F33]/90 to-[#12131F]/95 border border-[var(--brand-gold)]/25 shadow-[0_24px_60px_-15px_rgba(30,31,51,0.25)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-[11px] font-mono text-white/40 tracking-wider">
                  OASIS PORTAL · VERIFIED SANCTUARY
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  REALTIME SECURE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-2 sm:p-4 text-white">
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white/50 text-sm">
                    <Search className="w-4 h-4 text-[#F3D3A2]" />
                    <span>Search mentors, founders, state grants...</span>
                  </div>
                  <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white/10 text-white/60 rounded border border-white/10">
                    ⌘K
                  </kbd>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#F3D3A2] font-semibold uppercase tracking-wider text-[11px]">
                      UPCOMING ROUNDTABLE
                    </span>
                    <span className="text-white/40">This Saturday · 6:30 PM</span>
                  </div>
                  <h4 className="font-display text-lg text-white font-medium">
                    Founders Demo Night — Bhubaneswar Tech Corridor
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Closed-door feedback session with 4 institutional investors and seed-stage operators.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-white/10">
                    <span className="text-emerald-400 font-mono text-[11px]">42 of 60 Registered</span>
                    <span className="text-[#F3D3A2] font-medium">Reserve Seat →</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-[var(--brand-gold)]/20 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-mono tracking-wider text-[#F3D3A2]">
                      VERIFIED ADVISOR
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E9C68C] text-[#1E1F33] text-[10px] font-semibold">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#1E1F33] border border-[#F3D3A2] flex items-center justify-center font-display text-sm font-semibold text-[#F3D3A2]">
                      DB
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Dr. Debashis Barik</h4>
                      <p className="text-xs text-white/60">DeepTech &amp; AI Systems · Bhubaneswar</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed">
                    “Helped 14 Odisha startups architect enterprise pilot deployments.”
                  </p>
                  <div className="pt-2">
                    <div className="w-full py-2 rounded-xl bg-white/10 border border-[#F3D3A2]/30 text-xs font-medium text-center text-[#FCF6E3]">
                      Request 1-on-1 Advisory Session
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Core Sanctuary Pillars ──────────────────────────────────── */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-semibold">
              DESIGNED DIFFERENTLY
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[var(--text)]">
              Four Principles That Guide Every Feature
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              Why OASIS feels unlike any social network or public discussion group.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="card-luxury p-7 sm:p-8 rounded-3xl border border-[var(--border)] hover:border-[var(--brand-gold)]/40 transition-colors space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#1E1F33] border border-[#F3D3A2]/30 flex items-center justify-center text-[#F3D3A2]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-medium text-[var(--text)]">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Key Tooling Suite ───────────────────────────────────────── */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-semibold">
              FUNCTIONAL ARSENAL
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-normal text-[var(--text)]">
              Tools Engineered for Ecosystem Builders
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((t, idx) => {
              const Icon = t.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3 flex flex-col justify-between hover:border-[var(--brand-gold)]/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)] border border-[var(--border)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-lg font-medium text-[var(--text)]">
                      {t.name}
                    </h3>
                    <p className="text-[11px] font-mono text-[var(--brand-gold)]">
                      {t.tagline}
                    </p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────── */}
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#1E1F33] via-[#23243A] to-[#1E1F33] border border-[var(--brand-gold)]/30 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand-gold)]/10 border border-[var(--brand-gold)]/30 flex items-center justify-center text-[var(--brand-gold)] mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-light text-[var(--brand-cream)] tracking-tight">
            Ready to Experience the OASIS Sanctuary?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--brand-cream)]/75 max-w-xl mx-auto leading-relaxed">
            Join 650+ verified founders, mentors, and innovators across Odisha.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="gold" className="rounded-full px-8 shadow-lg" asChild>
              <Link href="/join">Apply for Membership</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6 border-white/20 text-[var(--brand-cream)] hover:bg-white/5" asChild>
              <Link href="/login">Member Sign In</Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
