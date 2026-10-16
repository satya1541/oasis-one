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
      <div className="max-w-[680px] mx-auto py-6 lg:py-10 space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-medium text-[var(--text)]">
            Contact OASIS
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Questions, feedback or a concern? The administrative committee replies within 24 hours.
          </p>
        </div>

        {submitted ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 lg:p-10 shadow-[var(--shadow-1)] text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-[var(--success)] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-display font-medium text-[var(--text)]">
                Inquiry Received
              </h2>
              <p className="mt-2 text-xs text-[var(--muted)] max-w-[400px] mx-auto">
                Thanks. Your ticket has been logged and assigned to the community committee. We have
                emailed a confirmation copy to your registered address.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] max-w-[340px] mx-auto flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--muted)]">Case Number:</span>
              <span className="font-mono text-sm font-semibold text-[var(--brand-navy)]">
                {caseNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setSubject("");
                  setMessage("");
                }}
              >
                Submit another message
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 lg:p-8 shadow-[var(--shadow-1)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Topic Select */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all cursor-pointer"
                >
                  <option value="General inquiry">General inquiry & feedback</option>
                  <option value="Account & profile help">Account & profile help</option>
                  <option value="Content moderation">Content moderation or dispute</option>
                  <option value="A concern about an admin">A concern about an admin or committee decision</option>
                  <option value="Event partnership">Host / co-organize an Odisha startup meetup</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Hosting a CleanTech workshop in Rourkela"
                  className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question or situation with specific context..."
                  className="w-full p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all resize-y"
                />
              </div>

              {topic === "A concern about an admin" && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[var(--warning)] flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Concerns regarding admin conduct are routed directly to the independent Advisory
                    Oversight Council for confidential evaluation.
                  </span>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">
                  Replies sent to your authenticated email.
                </span>
                <Button type="submit" size="md" className="gap-2">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send message</span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </MemberShell>
  );
}
