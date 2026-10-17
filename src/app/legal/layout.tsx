import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { ArrowLeft, Shield, FileText, Lock, Users, AlertCircle, Cookie, HelpCircle } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";

const POLICY_LINKS = [
  { href: "/legal", label: "Overview", icon: Shield },
  { href: "/legal/terms", label: "Terms of Service", icon: FileText },
  { href: "/legal/privacy", label: "Privacy Notice", icon: Lock },
  { href: "/legal/guidelines", label: "Community Guidelines", icon: Users },
  { href: "/legal/grievance", label: "Grievance & Appeals", icon: AlertCircle },
  { href: "/legal/cookies", label: "Operations & Cookies", icon: Cookie },
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[var(--brand-navy)] border-b border-[var(--brand-gold)]/20 px-4 sm:px-6 lg:px-12 h-16 flex items-center shadow-md">
        <div className="w-full max-w-[1240px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BrandLockup variant="horizontal" href="/" />
            <span className="hidden md:inline-flex text-[11px] font-mono uppercase bg-[var(--brand-gold)]/15 text-[var(--brand-gold)] px-2.5 py-0.5 rounded border border-[var(--brand-gold)]/30 font-medium">
              Legal & Governance Hub
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/faq"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[var(--brand-cream)]/75 hover:text-[var(--brand-gold)] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Migration FAQ</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand-cream)]/85 hover:text-[var(--brand-gold)] transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-[var(--brand-gold)]/40 bg-white/5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Secondary Sub-Navigation Bar ──────────────────────── */}
      <nav className="w-full bg-[var(--surface-2)] border-b border-[var(--border)] px-4 sm:px-6 lg:px-12 py-2 overflow-x-auto">
        <div className="max-w-[1240px] mx-auto flex items-center gap-2 sm:gap-3 text-xs whitespace-nowrap min-w-max">
          {POLICY_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all font-medium"
              >
                <Icon className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Document Body Canvas ──────────────────────────────── */}
      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {children}
      </main>

      {/* ── Standardized Official Footer ────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
