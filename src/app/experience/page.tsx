import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  MessageSquare,
  Calendar,
  Users,
  ShieldCheck,
  Lock,
  ArrowRight,
  Zap,
  Award,
  Layers,
} from "lucide-react";
import { DocsShell } from "@/components/layout/DocsShell";
import { DocsPageHeader } from "@/components/layout/DocsPageHeader";

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
      description:
        "Filter founders by venture stage (Ideation, Pre-Seed, Growth) and sector tags (Agri, DeepTech, Climate, HealthTech).",
      icon: Users,
    },
    {
      name: "Structured Discussions",
      tagline: "High-Signal Q&A Without Noise",
      description:
        "Ask detailed questions on grant paperwork, pilot contracts, and architectural decisions. Vetted answers earn founder endorsements.",
      icon: MessageSquare,
    },
    {
      name: "Closed-Door Events",
      tagline: "Demo Nights & Investor Roundtables",
      description:
        "Curated in-person sessions in Bhubaneswar, Cuttack, and regional academic incubators with real-time attendee caps.",
      icon: Calendar,
    },
    {
      name: "Capped Mentorship",
      tagline: "Respectful, High-Context Advice",
      description:
        "Send pre-screened guidance requests. Mentors are protected by a strict quota of 10 inbound requests per day.",
      icon: Award,
    },
  ];

  return (
    <DocsShell>
      <article className="space-y-10 text-[15px] leading-7 text-gray-700">
        <DocsPageHeader
          title="The Sanctuary Experience"
          meta="Quiet Focus for Serious Builders"
          subtitle="Designed with precision and restraint. No ads, no algorithmic attention traps, and no unsolicited marketing. Just the high-caliber network you need to advance your enterprise."
        />

        <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
          <Link
            href="/join"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors"
          >
            Apply to Join
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Member Sign In
          </Link>
        </div>

        <section id="portal-preview" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
            1. The Member Portal at a Glance
          </h2>
          <p className="text-sm text-gray-600">
            A calm, fast interface tailored for deep focus, searchable intelligence, and verified peer connections.
          </p>

          <div className="rounded-xl p-4 sm:p-5 bg-gray-50 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-xs font-mono text-gray-500">OASIS PORTAL · VERIFIED SANCTUARY</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
                REALTIME SECURE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-7 space-y-3">
                <div className="p-3.5 rounded-lg bg-white border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-gray-500 text-xs sm:text-sm">
                    <Search className="w-4 h-4 text-[#4F46E5]" />
                    <span>Search mentors, founders, state grants...</span>
                  </div>
                  <kbd className="px-2 py-0.5 text-[10px] font-mono bg-gray-100 text-gray-600 rounded border border-gray-200">
                    ⌘K
                  </kbd>
                </div>

                <div className="p-4 rounded-lg bg-white border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4F46E5] font-semibold uppercase tracking-wider text-[11px]">
                      UPCOMING ROUNDTABLE
                    </span>
                    <span className="text-gray-500">This Saturday · 6:30 PM</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Founders Demo Night — Bhubaneswar Tech Corridor
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Closed-door feedback session with 4 institutional investors and seed-stage operators.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-gray-100">
                    <span className="text-emerald-700 font-mono text-[11px]">42 of 60 Registered</span>
                    <span className="text-[#4F46E5] font-medium">Reserve Seat &rarr;</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5">
                <div className="p-4 rounded-lg bg-white border border-gray-200 space-y-3 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-mono tracking-wider text-[#4F46E5] font-semibold">
                        VERIFIED ADVISOR
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-100 text-[10px] font-semibold">
                        Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#111827] text-white flex items-center justify-center font-display text-xs font-semibold">
                        DB
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">Dr. Debashis Barik</h3>
                        <p className="text-xs text-gray-500">DeepTech &amp; AI Systems · Bhubaneswar</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      &ldquo;Helped 14 Odisha startups architect enterprise pilot deployments.&rdquo;
                    </p>
                  </div>
                  <div className="py-1.5 rounded-md bg-gray-50 border border-gray-200 text-xs font-medium text-center text-gray-700">
                    Request 1-on-1 Advisory Session
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="core-pillars" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
            2. Four Principles That Guide Every Feature
          </h2>
          <p className="text-sm text-gray-600">
            Why OASIS feels unlike any social network or public discussion group.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-lg border border-gray-200 bg-white space-y-2.5"
                >
                  <div className="w-9 h-9 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{p.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="tooling-suite" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
            3. Tools Engineered for Ecosystem Builders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tools.map((t, idx) => {
              const Icon = t.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-lg border border-gray-200 bg-gray-50/60 space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[#4F46E5]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{t.name}</h3>
                      <p className="text-[11px] font-mono text-[#4F46E5]">{t.tagline}</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{t.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="get-started" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
            4. Ready to Experience OASIS?
          </h2>
          <div className="p-5 rounded-lg bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Join 650+ verified founders, mentors, and innovators across Odisha.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/join"
                className="px-4 py-2 rounded-md bg-[#4F46E5] text-white text-xs sm:text-sm font-medium hover:bg-[#4338CA] transition-colors"
              >
                Apply for Membership
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Member Sign In
              </Link>
            </div>
          </div>
        </section>
      </article>
    </DocsShell>
  );
}
