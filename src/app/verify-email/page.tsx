"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams?.get("token") || "";
  const initialExpired = searchParams?.get("expired") === "true";
  const emailParam = searchParams?.get("email") || "";

  const [tokenVerified, setTokenVerified] = useState(false);
  const [verifying, setVerifying] = useState(!!tokenParam);
  const [isExpired, setIsExpired] = useState(initialExpired);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  useEffect(() => {
    if (!tokenParam) return;
    let isMounted = true;

    async function verify() {
      try {
        setVerifying(true);
        const res = await fetch("/api/v1/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenParam }),
        });

        if (res.ok) {
          if (isMounted) setTokenVerified(true);
        } else {
          if (isMounted) setIsExpired(true);
        }
      } catch (e) {
        if (isMounted) setIsExpired(true);
      } finally {
        if (isMounted) setVerifying(false);
      }
    }

    verify();
    return () => {
      isMounted = false;
    };
  }, [tokenParam]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setSentNotice(false);

    try {
      await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam || "applicant@oasis.community" }),
      }).catch(() => null);

      setSentNotice(true);
      setCooldown(60);
    } finally {
      setResending(false);
    }
  };

  if (verifying) {
    return (
      <div className="w-full max-w-md mx-auto text-center p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
        <RotateCw className="w-8 h-8 animate-spin text-[var(--accent)] mx-auto mb-3" />
        <h2 className="text-base font-semibold text-[var(--text)]">Verifying your email...</h2>
        <p className="text-xs text-[var(--muted)] mt-1">Please wait while we confirm your security token.</p>
      </div>
    );
  }

  if (tokenVerified) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="p-8 sm:p-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[var(--success)] shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-medium text-[var(--text)] tracking-tight">
              Email Verified Successfully
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              Your email has been verified. Your application has entered the OASIS administrative review queue.
            </p>
          </div>

          <div className="pt-2">
            <Button size="lg" variant="primary" className="w-full gap-2" asChild>
              <Link href="/dashboard">
                <span>Go to Member Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-8 sm:p-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-6 text-center">
        {/* State Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-gold)]/30 flex items-center justify-center text-[var(--brand-gold)] shadow-sm">
          {isExpired ? (
            <ShieldAlert className="w-8 h-8 text-[var(--warning)]" />
          ) : (
            <Mail className="w-8 h-8 text-[var(--brand-gold)]" />
          )}
        </div>

        {/* Heading & Context */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-medium text-[var(--text)] tracking-tight">
            {isExpired ? "Verification link expired" : "Check your inbox"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            {isExpired
              ? "This security link has expired or has already been used. Please request a fresh verification link below."
              : `We sent a secure verification link to your registered email address.`}
          </p>
          {!isExpired && emailParam && (
            <div className="font-mono text-xs font-semibold text-[var(--text)] bg-[var(--surface-2)] py-1.5 px-3 rounded-lg inline-block break-all border border-[var(--border)]">
              {emailParam}
            </div>
          )}
        </div>

        {/* Expired or Success Feedback */}
        {sentNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--success)] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>A fresh verification link has been dispatched to your email.</span>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-3 pt-2">
          <Button
            size="lg"
            variant="primary"
            className="w-full gap-2"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
          >
            {resending ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Sending link...</span>
              </>
            ) : cooldown > 0 ? (
              <span>Resend available in {cooldown}s</span>
            ) : (
              <span>Resend verification email</span>
            )}
          </Button>

          <Button variant="outline" size="md" className="w-full" asChild>
            <Link href="/login">Return to Sign In</Link>
          </Button>
        </div>

        {/* Security & Anti-Fishing Note */}
        <div className="pt-4 border-t border-[var(--border)] text-[11px] text-[var(--muted)] text-left space-y-1">
          <p className="font-medium text-[var(--text)]">Didn't receive an email?</p>
          <p>
            Please check your spam or promotion folder. If your email was registered via Google, you can sign in directly via OAuth on the login screen.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
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
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-xs text-[var(--muted)]">Loading verification...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </main>
    </div>
  );
}
