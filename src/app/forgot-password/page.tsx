"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";

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
    <div className="login-bg h-screen max-h-screen min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#03080B] text-[#F5FAF6]">
      {/* ── Top Header with Glass Logo Pill and Nav ──────────────────────────── */}
      <header className="shrink-0 relative z-20 w-full px-4 sm:px-8 lg:px-12 py-2 sm:py-2.5 flex items-center justify-between pointer-events-auto">
        <Link href="/" className="join-logo-pill" aria-label="OASIS ONE home">
          <div className="w-[30px] h-[30px] rounded-full bg-[#030909] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 46 46" width="30" height="30" fill="none" stroke="#7CC6B5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M24.2 37V24" />
              <path d="M19.8 39.3c1.2-1.9 2.8-2.7 4.4-2.7s3.2.8 4.4 2.7" />
              <path d="M23.8 30.2c-2.8-.6-5.5-2.6-7.2-5-2-1.8-5.2-2-7-4.2-1.4-1.8-1.4-4.2 0-6 2-3 5.8-5.2 8.8-6.2 1.4-.5 2.8-1 4.2-1.3" />
              <path d="M14.8 23V13.2c0-1.4.8-2.6 2.4-3.4" />
              <path d="M24 24.2c-1.8-1.8-3.2-3.8-3.7-6.4-.5-2.6-.6-5.2-.3-7.2" />
              <path d="M24.3 23.2c1.5-3 3.5-6.4 4.3-10.2.4-2.6 1.2-4.1 2.8-4.3H35" />
              <path d="M24.6 25.7c3-.7 5.8-2.1 7.4-4.5 1.2-1.8 1.4-3.8 2.8-5.2 1.4-1.4 3.2-2.1 5.2-2.4" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 pl-2 select-none">
            <span className="font-semibold text-xs sm:text-sm tracking-[0.16em] text-[#F5FAF6] uppercase">
              OASIS
            </span>
            <span className="font-bold text-[8px] sm:text-[9px] tracking-wider bg-[#F3D3A2] text-[#12131F] px-1.5 py-0.5 rounded leading-none uppercase">
              ONE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center text-xs font-normal text-[#ECF1EF]/70 hover:text-[#88DECC] transition-colors py-1.5 px-3"
          >
            &larr; Back to Home
          </Link>
          <Link href="/login" className="join-login-pill inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span>Log in</span>
            <svg viewBox="0 0 4 7" width="4" height="7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M.5.5 3.5 3.5.5 6.5" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── Main Forgot Password Card ────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 py-1 overflow-hidden">
        <div className="w-full max-w-[390px] mx-auto space-y-1.5 sm:space-y-2 animate-fade-in-up my-auto">
          <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
            {submitted ? (
              <div className="text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#88DECC]/10 border border-[#88DECC]/30 flex items-center justify-center text-[#88DECC] mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h1 className="join-hero-headline text-lg sm:text-xl font-light text-[#F5FAF6] tracking-tight">
                    Reset link sent
                  </h1>
                  <p className="join-hero-subhead text-[11px] sm:text-xs text-[#ECF1EF]/70 leading-relaxed max-w-sm mx-auto">
                    If an account exists for <strong className="text-[#F5FAF6] font-mono">{email}</strong>, we have dispatched a secure password reset link. Please check your inbox.
                  </p>
                </div>
                <div className="pt-1">
                  <Link
                    href="/login"
                    className="join-cta-pill group"
                  >
                    <span className="font-medium tracking-tight">Return to Sign In</span>
                    <div className="join-cta-disc shrink-0">
                      <svg viewBox="0 0 5 8" width="5" height="8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M.6.6 4 4 .6 7.4" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                <div className="space-y-0.5 text-center">
                  <h1 className="join-hero-headline text-lg sm:text-xl font-light text-[#F5FAF6] tracking-tight">
                    Reset your password
                  </h1>
                  <p className="join-hero-subhead text-[11px] sm:text-xs text-[#ECF1EF]/70 leading-relaxed max-w-sm mx-auto">
                    Enter your registered email address and we will send you secure instructions to recover access.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-[10px] sm:text-[10.5px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-0.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#ECF1EF]/40 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@startup.in"
                      className="w-full h-8.5 sm:h-9 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-0.5">
                  <button
                    type="submit"
                    disabled={!email || loading}
                    className="join-cta-pill group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="font-medium tracking-tight">
                      {loading ? "Sending reset link..." : "Send Reset Instructions"}
                    </span>
                    <div className="join-cta-disc shrink-0">
                      <svg viewBox="0 0 5 8" width="5" height="8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M.6.6 4 4 .6 7.4" />
                      </svg>
                    </div>
                  </button>
                </div>

                <div className="pt-0.5 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-[#ECF1EF]/60 hover:text-[#88DECC] transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back to login</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="shrink-0 relative z-10 w-full py-1 sm:py-1.5 text-center text-[10px] sm:text-[10.5px] text-[#ECF1EF]/40 font-mono">
        OASIS ONE &middot; Odisha Startup Community &middot; Admin-approved membership
      </footer>
    </div>
  );
}
