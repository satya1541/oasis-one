"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AccountLockedModal } from "@/components/auth/AccountLockedModal";
import { UnregisteredAccountModal } from "@/components/auth/UnregisteredAccountModal";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [lockedEmail, setLockedEmail] = useState("");
  const [unregisteredModalOpen, setUnregisteredModalOpen] = useState(false);
  const [unregisteredEmail, setUnregisteredEmail] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const notice = params.get("notice");
      const emailQuery = params.get("email");
      if (notice === "not_registered") {
        setUnregisteredEmail(emailQuery || "");
        setUnregisteredModalOpen(true);
      }
    }
  }, []);

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
        setError("Unable to sign in. Please verify your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-bg h-screen max-h-screen min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#03080B] text-[#F5FAF6]">
      {/* ── Top Header with Glass Logo Pill and Nav ──────────────────────────── */}
      <header className="shrink-0 relative z-20 w-full px-4 sm:px-8 lg:px-12 py-2 sm:py-2.5 flex items-center justify-between pointer-events-auto">
        {/* Top Left Glass Logo Pill */}
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

        {/* Top Right Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center text-xs font-normal text-[#ECF1EF]/70 hover:text-[#88DECC] transition-colors py-1.5 px-3"
          >
            &larr; Back to Home
          </Link>
          <Link href="/join" className="join-login-pill inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span>Apply for membership</span>
            <svg viewBox="0 0 4 7" width="4" height="7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M.5.5 3.5 3.5.5 6.5" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── Main Login Card ──────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 py-1 overflow-hidden">
        <div className="w-full max-w-[390px] mx-auto space-y-1.5 sm:space-y-2 animate-fade-in-up my-auto">
          {/* Heading */}
          <div className="text-center space-y-0.5">
            <h1 className="join-hero-headline text-lg sm:text-xl font-light text-[#F5FAF6] tracking-tight">
              Welcome back
            </h1>
            <p className="join-hero-subhead text-[11px] sm:text-xs text-[#ECF1EF]/70 max-w-sm mx-auto">
              Sign in to access your dashboard, verified directory, and closed events.
            </p>
          </div>

          {/* Floating Glass Panel */}
          <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
              {error && (
                <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-[11px] text-red-200">
                  {error}
                </div>
              )}

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[10px] sm:text-[10.5px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-0.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="name@startup.in"
                  className="w-full h-8.5 sm:h-9 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label
                    htmlFor="password"
                    className="block text-[10px] sm:text-[10.5px] font-mono uppercase tracking-wider text-[#ECF1EF]/75"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] text-[#88DECC] hover:underline font-normal"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full h-8.5 sm:h-9 px-3 pr-9 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-[#ECF1EF]/50 hover:text-[#88DECC] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Signature Cream CTA Pill */}
              <div className="pt-0.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="join-cta-pill group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="font-medium tracking-tight">{isLoading ? "Signing in to OASIS..." : "Sign in to Portal"}</span>
                  <div className="join-cta-disc shrink-0">
                    <svg viewBox="0 0 5 8" width="5" height="8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M.6.6 4 4 .6 7.4" />
                    </svg>
                  </div>
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-1.5 sm:my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0b1419] px-2 font-mono text-[8.5px] uppercase tracking-wider text-[#ECF1EF]/40">
                  or
                </span>
              </div>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={() => {
                window.location.href = "/api/v1/auth/google?mode=login";
              }}
              className="w-full h-8.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs font-medium text-[#F5FAF6] hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
            </button>

            {/* Bottom Links */}
            <div className="pt-1.5 text-center text-xs space-y-0.5">
              <p className="text-[#ECF1EF]/70 text-[10.5px]">
                New to OASIS?{" "}
                <Link href="/join" className="text-[#88DECC] font-medium hover:underline">
                  Apply for membership
                </Link>
              </p>
              <p className="text-[9.5px] text-[#ECF1EF]/40 font-mono">
                By continuing, you agree to the{" "}
                <Link href="/legal/privacy" className="underline hover:text-[#88DECC]">
                  Privacy Notice
                </Link>{" "}
                and{" "}
                <Link href="/legal/guidelines" className="underline hover:text-[#88DECC]">
                  Community Guidelines
                </Link>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#ECF1EF]/60">
            <ShieldCheck className="w-3 h-3 text-[#88DECC] shrink-0" />
            <span>Encrypted login &middot; Protected member sanctuary</span>
          </div>
        </div>

        {/* Modals */}
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

        <UnregisteredAccountModal
          isOpen={unregisteredModalOpen}
          onClose={() => setUnregisteredModalOpen(false)}
          email={unregisteredEmail}
          onContinue={() => {
            window.location.href = `/join?notice=not_registered&email=${encodeURIComponent(unregisteredEmail)}`;
          }}
        />
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="shrink-0 relative z-10 w-full py-1 sm:py-1.5 text-center text-[10px] sm:text-[10.5px] text-[#ECF1EF]/40 font-mono">
        OASIS ONE &middot; Odisha Startup Community &middot; Admin-approved membership
      </footer>
    </div>
  );
}
