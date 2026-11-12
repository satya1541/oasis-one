import { CheckCircle2, Ban, AlertOctagon } from "lucide-react";
import { DocsPageHeader } from "@/components/layout/DocsPageHeader";

export const metadata = {
  title: "Community Guidelines & Content Policy · OASIS",
  description:
    "Code of conduct, content policies, 24h achievement rules, and mandatory zero-tolerance policy against fraudulent fundraising for OASIS.",
};

export default function CommunityGuidelinesPage() {
  return (
    <article className="space-y-9 text-[15px] leading-7 text-gray-700">
      <DocsPageHeader
        title="Community Guidelines & Content Policy"
        meta="Last updated: 16 October 2026 · Version 1.0"
        subtitle="The code of conduct, discussion standards, and mandatory content & investor solicitation rules (PRD §21.2) for Odisha's 650+ startup builders."
      />

      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs sm:text-sm grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
        <div>
          <strong className="text-gray-900">Platform:</strong> OASIS
        </div>
        <div>
          <strong className="text-gray-900">Community Size:</strong> 650+ Vetted Builders
        </div>
        <div>
          <strong className="text-gray-900">Contact:</strong> Info@oasisodisha.in
        </div>
        <div>
          <strong className="text-gray-900">Phone:</strong> +91-904-01-98-628
        </div>
        <div className="sm:col-span-2">
          <strong className="text-gray-900">Governing Regulation:</strong> Rule 3(1)(b) of the Information Technology Intermediary Rules, 2021
        </div>
      </div>

      <section id="community-covenant" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          1. The OASIS Community Covenant
        </h2>
        <p>
          OASIS is designed as a sanctuary for builders. Our culture is defined by authentic curiosity, generosity of knowledge, and mutual respect among founders, researchers, and mentors across Odisha (Bhubaneswar, Cuttack, Rourkela, Sambalpur, Berhampur).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-gray-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Search Before Asking</span>
            </strong>
            <p className="text-gray-600">
              Use the universal search bar (<code className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-gray-200">⌘K</code> / <code className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-gray-200">Ctrl+K</code>) before creating a post. Check if your question has already been answered.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-gray-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>High-Signal Knowledge</span>
            </strong>
            <p className="text-gray-600">
              Share transparent learnings from pilots and setbacks. Generic promotional ads or cryptocurrency shilling are strictly forbidden.
            </p>
          </div>
        </div>
      </section>

      <section id="posting-standards" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          2. Posting Standards &amp; 24-Hour Edit Window
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong className="text-gray-900">Character Quotas:</strong> Post titles up to <strong>200 characters</strong>, post body up to <strong>10,000 characters</strong>, and responses up to <strong>5,000 characters</strong>.
          </li>
          <li>
            <strong className="text-gray-900">Accurate Categorization:</strong> Classify every post as a <em>Question</em>, <em>Suggestion</em>, <em>Resource</em>, or <em>Opportunity</em>, and tag with proper sectors and functional skills.
          </li>
          <li>
            <strong className="text-gray-900">24-Hour Author Edit Window:</strong> Authors may edit posts within 24 hours of publication. An &ldquo;edited&rdquo; badge appears and previous versions are securely logged for moderation.
          </li>
          <li>
            <strong className="text-gray-900">Closing the Loop:</strong> When an answer solves your question, mark it as <strong>Resolved</strong> so other entrepreneurs find the solution easily.
          </li>
        </ul>
      </section>

      <section id="achievement-banner" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          3. Dashboard 24-Hour Achievement Banner
        </h2>
        <p>
          The dashboard Achievement Banner highlights real entrepreneurial milestones—such as MVP launch, securing a grant/patent, signing a key pilot customer, or closing an incubation cohort.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
          <li>
            Keep submissions under <strong>500 characters</strong> with an optional image up to <strong>5 MB</strong>.
          </li>
          <li>Every submission is reviewed by moderators before going live.</li>
          <li>
            Once approved, achievements remain displayed for exactly <strong>24 hours (UTC)</strong> before auto-expiring.
          </li>
          <li>Commercial discount flyers, festive greetings, or unverified claims are rejected.</li>
        </ul>
      </section>

      <section id="prohibited-content" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          4. Prohibited Content &amp; Intermediary Rules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-rose-700 flex items-center gap-1.5">
              <Ban className="w-4 h-4 shrink-0" />
              <span>Harassment &amp; Doxxing</span>
            </strong>
            <p className="text-gray-600">
              Personal insults, intimidation, hate speech, or screenshotting and publishing private contact info and messages without consent.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-amber-700 flex items-center gap-1.5">
              <Ban className="w-4 h-4 shrink-0" />
              <span>Spam &amp; Directory Harvesting</span>
            </strong>
            <p className="text-gray-600">
              Cold-pitching agency services, mass messaging, or scraping member emails/phones to build external WhatsApp groups or marketing pipelines.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-orange-700 flex items-center gap-1.5">
              <Ban className="w-4 h-4 shrink-0" />
              <span>Misinformation &amp; Impersonation</span>
            </strong>
            <p className="text-gray-600">
              Falsifying credentials, fabricated traction, or spreading misleading information on government grants or Startup Odisha schemes.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-red-700 flex items-center gap-1.5">
              <Ban className="w-4 h-4 shrink-0" />
              <span>Unlawful Content &amp; Malware</span>
            </strong>
            <p className="text-gray-600">
              Infringing trade secrets, breach of NDAs, or uploading malicious executable scripts and macros.
            </p>
          </div>
        </div>
      </section>

      <section id="solicitation-policy" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          5. Fraudulent Funding &amp; Investor Solicitation (PRD §21.2)
        </h2>
        <div className="p-5 rounded-lg bg-rose-50 border border-rose-200 text-sm space-y-3">
          <div className="font-semibold text-rose-900 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-700 shrink-0" />
            <span>Mandatory Zero-Tolerance Financial Fraud Policy</span>
          </div>
          <p className="text-gray-800 leading-relaxed">
            Because entrepreneurs frequently seek capital and grants on OASIS, we enforce a strict <strong>zero-tolerance policy</strong> against fraudulent funding schemes, improper solicitation, and deceptive financial promotions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-700 text-xs sm:text-sm">
            <li>
              <strong className="text-gray-900">No Guaranteed Returns or Crypto Schemes:</strong> Members must never solicit investments offering guaranteed yields, unregistered equity crowdfunding, or speculative token offerings.
            </li>
            <li>
              <strong className="text-gray-900">No Advance-Fee Funding Brokering:</strong> Charging fellow founders upfront fees for &ldquo;guaranteed investor introductions&rdquo; or claiming private access to state grants for a kickback is strictly prohibited.
            </li>
            <li>
              <strong className="text-gray-900">Immediate Blacklisting:</strong> Violations of this policy result in immediate account revocation, permanent blacklisting (<code className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-rose-200">BlacklistIdentifier</code>), and reporting to regulatory and law enforcement authorities where warranted.
            </li>
          </ul>
        </div>
      </section>
    </article>
  );
}
