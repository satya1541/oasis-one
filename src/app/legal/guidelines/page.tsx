import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Shield, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";

export default function CommunityGuidelinesPage() {
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
            OASIS Community Guidelines
          </h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Our community covenant for fostering high-signal collaboration, ethical mentorship, and constructive peer support across Odisha.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--text)]/90">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-medium text-[var(--text)]">
              1. The OASIS Covenant
            </h2>
            <p>
              OASIS is designed as a sanctuary for builders. Our culture is defined by authentic curiosity, generosity of knowledge, and mutual respect among founders, researchers, and mentors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-medium text-[var(--text)]">
              2. Core Principles
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                <div className="font-semibold text-[var(--text)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  <span>High-Signal Discussions</span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Ask thoughtful, specific questions. Share transparent learnings from failures and pilot tests. Generic promotional marketing or crypto shilling is strictly prohibited.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                <div className="font-semibold text-[var(--text)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  <span>Respect Mentor Quotas</span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Mentors dedicate limited volunteer time to counsel aspiring founders. Each member is capped at 10 guidance requests per 24 hours. Always state your specific hurdle and context before requesting an introduction.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                <div className="font-semibold text-[var(--text)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  <span>Confidentiality & Closed-Door Trust</span>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Founders frequently discuss unreleased prototypes, early traction numbers, and proprietary patents. What is discussed in closed roundtables and direct mentorship sessions stays within OASIS.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-medium text-[var(--text)]">
              3. Zero-Tolerance Violations & Enforcement
            </h2>
            <p className="text-[var(--muted)]">
              To protect community safety, administrators enforce a structured 4-tier restriction protocol per PRD §10.2:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted)]">
              <li><strong>Warning:</strong> Formal notice for minor infractions (e.g. unsolicited outreach or aggressive pitching).</li>
              <li><strong>Suspension:</strong> Temporary revocation of community write privileges (7 to 30 days).</li>
              <li><strong>Revocation:</strong> Permanent termination of membership for deliberate IP theft, harassment, or misconduct.</li>
              <li><strong>Blacklist:</strong> Institutional ban from future admissions applied by Super Administrators.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
              <Shield className="w-4 h-4" />
              <span>Reporting an Issue</span>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              If you experience or witness an infraction, please use the in-app "Report" action on any post or profile, or submit a confidential grievance through the{" "}
              <Link href="/contact" className="text-[var(--accent)] underline">
                Contact OASIS grievance channel
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
