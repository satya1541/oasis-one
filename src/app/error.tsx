"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RotateCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring if desired
    console.error("OASIS application runtime error:", error);
  }, [error]);

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

      {/* ── 500 Canvas ───────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-[var(--danger)] mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--danger)] font-semibold">
              500 · SYSTEM EXCEPTION
            </span>
            <h1 className="font-display text-3xl font-normal text-[var(--text)] tracking-tight">
              Something went unexpected
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-sm mx-auto">
              Our engineering team has been automatically alerted. You can attempt to reload the current view or return home.
            </p>
            {error.digest && (
              <div className="font-mono text-[10px] text-[var(--muted)] pt-1">
                Ref digest: {error.digest}
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="primary" className="gap-2" onClick={() => reset()}>
              <RotateCw className="w-4 h-4" />
              <span>Try again</span>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                <span>Return to Home</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
