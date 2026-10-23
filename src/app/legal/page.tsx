import Link from "next/link";
import {
  Shield,
  FileText,
  Lock,
  Users,
  AlertCircle,
  Cookie,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Legal & Governance Hub · OASIS",
  description:
    "Official legal documents, statutory policies, DPDP Act 2023 compliance, and community guidelines for OASIS.",
};

const POLICIES = [
  {
    title: "Terms of Service & Membership Agreement",
    href: "/legal/terms",
    docType: "terms_of_service",
    version: "1.0",
    description:
      "Binding contract under Indian Contract Act 1872 covering membership vetting, 18+ age gate, account security, and explicit non-financial disclaimers.",
    icon: FileText,
    statutory: "Indian Contract Act, 1872 · IT Act 2000",
  },
  {
    title: "Privacy Notice & Data Protection Policy",
    href: "/legal/privacy",
    docType: "privacy_notice",
    version: "1.0",
    description:
      "Complete personal data inventory, private-by-default phone/email controls, retention schedule, and rights under Digital Personal Data Protection Act, 2023.",
    icon: Lock,
    statutory: "DPDP Act 2023 · SPDI Rules 2011",
  },
  {
    title: "Community Guidelines & Content Policy",
    href: "/legal/guidelines",
    docType: "community_guidelines",
    version: "1.0",
    description:
      "Code of conduct, anti-harassment rules, 24h achievement guidelines, and mandatory zero-tolerance policy against fraudulent fundraising & improper investor solicitation.",
    icon: Users,
    statutory: "IT Intermediary Rules 2021 (Rule 3)",
  },
  {
    title: "Grievance Redressal, Support & Appeals",
    href: "/legal/grievance",
    docType: "grievance_policy",
    version: "1.0",
    description:
      "Designated Grievance Officer contact, SLA resolution milestones (24h ack, 15d resolution), independent oversight routing for admin misconduct, and suspension appeals.",
    icon: AlertCircle,
    statutory: "IT Rules 2021 (Rule 3(2)) · DPDP Act Sec 13",
  },
  {
    title: "Platform Operations, Backup & Cookie Policy",
    href: "/legal/cookies",
    docType: "operations_policy",
    version: "1.0",
    description:
      "Strictly necessary cookie schedule (zero third-party tracking), server-side rate limits (429 quotas), ClamAV virus scanning, and AWS S3 backup retention.",
    icon: Cookie,
    statutory: "Platform Operations & Security §13/§14",
  },
];

export default function LegalIndexPage() {
  return (
    <div className="space-y-12">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="space-y-4 pb-8 border-b border-white/10">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#88DECC] bg-[#88DECC]/10 px-3 py-1 rounded-full border border-[#88DECC]/25">
          <Shield className="w-3.5 h-3.5" />
          <span>STATUTORY COMPLIANCE &amp; LEGAL GOVERNANCE · VERSION 1.0</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white">
          OASIS Legal &amp; Compliance Hub
        </h1>
        <p className="text-sm sm:text-base text-[#FCF6E3]/75 leading-relaxed max-w-2xl">
          OASIS is an admin-approved, role-aware digital sanctuary for 650+ entrepreneurs across Odisha.
          Below you will find our complete statutory covenants, privacy guarantees under the DPDP Act 2023,
          and anti-fraud investor solicitation rules.
        </p>
      </div>

      {/* ── Policy Cards Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5">
        {POLICIES.map((policy) => {
          const Icon = policy.icon;
          return (
            <Link
              key={policy.href}
              href={policy.href}
              className="group block p-6 sm:p-7 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#F3D3A2]/50 hover:bg-white/[0.05] transition-all duration-300 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#F3D3A2] group-hover:bg-[#F3D3A2]/20 group-hover:text-white transition-all shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white group-hover:text-[#F3D3A2] transition-colors">
                      {policy.title}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#FCF6E3]/50">
                      <span>Doc Type: {policy.docType}</span>
                      <span>·</span>
                      <span>v{policy.version}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#F3D3A2] group-hover:translate-x-1 transition-transform">
                  <span>Read Policy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#FCF6E3]/75 leading-relaxed pl-0 sm:pl-[56px]">
                {policy.description}
              </p>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[#FCF6E3]/50 pl-0 sm:pl-[56px] pt-1">
                <span className="font-semibold text-[#88DECC]">Statutory Framework:</span>
                <span>{policy.statutory}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Summary Compliance Table ──────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Statutory Disclosures &amp; Entity Information</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#FCF6E3]/70">
          <div>
            <span className="font-semibold text-white">Legal Entity:</span> OASIS
          </div>
          <div>
            <span className="font-semibold text-white">Jurisdiction:</span> Bhubaneswar, Odisha, India
          </div>
          <div>
            <span className="font-semibold text-white">Minimum Age:</span> 18+ Years (Strictly Enforced)
          </div>
          <div>
            <span className="font-semibold text-white">Phone:</span> +91-904-01-98-628
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold text-white">Registered Address:</span> Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold text-white">Official Email:</span> Info@oasisodisha.in
          </div>
        </div>
      </div>
    </div>
  );
}
