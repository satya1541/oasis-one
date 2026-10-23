"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GlassLogoPill } from "@/components/brand/GlassLogoPill";
import { JoinShowcase } from "@/components/join/JoinShowcase";
import { AccountLockedModal } from "@/components/auth/AccountLockedModal";
import { UnregisteredAccountModal } from "@/components/auth/UnregisteredAccountModal";
import { ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";

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
    <div className="login-bg h-screen max-h-screen min-h-screen relative flex flex-col overflow-hidden bg-[#03080B] text-[#F5FAF6]">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="shrink-0 relative z-20 w-full px-4 sm:px-8 lg:px-12 py-2.5 sm:py-3.5 flex items-center justify-between pointer-events-auto">
        <GlassLogoPill href="/" />
        <div className="flex items-center gap-3.5 sm:gap-6">
          <Link
            href="/faq"
            className="text-xs text-[#ECF1EF]/60 hover:text-[#88DECC] transition-colors font-medium"
          >
            Need help?
          </Link>
          <Link
            href="/join"
            className="join-login-pill inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <span>Apply for membership</span>
            <svg
              viewBox="0 0 4 7"
              width="4"
              height="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M.5.5 3.5 3.5.5 6.5" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── Main Content: Split Layout ──────────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: Login Form */}
        <div className="flex-1 min-h-0 flex flex-col justify-center lg:w-1/2 px-4 sm:px-8 lg:px-12 xl:px-16 py-4 overflow-y-auto auth-scrollbar">
          <div className="w-full max-w-md mx-auto space-y-4">
            {/* Editorial Heading */}
            <div className="text-left space-y-1.5">
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-display font-light text-[#F5FAF6] tracking-tight leading-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-[#ECF1EF]/65 leading-relaxed">
                Sign in to access your venture dashboard, verified peer directory, and closed events.
              </p>
            </div>

            {/* Glass Panel Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-3.5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              {error && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[10px] sm:text-[10.5px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1"
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
                  className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-[10px] sm:text-[10.5px] font-mono uppercase tracking-wider text-[#ECF1EF]/75"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#88DECC] hover:underline font-normal"
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
                    className="w-full h-10 px-3.5 pr-10 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-[#ECF1EF]/50 hover:text-[#88DECC] transition-colors p-1 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Signature Cream CTA Pill */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="join-cta-pill group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="font-medium tracking-tight">
                    {isLoading ? "Signing in to OASIS..." : "Sign in to Portal"}
                  </span>
                  <div className="join-cta-disc shrink-0">
                    <svg
                      viewBox="0 0 5 8"
                      width="5"
                      height="8"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                    >
                      <path d="M.6.6 4 4 .6 7.4" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2.5 pt-1">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[9px] uppercase font-mono tracking-wider text-[#ECF1EF]/40">
                  or
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/api/v1/auth/google?mode=login";
                }}
                className="w-full h-10 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-[#F5FAF6] hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Bottom Links */}
              <div className="pt-2 text-center space-y-1">
                <p className="text-xs text-[#ECF1EF]/70">
                  New to OASIS?{" "}
                  <Link href="/join" className="text-[#88DECC] font-medium hover:underline">
                    Apply for membership
                  </Link>
                </p>
                <p className="text-[10px] text-[#ECF1EF]/40 font-mono">
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
            </form>

            {/* Security reassurance */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#ECF1EF]/55">
              <ShieldCheck className="w-3.5 h-3.5 text-[#88DECC] shrink-0" />
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
              window.location.href = `/join?notice=not_registered&email=${encodeURIComponent(
                unregisteredEmail
              )}`;
            }}
          />
        </div>

        {/* RIGHT COLUMN: Cinematic Showcase (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 relative border-l border-white/[0.06]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#070D12] via-[#0a1218] to-[#03080B]" />
          <JoinShowcase variant="login" />
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="shrink-0 relative z-10 w-full py-1.5 text-center text-[10px] text-[#ECF1EF]/35 font-mono">
        OASIS &middot; Odisha Startup Community &middot; Admin-approved membership
      </footer>
    </div>
  );
}
