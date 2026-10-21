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
import { subscribeToAccountStatus, subscribeToApplicationMessages } from "@/lib/socket";

interface LockedDashboardViewProps {
  userName: string;
  onSimulateApproval?: () => void;
}

export function LockedDashboardView({
  userName,
  onSimulateApproval,
}: LockedDashboardViewProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [appStatus, setAppStatus] = useState("pending");
  const [decisionReason, setDecisionReason] = useState("");

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
            if (app.decisionReason) {
              setDecisionReason(app.decisionReason);
            }
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

    const unsubscribeStatus = subscribeToAccountStatus((payload) => {
      console.log("[LockedDashboardView] Realtime status received:", payload);
      if (payload?.accountStatus === "active") {
        onSimulateApproval?.();
      } else if (payload?.applicationStatus === "info_requested") {
        setAppStatus("info_requested");
        loadApplication();
      }
    });

    const unsubscribeMessages = subscribeToApplicationMessages(() => {
      loadApplication();
    });

    return () => {
      isMounted = false;
      unsubscribeStatus();
      unsubscribeMessages();
    };
  }, [onSimulateApproval]);

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
        setAppStatus("pending");
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

  const isInfoRequested = appStatus === "info_requested";

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      {/* Account Locked Notice Modal - persistently locked until approved */}
      <AccountLockedModal
        isOpen={true}
        email={userEmail || "your registered email"}
        onApproved={onSimulateApproval}
        initialAppStatus={appStatus}
        initialDecisionReason={decisionReason}
      />

      {/* ── Email Verification Banner ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-sans leading-relaxed">
            Please verify your email address to expedite committee vetting. A verification link was dispatched to your inbox.
          </span>
        </div>
        <button
          type="button"
          onClick={handleResendEmail}
          disabled={resendCooldown}
          className="text-xs font-semibold text-amber-300 hover:text-amber-200 hover:underline disabled:opacity-50 shrink-0 cursor-pointer text-left sm:text-right"
        >
          {resendCooldown ? "Link sent (wait 60s)" : "Resend email"}
        </button>
      </div>

      {/* ── Application Status Card (Live) ────────────────────────── */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl join-glass-panel border border-white/10 text-[#F5FAF6] shadow-[0_12px_36px_rgba(0,0,0,0.5)] space-y-6 relative overflow-hidden">
        {/* Specular Top Hairline */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/35 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            {isInfoRequested ? (
              <div className="text-[11px] uppercase font-mono font-bold tracking-widest text-amber-400 flex items-center gap-2 animate-pulse mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Action Required • Information Requested</span>
              </div>
            ) : (
              <div className="text-[11px] uppercase font-mono font-semibold tracking-widest text-[#88DECC] mb-1">
                Admissions Vetting In Progress
              </div>
            )}
            <h2 className="font-display text-2xl sm:text-3xl font-light text-[#F5FAF6] tracking-tight">
              Welcome to OASIS, <span className="font-normal text-white">{userName}</span>
            </h2>
            {isInfoRequested ? (
              <p className="text-xs sm:text-sm text-amber-300/90 mt-1 font-sans">
                The Admissions Committee requested additional verification details. Reply in the dialogue below.
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-[#ECF1EF]/60 mt-1 font-sans">
                Under confidential review by the OASIS membership council. We typically resolve applications in 48 hours.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isInfoRequested ? (
              <div className="text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/40 flex items-center gap-2 px-3.5 py-1.5 rounded-full select-none animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Action Required</span>
              </div>
            ) : (
              <div className="text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 px-3.5 py-1.5 rounded-full select-none">
                <Lock className="w-3.5 h-3.5" />
                <span>Pre-Vetting Mode</span>
              </div>
            )}

            {referenceId && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 font-mono text-xs text-[#F5FAF6]">
                <span className="text-[#ECF1EF]/50">Docket:</span>
                <span className="font-semibold text-[#88DECC] truncate max-w-[120px]">
                  {referenceId.slice(0, 8)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="text-[#ECF1EF]/50 hover:text-white ml-1 cursor-pointer transition-colors"
                  title="Copy reference ID"
                >
                  {copiedRef ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Required Banner for Info Request */}
        {isInfoRequested && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-amber-300 font-mono uppercase tracking-wider text-[11px]">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Admissions Committee Inquiry Note:</span>
            </div>
            <div className="p-4 bg-black/40 border border-amber-500/20 rounded-2xl font-medium text-[#F5FAF6] leading-relaxed break-words whitespace-pre-wrap font-sans">
              {decisionReason || messages.find((m) => m.authorType === "admin")?.body || "Please share proof of business incorporation, Pitch Deck, or active founder LinkedIn link."}
            </div>
            <p className="text-[11px] text-[#ECF1EF]/60 font-mono">
              Provide your documents or explanation in the Admissions Channel below.
            </p>
          </div>
        )}

        {/* Messaging Box with Admins */}
        <div className="space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#ECF1EF]/60 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#88DECC]" />
            <span>Admissions Council Dialogue</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-2 auth-scrollbar">
            {messages.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-[#ECF1EF]/50 text-center font-sans leading-relaxed">
                Your dossier has entered the evaluation pool. Any inquiries, verification notices, or decisions from admissions will stream here in real-time.
              </div>
            ) : (
              messages.map((m) => {
                const isAdmin = m.authorType === "admin";
                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border text-xs space-y-1.5 font-sans ${
                      isAdmin
                        ? "bg-amber-500/10 text-[#F5FAF6] border-amber-500/25 shadow-xs"
                        : "bg-white/[0.04] text-[#F5FAF6] border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#ECF1EF]/60 font-mono">
                      <span className={isAdmin ? "text-amber-300 font-semibold" : "text-[#88DECC] font-semibold"}>
                        {m.author?.profile?.name || (isAdmin ? "Admissions Council" : "You")}
                      </span>
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendReply} className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to the reviewer with links or clarifications..."
              className="flex-1 text-xs px-4 py-3 rounded-2xl border border-white/10 bg-white/[0.04] text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 focus:outline-none focus:ring-1 focus:ring-[#88DECC] font-sans"
            />
            <button
              type="submit"
              disabled={submittingReply || !replyText.trim()}
              className="rounded-2xl px-5 h-11 bg-[#EEF1EA] text-[#03080B] font-semibold text-xs hover:bg-white hover:shadow-[0_0_15px_rgba(136,222,204,0.35)] transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Withdrawal Link */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#ECF1EF]/50 font-mono text-[11px]">
          <span>Assistance: <a href="mailto:support@oasis.community" className="text-[#88DECC] hover:underline">support@oasis.community</a></span>
          {!withdrawn && (
            <button
              type="button"
              onClick={() => setWithdrawModalOpen(true)}
              className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer text-left sm:text-right"
            >
              Withdraw Application
            </button>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03080B]/80 backdrop-blur-xl">
          <div className="w-full max-w-md join-glass-panel border border-white/10 text-[#F5FAF6] rounded-3xl p-6 sm:p-7 space-y-4 text-xs shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
            <h3 className="font-display text-lg font-medium text-[#F5FAF6]">
              Withdraw Application
            </h3>
            <p className="text-[#ECF1EF]/70 leading-relaxed font-sans">
              Are you certain you wish to withdraw your application? Your docket records will be purged from the review queue and you will need to re-apply if you reconsider.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-[#ECF1EF]/80 text-xs transition-colors cursor-pointer"
                onClick={() => setWithdrawModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
                onClick={handleWithdraw}
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
