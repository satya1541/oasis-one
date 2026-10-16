"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { AstrolabeStar } from "@/components/brand/AstrolabeStar";
import { Button } from "@/components/ui/Button";
import { AccountLockedModal } from "@/components/auth/AccountLockedModal";
import { ShieldCheck, Info } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [lockedEmail, setLockedEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          json?.error?.message || json?.message || "Invalid email address or password."
        );
      }

      const user = json?.data?.user;

      // Handle Admin Multi-Factor Authentication requirement
      if (user?.requiresMfa) {
        window.location.href = "/admin/mfa";
        return;
      }

      // Handle unapproved/locked membership state
      if (
        user?.accountStatus === "pending_verification" ||
        user?.accountStatus === "pending_approval"
      ) {
        setLockedEmail(user.email || email);
        setLockedModalOpen(true);
        return;
      }

      // Active approved member / admin routing
      if (user?.adminLevel) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to sign in. Please verify your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg)] text-[var(--text)]">
      {/* ── Left Half (Midnight Navy Brand Panel — Desktop) ───────────────────── */}
      <div className="w-full lg:w-1/2 bg-[var(--brand-navy)] text-[var(--brand-cream)] px-8 sm:px-14 py-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--brand-gold)]/20 min-h-[240px] lg:min-h-screen">
        {/* Subtle radial ambient glow */}
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#2E314D]/40 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <BrandLockup variant="full" priority />
        </div>

        {/* Narrative & Quote */}
        <div className="my-auto py-12 relative z-10 max-w-lg">
          <blockquote className="font-display text-2xl sm:text-3xl font-light text-[var(--brand-cream)] leading-snug tracking-tight">
            “The Odisha startup ecosystem isn’t built on noise. It is built on
            rigor, deep roots, and collective conviction.”
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--brand-gold)]/20 border border-[var(--brand-gold)]/40 flex items-center justify-center text-[var(--brand-gold)] font-mono text-xs font-semibold">
              O1
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-[var(--brand-gold)] uppercase font-mono">
                OASIS ONE Portal
              </p>
              <p className="text-xs text-[var(--brand-cream)]/70">
                For Founders, Aspiring Builders & Mentors
              </p>
            </div>
          </div>
        </div>

        {/* Bottom subtle watermarks */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[var(--brand-cream)]/50 pt-6 border-t border-[var(--brand-gold)]/10 font-mono">
          <span>COHORT IV • 650+ MEMBERS</span>
          <AstrolabeStar size={16} className="text-[var(--brand-gold)]/60" />
        </div>
      </div>

      {/* ── Right Half (Ivory Interactive Sign In) ────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12 bg-[var(--surface)]">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-normal tracking-tight text-[var(--text)]">
              Welcome back
            </h1>
            <p className="text-xs text-[var(--muted)]">
              Sign in to access your cohort, directory, and private requests.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-[var(--text)]"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-11 px-3.5 text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-[var(--text)]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 px-3.5 text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in to OASIS..." : "Sign In to Portal"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono">
              <span className="bg-[var(--surface)] px-3 text-[var(--muted)]">
                Or authenticate via SSO
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="md"
            className="w-full bg-[var(--surface-2)]"
            onClick={() => {
              window.location.href = "/api/v1/auth/google";
            }}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continue with Google
          </Button>

          <AccountLockedModal
            isOpen={lockedModalOpen}
            onClose={() => {
              setLockedModalOpen(false);
              window.location.href = "/dashboard";
            }}
            email={lockedEmail}
            onViewApplication={() => {
              setLockedModalOpen(false);
              window.location.href = "/dashboard";
            }}
          />

          <p className="text-center text-xs text-[var(--muted)]">
            By signing in, you agree to the OASIS{" "}
            <Link href="/legal/privacy" className="underline hover:text-[var(--text)]">
              Privacy Notice
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/guidelines"
              className="underline hover:text-[var(--text)]"
            >
              Community Guidelines
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
