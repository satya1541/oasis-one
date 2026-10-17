import Link from "next/link";
import { Lock, Clock, ShieldCheck, Database, Eye, Trash2, Download, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Privacy Notice & Data Protection Policy · OASIS ONE",
  description: "Statutory data protection policy under the Digital Personal Data Protection Act, 2023 (DPDP Act) for the OASIS ONE platform in Odisha.",
};

const DATA_CATEGORIES = [
  {
    category: "1. Common Account & Identity",
    fields: "Full name, email address (unique ID), Argon2id salted password hash or Google OAuth sub, 18+ age confirmation, time zone.",
    scope: "Full name & role visible to approved members. Email is Private by default.",
    type: "Required",
  },
  {
    category: "2. Contact & Profile Details",
    fields: "Phone number (verified via SMS OTP), City and State, profile photo (≤2 MB), bio (≤500 chars), areas of interest, LinkedIn/website.",
    scope: "Phone is Private by default. City, bio, interests, and photo visible to approved members (customizable).",
    type: "Bio/City Required; Phone/Photo Optional",
  },
  {
    category: "3. Aspiring Entrepreneur Data",
    fields: "Idea/focus area (≤500 chars), preferred sectors, skills & experience (≤1,000 chars), current stage (Exploring, Validation, Planning, Pre-MVP), guidance needed.",
    scope: "Visible to approved members according to your field privacy settings.",
    type: "Role-Specific Required",
  },
  {
    category: "4. Startup Founder Data",
    fields: "Startup name, role in company, industry sector, stage (Ideation, MVP, Launched, Revenue, Scaling), product summary (≤1,000 chars), website URL, location.",
    scope: "Visible to approved members. Multiple co-founders link to one shared Startup record.",
    type: "Role-Specific Required",
  },
  {
    category: "5. Mentor & Advisor Data",
    fields: "Current organization, years of experience (1-3, 3-5, 5-10, 10-15, 15+), expertise tags, mentoring topics, availability status, LinkedIn URL, verification evidence (PDF/JPEG/PNG ≤10 MB).",
    scope: "Profile fields visible to approved members. Verification evidence is Strictly Private to reviewing admins via signed URLs.",
    type: "Role-Specific Required",
  },
  {
    category: "6. Personal Planner Tasks",
    fields: "Task titles (≤200 chars), notes (≤2,000 chars), deadlines, priorities, reminders.",
    scope: "Strictly Private to the Member. Zero visibility to other members or administrators.",
    type: "Optional / User-Generated",
  },
];

