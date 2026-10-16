"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { Lock, CheckCircle2, RotateCw, ArrowRight, ShieldCheck } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 4 password rules
  const rules = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "At least one uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", valid: /[a-z]/.test(password) },
    { label: "At least one number or symbol", valid: /[0-9!@#$%^&*]/.test(password) },
  ];
  const allRulesPass = rules.every((r) => r.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesPass) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      }).catch(() => null);

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-8 sm:p-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-6">
        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[var(--success)] mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-medium text-[var(--text)]">
                Password updated
              </h1>
              <p className="text-xs text-[var(--muted)]">
                Your new credentials have been safely stored. Redirecting to login...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-medium text-[var(--text)]">
                Choose a new password
              </h1>
              <p className="text-xs text-[var(--muted)]">
                Ensure your account remains protected with a strong passphrase.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[var(--danger)]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
                />
              </div>
            </div>

            {/* Password Validation Checklist */}
            <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      rule.valid ? "text-[var(--success)]" : "text-[var(--muted)]/40"
                    }`}
                  />
                  <span className={rule.valid ? "text-[var(--text)] font-medium" : "text-[var(--muted)]"}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full gap-2"
              disabled={!allRulesPass || !confirmPassword || loading}
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Save new password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
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
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-[var(--muted)]">Loading security form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
