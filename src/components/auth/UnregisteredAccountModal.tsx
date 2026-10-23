"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShieldCheck } from "lucide-react";

interface UnregisteredAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  onContinue?: () => void;
}

export function UnregisteredAccountModal({
  isOpen,
  onClose,
  email = "",
  onContinue,
}: UnregisteredAccountModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = () => {
    if (onContinue) {
      onContinue();
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#03080B]/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] rounded-2xl sm:rounded-3xl join-glass-panel border border-white/10 p-5 sm:p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.85)] space-y-3.5 animate-in zoom-in-95 duration-200 overflow-hidden my-auto text-[#F5FAF6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Specular Hairline */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#ECF1EF]/60 hover:text-[#F5FAF6] hover:bg-white/[0.08] transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Top Brand Mark / Astrolabe Emblem */}
        <div className="flex justify-center items-center pt-1">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#F3D3A2]/20 blur-xl" />
            <div className="w-13 h-13 rounded-2xl bg-[#030909] border border-[#F3D3A2]/30 flex items-center justify-center shadow-[0_0_20px_rgba(243,211,162,0.2)] relative p-2 overflow-hidden">
              <Image
                src="/brand/oasis-mark.png"
                alt="OASIS Official Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain drop-shadow-[0_2px_8px_rgba(243,211,162,0.4)]"
              />
            </div>
          </div>
        </div>

        {/* Status Pill Indicator */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>New Applicant &middot; Application Required</span>
          </div>
        </div>

        {/* Heading & Target Email */}
        <div className="space-y-1.5">
          <h2 className="join-hero-headline text-lg sm:text-xl font-light text-[#F5FAF6] tracking-tight">
            No active OASIS account found
          </h2>

          {email ? (
            <div className="inline-block">
              <span className="font-mono text-xs text-[#88DECC] bg-black/40 px-3 py-1 rounded-lg border border-white/10 shadow-inner">
                {email}
              </span>
            </div>
          ) : null}
        </div>

        {/* Informative Body Text */}
        <p className="join-hero-subhead text-[11px] sm:text-xs text-[#ECF1EF]/70 leading-relaxed font-normal max-w-sm mx-auto">
          Select your role below and complete your application. Once reviewed and approved by our Admissions Committee, you will be able to sign in seamlessly with Google.
        </p>

        {/* 3 Step Onboarding Highlights */}
        <div className="grid grid-cols-3 gap-2 pt-0.5 text-left">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-0.5">
            <div className="text-[9px] uppercase font-mono tracking-wider text-[#88DECC] font-semibold">
              Step 1
            </div>
            <div className="text-xs font-medium text-[#F5FAF6]">Choose Path</div>
            <div className="text-[10px] text-[#ECF1EF]/60 leading-tight">Founder, Builder or Mentor</div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-0.5">
            <div className="text-[9px] uppercase font-mono tracking-wider text-[#88DECC] font-semibold">
              Step 2
            </div>
            <div className="text-xs font-medium text-[#F5FAF6]">Apply</div>
            <div className="text-[10px] text-[#ECF1EF]/60 leading-tight">Submit founder dossier</div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-0.5">
            <div className="text-[9px] uppercase font-mono tracking-wider text-[#88DECC] font-semibold">
              Step 3
            </div>
            <div className="text-xs font-medium text-[#F5FAF6]">Unlock</div>
            <div className="text-[10px] text-[#ECF1EF]/60 leading-tight">Admissions approval</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 space-y-2">
          {/* Signature Cream CTA Pill with Dark Disc & White Chevron */}
          <button
            type="button"
            onClick={handleAction}
            className="join-cta-pill group"
          >
            <span className="font-medium tracking-tight">Select Role &amp; Complete Application</span>
            <div className="join-cta-disc shrink-0">
              <svg viewBox="0 0 5 8" width="5" height="8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M.6.6 4 4 .6 7.4" />
              </svg>
            </div>
          </button>

          <div className="flex items-center justify-center text-xs text-[#ECF1EF]/60 font-mono pt-0.5">
            <Link
              href="/login"
              onClick={onClose}
              className="text-[11px] text-[#ECF1EF]/60 hover:text-[#88DECC] transition-colors underline-offset-4 hover:underline"
            >
              Sign in with different account
            </Link>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[10px] text-[#ECF1EF]/50">
          <ShieldCheck className="w-3.5 h-3.5 text-[#88DECC] shrink-0" />
          <span>Every applicant is personally reviewed by the Admissions Committee.</span>
        </div>
      </div>
    </div>
  );
}
