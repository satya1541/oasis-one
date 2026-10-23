"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  Clock,
  Circle,
  Copy,
  Check,
  Send,
  MessageSquare,
  AlertTriangle,
  RotateCw,
} from "lucide-react";

interface AdminMessage {
  id: string;
  sender: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isApplicant?: boolean;
}

function ApplicationStatusView() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [refCode, setRefCode] = useState(initialCode);
  const [appStatus, setAppStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [hasApp, setHasApp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [messages, setMessages] = useState<AdminMessage[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const appRes = await fetch("/api/v1/applications/me");
      if (appRes.ok) {
        const appJson = await appRes.json();
        const app = appJson.data || appJson;
        setHasApp(true);
        setRefCode(app.referenceId || app.id || initialCode);
        setAppStatus(app.status || "pending");
        if (app.status === "withdrawn") {
          setWithdrawn(true);
        }

        // Fetch thread messages
        const msgRes = await fetch("/api/v1/applications/me/messages");
        if (msgRes.ok) {
          const msgJson = await msgRes.json();
          const rawMsgs = msgJson.data || [];
          setMessages(
            rawMsgs.map((m: any) => ({
              id: m.id,
              sender: m.authorType === "applicant" ? "You" : "OASIS Review Committee",
              senderRole: m.authorType === "applicant" ? "Applicant" : "Committee Member",
              text: m.body,
              timestamp: new Date(m.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              isApplicant: m.authorType === "applicant",
            }))
          );
        }
      } else {
        setHasApp(false);
      }
    } catch (err) {
      console.error("Error loading application status:", err);
      setHasApp(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRef = sessionStorage.getItem("oasis_app_ref");
      if (storedRef && !refCode) setRefCode(storedRef);
    }
    loadData();
  }, []);

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && refCode) {
      navigator.clipboard.writeText(refCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      const res = await fetch("/api/v1/applications/me/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText.trim() }),
      });

      if (res.ok) {
        setReplyText("");
        await loadData();
      }
    } catch (err) {
      console.error("Failed to post message:", err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleWithdrawConfirm = async () => {
    try {
      const res = await fetch("/api/v1/applications/me/withdraw", {
        method: "POST",
      });
      if (res.ok) {
        setWithdrawn(true);
      }
    } catch (err) {
      console.error("Failed to withdraw application:", err);
    } finally {
      setShowWithdrawConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3 text-xs text-[var(--muted)]">
        <RotateCw className="w-6 h-6 animate-spin text-[var(--accent)]" />
        <span>Loading application status from OASIS...</span>
      </div>
    );
  }

  if (withdrawn) {
    return (
      <div className="w-full max-w-[620px] mx-auto text-center py-12">
        <div className="w-14 h-14 mx-auto rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-display font-light text-[var(--text)]">
          Application Withdrawn
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Your application {refCode} has been withdrawn from the review queue.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!hasApp && !refCode) {
    return (
      <div className="w-full max-w-[540px] mx-auto text-center py-12">
        <h2 className="text-2xl font-display font-light text-[var(--text)]">
          No Application Found
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          You do not have any active applications submitted to the OASIS Committee.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/join">
            <Button variant="primary">Apply for Membership</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Log in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[720px] mx-auto space-y-8">
      {/* ── Status Header ─────────────────────────────────────────────────────── */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--brand-navy)] border border-[var(--accent)]/30 text-xs font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-[var(--brand-gold)] animate-pulse" />
          <span className="capitalize">{appStatus.replace("_", " ")}</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-display font-light text-[var(--text)] tracking-tight">
          Application received
        </h1>
        <p className="mt-2.5 text-sm text-[var(--muted)]">
          With the OASIS committee for review. We usually reply within 2 business days.
        </p>
      </div>

      {/* ── Reference Code Box ─────────────────────────────────────────────────── */}
      {refCode && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-display uppercase tracking-wider text-[var(--muted)] font-medium">
              Application Reference
            </span>
            <span className="font-mono text-base font-semibold text-[var(--brand-navy)] px-3 py-1 bg-[var(--surface-2)] rounded-lg border border-[var(--border)] tracking-wider">
              {refCode}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                <span className="text-[var(--success)]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Review Timeline ───────────────────────────────────────────────────── */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 lg:p-8 shadow-[var(--shadow-1)]">
        <h2 className="text-xs font-display uppercase tracking-wider text-[var(--muted)] font-medium mb-6">
          Estimated Process Timeline
        </h2>

        <div className="relative flex items-center justify-between">
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-[var(--border)] -z-0" />
          <div
            className="absolute top-5 left-10 h-0.5 bg-[var(--brand-navy)] -z-0"
            style={{ width: appStatus === "approved" ? "100%" : "50%" }}
          />

          {/* Step 1: Submitted */}
          <div className="flex flex-col items-center text-center relative z-10 w-28">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-navy)] text-[var(--brand-cream)] flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="mt-3 text-xs font-semibold text-[var(--text)]">Submitted</span>
            <span className="text-[11px] text-[var(--muted)]">Received</span>
          </div>

          {/* Step 2: In Review */}
          <div className="flex flex-col items-center text-center relative z-10 w-28">
            <div className="w-10 h-10 rounded-full bg-[var(--surface)] border-2 border-[var(--brand-gold)] text-[var(--brand-navy)] flex items-center justify-center ring-4 ring-[var(--brand-gold)]/20 shadow-xs">
              <Clock className="w-5 h-5 text-[var(--brand-navy)] animate-spin-slow" />
            </div>
            <span className="mt-3 text-xs font-semibold text-[var(--brand-navy)]">In review</span>
            <span className="text-[11px] text-[var(--muted)]">Committee active</span>
          </div>

          {/* Step 3: Decision */}
          <div className="flex flex-col items-center text-center relative z-10 w-28">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] flex items-center justify-center">
              <Circle className="w-5 h-5 text-[var(--border)]" />
            </div>
            <span className="mt-3 text-xs font-medium text-[var(--muted)]">Decision</span>
            <span className="text-[11px] text-[var(--muted)]">Within 48h</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)]/60 text-xs text-[var(--muted)] flex items-center justify-between">
          <span>Assigned to: Startup Review Working Group</span>
          <span className="text-[var(--text)] font-medium">Standard SLA: 48 Hours</span>
        </div>
      </div>

      {/* ── Messages from Admins ──────────────────────────────────────────────── */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 lg:p-8 shadow-[var(--shadow-1)]">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-base font-display font-medium text-[var(--text)]">
            Messages from the committee
          </h2>
        </div>

        {/* Message Thread */}
        {messages.length === 0 ? (
          <p className="text-xs text-[var(--muted)] italic mb-6">
            No messages from the committee yet. We will notify you here and via email if additional details are needed.
          </p>
        ) : (
          <div className="space-y-4 mb-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  m.isApplicant
                    ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] border-transparent ml-6 sm:ml-12"
                    : "bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)] mr-6 sm:mr-12"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{m.sender}</span>
                  <span
                    className={`text-[10px] ${
                      m.isApplicant ? "text-[var(--brand-cream)]/70" : "text-[var(--muted)]"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reply Box */}
        <form onSubmit={handleSendReply} className="flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a message to the admissions committee..."
            className="flex-1 h-11 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all"
          />
          <Button type="submit" size="sm" disabled={sendingReply || !replyText.trim()} className="gap-1.5 h-11 px-4">
            {sendingReply ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Send</span>
          </Button>
        </form>
      </div>

      {/* ── Withdraw Option ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs pt-2">
        <button
          type="button"
          onClick={() => setShowWithdrawConfirm(true)}
          className="text-[var(--danger)] hover:underline cursor-pointer"
        >
          Withdraw application
        </button>
      </div>

      {/* Withdraw Modal Dialog */}
      {showWithdrawConfirm && (
        <div className="fixed inset-0 z-50 bg-[var(--brand-navy)]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 max-w-[420px] w-full shadow-[var(--shadow-2)] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-display font-medium text-[var(--text)]">
              Withdraw Application?
            </h3>
            <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
              Are you sure you want to withdraw reference {refCode}? You will need to submit a new
              application if you wish to apply again.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowWithdrawConfirm(false)}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleWithdrawConfirm}
                className="px-4 py-2 rounded-xl bg-[var(--danger)] text-white text-xs font-medium hover:bg-red-700 transition-colors cursor-pointer"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationStatusPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <header className="w-full bg-[var(--brand-navy)] border-b border-[var(--brand-gold)]/20 px-6 lg:px-12 h-16 flex items-center">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <BrandLockup variant="horizontal" />
          <Link
            href="/"
            className="text-sm font-medium text-[var(--brand-cream)]/85 hover:text-[var(--brand-gold)] transition-colors"
          >
            Home
          </Link>
        </div>
      </header>

      {/* ── Main Canvas ───────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-16">
        <Suspense fallback={<div className="text-center text-sm text-[var(--muted)]">Loading status...</div>}>
          <ApplicationStatusView />
        </Suspense>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="py-6 border-t border-[var(--border)]/40 text-center text-xs text-[var(--muted)]">
        OASIS · Odisha Startup Community · Admin-approved membership
      </footer>
    </div>
  );
}
