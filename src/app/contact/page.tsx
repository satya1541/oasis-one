"use client";

import { useState } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import { Button } from "@/components/ui/Button";
import {
  Send,
  Mail,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export default function ContactPage() {
  const [topic, setTopic] = useState("General inquiry");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const category =
      topic === "A concern about an admin"
        ? "admin_misconduct"
        : topic === "Content moderation"
        ? "content_moderation"
        : topic === "Account & profile help"
        ? "account_help"
        : topic === "Event partnership"
        ? "partnership"
        : "general";

    try {
      setLoading(true);
      const res = await fetch("/api/v1/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, message }),
      });

      if (res.ok) {
        const json = await res.json();
        setCaseNumber(json.data?.caseId || "OASIS-GRV-CASE");
        setSubmitted(true);
      } else {
        const err = await res.json();
        alert(err.error?.message || "Failed to submit ticket.");
      }
    } catch (e: any) {
      alert("Submission error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(caseNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <MemberShell>
      <div className="max-w-[720px] mx-auto py-8 sm:py-12 space-y-8 pb-20">
        {/* Editorial Header */}
        <div className="pb-6 border-b border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#86601F]/10 dark:bg-[#F3D3A2]/10 border border-[#86601F]/20 dark:border-[#F3D3A2]/20 mb-3">
            <Mail className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#86601F] dark:text-[#F3D3A2] font-semibold">
              Admissions Concierge
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-[var(--text)] tracking-tight">
            Contact OASIS Advisory
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 font-sans leading-relaxed">
            Inquiries, grievance escalations, and event partnerships. The admissions committee responds within 24 hours.
          </p>
        </div>

        {submitted ? (
          <div className="bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/90 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6 backdrop-blur-md animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-linear-to-b from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-display font-light text-[var(--text)]">
                Inquiry Logged with Committee
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed font-sans">
                Your dispatch has been registered on the immutable audit ledger. An email copy with tracking telemetry has been routed to your registered address.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[#EAE1CF] dark:border-[#2C2E4A] max-w-xs mx-auto flex items-center justify-between gap-3 shadow-2xs">
              <span className="text-xs font-mono text-[var(--muted)]">Docket ID:</span>
              <span className="font-mono text-sm font-semibold text-[#86601F] dark:text-[#F3D3A2]">
                {caseNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-[var(--text)] hover:text-[#86601F] flex items-center gap-1 cursor-pointer transition-colors p-1"
                title="Copy reference code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl px-6 py-2 text-xs cursor-pointer"
                onClick={() => {
                  setSubmitted(false);
                  setSubject("");
                  setMessage("");
                }}
              >
                Submit another dispatch
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/90 rounded-3xl p-7 sm:p-9 shadow-sm backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Topic Select */}
              <div>
                <label className="block text-[11px] font-mono font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                  Dispatch Category
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-[var(--surface-2)] border border-[#D9CDAE]/70 dark:border-[#2C2E4A] text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#86601F]/30 dark:focus:ring-[#F3D3A2]/30 transition-all cursor-pointer font-sans"
                >
                  <option value="General inquiry">General inquiry &amp; community feedback</option>
                  <option value="Account & profile help">Account verification &amp; profile support</option>
                  <option value="Content moderation">Content moderation or discussion dispute</option>
                  <option value="A concern about an admin">Confidential governance &amp; committee review</option>
                  <option value="Event partnership">Host / co-organize an Odisha startup masterclass</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-mono font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                  Inquiry Title
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. CleanTech roundtable proposal for Rourkela"
                  className="w-full h-12 px-4 rounded-2xl bg-[var(--surface-2)] border border-[#D9CDAE]/70 dark:border-[#2C2E4A] text-xs sm:text-sm text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[#86601F]/30 dark:focus:ring-[#F3D3A2]/30 transition-all font-sans"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-mono font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                  Detailed Context
                </label>
                <textarea
                  rows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide precise details, context, or links for the admissions committee..."
                  className="w-full p-4 rounded-2xl bg-[var(--surface-2)] border border-[#D9CDAE]/70 dark:border-[#2C2E4A] text-xs sm:text-sm text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[#86601F]/30 dark:focus:ring-[#F3D3A2]/30 transition-all font-sans leading-relaxed resize-y"
                />
              </div>

              {topic === "A concern about an admin" && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span className="font-sans leading-relaxed">
                    Governance reports bypass local moderators and route directly to the independent Advisory Oversight Council for confidential evaluation.
                  </span>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <span className="text-[var(--muted)] font-mono text-[11px]">
                  Dispatch confirmation will be sent to your verified email.
                </span>
                <Button
                  type="submit"
                  disabled={loading}
                  className="gap-2 rounded-2xl px-7 py-3 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? "Transmitting..." : "Send Message"}</span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </MemberShell>
  );
}
