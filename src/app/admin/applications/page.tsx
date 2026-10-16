"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Send,
  User,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  location?: string;
  submittedAt: string;
}

export default function AdminApplicationReviewPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [currentApp, setCurrentApp] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [internalNote, setInternalNote] = useState("");
  const [notesList, setNotesList] = useState<any[]>([]);
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Rubric checklist
  const [rubric, setRubric] = useState({
    looksGenuine: true,
    roleMatches: true,
    profileComplete: true,
    fitsOasis: true,
    noRedFlags: true,
  });

  const [decisionState, setDecisionState] = useState<"pending" | "approved" | "rejected" | "more_info">("pending");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoRequestText, setInfoRequestText] = useState("");

  const toggleRubric = (key: keyof typeof rubric) => {
    setRubric((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. Fetch applications
  const fetchApplications = async () => {
    try {
      setLoadingList(true);
      const res = await fetch("/api/v1/admin/applications");
      if (res.ok) {
        const json = await res.json();
        const list: ApplicationListItem[] = Array.isArray(json.data)
          ? json.data
          : (json.data?.items || []);
        setApplications(list);
        if (list.length > 0 && !selectedAppId) {
          // Select first pending or first app
          const firstPending = list.find((a) => a.status === "pending") || list[0];
          setSelectedAppId(firstPending.id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // 2. Fetch selected application detail & claim it
  useEffect(() => {
    if (!selectedAppId) return;

    let isMounted = true;
    async function loadDetail() {
      try {
        setLoadingDetail(true);
        // Claim application
        fetch(`/api/v1/admin/applications/${selectedAppId}/claim`, { method: "POST" }).catch(() => null);

        // Fetch Detail
        const res = await fetch(`/api/v1/admin/applications/${selectedAppId}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setCurrentApp(json.data);
            setNotesList(json.data.messages || []);
            setDecisionState(json.data.status === "approved" ? "approved" : json.data.status === "rejected" ? "rejected" : "pending");
          }
        }
      } catch (err) {
        console.error("Failed to load application detail:", err);
      } finally {
        if (isMounted) setLoadingDetail(false);
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [selectedAppId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim() || !selectedAppId) return;

    try {
      const res = await fetch(`/api/v1/admin/applications/${selectedAppId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: internalNote.trim(), isInternalNote: true }),
      });
      if (res.ok) {
        const json = await res.json();
        setNotesList((prev) => [...prev, json.data]);
        setInternalNote("");
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  const handleDecision = async (decision: "approve" | "reject" | "request_info", reason?: string) => {
    if (!selectedAppId) return;
    try {
      setSubmittingDecision(true);
      const res = await fetch(`/api/v1/admin/applications/${selectedAppId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          reason: reason || "Meets criteria for cohort admission.",
          rubric,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to submit decision");
        return;
      }

      setDecisionState(decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "more_info");
      setShowRejectModal(false);
      setShowInfoModal(false);
      await fetchApplications();
    } catch (err: any) {
      alert(err.message || "Failed to submit decision");
    } finally {
      setSubmittingDecision(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-light text-white tracking-tight">
              Application Review Queue
            </h1>
            <p className="text-xs text-[#A9A7C4] mt-1">
              Review prospective founders, mentors, and aspiring applicants under OASIS vetting criteria.
            </p>
          </div>
        </div>

        {/* Layout: Master List (Sidebar/Cards) & Detail View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A9A7C4]">
              Applications Queue ({applications.length})
            </h2>

            {loadingList ? (
              <div className="flex items-center justify-center p-8 text-xs text-[#A9A7C4] gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-[#F3D3A2]" />
                <span>Loading queue...</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-8 rounded-xl border border-white/10 bg-[#1E1F33] text-center text-xs text-[#A9A7C4]">
                No applications currently in queue.
              </div>
            ) : (
              <div className="space-y-2.5">
                {applications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAppId(item.id)}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer space-y-1.5",
                      selectedAppId === item.id
                        ? "bg-[#282942] border-[#F3D3A2] shadow-sm"
                        : "bg-[#1E1F33] border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white truncate">
                        {item.name}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-medium",
                          item.status === "approved"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800"
                            : item.status === "rejected"
                            ? "bg-rose-950/60 text-rose-400 border border-rose-800"
                            : "bg-amber-950/60 text-amber-300 border border-amber-800"
                        )}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A9A7C4] truncate">{item.email}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#A9A7C4] pt-1">
                      <span className="capitalize">{item.role.replace("_", " ")}</span>
                      <span>{item.location || "Odisha"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Application Detail Panel */}
          <div className="lg:col-span-8">
            {loadingDetail ? (
              <div className="flex items-center justify-center p-20 text-xs text-[#A9A7C4] gap-2">
                <RotateCw className="w-5 h-5 animate-spin text-[#F3D3A2]" />
                <span>Loading application profile...</span>
              </div>
            ) : !currentApp ? (
              <div className="p-16 rounded-2xl border border-white/10 bg-[#1E1F33] text-center text-xs text-[#A9A7C4]">
                Select an application from the queue to start review.
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#1E1F33] space-y-6">
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-xl font-medium text-white">
                        {currentApp.user?.profile?.name || currentApp.submittedProfileSnapshot?.name || "Applicant"}
                      </h2>
                      <span className="text-[10px] font-mono uppercase bg-[#141522] text-[#F3D3A2] px-2 py-0.5 rounded border border-white/10">
                        {currentApp.user?.primaryRole || currentApp.submittedProfileSnapshot?.role || "founder"}
                      </span>
                    </div>
                    <p className="text-xs text-[#A9A7C4] mt-1 font-mono">
                      {currentApp.user?.email} • {currentApp.user?.profile?.city || "Odisha"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs uppercase font-mono px-3 py-1 rounded-full font-semibold",
                        decisionState === "approved"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800"
                          : decisionState === "rejected"
                          ? "bg-rose-950/60 text-rose-400 border border-rose-800"
                          : "bg-amber-950/60 text-amber-300 border border-amber-800"
                      )}
                    >
                      {decisionState}
                    </span>
                  </div>
                </div>

                {/* Submitted Pitch / Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A9A7C4]">
                    Profile & Submission Summary
                  </h3>
                  <div className="p-4 rounded-xl border border-white/10 bg-[#141522] space-y-2 text-xs">
                    <p className="text-white font-medium">
                      {currentApp.user?.profile?.headline || "No headline provided."}
                    </p>
                    <p className="text-[#A9A7C4] leading-relaxed whitespace-pre-wrap">
                      {currentApp.user?.profile?.bio || "Applicant details submitted during registration."}
                    </p>
                  </div>
                </div>

                {/* Rubric Checklist */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A9A7C4]">
                    Vetting Rubric
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(rubric).map(([k, v]) => (
                      <div
                        key={k}
                        onClick={() => toggleRubric(k as any)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/10 bg-[#141522] cursor-pointer hover:border-white/20"
                      >
                        <input
                          type="checkbox"
                          checked={v}
                          onChange={() => {}}
                          className="rounded text-[#F3D3A2] focus:ring-0"
                        />
                        <span className="text-white capitalize">
                          {k.replace(/([A-Z])/g, " $1")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={submittingDecision || decisionState === "approved"}
                    onClick={() => handleDecision("approve")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Admission
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={submittingDecision || decisionState === "rejected"}
                    onClick={() => setShowRejectModal(true)}
                    className="border-rose-800 text-rose-400 hover:bg-rose-950/40 gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Application
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={submittingDecision}
                    onClick={() => setShowInfoModal(true)}
                    className="text-[#A9A7C4] hover:text-white gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Request More Info
                  </Button>
                </div>

                {/* Internal Notes Thread */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A9A7C4]">
                    Reviewer Internal Notes
                  </h3>

                  <div className="space-y-2">
                    {notesList.map((n: any, idx: number) => (
                      <div
                        key={n.id || idx}
                        className="p-3 rounded-xl border border-white/5 bg-[#141522] text-xs text-[#A9A7C4]"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white">
                            {n.author?.profile?.name || "Committee Admin"}
                          </span>
                          <span className="text-[10px] font-mono">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : "Just now"}
                          </span>
                        </div>
                        <p>{n.body}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Add an internal reviewer note..."
                      className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-white/10 bg-[#141522] text-white focus:outline-none focus:ring-1 focus:ring-[#F3D3A2]"
                    />
                    <Button size="sm" type="submit" variant="secondary">
                      Add Note
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="w-full max-w-md bg-[#1E1F33] border border-white/10 rounded-2xl p-6 space-y-4 text-xs">
              <h3 className="font-display text-base font-medium text-white">
                Reject Application
              </h3>
              <p className="text-[#A9A7C4]">
                Provide clear, constructive feedback for the applicant:
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Early concept stage; encourage re-application after customer discovery."
                className="w-full p-3 rounded-xl border border-white/10 bg-[#141522] text-white focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-500 text-white"
                  onClick={() => handleDecision("reject", rejectReason)}
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Info Modal */}
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="w-full max-w-md bg-[#1E1F33] border border-white/10 rounded-2xl p-6 space-y-4 text-xs">
              <h3 className="font-display text-base font-medium text-white">
                Request Additional Details
              </h3>
              <p className="text-[#A9A7C4]">
                Specify what documents or details the applicant must submit:
              </p>
              <textarea
                rows={3}
                value={infoRequestText}
                onChange={(e) => setInfoRequestText(e.target.value)}
                placeholder="e.g. Please upload your pitch deck or incorporate registration certificate."
                className="w-full p-3 rounded-xl border border-white/10 bg-[#141522] text-white focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowInfoModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDecision("request_info", infoRequestText)}
                >
                  Send Request
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
