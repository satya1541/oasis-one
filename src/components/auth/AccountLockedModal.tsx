"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface AccountLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  onViewApplication?: () => void;
}

export function AccountLockedModal({
  isOpen,
  onClose,
  email = "founder@oasis-one.in",
  onViewApplication,
}: AccountLockedModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--brand-navy)]/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-[460px] w-full p-8 text-center shadow-[var(--shadow-3)] space-y-6 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Brand Mark / Logo Emblem */}
        <div className="flex justify-center items-center">
          <div className="w-14 h-14 rounded-full bg-[var(--brand-navy)] border border-[var(--brand-gold)]/40 flex items-center justify-center p-2 shadow-xs">
            <Image
              src="/brand/icon-192.png"
              alt="OASIS ONE"
              width={42}
              height={42}
              className="object-contain"
            />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight">
            Your account has been locked.
          </h2>

          {/* Account Email */}
          <div className="text-xs text-[var(--muted)]">
            Account email:{" "}
            <span className="font-mono font-medium text-[var(--text)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
              {email}
            </span>
          </div>
        </div>

        {/* Description Body matching user requirement */}
        <div className="text-xs text-[var(--muted)] leading-relaxed space-y-2 max-w-sm mx-auto">
          <p>
            Your membership application is currently under review with the <strong>OASIS Admissions Committee</strong>.
          </p>
          <p className="text-[var(--text)] font-medium">
            After approval, you will receive an email notification and can log back in with full access to the portal.
          </p>
        </div>

        {/* Center Action Button matching reference design */}
        <div className="pt-2 flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-28 h-10 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--surface-2)] font-mono text-xs font-semibold rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
          >
            OK
          </button>

          {onViewApplication && (
            <button
              type="button"
              onClick={onViewApplication}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] underline transition-colors pt-1 cursor-pointer"
            >
              Check application timeline & messages
            </button>
          )}
        </div>

        {/* Footer Support Links matching reference design */}
        <div className="pt-4 border-t border-[var(--border)] flex items-center justify-center gap-4 text-[11px] text-[var(--muted)]">
          <Link
            href="/contact"
            className="hover:text-[var(--accent)] underline transition-colors"
          >
            Contact OASIS Support
          </Link>
          <span className="text-[var(--border)]">•</span>
          <Link
            href="/legal/guidelines"
            className="hover:text-[var(--accent)] underline transition-colors"
          >
            Community Guidelines
          </Link>
        </div>
      </div>
    </div>
  );
}
