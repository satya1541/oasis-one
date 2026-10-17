import Link from "next/link";
import { Users, Clock, ShieldAlert, CheckCircle2, AlertOctagon, HelpCircle, DollarSign, Ban } from "lucide-react";

export const metadata = {
  title: "Community Guidelines & Content Policy · OASIS ONE",
  description: "Code of conduct, content policies, 24h achievement rules, and mandatory zero-tolerance policy against fraudulent fundraising for OASIS ONE.",
};

export default function CommunityGuidelinesPage() {
  return (
    <article className="space-y-10">
      {/* ── Document Title Header ─────────────────────────────────── */}
      <div className="space-y-3 pb-8 border-b border-[var(--border)]">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--brand-gold)]">
          <span className="bg-[var(--surface-2)] px-2.5 py-0.5 rounded border border-[var(--border)]">
            DOC TYPE: community_guidelines
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Version 1.0 · Effective 16 October 2026
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text)]">
          OASIS ONE — Community Guidelines &amp; Content Policy
        </h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          The code of conduct, discussion standards, and mandatory content &amp; investor solicitation rules (PRD §21.2) for Odisha&rsquo;s 650+ startup builders.
        </p>

        {/* Quick Identity Box */}
        <div className="mt-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--muted)]">
          <div><strong className="text-[var(--text)]">Platform:</strong> OASIS ONE</div>
          <div><strong className="text-[var(--text)]">Community Size:</strong> 650+ Vetted Builders</div>
          <div><strong className="text-[var(--text)]">Contact:</strong> Info@oasisodisha.in</div>
          <div><strong className="text-[var(--text)]">Phone:</strong> +91-904-01-98-628</div>
          <div className="sm:col-span-2"><strong className="text-[var(--text)]">Governing Regulation:</strong> Rule 3(1)(b) of the Information Technology Intermediary Rules, 2021</div>
        </div>
      </div>

      {/* ── Document Sections ─────────────────────────────────────── */}
      <div className="space-y-10 text-sm leading-relaxed text-[var(--text)]/90">
        {/* Section 1: Welcome & Ethos */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 1</span>
            <span>The OASIS Community Covenant</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <p>
              OASIS ONE is designed as a sanctuary for builders. Our culture is defined by authentic curiosity, generosity of knowledge, and mutual respect among founders, researchers, and mentors across Odisha (Bhubaneswar, Cuttack, Rourkela, Sambalpur, Berhampur).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                <strong className="text-[var(--text)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Search Before Asking</span>
                </strong>
                <p className="text-[var(--muted)]">
                  Use the universal search bar (<code className="font-mono text-[11px]">⌘K</code> / <code className="font-mono text-[11px]">Ctrl+K</code>) before creating a post. Check if your question has already been answered.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                <strong className="text-[var(--text)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>High-Signal Knowledge</span>
                </strong>
                <p className="text-[var(--muted)]">
                  Share transparent learnings from pilots and setbacks. Generic promotional ads or cryptocurrency shilling are strictly forbidden.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Post Limits & 24h Edit Window */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 2</span>
            <span>Posting Standards &amp; 24-Hour Edit Window</span>
          </h2>
          <div className="space-y-2 text-xs sm:text-sm">
            <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted)]">
              <li><strong className="text-[var(--text)]">Character Quotas:</strong> Post titles up to <strong>200 characters</strong>, post body up to <strong>10,000 characters</strong>, and responses up to <strong>5,000 characters</strong>.</li>
              <li><strong className="text-[var(--text)]">Accurate Categorization:</strong> Classify every post as a <em>Question</em>, <em>Suggestion</em>, <em>Resource</em>, or <em>Opportunity</em>, and tag with proper sectors and functional skills.</li>
              <li><strong className="text-[var(--text)]">24-Hour Author Edit Window:</strong> Authors may edit posts within 24 hours of publication. An &ldquo;edited&rdquo; badge appears and previous versions are securely logged for moderation.</li>
              <li><strong className="text-[var(--text)]">Closing the Loop:</strong> When an answer solves your question, mark it as <strong>Resolved</strong> so other entrepreneurs find the solution easily.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: 24h Achievement Banner */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 3</span>
            <span>Dashboard 24-Hour Achievement Banner</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <p>
              The dashboard Achievement Banner highlights real entrepreneurial milestones—such as MVP launch, securing a grant/patent, signing a key pilot customer, or closing an incubation cohort.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[var(--muted)]">
              <li>Keep submissions under <strong>500 characters</strong> with an optional image up to <strong>5 MB</strong>.</li>
              <li>Every submission is reviewed by moderators before going live.</li>
              <li>Once approved, achievements remain displayed for exactly <strong>24 hours (UTC)</strong> before auto-expiring.</li>
              <li>Commercial discount flyers, festive greetings, or unverified claims are rejected.</li>
            </ul>
          </div>
        </section>

        {/* Section 4: Prohibited Content */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 4</span>
            <span>Prohibited Content &amp; Intermediary Rules</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <strong className="text-rose-500 flex items-center gap-1.5">
                <Ban className="w-4 h-4" />
                <span>Harassment &amp; Doxxing</span>
              </strong>
              <p className="text-[var(--muted)]">
                Personal insults, intimidation, hate speech, or screenshotting and publishing private contact info and messages without consent.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <strong className="text-amber-500 flex items-center gap-1.5">
                <Ban className="w-4 h-4" />
                <span>Spam &amp; Directory Harvesting</span>
              </strong>
              <p className="text-[var(--muted)]">
                Cold-pitching agency services, mass messaging, or scraping member emails/phones to build external WhatsApp groups or marketing pipelines.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <strong className="text-orange-500 flex items-center gap-1.5">
                <Ban className="w-4 h-4" />
                <span>Misinformation &amp; Impersonation</span>
              </strong>
              <p className="text-[var(--muted)]">
                Falsifying credentials, fabricated traction, or spreading misleading information on government grants or Startup Odisha schemes.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
              <strong className="text-red-500 flex items-center gap-1.5">
                <Ban className="w-4 h-4" />
                <span>Unlawful Content &amp; Malware</span>
              </strong>
              <p className="text-[var(--muted)]">
                Infringing trade secrets, breach of NDAs, or uploading malicious executable scripts and macros.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Mandatory Solicitation Policy (PRD §21.2) */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 5</span>
            <span>Fraudulent Funding &amp; Investor Solicitation (PRD §21.2)</span>
          </h2>
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-3">
            <div className="font-semibold text-rose-500 flex items-center gap-2 text-sm">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <span>Mandatory Zero-Tolerance Financial Fraud Policy</span>
            </div>
            <p className="text-[var(--text)]/90 leading-relaxed">
              Because entrepreneurs frequently seek capital and grants on OASIS ONE, we enforce a strict <strong>zero-tolerance policy</strong> against fraudulent funding schemes, improper solicitation, and deceptive financial promotions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[var(--muted)]">
              <li><strong className="text-[var(--text)]">No Guaranteed Returns or Crypto Schemes:</strong> Members must never solicit investments offering guaranteed yields, unregistered equity crowdfunding, or speculative token offerings.</li>
              <li><strong className="text-[var(--text)]">No Advance-Fee Funding Brokering:</strong> Charging fellow founders upfront fees for &ldquo;guaranteed investor introductions&rdquo; or claiming private access to state grants for a kickback is strictly prohibited.</li>
              <li><strong className="text-[var(--text)]">Immediate Blacklisting:</strong> Violations of this policy result in immediate account revocation, permanent blacklisting (<code className="font-mono text-[11px]">BlacklistIdentifier</code>), and reporting to regulatory and law enforcement authorities where warranted.</li>
            </ul>
          </div>
        </section>
      </div>
    </article>
  );
}
