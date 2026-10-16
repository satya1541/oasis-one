"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowRight, CheckCircle2, RotateCw, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => null);

      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Header (Midnight Navy) ────────────────────────────────────────── */}
      <header className="w-full bg-[var(--brand-navy)] border-b border-[var(--brand-gold)]/20 px-6 lg:px-12 h-16 flex items-center">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <BrandLockup variant="horizontal" />
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--brand-cream)]/85 hover:text-[var(--brand-gold)] transition-colors"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* ── Main Canvas ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="p-8 sm:p-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-6">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[var(--success)] mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h1 className="font-display text-2xl font-medium text-[var(--text)]">
                    Password reset link sent
                  </h1>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    If an account exists for <strong className="text-[var(--text)]">{email}</strong>, we have dispatched a secure password reset link. Please check your inbox.
                  </p>
                </div>
                <div className="pt-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Return to Sign In</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1 text-center sm:text-left">
                  <h1 className="font-display text-2xl sm:text-3xl font-medium text-[var(--text)]">
                    Reset your password
                  </h1>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Enter your registered email address and we will send you instructions to recover access.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@venture.in"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full gap-2"
                  disabled={!email || loading}
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Sending instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send reset link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to login</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
