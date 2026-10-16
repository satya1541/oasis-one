import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { AstrolabeStar } from "@/components/brand/AstrolabeStar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
  Rocket,
  Award,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Bar (Strictly Midnight Navy for Brand Lockup) ────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[var(--brand-navy)]/95 backdrop-blur-md border-b border-[var(--brand-gold)]/20 px-6 lg:px-12 h-16 sm:h-[70px] flex items-center transition-all shadow-sm">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <BrandLockup variant="horizontal" priority />

          <nav className="flex items-center gap-5 sm:gap-7">
            <Link
              href="#membership"
              className="hidden md:inline-block text-xs font-medium tracking-wide text-[var(--brand-cream)]/75 hover:text-[var(--brand-gold)] transition-colors"
            >
              Who it's for
            </Link>
            <Link
              href="#how-it-works"
              className="hidden md:inline-block text-xs font-medium tracking-wide text-[var(--brand-cream)]/75 hover:text-[var(--brand-gold)] transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--brand-cream)]/85 hover:text-[var(--brand-gold)] transition-colors"
            >
              Log in
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--brand-gold)]/40 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/10 font-medium h-9 px-4"
              asChild
            >
              <Link href="/join">Join OASIS</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ── Hero Section (Full-width Midnight Navy with Astrolabe Compass) ────── */}
      <section className="relative overflow-hidden bg-[var(--brand-navy)] text-[var(--brand-cream)] px-6 lg:px-12 pt-16 pb-24 border-b border-[var(--brand-gold)]/20">
        {/* Subtle radial ambient glow */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#2C2E4A]/30 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Hero Content (Left 7 Columns) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="font-display text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand-gold)]">
                ODISHA · STARTUP COMMUNITY
              </span>
              <span className="h-1 w-1 rounded-full bg-[var(--brand-gold)]/60" />
              <span className="text-xs text-[var(--brand-cream)]/70">
                Invitation & Admin Approved
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[var(--brand-cream)] leading-[1.12]">
              One Community. <br />
              <span className="font-normal text-[var(--brand-gold)]">
                Infinite Possibilities.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--brand-cream)]/80 max-w-xl leading-relaxed">
              A members-only home for Odisha’s aspiring entrepreneurs, startup
              founders, and mentors. Find the right people, ask better
              questions, and meet in person.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="bg-[var(--brand-gold)] text-[var(--brand-navy)] font-semibold border-none hover:bg-[#E9C68C] gap-2 shadow-sm"
                asChild
              >
                <Link href="/join">
                  Join OASIS
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-[var(--brand-gold)]/30 text-[var(--brand-cream)] hover:border-[var(--brand-gold)]"
                asChild
              >
                <Link href="/login">Log in to portal</Link>
              </Button>
            </div>

            {/* Micro-metric verification note */}
            <div className="pt-6 border-t border-[var(--brand-gold)]/15 flex flex-wrap items-center gap-3 text-xs text-[var(--brand-cream)]/65">
              <ShieldCheck className="w-4 h-4 text-[var(--brand-gold)] shrink-0" />
              <span>
                <strong>650+ verified members</strong> active in Bhubaneswar,
                Cuttack, Rourkela, Sambalpur & Berhampur
              </span>
            </div>
          </div>

          {/* Astrolabe Motif (Right 5 Columns) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <AstrolabeStar size={420} className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px]" />
          </div>
        </div>
      </section>

      {/* ── Quiet Trust Callout Strip ────────────────────────────────────────── */}
      <div className="bg-[var(--surface-2)] border-b border-[var(--border)] py-4 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
            <span className="font-medium text-[var(--text)]">
              Every member is reviewed by an admin before they join.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Verified Founder Network</span>
            <span>•</span>
            <span>Zero Spam & Ad-Free</span>
            <span>•</span>
            <span>Direct Guidance</span>
          </div>
        </div>
      </div>

      {/* ── Section: Who It's For (Horizontal Editorial Rows) ────────────────── */}
      <section id="membership" className="py-20 px-6 lg:px-12 bg-[var(--bg)] scroll-mt-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-12">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-semibold">
              MEMBERSHIP
            </span>
            <h2 className="font-display text-3xl font-normal text-[var(--text)] mt-2">
              Who it’s for
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1 max-w-lg">
              OASIS is built around three interdependent stages of Odisha’s
              growing startup ecosystem.
            </p>
          </div>

          {/* Three Simple Rows (Banned 3 identical card clichés; clean structural dividers) */}
          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {/* Row 1 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center border border-[var(--border)] text-[var(--accent)]">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-medium text-[var(--text)]">
                    Aspiring entrepreneurs
                  </h3>
                  <Badge variant="aspiring" className="mt-1">
                    Ideation & Validation
                  </Badge>
                </div>
              </div>
              <div className="md:col-span-5 text-sm text-[var(--text)] leading-relaxed">
                <p className="font-medium">Test your idea and find guidance.</p>
                <p className="text-[var(--muted)] mt-1">
                  Connect with experienced founders, join closed roundtables,
                  and refine your problem statement before incorporating.
                </p>
              </div>
              <div className="md:col-span-3 text-xs text-[var(--muted)] md:text-right">
                Bhubaneswar & Student Founders
              </div>
            </div>

            {/* Row 2 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-navy)] flex items-center justify-center border border-[var(--brand-gold)]/20 text-[var(--brand-gold)]">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-medium text-[var(--text)]">
                    Founders & co-founders
                  </h3>
                  <Badge variant="founder" className="mt-1">
                    Building & Scaling
                  </Badge>
                </div>
              </div>
              <div className="md:col-span-5 text-sm text-[var(--text)] leading-relaxed">
                <p className="font-medium">Share what you need and find collaborators.</p>
                <p className="text-[var(--muted)] mt-1">
                  Ask targeted questions, hire key engineering or operations
                  talent, navigate pilot customers, and sync with peer founders.
                </p>
              </div>
              <div className="md:col-span-3 text-xs text-[var(--muted)] md:text-right">
                DeepTech, Agri, Climate, AI
              </div>
            </div>

            {/* Row 3 */}
            <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center border border-[var(--accent)]/40 text-[var(--accent)]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-medium text-[var(--text)]">
                    Mentors & advisors
                  </h3>
                  <Badge variant="verified-mentor" className="mt-1">
                    Verified Advisory
                  </Badge>
                </div>
              </div>
              <div className="md:col-span-5 text-sm text-[var(--text)] leading-relaxed">
                <p className="font-medium">Give back to the next generation of founders.</p>
                <p className="text-[var(--muted)] mt-1">
                  Controlled connection requests (max 10/day quota), verified
                  credentials, and closed-door clinical sessions with serious builders.
                </p>
              </div>
              <div className="md:col-span-3 text-xs text-[var(--muted)] md:text-right">
                Operators, Investors, CXOs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: How It Works ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 bg-[var(--surface-2)]/60 border-t border-[var(--border)] scroll-mt-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-14">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-semibold">
              ADMISSION
            </span>
            <h2 className="font-display text-3xl font-normal text-[var(--text)] mt-2">
              How it works
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              Joining is by application only to protect community focus and trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 relative">
              <span className="font-mono text-2xl font-light text-[var(--accent)] mb-3 block">
                01
              </span>
              <h3 className="font-display text-lg font-medium text-[var(--text)] mb-2">
                Apply online
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Submit a short 3-minute form detailing what you are building or
                how you plan to contribute.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 relative">
              <span className="font-mono text-2xl font-light text-[var(--accent)] mb-3 block">
                02
              </span>
              <h3 className="font-display text-lg font-medium text-[var(--text)] mb-2">
                Admin review
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                An admin personally reviews your profile and background within 48
                hours to ensure high community alignment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 relative">
              <span className="font-mono text-2xl font-light text-[var(--accent)] mb-3 block">
                03
              </span>
              <h3 className="font-display text-lg font-medium text-[var(--text)] mb-2">
                Connect & participate
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Access the verified directory, attend members-only events, and
                exchange insights with fellow Odisha entrepreneurs.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/join">Start your application</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer (Midnight Navy) ───────────────────────────────────────────── */}
      <footer className="mt-auto bg-[var(--brand-navy)] text-[var(--brand-cream)] border-t border-[var(--brand-gold)]/20 px-6 lg:px-12 py-12">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-1">
            <BrandLockup variant="full" />
            <p className="text-xs text-[var(--brand-cream)]/50 pt-2">
              The exclusive portal for Odisha’s entrepreneurship ecosystem.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-[var(--brand-cream)]/80">
            <Link
              href="/privacy"
              className="hover:text-[var(--brand-gold)] transition-colors"
            >
              Privacy Notice
            </Link>
            <Link
              href="/guidelines"
              className="hover:text-[var(--brand-gold)] transition-colors"
            >
              Community Guidelines
            </Link>
            <Link
              href="/contact"
              className="hover:text-[var(--brand-gold)] transition-colors"
            >
              Contact OASIS
            </Link>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-8 pt-6 border-t border-[var(--brand-gold)]/10 text-center md:text-left text-[11px] text-[var(--brand-cream)]/40 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 OASIS ONE. All rights reserved.</span>
          <span>Bhubaneswar · Cuttack · Rourkela · Sambalpur · Berhampur</span>
        </div>
      </footer>
    </div>
  );
}
