import Link from "next/link";
import { Shield, FileText, Lock, Users, AlertCircle, Cookie, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Legal & Governance Hub · OASIS ONE",
  description: "Official legal documents, statutory policies, DPDP Act 2023 compliance, and community guidelines for OASIS ONE.",
};

const POLICIES = [
  {
    title: "Terms of Service & Membership Agreement",
    href: "/legal/terms",
    docType: "terms_of_service",
    version: "1.0",
    description: "Binding contract under Indian Contract Act 1872 covering membership vetting, 18+ age gate, account security, and explicit non-financial disclaimers.",
    icon: FileText,
    statutory: "Indian Contract Act, 1872 · IT Act 2000",
  },
  {
    title: "Privacy Notice & Data Protection Policy",
    href: "/legal/privacy",
    docType: "privacy_notice",
    version: "1.0",
    description: "Complete personal data inventory, private-by-default phone/email controls, retention schedule, and rights under Digital Personal Data Protection Act, 2023.",
    icon: Lock,
    statutory: "DPDP Act 2023 · SPDI Rules 2011",
  },
  {
    title: "Community Guidelines & Content Policy",
    href: "/legal/guidelines",
    docType: "community_guidelines",
    version: "1.0",
    description: "Code of conduct, anti-harassment rules, 24h achievement guidelines, and mandatory zero-tolerance policy against fraudulent fundraising & improper investor solicitation.",
    icon: Users,
    statutory: "IT Intermediary Rules 2021 (Rule 3)",
  },
  {
    title: "Grievance Redressal, Support & Appeals",
    href: "/legal/grievance",
    docType: "grievance_policy",
    version: "1.0",
    description: "Designated Grievance Officer contact, SLA resolution milestones (24h ack, 15d resolution), independent oversight routing for admin misconduct, and suspension appeals.",
    icon: AlertCircle,
    statutory: "IT Rules 2021 (Rule 3(2)) · DPDP Act Sec 13",
  },
  {
    title: "Platform Operations, Backup & Cookie Policy",
    href: "/legal/cookies",
    docType: "operations_policy",
    version: "1.0",
    description: "Strictly necessary cookie schedule (zero third-party tracking), server-side rate limits (429 quotas), ClamAV virus scanning, and AWS S3 backup retention.",
    icon: Cookie,
    statutory: "Platform Operations & Security §13/§14",
  },
];

export default function LegalIndexPage() {
  return (
    <div className="space-y-12">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="space-y-4 pb-8 border-b border-[var(--border)]">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--brand-gold)] bg-[var(--surface-2)] px-3 py-1 rounded-full border border-[var(--border)]">
          <Shield className="w-3.5 h-3.5" />
          <span>STATUTORY COMPLIANCE & LEGAL GOVERNANCE · VERSION 1.0</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text)]">
          OASIS ONE Legal & Compliance Hub
        </h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
          OASIS ONE is an admin-approved, role-aware digital home for 650+ entrepreneurs across Odisha.
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
              className="group block p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--brand-gold)] hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--brand-gold)] group-hover:bg-[var(--brand-gold)] group-hover:text-[var(--brand-navy)] transition-colors shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[var(--text)] group-hover:text-[var(--brand-gold)] transition-colors">
                      {policy.title}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--muted)]">
                      <span>Doc Type: {policy.docType}</span>
                      <span>·</span>
                      <span>v{policy.version}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-[var(--brand-gold)] group-hover:translate-x-0.5 transition-transform">
                  <span>Read Document</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <p className="text-xs text-[var(--muted)] leading-relaxed pl-0 sm:pl-[52px]">
                {policy.description}
              </p>

              <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--muted)]/80 pl-0 sm:pl-[52px] pt-1">
                <span className="font-semibold text-[var(--text)]/70">Statutory Framework:</span>
                <span>{policy.statutory}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Summary Compliance Table ──────────────────────────── */}
      <div className="p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Statutory Disclosures & Entity Information</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[var(--muted)]">
          <div>
            <span className="font-semibold text-[var(--text)]">Legal Entity:</span> OASIS
          </div>
          <div>
            <span className="font-semibold text-[var(--text)]">Jurisdiction:</span> Bhubaneswar, Odisha, India
          </div>
          <div>
            <span className="font-semibold text-[var(--text)]">Minimum Age:</span> 18+ Years (Strictly Enforced)
          </div>
          <div>
            <span className="font-semibold text-[var(--text)]">Phone:</span> +91-904-01-98-628
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold text-[var(--text)]">Registered Address:</span> Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018
          </div>
          <div className="sm:col-span-2">
            <span className="font-semibold text-[var(--text)]">Official Email:</span> Info@oasisodisha.in
          </div>
        </div>
      </div>
    </div>
  );
}
