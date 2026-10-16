import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { ShieldCheck, ArrowLeft, Clock } from "lucide-react";

export default function PrivacyNoticePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Header (Midnight Navy) ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[var(--brand-navy)] border-b border-[var(--brand-gold)]/20 px-6 lg:px-12 h-16 flex items-center shadow-sm">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <BrandLockup variant="horizontal" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand-cream)]/85 hover:text-[var(--brand-gold)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </header>

      {/* ── Document Canvas ──────────────────────────────────────────────────── */}
      <main className="max-w-[760px] mx-auto px-6 py-12 lg:py-16 space-y-10">
        <div className="space-y-3 pb-8 border-b border-[var(--border)]">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent)]">
            <Clock className="w-3.5 h-3.5" />
            <span>Version 2026.1 · Last updated October 1, 2026</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text)]">
            OASIS ONE Privacy Notice
          </h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            This notice details how the OASIS Startup Community in Odisha collects, protects, and governs access to member and applicant data across our invitation-only portal.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--text)]/90">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-medium text-[var(--text)]">
              1. Purpose of Data Processing
            </h2>
            <p>
              OASIS is an admin-approved, non-profit entrepreneurial community ecosystem founded to support startup founders, aspiring builders, and mentors across Odisha (Bhubaneswar, Cuttack, Rourkela, Sambalpur, and Berhampur).
            </p>
            <p className="text-[var(--muted)]">
              We collect information solely to verify credentials, ensure zero-spam professional integrity, curate closed-door roundtables, and facilitate safe mentor-mentee guidance. We do not sell, rent, or monetize member data or profile information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-medium text-[var(--text)]">
              2. Strict Field-Level Privacy Controls
            </h2>
            <p>
              Every member retains complete sovereignty over their data through our Settings & Privacy dashboard:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted)]">
              <li><strong>Contact Information:</strong> Phone numbers and personal email addresses are private by default and are never rendered to unauthorized directory viewers.</li>
              <li><strong>Selective Sharing:</strong> Contact details are only exchanged when both parties explicitly accept a mutual connection request.</li>
              <li><strong>Zero Indexing:</strong> Member profiles are blocked from public search engines (<code className="font-mono text-xs">noindex, nofollow</code>).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-medium text-[var(--text)]">
              3. Verification Evidence & Uploads
            </h2>
            <p className="text-[var(--muted)]">
              Documents submitted during admission (such as mentor verification proof, incubation letters, or pitch decks) are stored in encrypted object storage. Only verified OASIS Selection Committee administrators possess authorization to review verification evidence during the evaluation window.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-medium text-[var(--text)]">
              4. Data Export & Account Deletion
            </h2>
            <p className="text-[var(--muted)]">
              Per our data protection commitment, members may request a complete JSON export of their submitted questions, profile details, and task history at any time. When an account is deleted, all personal data is purged within 30 days.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
              <ShieldCheck className="w-4 h-4" />
              <span>Grievance Officer</span>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              If you have any questions, concerns, or data requests, please submit an inquiry via our{" "}
              <Link href="/contact" className="text-[var(--accent)] underline">
                Contact OASIS Portal
              </Link>{" "}
              or email our designated community trustee at <code className="font-mono">governance@oasis-one.in</code>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
