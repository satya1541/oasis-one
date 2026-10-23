"use client";

import { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Shield,
  MapPin,
  Calendar,
  Clock,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  RotateCw,
} from "lucide-react";

interface PersonDetail {
  id: string;
  name: string;
  role: string;
  headline?: string;
  bio?: string;
  city?: string;
  state?: string;
  mentorVerified?: boolean;
  mentorAvailability?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  startup?: {
    name: string;
    industry?: string;
    stage?: string;
    productSummary?: string;
    website?: string;
  };
}

function PersonProfileContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const personId = unwrappedParams.id;

  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestTopic, setRequestTopic] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPerson() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/v1/profiles/${personId}`);
        if (!res.ok) {
          throw new Error("Profile not found");
        }
        const json = await res.json();
        if (isMounted) {
          setPerson(json.data);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPerson();
    return () => {
      isMounted = false;
    };
  }, [personId]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTopic.trim() || !person) return;

    try {
      setSubmittingRequest(true);
      setRequestError(null);
      const res = await fetch("/api/v1/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: person.id,
          message: requestTopic.trim(),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || "Failed to send connection request");
      }

      setRequestSent(true);
      setDialogOpen(false);
    } catch (err: any) {
      setRequestError(err.message || "Connection request failed");
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <MemberShell>
        <div className="flex flex-col items-center justify-center min-h-[45vh] text-[#ECF1EF]/60 space-y-4 select-none">
          <div className="w-12 h-12 rounded-2xl bg-[#030909] border border-[#88DECC]/30 flex items-center justify-center shadow-[0_0_20px_rgba(136,222,204,0.2)]">
            <RotateCw className="w-5 h-5 animate-spin text-[#88DECC]" />
          </div>
          <p className="text-xs font-mono text-[#ECF1EF]/60">Loading member profile...</p>
        </div>
      </MemberShell>
    );
  }

  if (error || !person) {
    return (
      <MemberShell>
        <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
          <h2 className="font-display text-xl text-[var(--text)]">Profile Not Found</h2>
          <p className="text-xs text-[var(--muted)]">The requested member profile could not be located in OASIS.</p>
          <Link href="/people">
            <Button size="sm" variant="outline">
              ← Return to Directory
            </Button>
          </Link>
        </div>
      </MemberShell>
    );
  }

  const initials = (person.name || "Member")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <MemberShell>
      <div className="max-w-4xl mx-auto py-6 space-y-6 pb-20">
        {/* Back Link */}
        <Link
          href="/people"
          className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to People
        </Link>

        {requestSent && (
          <div className="p-4 rounded-xl bg-emerald-50 text-[var(--success)] border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Connection request submitted successfully. You will be notified once accepted.</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--surface-2)] text-[var(--accent)] font-display font-medium text-xl flex items-center justify-center border-2 border-[var(--brand-gold)] shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-[var(--text)]">
                    {person.name}
                  </h1>
                  {person.mentorVerified && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--brand-navy)] bg-[var(--brand-gold)] px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" />
                      Verified Mentor
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[var(--text)] font-medium mt-1">
                  {person.headline || (person.startup ? `Founder @ ${person.startup.name}` : "OASIS Member")}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                    {person.city || "Odisha"}, {person.state || "India"}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{person.role.replace("_", " ")}</span>
                </div>
              </div>
            </div>

            <Button
              size="md"
              variant="primary"
              disabled={requestSent}
              onClick={() => setDialogOpen(true)}
              className="gap-2 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {requestSent ? "Request Pending" : "Request Connection"}
            </Button>
          </div>

          {/* Bio */}
          <div className="pt-6 border-t border-[var(--border)] space-y-2">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              About
            </h3>
            <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap">
              {person.bio || "No extended bio provided yet."}
            </p>
          </div>

          {/* Startup Information if available */}
          {person.startup && (
            <div className="pt-6 border-t border-[var(--border)] space-y-2">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Startup Initiative
              </h3>
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[var(--text)]">{person.startup.name}</h4>
                  <span className="text-[var(--accent)] font-mono">{person.startup.industry}</span>
                </div>
                <p className="text-[var(--muted)]">{person.startup.productSummary}</p>
                {person.startup.website && (
                  <a
                    href={person.startup.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--accent)] hover:underline inline-block pt-1 font-mono text-[11px]"
                  >
                    {person.startup.website} ↗
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] flex items-center gap-2.5 text-xs text-[var(--muted)]">
            <Lock className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>
              Direct contact details are protected under India DPDP Act and only shared once both members accept a connection request.
            </span>
          </div>
        </div>

        {/* Modal: Request Connection */}
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="font-display text-lg font-medium text-[var(--text)]">
                  Connect with {person.name}
                </h3>
              </div>

              {requestError && (
                <div className="p-3 rounded-xl bg-rose-50 text-[var(--danger)] text-xs border border-rose-200">
                  {requestError}
                </div>
              )}

              <form onSubmit={handleSendRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">
                    Introduction / Note
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={requestTopic}
                    onChange={(e) => setRequestTopic(e.target.value)}
                    placeholder="Briefly explain what you're working on and how you'd like to collaborate or seek advice..."
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submittingRequest || !requestTopic.trim()}
                  >
                    {submittingRequest ? "Sending Request..." : "Send Connection Request"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MemberShell>
  );
}

export default function PersonProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <PersonProfileContent params={params} />
    </Suspense>
  );
}
