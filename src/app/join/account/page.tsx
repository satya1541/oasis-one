"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Check, ShieldCheck, Eye, EyeOff } from "lucide-react";

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
      setError("Please enter a valid 10-digit mobile number for security verification.");
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
    <div className="w-full max-w-[540px] mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <span className="font-display uppercase tracking-[0.22em] text-[var(--accent)] font-semibold text-[11px]">
            Step 2 of 4
          </span>
          <span className="text-xs text-[var(--muted)] font-medium">Account Details</span>
        </div>
        <div className="grid grid-cols-4 gap-2.5 h-1.5 w-full">
          <div className="bg-gradient-to-r from-[var(--brand-gold)] to-[#E9C68C] rounded-full h-full shadow-[0_0_8px_rgba(243,211,162,0.6)]" />
          <div className="bg-gradient-to-r from-[var(--brand-gold)] to-[#E9C68C] rounded-full h-full shadow-[0_0_8px_rgba(243,211,162,0.6)]" />
          <div className="bg-[var(--border)]/70 rounded-full h-full" />
          <div className="bg-[var(--border)]/70 rounded-full h-full" />
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-8 space-y-1.5">
        <h1 className="text-3xl lg:text-4xl font-display font-light text-[var(--text)] tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Join 650+ verified founders and mentors across Odisha.
        </p>
      </div>

      {/* Form Card */}
      <div className="card-luxury p-7 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[var(--danger)]">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
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
              className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
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
              className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
              Mobile number (SMS / OTP verification)
            </label>
            <div className="flex rounded-xl bg-[var(--surface-2)] border border-[var(--border)] focus-within:bg-white focus-within:border-[var(--brand-navy)] focus-within:ring-2 focus-within:ring-[var(--brand-gold)]/20 transition-all overflow-hidden">
              <span className="inline-flex items-center px-3.5 text-xs font-mono font-semibold text-[var(--muted)] border-r border-[var(--border)] bg-black/[0.02]">
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
                className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-1.5">
              Required for SMS authentication and platform trust verification.
            </p>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
              className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all"
            />

            {/* Password Validation Requirements */}
            <div className="mt-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]/60 space-y-1.5 text-xs">
              <span className="block text-[11px] font-medium text-[var(--muted)] mb-1">
                Password requirements:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-[var(--success)]" : "text-[var(--muted)]"}`}>
                  <Check className={`w-3 h-3 ${hasMinLength ? "opacity-100" : "opacity-30"}`} />
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-[var(--success)]" : "text-[var(--muted)]"}`}>
                  <Check className={`w-3 h-3 ${hasUppercase ? "opacity-100" : "opacity-30"}`} />
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-[var(--success)]" : "text-[var(--muted)]"}`}>
                  <Check className={`w-3 h-3 ${hasLowercase ? "opacity-100" : "opacity-30"}`} />
                  <span>Lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-[var(--success)]" : "text-[var(--muted)]"}`}>
                  <Check className={`w-3 h-3 ${hasNumber ? "opacity-100" : "opacity-30"}`} />
                  <span>Number (0-9)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full">
              Continue
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--surface)] px-3 text-[var(--muted)] font-medium">or</span>
          </div>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-[var(--border)] bg-transparent hover:bg-[var(--surface-2)] text-sm font-medium text-[var(--text)] transition-colors cursor-pointer"
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

        <p className="mt-5 text-center text-xs text-[var(--muted)]">
          We&apos;ll send a link to confirm your email.
        </p>
      </div>

      {/* Back button */}
      <div className="mt-6 text-center">
        <Link
          href={`/join?role=${roleParam}`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change role selection</span>
        </Link>
      </div>
    </div>
  );
}

export default function JoinAccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
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

      {/* ── Main Wizard Canvas ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-16">
        <Suspense fallback={<div className="text-center text-sm text-[var(--muted)]">Loading step...</div>}>
          <JoinAccountForm />
        </Suspense>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="py-6 border-t border-[var(--border)]/40 text-center text-xs text-[var(--muted)]">
        OASIS ONE · Odisha Startup Community · Admin-approved membership
      </footer>
    </div>
  );
}
