"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { Compass, Rocket, Award, Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type RoleOption = "aspiring" | "founder" | "mentor";

export default function JoinStep1Page() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleOption>("founder");

  const handleContinue = () => {
    // Store selected role in sessionStorage for registration wizard
    if (typeof window !== "undefined") {
      sessionStorage.setItem("oasis_reg_role", selectedRole);
    }
    router.push(`/join/account?role=${selectedRole}`);
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
            Already a member? Log in
          </Link>
        </div>
      </header>

      {/* ── Main Wizard Canvas ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-16">
        <div className="w-full max-w-[800px] mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-display uppercase tracking-[0.18em] text-[var(--muted)] font-medium">
                Step 1 of 4
              </span>
              <span className="text-[var(--muted)]">Choose your role</span>
            </div>
            {/* 4-segment progress bar */}
            <div className="grid grid-cols-4 gap-2 h-1 w-full">
              <div className="bg-[var(--brand-navy)] rounded-full h-full" />
              <div className="bg-[var(--border)] rounded-full h-full" />
              <div className="bg-[var(--border)] rounded-full h-full" />
              <div className="bg-[var(--border)] rounded-full h-full" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl sm:text-4xl font-normal text-[var(--text)] tracking-tight">
              How would you describe yourself?
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted)] mt-2 max-w-md mx-auto">
              Select the primary path that reflects where you are today in
              Odisha’s entrepreneurial ecosystem.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Aspiring */}
            <button
              type="button"
              onClick={() => setSelectedRole("aspiring")}
              className={cn(
                "group relative text-left bg-[var(--surface)] border rounded-2xl p-6 transition-all cursor-pointer flex flex-col justify-between h-[220px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                selectedRole === "aspiring"
                  ? "border-[var(--brand-gold)] ring-2 ring-[var(--brand-gold)]/40 bg-[#FDFBF7] shadow-[var(--shadow-2)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)] shadow-[var(--shadow-1)] hover:-translate-y-0.5"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)] border border-[var(--border)]">
                    <Compass className="w-5 h-5" />
                  </div>
                  {selectedRole === "aspiring" && (
                    <div className="w-6 h-6 rounded-full bg-[var(--brand-gold)] text-[var(--brand-navy)] flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  )}
                </div>
                <h2 className="font-display text-lg font-medium text-[var(--text)]">
                  Aspiring entrepreneur
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                I’m exploring or validating an idea before taking the leap.
              </p>
            </button>

            {/* Card 2: Founder */}
            <button
              type="button"
              onClick={() => setSelectedRole("founder")}
              className={cn(
                "group relative text-left bg-[var(--surface)] border rounded-2xl p-6 transition-all cursor-pointer flex flex-col justify-between h-[220px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                selectedRole === "founder"
                  ? "border-[var(--brand-gold)] ring-2 ring-[var(--brand-gold)]/40 bg-[#FDFBF7] shadow-[var(--shadow-2)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)] shadow-[var(--shadow-1)] hover:-translate-y-0.5"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--brand-navy)] flex items-center justify-center text-[var(--brand-gold)] border border-[var(--brand-gold)]/20">
                    <Rocket className="w-5 h-5" />
                  </div>
                  {selectedRole === "founder" && (
                    <div className="w-6 h-6 rounded-full bg-[var(--brand-gold)] text-[var(--brand-navy)] flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  )}
                </div>
                <h2 className="font-display text-lg font-medium text-[var(--text)]">
                  Founder or co-founder
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                I’m actively building, launching, or scaling a startup.
              </p>
            </button>

            {/* Card 3: Mentor */}
            <button
              type="button"
              onClick={() => setSelectedRole("mentor")}
              className={cn(
                "group relative text-left bg-[var(--surface)] border rounded-2xl p-6 transition-all cursor-pointer flex flex-col justify-between h-[220px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                selectedRole === "mentor"
                  ? "border-[var(--brand-gold)] ring-2 ring-[var(--brand-gold)]/40 bg-[#FDFBF7] shadow-[var(--shadow-2)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)] shadow-[var(--shadow-1)] hover:-translate-y-0.5"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/40">
                    <Award className="w-5 h-5" />
                  </div>
                  {selectedRole === "mentor" && (
                    <div className="w-6 h-6 rounded-full bg-[var(--brand-gold)] text-[var(--brand-navy)] flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  )}
                </div>
                <h2 className="font-display text-lg font-medium text-[var(--text)]">
                  Mentor or advisor
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                I want to guide, advise, and support high-conviction ventures.
              </p>
            </button>
          </div>

          {/* Actions & Next Steps */}
          <div className="mt-10 max-w-sm mx-auto flex flex-col space-y-3">
            <Button size="lg" className="w-full" onClick={handleContinue}>
              Continue
            </Button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs uppercase tracking-wider text-[var(--muted)]">
                or
              </span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            <Button
              variant="secondary"
              size="md"
              className="w-full bg-[var(--surface)]"
              onClick={() => {
                window.location.href = `/api/v1/auth/google?role=${selectedRole}`;
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

            <div className="pt-4 flex items-center justify-center gap-1.5 text-xs text-[var(--muted)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Every member is reviewed by an admin before they join.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
