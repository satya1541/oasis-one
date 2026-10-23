"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  RotateCw,
} from "lucide-react";

interface InviteData {
  name?: string;
  email: string;
  role: string;
  invitedBy?: string;
}

function InviteClaimContent() {
  const params = useParams();
  const router = useRouter();
  const token = typeof params?.token === "string" ? params.token : "";

  const [loadingInvite, setLoadingInvite] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [invite, setInvite] = useState<InviteData | null>(null);

  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    async function loadInvite() {
      try {
        setLoadingInvite(true);
        const res = await fetch(`/api/v1/invites/${token}`);
        if (!res.ok) {
          if (isMounted) setIsExpired(true);
          return;
        }
        const json = await res.json();
        if (isMounted) {
          setInvite(json.data);
        }
      } catch (err) {
        if (isMounted) setIsExpired(true);
      } finally {
        if (isMounted) setLoadingInvite(false);
      }
    }
    loadInvite();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !agreed) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/invites/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || "Failed to accept invite");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to activate invited account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="w-full bg-[var(--surface)] border-b border-[var(--border)] px-6 lg:px-12 h-16 flex items-center justify-between">
        <BrandLockup variant="horizontal" href="/" />
        <Link
          href="/login"
          className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          Already have credentials? Sign in →
        </Link>
      </header>

      {/* ── Main Canvas ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg mx-auto">
          {loadingInvite ? (
            <div className="p-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-3">
              <RotateCw className="w-6 h-6 animate-spin text-[var(--accent)] mx-auto" />
              <p className="text-xs text-[var(--muted)]">Validating invitation credentials...</p>
            </div>
          ) : isExpired || !invite ? (
            /* Expired Invite Fallback */
            <div className="p-8 sm:p-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-gold)]/30 flex items-center justify-center text-[var(--warning)] mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-2xl font-medium text-[var(--text)]">
                  Invitation no longer valid
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  This invitation token has expired or has already been used to create an active membership.
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <Button size="lg" variant="primary" className="w-full" asChild>
                  <Link href="/join">Apply via standard admission</Link>
                </Button>
                <Button size="md" variant="outline" className="w-full" asChild>
                  <Link href="/contact">Contact Admissions Helpdesk</Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Valid Pre-approved Invite Claim Form */
            <div className="p-8 sm:p-10 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] border border-[var(--brand-gold)] flex items-center justify-center text-[var(--brand-navy)] mx-auto shadow-xs">
                  <ShieldCheck className="w-7 h-7 text-[var(--accent)]" />
                </div>
                <h1 className="font-display text-2xl font-medium tracking-tight text-[var(--text)]">
                  Welcome to OASIS
                </h1>
                <p className="text-xs text-[var(--muted)] leading-relaxed max-w-sm mx-auto">
                  You have been invited by the <strong>{invite.invitedBy || "OASIS Selection Committee"}</strong> as a pre-approved member. Complete your credentials below to enter the portal.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 text-[var(--danger)] text-xs border border-rose-200">
                  {error}
                </div>
              )}

              {/* Pre-filled Read-Only Badges */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted)]">Invited Name:</span>
                  <span className="font-semibold text-[var(--text)]">{invite.name || "Pre-Approved Member"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted)]">Email:</span>
                  <span className="font-mono text-[var(--text)]">{invite.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted)]">Pre-Approved Role:</span>
                  <Badge variant="primary">{invite.role}</Badge>
                </div>
              </div>

              {/* Claim Form */}
              <form onSubmit={handleAccept} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1.5">
                    Set Portal Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters..."
                      className="w-full h-11 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                    <Lock className="w-4 h-4 text-[var(--muted)] absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="guidelines-consent"
                    required
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-[var(--brand-navy)] focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="guidelines-consent"
                    className="text-xs text-[var(--muted)] leading-relaxed cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-[var(--accent)] underline">
                      Community Standards
                    </Link>{" "}
                    and confirm my commitment to constructive mentorship and peer trust.
                  </label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 font-semibold cursor-pointer"
                  disabled={submitting || !password || !agreed}
                >
                  {submitting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Activating Membership...</span>
                    </>
                  ) : (
                    <>
                      <span>Activate & Enter OASIS</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function InviteClaimPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0E0E18] flex items-center justify-center text-white/50 text-sm">
          Loading invitation...
        </div>
      }
    >
      <InviteClaimContent />
    </Suspense>
  );
}
