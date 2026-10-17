import Link from "next/link";
import { AlertCircle, Clock, ShieldCheck, Mail, Phone, MapPin, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Grievance Redressal, Support & Appeals Policy · OASIS ONE",
  description: "Official Grievance Officer contacts, statutory escalation timelines, independent admin misconduct oversight, and appeals procedures for OASIS ONE.",
};

const SLA_STAGES = [
  { stage: "1. Submission & Acknowledgement", timeline: "Immediate (In-App) / ≤ 24 Hours (Email)", details: "System assigns a unique OASIS-GRV-YYYY-XXXX Case ID and dispatches an automated receipt email." },
  { stage: "2. Initial Assessment", timeline: "Within 48 to 72 Hours", details: "Designated officer reviews submission against logs, audit records, and applicable guidelines." },
  { stage: "3. Investigation & Evidence", timeline: "Within 7 Calendar Days", details: "Parties contacted if additional facts are needed; internal notes logged in confidential audit trail." },
  { stage: "4. Final Resolution & Remedy", timeline: "≤ 15 Calendar Days", details: "Formal decision communicated in writing with rationale, corrective actions, or appeal options." },
];

export default function GrievancePolicyPage() {
  return (
    <article className="space-y-10">
      {/* ── Document Title Header ─────────────────────────────────── */}
      <div className="space-y-3 pb-8 border-b border-[var(--border)]">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--brand-gold)]">
          <span className="bg-[var(--surface-2)] px-2.5 py-0.5 rounded border border-[var(--border)]">
            DOC TYPE: grievance_policy
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Version 1.0 · Effective 16 October 2026
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text)]">
          OASIS ONE — Grievance Redressal, Appeals &amp; Admin Governance
        </h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Statutory compliance under Rule 3(2) of the Information Technology (Intermediary Guidelines) Rules, 2021 and Section 13 of the Digital Personal Data Protection Act, 2023.
        </p>
      </div>

      {/* ── Designated Grievance Officer Card ──────────────────────── */}
      <div className="p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--brand-gold)]/30 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <ShieldCheck className="w-5 h-5 text-[var(--brand-gold)]" />
          <span>Designated Grievance &amp; Compliance Officer</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[var(--muted)]">
          <div><strong className="text-[var(--text)]">Designation:</strong> Grievance Officer — OASIS Administration</div>
          <div><strong className="text-[var(--text)]">Organization:</strong> OASIS (Odisha Startup Community)</div>
          <div>
            <strong className="text-[var(--text)]">Official Email:</strong>{" "}
            <a href="mailto:Info@oasisodisha.in" className="text-[var(--brand-gold)] hover:underline">
              Info@oasisodisha.in
            </a>
          </div>
          <div>
            <strong className="text-[var(--text)]">Telephone:</strong>{" "}
            <a href="tel:+919040198628" className="text-[var(--brand-gold)] hover:underline">
              +91-904-01-98-628
            </a>
          </div>
          <div className="sm:col-span-2">
            <strong className="text-[var(--text)]">Office Address:</strong> Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018
          </div>
        </div>
      </div>

      {/* ── Document Sections ─────────────────────────────────────── */}
      <div className="space-y-10 text-sm leading-relaxed text-[var(--text)]/90">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 1</span>
            <span>How to Submit a Support Inquiry or Grievance</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <p>
              OASIS ONE provides universal access to grievance submission across all user states—including to pending applicants on the Locked Dashboard and to members on the Suspended Account screen:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
                <strong className="text-[var(--text)] block text-xs">Method A: In-App Support Form</strong>
                <p className="text-xs text-[var(--muted)]">
                  Use the universal <Link href="/contact" className="text-[var(--brand-gold)] underline">Contact OASIS</Link> form (<code className="font-mono text-[11px]">POST /support/contact</code>). Generates an instant sequential tracking reference (<code className="font-mono text-[11px]">OASIS-GRV-YYYY-XXXX</code>).
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
                <strong className="text-[var(--text)] block text-xs">Method B: Direct Email</strong>
                <p className="text-xs text-[var(--muted)]">
                  Send directly to <a href="mailto:Info@oasisodisha.in" className="text-[var(--brand-gold)] underline">Info@oasisodisha.in</a> from your registered email address with the subject prefix <em>[GRIEVANCE]</em>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Admin Misconduct Oversight */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 2</span>
            <span>Independent Oversight for Admin Misconduct (GRV-02)</span>
          </h2>
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
            <div className="font-semibold text-amber-500 flex items-center gap-2 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>Whistleblower &amp; Conflict-of-Interest Protection</span>
            </div>
            <p className="text-[var(--text)]/90 leading-relaxed">
              To ensure members can safely report abuse of authority, bias, or harassment by an OASIS Moderator or Administrator without fear of retaliation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted)]">
              <li>
                Selecting the <strong className="text-[var(--text)]">&ldquo;A concern about an admin&rdquo;</strong> (<code className="font-mono text-[11px]">category = admin_misconduct</code>) category in the Contact OASIS form automatically routes the grievance to a restricted oversight channel controlled by senior governance rather than standard admin inboxes.
              </li>
              <li>
                Grievances alleging admin misconduct are strictly confidential and are excluded from standard moderator queues.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Statutory SLA Timelines */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 3</span>
            <span>Statutory Service Level Agreements (SLAs)</span>
          </h2>
          <div className="space-y-3">
            <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)] text-xs">
              {SLA_STAGES.map((sla, i) => (
                <div key={i} className="p-4 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-[var(--text)] font-semibold">{sla.stage}</strong>
                    <span className="font-mono text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {sla.timeline}
                    </span>
                  </div>
                  <p className="text-[var(--muted)]">{sla.details}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Appeals Process */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 4</span>
            <span>Appeals Procedure for Restrictions and Suspensions</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <p>
              If your account has been suspended (<code className="font-mono text-xs">/suspended</code>) or your application was not approved, you have the right to file a formal appeal within <strong>14 calendar days</strong> of receiving the decision notice:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-[var(--muted)]">
              <li>Open the <Link href="/contact" className="underline text-[var(--brand-gold)]">Contact OASIS Appeal Form</Link> accessible directly from the suspended account screen.</li>
              <li>Provide your Case ID or registered email, reference the restriction notice, and provide any supporting context or updated documentation.</li>
              <li>Appeals are reviewed by an independent Super Admin who was not involved in the original moderation decision. Written appeal rulings are final.</li>
            </ol>
          </div>
        </section>
      </div>
    </article>
  );
}
