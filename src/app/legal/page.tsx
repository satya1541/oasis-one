import Link from "next/link";
import {
  FileText,
  Lock,
  Users,
  AlertCircle,
  Cookie,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { DocsPageHeader } from "@/components/layout/DocsPageHeader";

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
    <article className="space-y-10 text-[15px] leading-7 text-gray-700">
      <DocsPageHeader
        title="OASIS Legal & Governance Hub"
        meta="Last updated: 16 October 2026 · Version 1.0"
        subtitle="OASIS is an admin-approved, role-aware digital sanctuary for 650+ entrepreneurs across Odisha. Review our statutory covenants, DPDP Act 2023 privacy guarantees, and governance policies."
      />

      <section id="overview" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          1. Overview &amp; Governing Policies
        </h2>
        <p>
          Welcome to the OASIS Legal &amp; Compliance Hub. Every member, mentor, applicant, and visitor interacting with OASIS is protected and governed by the five statutory documents listed below.
        </p>

        <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
          {POLICIES.map((policy) => {
            const Icon = policy.icon;
            return (
              <Link
                key={policy.href}
                href={policy.href}
                className="group block p-5 hover:bg-gray-50 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#4F46E5] transition-colors">
                        {policy.title}
                      </h3>
                      <div className="text-xs font-mono text-gray-500">
                        {policy.docType} · v{policy.version} · {policy.statutory}
                      </div>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-[#4F46E5] shrink-0 pt-1">
                    Read
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed sm:pl-12">
                  {policy.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="disclosures" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          2. Statutory Disclosures &amp; Entity Information
        </h2>
        <div className="p-5 rounded-lg bg-gray-50 border border-gray-200 space-y-3 text-sm">
          <div className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Registered Operator &amp; Compliance Contacts</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600">
            <div>
              <strong className="text-gray-900">Legal Entity:</strong> OASIS
            </div>
            <div>
              <strong className="text-gray-900">Jurisdiction:</strong> Bhubaneswar, Odisha, India
            </div>
            <div>
              <strong className="text-gray-900">Minimum Age:</strong> 18+ Years (Strictly Enforced)
            </div>
            <div>
              <strong className="text-gray-900">Phone:</strong>{" "}
              <a href="tel:+919040198628" className="text-[#4F46E5] hover:underline">
                +91-904-01-98-628
              </a>
            </div>
            <div className="sm:col-span-2">
              <strong className="text-gray-900">Registered Address:</strong> Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018
            </div>
            <div className="sm:col-span-2">
              <strong className="text-gray-900">Official Email:</strong>{" "}
              <a href="mailto:Info@oasisodisha.in" className="text-[#4F46E5] hover:underline">
                Info@oasisodisha.in
              </a>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
