"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AccountLockedModal } from "@/components/auth/AccountLockedModal";
import {
  Lock,
  Copy,
  Check,
  Send,
  AlertCircle,
  Clock,
  MessageSquare,
  Calendar,
  CheckSquare,
  ShieldAlert,
  RotateCw,
} from "lucide-react";

interface LockedDashboardViewProps {
  userName: string;
  onSimulateApproval?: () => void;
}

export function LockedDashboardView({
  userName,
}: LockedDashboardViewProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [lockedModalOpen, setLockedModalOpen] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [appStatus, setAppStatus] = useState("pending");

  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadApplication() {
      try {
        const appRes = await fetch("/api/v1/applications/me");
        if (appRes.ok) {
          const json = await appRes.json();
          const app = json.data;
          if (isMounted && app) {
            setReferenceId(app.id || app.referenceNumber || "");
            setAppStatus(app.status || "pending");
          }
        }

        const meRes = await fetch("/api/v1/auth/me");
        if (meRes.ok) {
          const json = await meRes.json();
          if (isMounted && json.data) {
            setUserEmail(json.data.email || "");
          }
        }

        const msgRes = await fetch("/api/v1/applications/me/messages");
        if (msgRes.ok) {
          const json = await msgRes.json();
          if (isMounted) {
            setMessages(json.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load application details:", err);
      }
    }
    loadApplication();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyRef = () => {
    if (referenceId) {
      navigator.clipboard.writeText(referenceId);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await fetch("/api/v1/applications/me/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText.trim() }),
      });
      if (res.ok) {
        const json = await res.json();
        setMessages((prev) => [...prev, json.data]);
        setReplyText("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResendCooldown(true);
      await fetch("/api/v1/auth/resend-verification", { method: "POST" });
    } catch (err) {
      console.error("Resend error:", err);
    } finally {
      setTimeout(() => setResendCooldown(false), 60000);
    }
  };

  const handleWithdraw = async () => {
    try {
      const res = await fetch("/api/v1/applications/me/withdraw", { method: "POST" });
      if (res.ok) {
        setWithdrawn(true);
        setWithdrawModalOpen(false);
      }
    } catch (err) {
      console.error("Withdraw error:", err);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Account Locked Notice Modal */}
      <AccountLockedModal
        isOpen={lockedModalOpen}
        onClose={() => setLockedModalOpen(false)}
        email={userEmail || "your registered email"}
      />

      {/* ── Email Verification Banner ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Please verify your email address so review can proceed. We sent a verification link to your inbox.
          </span>
        </div>
        <button
          type="button"
          onClick={handleResendEmail}
          disabled={resendCooldown}
          className="text-xs font-semibold text-amber-800 hover:underline disabled:opacity-50 shrink-0 ml-3 cursor-pointer"
        >
          {resendCooldown ? "Link sent (wait 60s)" : "Resend email"}
        </button>
      </div>

      {/* ── Screen 7a: Application Status Card (Live) ────────────────────────── */}
      <Card className="p-6 border-[var(--brand-gold)]/40 bg-[var(--surface)] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <div className="text-[10px] uppercase font-mono font-semibold tracking-wider text-[var(--accent)]">
              Application Under Review
            </div>
            <h2 className="font-display text-2xl font-light text-[var(--text)] tracking-tight mt-0.5">
              Welcome, {userName}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              With the OASIS admissions committee for vetting. We usually reply within 2 business days.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLockedModalOpen(true)}
              className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--border)] transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Review Notice</span>
            </button>

            {referenceId && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] font-mono text-xs">
                <span className="text-[var(--muted)]">Ref:</span>
                <span className="font-bold text-[var(--text)] truncate max-w-[120px]">
                  {referenceId.slice(0, 8)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="text-[var(--muted)] hover:text-[var(--text)] ml-1 cursor-pointer"
                  title="Copy reference ID"
                >
                  {copiedRef ? (
                    <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messaging Box with Admins */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
            Admissions Committee Channel
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 text-xs text-[var(--muted)] text-center">
                Your application has been received and queued for committee review. Any information requests or notes from reviewers will appear here.
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--text)] space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                    <span className="font-semibold text-[var(--text)]">
                      {m.author?.profile?.name || (m.authorType === "admin" ? "Admissions Committee" : "You")}
                    </span>
                    <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="leading-relaxed">{m.body}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendReply} className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply or share updated links with the reviewer..."
              className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <Button size="sm" type="submit" disabled={submittingReply || !replyText.trim()}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* Withdrawal Link */}
        <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center text-xs text-[var(--muted)]">
          <span>Need help? Contact <a href="mailto:support@oasis.community" className="text-[var(--accent)] hover:underline">support@oasis.community</a></span>
          {!withdrawn && (
            <button
              type="button"
              onClick={() => setWithdrawModalOpen(true)}
              className="text-rose-600 hover:underline cursor-pointer"
            >
              Withdraw application
            </button>
          )}
        </div>
      </Card>

      {/* Withdraw Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4 text-xs">
            <h3 className="font-display text-base font-medium text-[var(--text)]">
              Withdraw Application
            </h3>
            <p className="text-[var(--muted)]">
              Are you sure you wish to withdraw your application? You will need to start a new application if you wish to apply again.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setWithdrawModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-500 text-white"
                onClick={handleWithdraw}
              >
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
