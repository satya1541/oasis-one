"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import {
  ShieldAlert,
  Clock,
  AlertCircle,
  ArrowRight,
  Send,
  CheckCircle2,
  LogOut,
  RotateCw,
} from "lucide-react";

interface RestrictionItem {
  id: string;
  type: string;
  reason: string;
  issuedAt: string;
  expiresAt?: string | null;
}

export default function SuspendedAccountPage() {
  const [loading, setLoading] = useState(true);
  const [restriction, setRestriction] = useState<RestrictionItem | null>(null);
  const [appealMessage, setAppealMessage] = useState("");
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadRestrictions() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/me/restrictions");
        if (res.ok) {
          const json = await res.json();
          const list: RestrictionItem[] = json.data?.restrictions || [];
          if (isMounted && list.length > 0) {
            setRestriction(list[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load restrictions:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRestrictions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealMessage.trim()) return;

    setSubmitting(true);
    try {
      await fetch("/api/v1/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "account_appeal",
          subject: "Appeal for membership safety restriction",
          message: appealMessage.trim(),
        }),
      });
      setAppealSubmitted(true);
    } catch (err) {
      console.error("Appeal error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Header (Midnight Navy) ────────────────────────────────────────── */}
      <header className="w-full bg-[var(--brand-navy)] border-b border-[var(--brand-gold)]/20 px-6 lg:px-12 h-16 flex items-center">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <BrandLockup variant="horizontal" />
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs text-[var(--brand-cream)]/70 hover:text-[var(--brand-gold)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Canvas ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[620px] mx-auto space-y-6">
          {loading ? (
            <div className="p-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-3">
              <RotateCw className="w-6 h-6 animate-spin text-[var(--accent)] mx-auto" />
              <p className="text-xs text-[var(--muted)]">Loading account status...</p>
            </div>
          ) : (
            <div className="p-8 sm:p-10 rounded-2xl border border-rose-200 dark:border-rose-900 bg-[var(--surface)] shadow-xl space-y-6">
              {/* Badge & Icon */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-[var(--danger)]">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <span className="font-mono text-xs uppercase px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-[var(--danger)] font-semibold border border-rose-300 dark:border-rose-800">
                  {restriction?.type === "revocation"
                    ? "Membership Revoked"
                    : "Account Temporarily Suspended"}
                </span>
              </div>

              {/* Title & Explanation */}
              <div className="space-y-2">
                <h1 className="font-display text-2xl font-medium tracking-tight text-[var(--text)]">
                  Account Access Restricted
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Your OASIS ONE membership account has been placed under administrative review by the Admissions & Safety Committee.
                </p>
              </div>

              {/* Specific Reason Block */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block font-semibold">
                  Official Record & Reason:
                </span>
                <p className="text-[var(--text)] leading-relaxed font-sans">
                  {restriction?.reason ||
                    "Temporary hold placed pending verification of membership credentials."}
                </p>
                {restriction?.expiresAt && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)] text-[var(--muted)] text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>
                      Scheduled expiration:{" "}
                      {new Date(restriction.expiresAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Appeal Form */}
              <div className="pt-4 border-t border-[var(--border)] space-y-4">
                <h3 className="font-display text-sm font-semibold text-[var(--text)]">
                  Submit Formal Appeal
                </h3>
                {appealSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-50 text-[var(--success)] border border-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Your appeal has been logged to the grievance desk. Our oversight committee reviews appeals within 48 business hours.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleAppeal} className="space-y-3">
                    <textarea
                      rows={4}
                      required
                      value={appealMessage}
                      onChange={(e) => setAppealMessage(e.target.value)}
                      placeholder="Explain the context or clarify what occurred for the committee review..."
                      className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submitting || !appealMessage.trim()}
                        className="gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {submitting ? "Submitting..." : "Send Appeal to Oversight Desk"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
