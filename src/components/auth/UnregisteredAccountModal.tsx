"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
      className="fixed inset-0 z-50 bg-[#0B0C14]/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[540px] rounded-3xl bg-[var(--surface)] border border-[var(--brand-gold)]/30 p-7 sm:p-9 text-center shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Gold Hairline */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--brand-gold)] to-transparent animate-pulse" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Brand Mark / Astrolabe Icon */}
        <div className="flex justify-center items-center pt-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[var(--brand-gold)]/25 to-[#86601F]/10 blur-xl" />
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-b from-[#1E1F33] to-[#12131F] border border-[var(--brand-gold)]/40 flex items-center justify-center p-2.5 shadow-xl relative">
              <Image
                src="/brand/icon-192.png"
                alt="OASIS ONE"
                width={46}
                height={46}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Status Pill Indicator */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>New Applicant • Application Required</span>
          </div>
        </div>

        {/* Heading & Target Email */}
        <div className="space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight">
            No active OASIS account found
          </h2>

          {email ? (
            <div className="inline-block">
              <span className="font-mono text-xs text-[var(--text)] bg-[var(--surface-2)] px-3.5 py-1.5 rounded-xl border border-[var(--border)] shadow-xs">
                {email}
              </span>
            </div>
          ) : null}
        </div>

        {/* Informative Body Text */}
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed font-sans max-w-md mx-auto">
          Select your role below and complete your application. Once reviewed and approved by our Admissions Committee, you will be able to sign in seamlessly with Google.
        </p>

        {/* 3 Step Onboarding Highlights */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 text-left">
          <div className="p-3 rounded-2xl bg-[var(--surface-2)]/70 border border-[var(--border)]/70 space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--accent)] font-semibold">
              Step 1
            </div>
            <div className="text-xs font-medium text-[var(--text)]">Choose Path</div>
            <div className="text-[11px] text-[var(--muted)]">Founder, Builder or Mentor</div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--surface-2)]/70 border border-[var(--border)]/70 space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--accent)] font-semibold">
              Step 2
            </div>
            <div className="text-xs font-medium text-[var(--text)]">Apply</div>
            <div className="text-[11px] text-[var(--muted)]">Submit founder dossier</div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--surface-2)]/70 border border-[var(--border)]/70 space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--accent)] font-semibold">
              Step 3
            </div>
            <div className="text-xs font-medium text-[var(--text)]">Unlock</div>
            <div className="text-[11px] text-[var(--muted)]">Admissions approval</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <Button
            variant="gold"
            size="lg"
            onClick={handleAction}
            className="w-full h-12 rounded-xl text-xs sm:text-sm font-semibold tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Select Role &amp; Complete Application</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex items-center justify-center gap-4 text-xs text-[var(--muted)] font-mono">
            <Link
              href="/login"
              className="hover:text-[var(--text)] transition-colors underline-offset-4 hover:underline"
            >
              Sign in with different account
            </Link>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="pt-3 border-t border-[var(--border)]/80 flex items-center justify-center gap-2 text-[11px] text-[var(--muted)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
          <span>Every applicant is personally reviewed by the Admissions Committee.</span>
        </div>
      </div>
    </div>
  );
}
