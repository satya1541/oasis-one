"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";

function JoinAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "founder";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = sessionStorage.getItem("oasis_reg_name");
      const savedEmail = sessionStorage.getItem("oasis_reg_email");
      const savedPhone = sessionStorage.getItem("oasis_reg_phone");
      if (savedName) setFullName(savedName);
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
    }
  }, []);

  // Password rules validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("oasis_reg_name", fullName.trim());
      sessionStorage.setItem("oasis_reg_email", email.trim());
      sessionStorage.setItem("oasis_reg_phone", phone.trim());
      sessionStorage.setItem("oasis_reg_password", password);
    }

    router.push(`/join/details?role=${roleParam}`);
  };

  const handleGoogleSignUp = () => {
    window.location.href = `/api/v1/auth/google?mode=signup&role=${encodeURIComponent(roleParam || "founder")}`;
  };

  return (
    <div className="w-full max-w-[540px] mx-auto space-y-1.5 sm:space-y-2 relative z-10 animate-fade-in-up my-auto">
      {/* Progress Indicator */}
      <div className="px-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#88DECC] font-mono">
            Step 2 of 4 &middot; Account Details
          </span>
          <span className="text-[10px] sm:text-[10.5px] text-[#ECF1EF]/60 font-normal">Security &amp; Credentials</span>
        </div>
        {/* 4-Segment Progress Bar */}
        <div className="grid grid-cols-4 gap-1.5 h-1 w-full">
          <div className="bg-gradient-to-r from-[#88DECC] to-[#7EC4B5] rounded-full h-full shadow-[0_0_10px_rgba(136,222,204,0.6)]" />
          <div className="bg-gradient-to-r from-[#88DECC] to-[#7EC4B5] rounded-full h-full shadow-[0_0_10px_rgba(136,222,204,0.6)]" />
          <div className="bg-white/10 rounded-full h-full" />
          <div className="bg-white/10 rounded-full h-full" />
        </div>
      </div>

      {/* Heading */}
      <div className="text-center space-y-0.5">
        <h1 className="join-hero-headline text-lg sm:text-xl font-light text-[#F5FAF6] tracking-tight">
          Create your account
        </h1>
        <p className="join-hero-subhead text-[11px] sm:text-xs text-[#ECF1EF]/70">
          Join 650+ verified founders and mentors across Odisha.
        </p>
      </div>

      {/* Main Glass Panel */}
      <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
          {error && (
            <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-[11px] text-red-200">
              {error}
            </div>
          )}

          {/* 2-Column Responsive Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] sm:text-[10.5px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-0.5">
                Full name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Your full name"
                className="w-full h-8.5 sm:h-9 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 outline-none transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] sm:text-[10.5px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-0.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="name@startup.in"
                className="w-full h-8.5 sm:h-9 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 outline-none transition-all"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[10px] sm:text-[10.5px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-0.5">
                Mobile number
              </label>
              <div className="flex rounded-xl bg-white/[0.04] border border-white/12 focus-within:bg-white/[0.08] focus-within:border-[#88DECC] focus-within:ring-1.5 focus-within:ring-[#88DECC]/20 transition-all overflow-hidden h-8.5 sm:h-9">
                <span className="inline-flex items-center px-2.5 text-xs font-mono font-semibold text-[#88DECC] border-r border-white/10 bg-black/30">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="98765 43210"
                  className="w-full h-full px-2.5 bg-transparent text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] sm:text-[10.5px] font-mono uppercase tracking-wider text-[#ECF1EF]/75">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[9.5px] sm:text-[10px] text-[#ECF1EF]/60 hover:text-[#88DECC] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="••••••••••••"
                className="w-full h-8.5 sm:h-9 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Validation Badges */}
          <div className="p-1.5 rounded-lg bg-black/30 border border-white/10 text-[9.5px] sm:text-[10px]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5">
              <div className={`flex items-center gap-1 ${hasMinLength ? "text-[#88DECC]" : "text-[#ECF1EF]/40"}`}>
                <Check className={`w-2.5 h-2.5 ${hasMinLength ? "opacity-100" : "opacity-30"}`} />
                <span>8+ chars</span>
              </div>
              <div className={`flex items-center gap-1 ${hasUppercase ? "text-[#88DECC]" : "text-[#ECF1EF]/40"}`}>
                <Check className={`w-2.5 h-2.5 ${hasUppercase ? "opacity-100" : "opacity-30"}`} />
                <span>Uppercase</span>
              </div>
              <div className={`flex items-center gap-1 ${hasLowercase ? "text-[#88DECC]" : "text-[#ECF1EF]/40"}`}>
                <Check className={`w-2.5 h-2.5 ${hasLowercase ? "opacity-100" : "opacity-30"}`} />
                <span>Lowercase</span>
              </div>
              <div className={`flex items-center gap-1 ${hasNumber ? "text-[#88DECC]" : "text-[#ECF1EF]/40"}`}>
                <Check className={`w-2.5 h-2.5 ${hasNumber ? "opacity-100" : "opacity-30"}`} />
                <span>Number (0-9)</span>
              </div>
            </div>
          </div>

          {/* Signature Cream CTA Pill */}
          <div className="pt-0.5">
            <button
              type="submit"
              className="join-cta-pill group"
            >
              <span className="font-medium tracking-tight">Continue to Startup Details</span>
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

        {/* Google OAuth in Dark Glass */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-1 text-center text-[9.5px] text-[#ECF1EF]/40 font-mono">
          We&apos;ll send an email confirmation upon approval.
        </p>
      </div>

      {/* Back button */}
      <div className="text-center">
        <Link
          href={`/join?role=${roleParam}`}
          className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-[#ECF1EF]/70 hover:text-[#88DECC] hover:border-[#88DECC]/30 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-2.5 h-2.5" />
          <span>Change role selection</span>
        </Link>
      </div>
    </div>
  );
}

export default function JoinAccountPage() {
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
            <span>Already a member? Log in</span>
            <svg viewBox="0 0 4 7" width="4" height="7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M.5.5 3.5 3.5.5 6.5" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── Main Wizard Canvas ────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 py-1 overflow-hidden">
        <Suspense fallback={<div className="text-center text-sm text-[#ECF1EF]/60">Loading step...</div>}>
          <JoinAccountForm />
        </Suspense>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="shrink-0 relative z-10 w-full py-1 sm:py-1.5 text-center text-[10px] sm:text-[10.5px] text-[#ECF1EF]/40 font-mono">
        OASIS ONE &middot; Odisha Startup Community &middot; Admin-approved membership
      </footer>
    </div>
  );
}