export default function PrivacyNoticePage() {
  return (
    <article className="space-y-10">
      {/* ── Document Title Header ─────────────────────────────────── */}
      <div className="space-y-3 pb-8 border-b border-[var(--border)]">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--brand-gold)]">
          <span className="bg-[var(--surface-2)] px-2.5 py-0.5 rounded border border-[var(--border)]">
            DOC TYPE: privacy_notice
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Version 1.0 · Effective 16 October 2026
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text)]">
          OASIS ONE — Privacy Notice &amp; Data Protection Policy
        </h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Drafted and enforced in accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India, the IT Act 2000, and SPDI Rules 2011.
        </p>

        {/* Quick Identity Box */}
        <div className="mt-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--muted)]">
          <div><strong className="text-[var(--text)]">Data Fiduciary:</strong> OASIS</div>
          <div><strong className="text-[var(--text)]">Jurisdiction:</strong> Bhubaneswar, Odisha, India</div>
          <div><strong className="text-[var(--text)]">Grievance &amp; Privacy Email:</strong> Info@oasisodisha.in</div>
          <div><strong className="text-[var(--text)]">Contact Phone:</strong> +91-904-01-98-628</div>
          <div className="sm:col-span-2"><strong className="text-[var(--text)]">Registered Office:</strong> Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha, India, 751018</div>
        </div>
      </div>

      {/* ── Three Core Commitments Banner ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5 text-xs">
          <div className="font-semibold text-[var(--text)] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Data Minimization</span>
          </div>
          <p className="text-[var(--muted)]">
            We collect only fields required to verify identity, enable role discovery, host events, and secure the portal.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5 text-xs">
          <div className="font-semibold text-[var(--text)] flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[var(--brand-gold)]" />
            <span>Private by Default</span>
          </div>
          <p className="text-[var(--muted)]">
            Phone numbers and email addresses are private by default and never disclosed without mutual connection consent.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5 text-xs">
          <div className="font-semibold text-[var(--text)] flex items-center gap-1.5">
            <Database className="w-4 h-4 text-cyan-500" />
            <span>Zero Data Selling</span>
          </div>
          <p className="text-[var(--muted)]">
            We never sell, rent, monetize, or license member data to third-party data brokers or advertisers.
          </p>
        </div>
      </div>

      {/* ── Document Sections ─────────────────────────────────────── */}
      <div className="space-y-10 text-sm leading-relaxed text-[var(--text)]/90">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 1</span>
            <span>Data Fiduciary Identity &amp; Statutory Compliance</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <p>
              <strong>OASIS</strong>, headquartered in Bhubaneswar, Odisha, India, operates the OASIS ONE platform and acts as the <strong>Data Fiduciary</strong> in respect of all personal data collected and processed through the Platform under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
            </p>
            <p>
              Personal data is collected strictly on the lawful basis of your free, specific, informed, unconditional, and unambiguous <strong>Consent</strong> (immutably recorded in <code className="font-mono text-xs">ConsentRecord</code>) and for legitimate community safety and administration uses under Section 4 and Section 7 of the DPDP Act.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 2</span>
            <span>Personal Data Inventory</span>
          </h2>
          <div className="space-y-3">
            <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)] text-xs">
              {DATA_CATEGORIES.map((cat, i) => (
                <div key={i} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm font-semibold text-[var(--text)]">{cat.category}</strong>
                    <span className="font-mono text-[10px] text-[var(--brand-gold)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {cat.type}
                    </span>
                  </div>
                  <p className="text-[var(--text)]/80"><strong className="text-[var(--text)]">Fields:</strong> {cat.fields}</p>
                  <p className="text-[var(--muted)]"><strong className="text-[var(--text)]">Visibility:</strong> {cat.scope}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 3</span>
            <span>Purposes of Processing</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm">
            <p>We process your personal data exclusively for:</p>
            <ol className="list-decimal pl-5 space-y-1.5 text-[var(--muted)]">
              <li><strong className="text-[var(--text)]">Membership Vetting:</strong> Verifying email and phone OTP, evaluating application details against the OASIS 6-point Rubric, and matching pre-approved WhatsApp community records.</li>
              <li><strong className="text-[var(--text)]">Directory &amp; Expertise Discovery:</strong> Enabling approved members to search peers, founders, and mentors across sectors and cities in Odisha.</li>
              <li><strong className="text-[var(--text)]">Consent-Based Connections:</strong> Revealing contact details only when both parties mutually accept a mentor guidance request.</li>
              <li><strong className="text-[var(--text)]">Event Registrations &amp; Automated Waitlists:</strong> Processing RSVPs, waitlist promotions, and sharing confidential meeting links to confirmed attendees.</li>
              <li><strong className="text-[var(--text)]">Security &amp; Abuse Prevention:</strong> Rate limiting, brute-force defense, ClamAV antivirus scanning, and 3-year compliance audit logging.</li>
            </ol>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 4</span>
            <span>Your Rights as a Data Principal (DPDP Act 2023)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <strong className="text-[var(--text)] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[var(--brand-gold)]" />
                <span>Right to Access &amp; Summary</span>
              </strong>
              <p className="text-[var(--muted)]">
                Inspect all personal data held about you at any time via Settings and your profile view.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <strong className="text-[var(--text)] flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[var(--brand-gold)]" />
                <span>Right to Data Portability</span>
              </strong>
              <p className="text-[var(--muted)]">
                Download a complete, machine-readable JSON archive of your account in Settings &rarr; Data &amp; Account within 48 hours.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <strong className="text-[var(--text)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Right to Correction &amp; Erasure</span>
              </strong>
              <p className="text-[var(--muted)]">
                Update profile fields directly. Request permanent account deletion which purges your personal data within 30 days.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <strong className="text-[var(--text)] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-cyan-500" />
                <span>Right of Grievance Redressal</span>
              </strong>
              <p className="text-[var(--muted)]">
                Submit formal privacy inquiries or appeals to our Designated Grievance Officer at Info@oasisodisha.in.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 5</span>
            <span>Data Retention Schedule</span>
          </h2>
          <div className="space-y-2 text-xs text-[var(--muted)]">
            <p><strong className="text-[var(--text)]">Active Accounts:</strong> Retained for the duration of active community membership.</p>
            <p><strong className="text-[var(--text)]">Inactive Accounts:</strong> Warning sent after 12 months; deactivated at 15 months; subject to purge upon request.</p>
            <p><strong className="text-[var(--text)]">Deleted Accounts:</strong> Personal data and uploaded files are purged within 30 days. Community posts display &ldquo;Former Member&rdquo;.</p>
            <p><strong className="text-[var(--text)]">Rejected Applications:</strong> Unapproved application drafts and evidence attachments are permanently purged after 90 days.</p>
            <p><strong className="text-[var(--text)]">Audit Logs:</strong> Security, admin actions, and consent logs are retained for 3 years in compliance with Indian statutory requirements.</p>
          </div>
        </section>
      </div>
    </article>
  );
}
