"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { UnregisteredAccountModal } from "@/components/auth/UnregisteredAccountModal";
import { Compass, Rocket, Award, Check, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type RoleOption = "aspiring" | "founder" | "mentor";

function JoinStep1Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notice = searchParams.get("notice");
  const emailParam = searchParams.get("email") || "";
  const nameParam = searchParams.get("name") || "";

  const isNotRegistered = notice === "not_registered";
  const [selectedRole, setSelectedRole] = useState<RoleOption>("founder");
  const [modalOpen, setModalOpen] = useState(isNotRegistered);

  useEffect(() => {
    if (isNotRegistered) {
      setModalOpen(true);
    }
  }, [isNotRegistered]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (emailParam) {
        sessionStorage.setItem("oasis_reg_email", emailParam);
      }
      if (nameParam) {
        sessionStorage.setItem("oasis_reg_name", nameParam);
      }
    }
  }, [emailParam, nameParam]);

  const handleContinue = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("oasis_reg_role", selectedRole);
    }
    router.push(`/join/account?role=${selectedRole}`);
  };

  return (
    <div className="w-full max-w-[820px] mx-auto space-y-9">
      {/* Modal for Unregistered Users routed from Google Login */}
      <UnregisteredAccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        email={emailParam}
        onContinue={() => setModalOpen(false)}
      />

      {/* Subtle indicator bar if modal was closed */}
      {isNotRegistered && !modalOpen && (
        <div className="p-3.5 px-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>
              Applying for Google account:{" "}
              <strong className="font-mono">{emailParam || "your email"}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-[11px] underline text-amber-800 dark:text-amber-300 hover:opacity-80 cursor-pointer"
          >
            View Notice
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2.5">
          <span className="font-display uppercase tracking-[0.22em] text-[var(--accent)] font-semibold text-[11px]">
            Step 1 of 4
          </span>
          <span className="text-xs text-[var(--muted)] font-medium">Role Selection</span>
        </div>
        {/* 4-segment progress bar with gold indicator */}
        <div className="grid grid-cols-4 gap-2.5 h-1.5 w-full">
          <div className="bg-gradient-to-r from-[var(--brand-gold)] to-[#E9C68C] rounded-full h-full shadow-[0_0_8px_rgba(243,211,162,0.6)]" />
          <div className="bg-[var(--border)]/70 rounded-full h-full" />
          <div className="bg-[var(--border)]/70 rounded-full h-full" />
          <div className="bg-[var(--border)]/70 rounded-full h-full" />
        </div>
      </div>

      {/* Heading */}
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <h1 className="font-display text-3xl sm:text-4xl font-light text-[var(--text)] tracking-tight">
          How would you describe yourself?
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed font-sans">
          Select the primary path that reflects where you are today in Odisha’s entrepreneurial ecosystem.
        </p>
      </div>

      {/* Role Cards Grid with Apple-grade tactile feedback */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Aspiring */}
        <button
          type="button"
          onClick={() => setSelectedRole("aspiring")}
          className={cn(
            "group relative text-left rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between h-[230px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
            selectedRole === "aspiring"
              ? "bg-[var(--surface)] border-2 border-[var(--brand-gold)] ring-4 ring-[var(--brand-gold)]/15 shadow-[0_12px_32px_-8px_rgba(134,96,31,0.18)]"
              : "bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/50 shadow-xs hover:-translate-y-1 hover:shadow-md"
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)] border border-[var(--border)] shadow-2xs">
                <Compass className="w-5 h-5" />
              </div>
              {selectedRole === "aspiring" && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#F3D3A2] to-[#E9C68C] text-[var(--brand-navy)] flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </div>
            <h2 className="font-display text-lg font-semibold text-[var(--text)]">
              Aspiring Entrepreneur
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            I’m exploring or validating a problem statement before taking the leap.
          </p>
        </button>

        {/* Card 2: Founder */}
        <button
          type="button"
          onClick={() => setSelectedRole("founder")}
          className={cn(
            "group relative text-left rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between h-[230px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
            selectedRole === "founder"
              ? "bg-[var(--surface)] border-2 border-[var(--brand-gold)] ring-4 ring-[var(--brand-gold)]/15 shadow-[0_12px_32px_-8px_rgba(134,96,31,0.18)]"
              : "bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/50 shadow-xs hover:-translate-y-1 hover:shadow-md"
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--brand-navy)] flex items-center justify-center text-[var(--brand-gold)] border border-[var(--brand-gold)]/25 shadow-xs">
                <Rocket className="w-5 h-5" />
              </div>
              {selectedRole === "founder" && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#F3D3A2] to-[#E9C68C] text-[var(--brand-navy)] flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </div>
            <h2 className="font-display text-lg font-semibold text-[var(--text)]">
              Founder or Co-founder
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            I’m actively building, testing an MVP, or scaling a registered startup.
          </p>
        </button>

        {/* Card 3: Mentor */}
        <button
          type="button"
          onClick={() => setSelectedRole("mentor")}
          className={cn(
            "group relative text-left rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between h-[230px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
            selectedRole === "mentor"
              ? "bg-[var(--surface)] border-2 border-[var(--brand-gold)] ring-4 ring-[var(--brand-gold)]/15 shadow-[0_12px_32px_-8px_rgba(134,96,31,0.18)]"
              : "bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/50 shadow-xs hover:-translate-y-1 hover:shadow-md"
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/40 shadow-2xs">
                <Award className="w-5 h-5" />
              </div>
              {selectedRole === "mentor" && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#F3D3A2] to-[#E9C68C] text-[var(--brand-navy)] flex items-center justify-center shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </div>
            <h2 className="font-display text-lg font-semibold text-[var(--text)]">
              Mentor or Advisor
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            I want to guide, advise, and support high-conviction ventures in Odisha.
          </p>
        </button>
      </div>

      {/* Actions & Next Steps */}
      <div className="pt-4 max-w-sm mx-auto flex flex-col space-y-3.5">
        <Button size="lg" variant="primary" className="w-full rounded-xl text-sm font-semibold tracking-wide shadow-md" onClick={handleContinue}>
          Continue to Account Setup
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-[11px] uppercase font-mono tracking-wider text-[var(--muted)]">
            or
          </span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <Button
          variant="secondary"
          size="md"
          className="w-full rounded-xl bg-[var(--surface-2)] border-[var(--border)] text-xs font-medium shadow-xs"
          onClick={() => {
            window.location.href = `/api/v1/auth/google?mode=signup&role=${selectedRole}`;
          }}
        >
          <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
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

        <div className="pt-3 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
          <ShieldCheck className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <span>Every applicant is personally reviewed by an admin.</span>
        </div>
      </div>
    </div>
  );
}

export default function JoinStep1Page() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Header (Midnight Navy Luxury Bar) ─────────────────────────────── */}
      <header className="w-full bg-[#1E1F33]/95 backdrop-blur-xl border-b border-[var(--brand-gold)]/20 px-6 lg:px-12 h-16 sm:h-[70px] flex items-center shadow-xs">
        <div className="w-full max-w-[1240px] mx-auto flex items-center justify-between">
          <BrandLockup variant="horizontal" priority />
          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium text-[var(--brand-cream)]/85 hover:text-[var(--brand-gold)] transition-colors"
          >
            Already a member? Log in
          </Link>
        </div>
      </header>

      {/* ── Main Wizard Canvas ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-16">
        <Suspense fallback={<div className="text-center text-sm text-[var(--muted)]">Loading step...</div>}>
          <JoinStep1Content />
        </Suspense>
      </main>
    </div>
  );
}
