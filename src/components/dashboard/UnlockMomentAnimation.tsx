"use client";

import { useEffect, useState } from "react";
import { AstrolabeStar } from "@/components/brand/AstrolabeStar";
import { Lock, Unlock, Sparkles, Check, X } from "lucide-react";

interface UnlockMomentAnimationProps {
  userName: string;
  onComplete: () => void;
}

export function UnlockMomentAnimation({
  userName,
  onComplete,
}: UnlockMomentAnimationProps) {
  const [frame, setFrame] = useState<1 | 2 | 3 | 4>(1);
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    if (dismissed) return;
    setDismissed(true);
    onComplete();
  };

  // Esc key or click to skip immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismissed]);

  // Frame sequence
  useEffect(() => {
    const t1 = setTimeout(() => setFrame(2), 700);
    const t2 = setTimeout(() => setFrame(3), 1400);
    const t3 = setTimeout(() => setFrame(4), 2100);
    const t4 = setTimeout(() => handleDismiss(), 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [dismissed]);

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-50 bg-[var(--brand-navy)]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-[var(--brand-cream)] cursor-pointer select-none"
    >
      {/* Top Sweep Hairline */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--brand-gold)] to-transparent animate-pulse" />

      {/* Skip button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-6 right-6 text-xs text-[var(--brand-cream)]/70 hover:text-[var(--brand-cream)] px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 flex items-center gap-1.5 transition-colors shadow-sm"
      >
        <span>Skip</span>
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Central Visual */}
      <div className="relative max-w-md w-full flex flex-col items-center text-center space-y-6">
        {/* Glowing Astrolabe Star with Quarter Turn */}
        <div
          className={`transition-all duration-1000 transform ${
            frame === 1
              ? "scale-95 rotate-0 opacity-80"
              : frame === 2
              ? "scale-105 rotate-45 opacity-100"
              : frame === 3
              ? "scale-100 rotate-90 opacity-90"
              : "scale-100 rotate-90 opacity-40"
          }`}
        >
          <AstrolabeStar size={160} />
        </div>

        {/* Dynamic Storyboard Frame Content */}
        {frame === 1 && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--brand-gold)]">
              Application Approved
            </div>
            <h2 className="font-display text-2xl font-light text-[var(--brand-cream)] tracking-tight">
              Admissions Committee verified your profile
            </h2>
            <p className="text-xs text-[var(--brand-cream)]/70">
              Unlocking your Odisha startup community portal...
            </p>
          </div>
        )}

        {frame === 2 && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[var(--brand-gold)]">
              <Unlock className="w-4 h-4 animate-bounce" />
              <span>Releasing community restrictions...</span>
            </div>
            <h2 className="font-display text-2xl font-light text-[var(--brand-cream)] tracking-tight">
              Directory, Events & Discussions Unlocked
            </h2>
          </div>
        )}

        {frame === 3 && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-xs font-mono text-[var(--brand-gold)]">
              Prefetching Cohort Feed...
            </div>
            <h2 className="font-display text-2xl font-light text-[var(--brand-cream)] tracking-tight">
              Synchronizing verified mentors across Odisha
            </h2>
          </div>
        )}

        {frame === 4 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-gold)] text-[var(--brand-navy)] text-xs font-semibold">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Membership Active</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-light text-[var(--brand-cream)] tracking-tight">
              You&apos;re in, {userName}.
              <br />
              <span className="text-[var(--brand-gold)]">Welcome to OASIS.</span>
            </h2>
            <p className="text-xs text-[var(--brand-cream)]/75 max-w-sm mx-auto">
              Click anywhere to explore your dashboard and get started.
            </p>
            <div className="pt-2 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}
                className="px-6 py-2.5 rounded-full bg-[var(--brand-gold)] text-[var(--brand-navy)] font-semibold text-xs hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-[var(--brand-gold)]/20"
              >
                Go to Dashboard &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex items-center gap-1.5 pt-4">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1 rounded-full transition-all duration-300 ${
                frame >= step ? "w-6 bg-[var(--brand-gold)]" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
