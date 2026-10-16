import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { Compass, ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Header (Midnight Navy) ────────────────────────────────────────── */}
      <header className="w-full bg-[var(--brand-navy)] border-b border-[var(--brand-gold)]/20 px-6 lg:px-12 h-16 flex items-center shadow-sm">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <BrandLockup variant="horizontal" />
          <Link
            href="/"
            className="text-sm font-medium text-[var(--brand-cream)]/85 hover:text-[var(--brand-gold)] transition-colors"
          >
            Home
          </Link>
        </div>
      </header>

      {/* ── 404 Canvas ───────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[var(--brand-navy)] border border-[var(--brand-gold)]/30 flex items-center justify-center text-[var(--brand-gold)] mx-auto shadow-md">
            <Compass className="w-10 h-10 animate-[spin_60s_linear_infinite]" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-semibold">
              404 · UNMAPPED DESTINATION
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-normal text-[var(--text)] tracking-tight">
              Page not found
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-sm mx-auto">
              The coordinate or page you are seeking does not exist or has been relocated within the OASIS portal.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="primary" className="gap-2" asChild>
              <Link href="/">
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">Member Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
