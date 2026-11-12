import Link from "next/link";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { DocsPageHeader } from "@/components/layout/DocsPageHeader";

export const metadata = {
  title: "Grievance Redressal, Support & Appeals Policy · OASIS",
  description:
    "Official Grievance Officer contacts, statutory escalation timelines, independent admin misconduct oversight, and appeals procedures for OASIS.",
};

const SLA_STAGES = [
  {
    stage: "1. Submission & Acknowledgement",
    timeline: "Immediate (In-App) / <= 24 Hours (Email)",
    details:
      "System assigns a unique OASIS-GRV-YYYY-XXXX Case ID and dispatches an automated receipt email.",
  },
  {
    stage: "2. Initial Assessment",
    timeline: "Within 48 to 72 Hours",
    details:
      "Designated officer reviews submission against logs, audit records, and applicable guidelines.",
  },
  {
    stage: "3. Investigation & Evidence",
    timeline: "Within 7 Calendar Days",
    details:
      "Parties contacted if additional facts are needed; internal notes logged in confidential audit trail.",
  },
  {
    stage: "4. Final Resolution & Remedy",
    timeline: "<= 15 Calendar Days",
    details:
      "Formal decision communicated in writing with rationale, corrective actions, or appeal options.",
  },
];

export default function GrievancePolicyPage() {
  return (
    <article className="space-y-9 text-[15px] leading-7 text-gray-700">
      <DocsPageHeader
        title="Grievance Redressal, Appeals & Admin Governance"
        meta="Last updated: 16 October 2026 · Version 1.0"
        subtitle="Statutory compliance under Rule 3(2) of the Information Technology (Intermediary Guidelines) Rules, 2021 and Section 13 of the Digital Personal Data Protection Act, 2023."
      />

      <div className="p-5 rounded-lg bg-gray-50 border border-gray-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ShieldCheck className="w-5 h-5 text-[#4F46E5]" />
          <span>Designated Grievance &amp; Compliance Officer</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-600">
          <div>
            <strong className="text-gray-900">Designation:</strong> Grievance Officer — OASIS Administration
          </div>
          <div>
            <strong className="text-gray-900">Organization:</strong> OASIS (Odisha Startup Community)
          </div>
          <div>
            <strong className="text-gray-900">Official Email:</strong>{" "}
            <a href="mailto:Info@oasisodisha.in" className="text-[#4F46E5] hover:underline">
              Info@oasisodisha.in
            </a>
          </div>
          <div>
            <strong className="text-gray-900">Telephone:</strong>{" "}
            <a href="tel:+919040198628" className="text-[#4F46E5] hover:underline">
              +91-904-01-98-628
            </a>
          </div>
          <div className="sm:col-span-2">
            <strong className="text-gray-900">Office Address:</strong> Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018
          </div>
        </div>
      </div>

      <section id="how-to-submit" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          1. How to Submit a Support Inquiry or Grievance
        </h2>
        <p>
          OASIS provides universal access to grievance submission across all user states—including to pending applicants on the Locked Dashboard and to members on the Suspended Account screen:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1.5">
            <strong className="text-gray-900 block text-sm">Method A: In-App Support Form</strong>
            <p className="text-xs sm:text-sm text-gray-600">
              Use the universal{" "}
              <Link href="/contact" className="text-[#4F46E5] underline">
                Contact OASIS
              </Link>{" "}
              form (<code className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-gray-200">POST /support/contact</code>). Generates an instant sequential tracking reference (<code className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-gray-200">OASIS-GRV-YYYY-XXXX</code>).
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1.5">
            <strong className="text-gray-900 block text-sm">Method B: Direct Email</strong>
            <p className="text-xs sm:text-sm text-gray-600">
              Send directly to{" "}
              <a href="mailto:Info@oasisodisha.in" className="text-[#4F46E5] underline">
                Info@oasisodisha.in
              </a>{" "}
              from your registered email address with the subject prefix <em>[GRIEVANCE]</em>.
            </p>
          </div>
        </div>
      </section>

      <section id="admin-misconduct-oversight" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          2. Independent Oversight for Admin Misconduct (GRV-02)
        </h2>
        <div className="p-5 rounded-lg bg-amber-50 border border-amber-200 text-sm space-y-2.5">
          <div className="font-semibold text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
            <span>Whistleblower &amp; Conflict-of-Interest Protection</span>
          </div>
          <p className="text-gray-800 leading-relaxed">
            To ensure members can safely report abuse of authority, bias, or harassment by an OASIS Moderator or Administrator without fear of retaliation:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-700 text-xs sm:text-sm">
            <li>
              Selecting the <strong className="text-gray-900">&ldquo;A concern about an admin&rdquo;</strong> (<code className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-amber-200">category = admin_misconduct</code>) category in the Contact OASIS form automatically routes the grievance to a restricted oversight channel controlled by senior governance rather than standard admin inboxes.
            </li>
            <li>
              Grievances alleging admin misconduct are strictly confidential and are excluded from standard moderator queues.
            </li>
          </ul>
        </div>
      </section>

      <section id="statutory-slas" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          3. Statutory Service Level Agreements (SLAs)
        </h2>
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white text-sm">
          {SLA_STAGES.map((sla, i) => (
            <div key={i} className="p-4 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-gray-900 font-semibold">{sla.stage}</strong>
                <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {sla.timeline}
                </span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">{sla.details}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="appeals-procedure" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          4. Appeals Procedure for Restrictions &amp; Suspensions
        </h2>
        <p>
          If your account has been suspended (<code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">/suspended</code>) or your application was not approved, you have the right to file a formal appeal within <strong>14 calendar days</strong> of receiving the decision notice:
        </p>
        <ol className="list-decimal pl-5 space-y-1.5 text-gray-700">
          <li>
            Open the{" "}
            <Link href="/contact" className="underline text-[#4F46E5]">
              Contact OASIS Appeal Form
            </Link>{" "}
            accessible directly from the suspended account screen.
          </li>
          <li>
            Provide your Case ID or registered email, reference the restriction notice, and provide any supporting context or updated documentation.
          </li>
          <li>
            Appeals are reviewed by an independent Super Admin who was not involved in the original moderation decision. Written appeal rulings are final.
          </li>
        </ol>
      </section>
    </article>
  );
}
