"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UnregisteredAccountModal } from "@/components/auth/UnregisteredAccountModal";
import { Compass, Rocket, Award, Check, ShieldCheck } from "lucide-react";

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
    <div className="w-full max-w-[780px] mx-auto space-y-2 relative z-10 animate-fade-in-up my-auto">
      {/* Modal for Unregistered Users routed from Google Login */}
      <UnregisteredAccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        email={emailParam}
        onContinue={() => setModalOpen(false)}
      />

      {/* Subtle indicator bar if modal was closed */}
      {isNotRegistered && !modalOpen && (
        <div className="p-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>
              Applying for Google account:{" "}
              <strong className="font-mono text-[#F3D3A2]">{emailParam || "your email"}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-[11px] underline text-[#F3D3A2] hover:opacity-80 cursor-pointer"
          >
            View Notice
          </button>
        </div>
      )}

      {/* Main Floating Glass Panel */}
      <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 lg:p-5 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)] space-y-2 sm:space-y-2.5">
        {/* Progress Indicator */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#88DECC] font-mono">
              Step 1 of 4 &middot; Role Selection
            </span>
            <span className="text-[10px] sm:text-[10.5px] text-[#ECF1EF]/60 font-normal">Odisha Startup Ecosystem</span>
          </div>
          {/* 4-Segment Progress Bar */}
          <div className="grid grid-cols-4 gap-1.5 h-1 w-full">
            <div className="bg-gradient-to-r from-[#88DECC] to-[#7EC4B5] rounded-full h-full shadow-[0_0_12px_rgba(136,222,204,0.6)]" />
            <div className="bg-white/10 rounded-full h-full" />
            <div className="bg-white/10 rounded-full h-full" />
            <div className="bg-white/10 rounded-full h-full" />
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center space-y-0.5 max-w-lg mx-auto">
          <h1 className="join-hero-headline text-lg sm:text-xl lg:text-[22px] font-light text-[#F5FAF6] tracking-tight leading-snug">
            How would you describe yourself?
          </h1>
          <p className="join-hero-subhead text-[11px] sm:text-xs text-[#ECF1EF]/75 leading-normal font-normal">
            Select the primary path that reflects where you are today in Odisha&apos;s entrepreneurial ecosystem.
          </p>
        </div>

        {/* Role Cards Grid - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {/* Card 1: Aspiring Entrepreneur */}
          <button
            type="button"
            onClick={() => setSelectedRole("aspiring")}
            className={`join-role-card ${selectedRole === "aspiring" ? "selected" : ""}`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-[#88DECC] shadow-inner">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                {selectedRole === "aspiring" ? (
                  <div className="w-4 h-4 rounded-full bg-[#88DECC] text-[#03080B] flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full border border-white/20" />
                )}
              </div>
              <div>
                <h2 className="text-xs sm:text-[13px] font-medium text-[#F5FAF6] mb-0.5">
                  Aspiring Entrepreneur
                </h2>
                <p className="text-[10px] sm:text-[10.5px] text-[#ECF1EF]/65 leading-snug line-clamp-2">
                  Exploring or validating a problem statement before taking the leap.
                </p>
              </div>
            </div>

            <div className="pt-1 border-t border-white/[0.06] flex items-center gap-1 flex-wrap">
              <span className="text-[8.5px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-[#88DECC]/90 border border-white/[0.05]">
                Ideation
              </span>
              <span className="text-[8.5px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-[#ECF1EF]/60 border border-white/[0.05]">
                Feedback
              </span>
            </div>
          </button>

          {/* Card 2: Founder or Co-founder */}
          <button
            type="button"
            onClick={() => setSelectedRole("founder")}
            className={`join-role-card ${selectedRole === "founder" ? "selected" : ""}`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-black/50 border border-[#88DECC]/30 flex items-center justify-center text-[#88DECC] shadow-inner">
                  <Rocket className="w-3.5 h-3.5" />
                </div>
                {selectedRole === "founder" ? (
                  <div className="w-4 h-4 rounded-full bg-[#88DECC] text-[#03080B] flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full border border-white/20" />
                )}
              </div>
              <div>
                <h2 className="text-xs sm:text-[13px] font-medium text-[#F5FAF6] mb-0.5">
                  Founder or Co-founder
                </h2>
                <p className="text-[10px] sm:text-[10.5px] text-[#ECF1EF]/65 leading-snug line-clamp-2">
                  Actively building, testing an MVP, or scaling a registered startup.
                </p>
              </div>
            </div>

            <div className="pt-1 border-t border-white/[0.06] flex items-center gap-1 flex-wrap">
              <span className="text-[8.5px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-[#88DECC]/90 border border-white/[0.05]">
                MVP &middot; Growth
              </span>
              <span className="text-[8.5px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-[#ECF1EF]/60 border border-white/[0.05]">
                Investors
              </span>
            </div>
          </button>

          {/* Card 3: Mentor or Advisor */}
          <button
            type="button"
            onClick={() => setSelectedRole("mentor")}
            className={`join-role-card ${selectedRole === "mentor" ? "selected" : ""}`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-[#88DECC] shadow-inner">
                  <Award className="w-3.5 h-3.5" />
                </div>
                {selectedRole === "mentor" ? (
                  <div className="w-4 h-4 rounded-full bg-[#88DECC] text-[#03080B] flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full border border-white/20" />
                )}
              </div>
              <div>
                <h2 className="text-xs sm:text-[13px] font-medium text-[#F5FAF6] mb-0.5">
                  Mentor or Advisor
                </h2>
                <p className="text-[10px] sm:text-[10.5px] text-[#ECF1EF]/65 leading-snug line-clamp-2">
                  Guiding, advising, and supporting high-conviction ventures in Odisha.
                </p>
              </div>
            </div>

            <div className="pt-1 border-t border-white/[0.06] flex items-center gap-1 flex-wrap">
              <span className="text-[8.5px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-[#88DECC]/90 border border-white/[0.05]">
                Advisory
              </span>
              <span className="text-[8.5px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-[#ECF1EF]/60 border border-white/[0.05]">
                Angel Network
              </span>
            </div>
          </button>
        </div>

        {/* Actions & Next Steps */}
        <div className="pt-0.5 max-w-xs sm:max-w-sm mx-auto flex flex-col space-y-1.5 w-full">
          {/* Signature Cream CTA Pill */}
          <button
            type="button"
            onClick={handleContinue}
            className="join-cta-pill group"
          >
            <span className="font-medium tracking-tight">Continue to Account Setup</span>
            <div className="join-cta-disc shrink-0">
              <svg viewBox="0 0 5 8" width="5" height="8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M.6.6 4 4 .6 7.4" />
              </svg>
            </div>
          </button>

          <div className="flex items-center gap-2.5 py-0">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[9px] uppercase font-mono tracking-wider text-[#ECF1EF]/40">
              or
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Continue with Google button in dark glass */}
          <button
            type="button"
            className="w-full h-8.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs font-medium text-[#F5FAF6] hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            onClick={() => {
              window.location.href = `/api/v1/auth/google?mode=signup&role=${selectedRole}`;
            }}
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

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#ECF1EF]/60">
            <ShieldCheck className="w-3 h-3 text-[#88DECC] shrink-0" />
            <span>Every applicant is personally reviewed by an admin.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JoinStep1Page() {
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

        {/* Top Right Navigation Pill */}
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

      {/* ── Main Step Content ─────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 py-1 overflow-hidden">
        <Suspense fallback={<div className="text-center text-sm text-[#ECF1EF]/60">Loading step...</div>}>
          <JoinStep1Content />
        </Suspense>
      </main>

      {/* ── Minimal Bottom Footer Line ────────────────────────────────────────── */}
      <footer className="shrink-0 relative z-10 w-full py-1 sm:py-1.5 text-center text-[10px] sm:text-[10.5px] text-[#ECF1EF]/40 font-mono">
        OASIS ONE &middot; Curated &amp; Admin Vetted Startup Community &middot; Odisha
      </footer>
    </div>
  );
}
