import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Rocket, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { DocsShell } from "@/components/layout/DocsShell";
import { DocsPageHeader } from "@/components/layout/DocsPageHeader";

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
      sectionHeading: "1. Aspiring Entrepreneurs",
      role: "Aspiring Entrepreneurs",
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
      commitments:
        "Active participation in community discussions and commitment to building ethical, scalable ventures.",
    },
    {
      id: "founders",
      sectionHeading: "2. Founders & Co-Founders",
      role: "Founders & Co-Founders",
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
      commitments:
        "Must be actively building or operating a registered entity or early prototype in or connected to Odisha.",
    },
    {
      id: "mentors",
      sectionHeading: "3. Mentors & Advisors",
      role: "Mentors & Advisors",
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
    {
      feature: "Direct 1-on-1 Mentor Connection Requests",
      aspiring: "Quota: 3/mo",
      founder: "Quota: 10/mo",
      mentor: "Inbound Only",
    },
    { feature: "Investor Syndicate Introductions", aspiring: "Pitch Clinics", founder: true, mentor: true },
    { feature: "Privacy-Protected Contact Masking", aspiring: true, founder: true, mentor: true },
  ];

  return (
    <DocsShell>
      <article className="space-y-10 text-[15px] leading-7 text-gray-700">
        <DocsPageHeader
          title="Who It's For · Membership Tiers & Cohorts"
          meta="Built for Every Phase of the Venture Journey in Odisha"
          subtitle="OASIS is an invitation and application-only network uniting 650+ aspiring entrepreneurs, early-stage operators, and verified advisors into one high-trust ecosystem."
        />

        <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
          <Link
            href="/join"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors"
          >
            Apply to Your Cohort
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admission"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Explore Admission Protocol
          </Link>
        </div>

        {cohorts.map((cohort, idx) => {
          const Icon = cohort.icon;
          return (
            <section key={cohort.id} id={cohort.id} className="scroll-mt-24 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-200">
                <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#4F46E5] shrink-0" />
                  <span>{cohort.sectionHeading}</span>
                </h2>
                <span className="text-xs font-mono text-[#4F46E5] bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                  {cohort.badgeText}
                </span>
              </div>

              <div className="p-5 sm:p-6 rounded-lg border border-gray-200 bg-white space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-gray-500">
                      COHORT #{idx + 1} · {cohort.audience}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">{cohort.headline}</h3>
                  </div>
                  <Link
                    href={`/join?role=${cohort.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#4F46E5] border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors shrink-0"
                  >
                    Apply as {cohort.role.split(" ")[0]} &rarr;
                  </Link>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">{cohort.description}</p>

                <div className="p-4 rounded-md bg-gray-50 border border-gray-200 space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                    Key Cohort Capabilities
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {cohort.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600">
                  <strong className="text-gray-900">Membership Commitment:</strong> {cohort.commitments}
                </p>
              </div>
            </section>
          );
        })}

        <section id="access-matrix" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
            4. Cohort Access Matrix
          </h2>
          <p className="text-sm text-gray-600">
            How features and permissions are calibrated across cohorts to safeguard trust and mentor bandwidth.
          </p>

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-xs sm:text-sm text-gray-700">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-900">
                  <th className="py-3 px-4 font-semibold">Platform Capability</th>
                  <th className="py-3 px-4 font-semibold text-center">Aspiring</th>
                  <th className="py-3 px-4 font-semibold text-center">Founder</th>
                  <th className="py-3 px-4 font-semibold text-center">Mentor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparison.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {typeof row.aspiring === "boolean" ? (
                        row.aspiring ? (
                          <span className="text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        row.aspiring
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {typeof row.founder === "boolean" ? (
                        row.founder ? (
                          <span className="text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
                      ) : (
                        row.founder
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {typeof row.mentor === "boolean" ? (
                        row.mentor ? (
                          <span className="text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )
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

        <section id="apply-cta" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
            5. Ready to Apply?
          </h2>
          <div className="p-5 rounded-lg bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <strong className="text-sm font-semibold text-gray-900 block">
                Find Your Place in Odisha&rsquo;s Premier Sanctuary
              </strong>
              <p className="text-xs sm:text-sm text-gray-600">
                Every application is evaluated by admissions personnel within 48 hours to preserve the integrity of our verified community.
              </p>
            </div>
            <Link
              href="/join"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors shrink-0"
            >
              Start 3-Minute Application
            </Link>
          </div>
        </section>
      </article>
    </DocsShell>
  );
}
