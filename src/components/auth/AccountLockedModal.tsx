"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  RotateCw,
  CheckCircle2,
  LogOut,
  ShieldAlert,
  AlertCircle,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { subscribeToAccountStatus, subscribeToApplicationMessages } from "@/lib/socket";

interface AccountLockedModalProps {
  isOpen: boolean;
  onClose?: () => void;
  email?: string;
  onApproved?: () => void;
  onViewApplication?: () => void;
  initialAppStatus?: string;
  initialDecisionReason?: string;
}

export function AccountLockedModal({
  isOpen,
  email = "founder@oasis-one.in",
  onApproved,
  onViewApplication,
  initialAppStatus,
  initialDecisionReason,
}: AccountLockedModalProps) {
  const [checking, setChecking] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [shake, setShake] = useState(false);

  // Application & Message State
  const [appStatus, setAppStatus] = useState<string>(initialAppStatus || "pending");
  const [decisionReason, setDecisionReason] = useState<string>(initialDecisionReason || "");
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load application & message details
  const fetchAppData = async () => {
    try {
      const [appRes, msgRes] = await Promise.all([
        fetch("/api/v1/applications/me"),
        fetch("/api/v1/applications/me/messages"),
      ]);

      if (appRes.ok) {
        const json = await appRes.json();
        const app = json.data;
        if (app) {
          setAppStatus(app.status || "pending");
          if (app.decisionReason) {
            setDecisionReason(app.decisionReason);
          }
          if (app.accountStatus === "active") {
            setIsApproved(true);
          }
        }
      }

      if (msgRes.ok) {
        const json = await msgRes.json();
        if (json.data && Array.isArray(json.data)) {
          setMessages(json.data);
          // If there's an admin message but decisionReason is empty, pick the latest admin message
          const adminMsgs = json.data.filter((m: any) => m.authorType === "admin");
          if (adminMsgs.length > 0 && !decisionReason) {
            setDecisionReason(adminMsgs[adminMsgs.length - 1].body);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load application data in modal:", err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchAppData();
  }, [isOpen]);

  // Realtime WebSocket: Listen for instant account approval or info request
  useEffect(() => {
    if (!isOpen || isApproved) return;

    const unsubscribeStatus = subscribeToAccountStatus((payload) => {
      console.log("[AccountLockedModal] Realtime account status received:", payload);
      if (payload?.accountStatus === "active") {
        setIsApproved(true);
        setStatusMessage("Approved! Unlocking your OASIS portal...");
        setTimeout(() => {
          if (onApproved) {
            onApproved();
          } else {
            window.location.reload();
          }
        }, 1000);
      } else if (payload?.applicationStatus === "info_requested") {
        setAppStatus("info_requested");
        fetchAppData();
      }
    });

    const unsubscribeMessages = subscribeToApplicationMessages(() => {
      fetchAppData();
    });

    return () => {
      unsubscribeStatus();
      unsubscribeMessages();
    };
  }, [isOpen, isApproved, onApproved]);

  // Auto-poll approval & application status every 12 seconds while modal is open (fallback)
  useEffect(() => {
    if (!isOpen || isApproved) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/v1/auth/me", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const user = json.data;
          if (isMounted && user?.accountStatus === "active") {
            setIsApproved(true);
            setStatusMessage("Approved! Unlocking your OASIS portal...");
            setTimeout(() => {
              if (onApproved) {
                onApproved();
              } else {
                window.location.reload();
              }
            }, 1000);
            return;
          }
        }

        // Also refresh application state in case admin requested info or reviewed
        if (isMounted) {
          await fetchAppData();
        }
      } catch (err) {
        // Silently handle background polling error
      }
    }, 12000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, isApproved, onApproved]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    // Backdrop click does NOT close the modal - trigger gentle shake to emphasize persistent lock
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleCheckStatus = async () => {
    try {
      setChecking(true);
      setStatusMessage(null);
      setReplySuccess(null);

      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const json = await res.json();
        const user = json.data;

        if (user?.accountStatus === "active") {
          setIsApproved(true);
          setStatusMessage("Congratulations! Your application has been approved by the committee.");
          setTimeout(() => {
            if (onApproved) {
              onApproved();
            } else {
              window.location.reload();
            }
          }, 1200);
          return;
        }

        await fetchAppData();

        if (appStatus === "info_requested") {
          setStatusMessage("The Admissions Committee is waiting for the requested details specified below.");
        } else {
          setStatusMessage(
            "Your application is currently pending review with the OASIS Admissions Committee. You will receive an email once an administrator approves your account."
          );
        }
      } else {
        setStatusMessage("Could not check approval status right now. Please try again shortly.");
      }
    } catch (err) {
      console.error("Check status error:", err);
      setStatusMessage("Network error checking status. Please check your connection.");
    } finally {
      setChecking(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || submittingReply) return;

    try {
      setSubmittingReply(true);
      setReplySuccess(null);

      const res = await fetch("/api/v1/applications/me/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText.trim() }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMessages((prev) => [...prev, json.data]);
        }
        setReplyText("");
        setAppStatus("pending");
        setReplySuccess(
          "Your response has been submitted to the Admissions Committee! Your application is now queued for re-review."
        );
        setStatusMessage(null);
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson?.error?.message || "Failed to submit response. Please try again.");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Error submitting response. Please check your internet connection.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  const isInfoRequested = appStatus === "info_requested";
  const displayRequestNote =
    decisionReason ||
    messages.filter((m) => m.authorType === "admin").slice(-1)[0]?.body ||
    "Please provide additional verification documents or details.";

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B0C14]/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300 select-none overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/90 rounded-3xl max-w-[560px] w-full p-7 sm:p-9 text-center shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200 my-auto ${
          shake ? "animate-wiggle" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Brand Mark / Astrolabe Emblem */}
        <div className="flex justify-center items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-linear-to-b from-[#D4AF37]/20 to-[#86601F]/5 blur-lg" />
            <div className="w-16 h-16 rounded-3xl bg-linear-to-b from-[#1E1F33] to-[#12131F] border border-[#F3D3A2]/30 flex items-center justify-center p-2.5 shadow-lg relative">
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
          {isApproved ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Membership Approved</span>
            </div>
          ) : isInfoRequested ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-mono font-semibold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Action Required • Information Requested</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#86601F]/10 border border-[#86601F]/20 text-[#86601F] dark:text-[#F3D3A2] text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span>Vetting in Progress • Admissions Review</span>
            </div>
          )}
        </div>

        {/* Heading & Email */}
        <div className="space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight">
            {isApproved
              ? "Access Approved"
              : isInfoRequested
              ? "Verification Inquiry"
              : "Account Under Review"}
          </h2>

          <div className="text-xs text-[var(--muted)] font-sans">
            Registered dossier:{" "}
            <span className="font-mono text-[11px] text-[var(--text)] bg-[var(--surface-2)] px-2.5 py-1 rounded-xl border border-[#D9CDAE]/60 dark:border-[#2C2E4A]">
              {email}
            </span>
          </div>
        </div>

        {/* ── INFO REQUESTED MODE: Dedicated Callout & Direct Reply Box ─────── */}
        {isInfoRequested ? (
          <div className="space-y-4 text-left">
            {/* Committee Request Box */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300 font-mono">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Admissions Council Request:
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 rounded-md">
                  Action Pending
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-amber-500/20 text-xs text-[var(--text)] font-sans leading-relaxed break-words whitespace-pre-wrap">
                {displayRequestNote}
              </div>
              <p className="text-[11px] text-[var(--muted)] font-mono">
                Submit documents or clarifications below so admissions can complete vetting.
              </p>
            </div>

            {/* Direct Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-3">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] font-semibold block">
                Your Response &amp; Verification Links:
              </label>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Share your response, incorporation documents, or cloud folder link..."
                className="w-full text-xs p-3.5 rounded-2xl border border-[#D9CDAE]/70 dark:border-[#2C2E4A] bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[#86601F]/30 dark:focus:ring-[#F3D3A2]/30 font-sans resize-none"
              />
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim()}
                className="w-full h-12 bg-[#1E1F33] dark:bg-[#FBF7EE] text-[#FBF7EE] dark:text-[#1E1F33] font-medium text-xs rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#86601F] dark:text-[#86601F]" />
                <span>{submittingReply ? "Transmitting..." : "Submit to Admissions Reviewer"}</span>
              </button>
            </form>
          </div>
        ) : (
          /* ── STANDARD PENDING REVIEW MODE ───────────────────────────────── */
          <div className="text-xs text-[var(--muted)] leading-relaxed space-y-2 max-w-md mx-auto font-sans">
            <p>
              Your membership submission is undergoing validation with the{" "}
              <strong className="text-[var(--text)]">OASIS Admissions Committee</strong>.
            </p>
            <p className="text-[var(--text)] font-medium">
              Once verified by an administrator, full sanctuary capabilities will unlock instantly and an encrypted confirmation will be sent to your email.
            </p>
          </div>
        )}

        {/* Message History Collapsible */}
        {messages.length > 0 && (
          <div className="pt-3 text-left border-t border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-between w-full text-xs font-mono text-[var(--muted)] hover:text-[var(--text)] transition-colors py-1 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
                <span>Conversation Log ({messages.length})</span>
              </span>
              {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showHistory && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {messages.map((m) => {
                  const isAdmin = m.authorType === "admin";
                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-2xl border text-xs space-y-1 font-sans ${
                        isAdmin
                          ? "bg-amber-500/10 border-amber-500/20 text-[var(--text)]"
                          : "bg-[var(--surface-2)] border-[#D9CDAE]/60 dark:border-[#2C2E4A] text-[var(--text)]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-[var(--muted)] font-mono">
                        <span className="font-semibold text-[var(--text)]">
                          {isAdmin ? "Admissions Council" : "You"}
                        </span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="leading-relaxed break-words whitespace-pre-wrap">{m.body}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Live Feedback / Success Toast */}
        {replySuccess && (
          <div className="p-3.5 rounded-2xl border bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs text-left animate-in fade-in duration-150 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-sans">{replySuccess}</span>
          </div>
        )}

        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl border text-xs text-left animate-in fade-in duration-150 font-sans ${
              isApproved
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Actions: Refresh Status & Sign Out */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking || isApproved}
            className="w-full sm:w-64 h-12 bg-[var(--surface-2)] hover:bg-[#D9CDAE]/40 dark:hover:bg-[#2C2E4A] border border-[#D9CDAE]/70 dark:border-[#2C2E4A] text-[var(--text)] font-medium text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2] ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Polling admissions status..." : "Synchronize Verification"}</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-xs text-[var(--muted)] hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer pt-1 font-mono text-[11px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{signingOut ? "Signing out..." : "Sign out of account"}</span>
          </button>
        </div>

        {/* Footer Support Links */}
        <div className="pt-4 border-t border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80 flex items-center justify-center gap-4 text-[11px] text-[var(--muted)] font-mono">
          <Link
            href="/contact"
            className="hover:text-[#86601F] dark:hover:text-[#F3D3A2] transition-colors"
          >
            Contact Admissions
          </Link>
          <span className="text-[#D9CDAE] dark:text-[#2C2E4A]">•</span>
          <Link
            href="/legal/guidelines"
            className="hover:text-[#86601F] dark:hover:text-[#F3D3A2] transition-colors"
          >
            Community Code
          </Link>
        </div>
      </div>
    </div>
  );
}
