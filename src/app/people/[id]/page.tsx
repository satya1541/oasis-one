"use client";

import { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";

interface PersonDetail {
  id: string;
  name: string;
  role?: string;
  primaryRole?: string;
  headline?: string;
  bio?: string;
  city?: string;
  state?: string;
  profilePhotoUrl?: string | null;
  mentorVerified?: boolean;
  mentorAvailability?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  startup?: {
    name: string;
    industry?: string;
    stage?: string;
    productSummary?: string;
    website?: string;
  };
  viewer?: {
    canConnect: boolean;
    connectionStatus: "none" | "pending_out" | "pending_in" | "connected";
    connectionId?: string | null;
    isBlocked?: boolean;
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.id) setCurrentUserId(json.data.id);
      })
      .catch(() => {});
  }, []);

  const loadPerson = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/profiles/${personId}`);
      if (!res.ok) {
        throw new Error("Profile not found");
      }
      const json = await res.json();
      setPerson(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerson();
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
        throw new Error(errJson.error?.message || errJson.message || "Failed to send connection request");
      }

      setRequestSent(true);
      setDialogOpen(false);
      // Reload profile to reflect new connection state
      await loadPerson();
    } catch (err: any) {
      setRequestError(err.message || "Connection request failed");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleRespond = async (action: "accept" | "decline") => {
    if (!person?.viewer?.connectionId) return;
    try {
      setResponding(true);
      const res = await fetch(`/api/v1/connections/${person.viewer.connectionId}/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || errJson.message || `Failed to ${action} request`);
      }
      await loadPerson();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} request`);
    } finally {
      setResponding(false);
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
              <div className="w-16 h-16 rounded-full bg-[var(--surface-2)] text-[var(--accent)] font-display font-medium text-xl flex items-center justify-center border-2 border-[var(--brand-gold)] shrink-0 overflow-hidden">
                {person.profilePhotoUrl ? (
                  <img
                    src={person.profilePhotoUrl}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-[var(--text)]">
                    {person.name}
                  </h1>
                  {person.mentorVerified && (
                    <Badge variant="verified-mentor">Verified Mentor</Badge>
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
                  <span className="capitalize">
                    {(person.primaryRole || person.role || "Member").replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </div>

            {person.id === currentUserId ? (
              <Link href="/profile">
                <Button size="md" variant="secondary" className="gap-2 shrink-0 cursor-pointer">
                  Edit Your Profile
                </Button>
              </Link>
            ) : person.viewer?.connectionStatus === "connected" ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-xs shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                Connected Member
              </div>
            ) : person.viewer?.connectionStatus === "pending_out" || requestSent ? (
              <Button
                size="md"
                variant="secondary"
                disabled
                className="gap-2 shrink-0 opacity-80 cursor-not-allowed bg-[var(--surface-2)] text-amber-400 border border-amber-400/20"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                Request Pending
              </Button>
            ) : person.viewer?.connectionStatus === "pending_in" ? (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="md"
                  variant="primary"
                  disabled={responding}
                  onClick={() => handleRespond("accept")}
                  className="gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {responding ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Accept Request
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  disabled={responding}
                  onClick={() => handleRespond("decline")}
                  className="gap-1.5 cursor-pointer text-rose-400 hover:text-rose-300"
                >
                  Decline
                </Button>
              </div>
            ) : person.mentorAvailability === "paused" ? (
              <Button
                size="md"
                variant="secondary"
                disabled
                className="gap-2 shrink-0 opacity-60 cursor-not-allowed"
              >
                Mentorship Paused
              </Button>
            ) : (
              <Button
                size="md"
                variant="primary"
                onClick={() => setDialogOpen(true)}
                className="gap-2 shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Request Connection
              </Button>
            )}
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

          {/* Contact Coordinates / DPDP Privacy Note */}
          {person.viewer?.connectionStatus === "connected" ? (
            <div className="p-5 rounded-2xl bg-[#061814] border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Direct Contact Details Unlocked (India DPDP Act Mutual Consent)</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                {person.email ? (
                  <a
                    href={`mailto:${person.email}`}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--accent)] hover:border-[var(--accent)] transition-colors font-mono"
                  >
                    <Mail className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{person.email}</span>
                  </a>
                ) : (
                  <div className="px-3.5 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] text-xs border border-[var(--border)]">
                    Email withheld by member preferences
                  </div>
                )}
                {person.phone && (
                  <a
                    href={`tel:${person.phone}`}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--accent)] hover:border-[var(--accent)] transition-colors font-mono"
                  >
                    <Phone className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{person.phone}</span>
                  </a>
                )}
                {person.linkedinUrl && (
                  <a
                    href={person.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--muted)]" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] flex items-center gap-2.5 text-xs text-[var(--muted)]">
              <Lock className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <span>
                Direct contact details are protected under India DPDP Act and only shared once both members accept a connection request.
              </span>
            </div>
          )}
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
