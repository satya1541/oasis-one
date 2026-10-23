"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Send,
  RotateCw,
  Phone,
  Mail,
  Globe,
  FileText,
  Download,
  Building2,
  Award,
  Sparkles,
  Check,
  ShieldCheck,
  Upload,
  Plus,
  Search,
  X,
  ChevronDown,
  Copy,
  MapPin,
  Calendar,
  MessageSquare,
  AlertCircle,
  Briefcase,
  FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
    </svg>
  );
}

interface ApplicationListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  location?: string;
  submittedAt: string;
}

const REJECT_PRESETS = [
  "Early concept stage — please reapply once prototype/MVP is validated.",
  "Venture not currently based in or connected to Odisha's ecosystem.",
  "Unable to verify founder identity or submitted professional credentials.",
  "Does not meet current cohort admission criteria.",
];

const REQUEST_INFO_PRESETS = [
  "Please upload your venture pitch deck or product demo link.",
  "Please provide your Certificate of Incorporation or MSME Udyam proof.",
  "Please provide a verifiable LinkedIn profile URL for admissions vetting.",
  "Please provide additional details regarding your traction and customer validation.",
];

export default function AdminApplicationReviewPage() {
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [currentApp, setCurrentApp] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<"pending" | "info_requested" | "approved" | "rejected" | "all">("pending");
  const [roleFilter, setRoleFilter] = useState<"all" | "founder" | "mentor" | "aspiring_entrepreneur">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Tabs inside dossier: 'overview' | 'documents' | 'notes'
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "notes">("overview");

  // Internal Notes
  const [internalNote, setInternalNote] = useState("");
  const [notesList, setNotesList] = useState<any[]>([]);

  // Decisions
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionState, setDecisionState] = useState<"pending" | "approved" | "rejected" | "more_info">("pending");
  const [grantMentorVerified, setGrantMentorVerified] = useState(true);

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoRequestText, setInfoRequestText] = useState("");

  // Document upload state
  const [uploadingAdminDoc, setUploadingAdminDoc] = useState(false);
  const [adminDocError, setAdminDocError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // 1. Fetch applications
  const fetchApplications = async () => {
    try {
      setLoadingList(true);
      const res = await fetch("/api/v1/admin/applications");
      if (res.ok) {
        const json = await res.json();
        const list: ApplicationListItem[] = Array.isArray(json.data)
          ? json.data
          : json.data?.items || [];
        setApplications(list);
        if (list.length > 0) {
          if (!selectedAppId || !list.some((a) => a.id === selectedAppId)) {
            const firstPending = list.find((a) => a.status === "pending" || a.status === "info_requested") || list[0];
            setSelectedAppId(firstPending.id);
          }
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

  // 2. Fetch selected application detail
  useEffect(() => {
    if (!selectedAppId) return;

    let isMounted = true;
    async function loadDetail() {
      try {
        setLoadingDetail(true);
        fetch(`/api/v1/admin/applications/${selectedAppId}/claim`, { method: "POST" }).catch(() => null);

        const res = await fetch(`/api/v1/admin/applications/${selectedAppId}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setCurrentApp(json.data);
            setNotesList(json.data.messages || []);
            setDecisionState(
              json.data.status === "approved"
                ? "approved"
                : json.data.status === "rejected"
                ? "rejected"
                : json.data.status === "info_requested"
                ? "more_info"
                : "pending"
            );
            setGrantMentorVerified(true);
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

  // Actions
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
      const isMentor =
        currentApp?.user?.primaryRole === "mentor" ||
        currentApp?.submittedProfileSnapshot?.role === "mentor";

      const res = await fetch(`/api/v1/admin/applications/${selectedAppId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          reason: reason || "Meets criteria for cohort admission.",
          grantMentorVerified: isMentor && decision === "approve" ? grantMentorVerified : undefined,
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

  const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAppId) return;

    try {
      setUploadingAdminDoc(true);
      setAdminDocError(null);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "verification_evidence");

      const uploadRes = await fetch("/api/v1/uploads", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload document file.");
      }

      const json = await uploadRes.json();
      const fileId = json.data?.id || json.id;

      const attachRes = await fetch(`/api/v1/admin/applications/${selectedAppId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (!attachRes.ok) {
        throw new Error("Failed to attach document to application.");
      }

      const detailRes = await fetch(`/api/v1/admin/applications/${selectedAppId}`);
      if (detailRes.ok) {
        const detailJson = await detailRes.json();
        setCurrentApp(detailJson.data);
      }
    } catch (err: any) {
      setAdminDocError(err.message || "Failed to attach document.");
    } finally {
      setUploadingAdminDoc(false);
      e.target.value = "";
    }
  };

  const copyEmailToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Helper getters
  const snapshot = currentApp?.submittedProfileSnapshot || {};
  const roleData = snapshot.roleData || {};
  const applicantRole = currentApp?.user?.primaryRole || snapshot.role || "founder";
  const applicantPhone = currentApp?.user?.phone || snapshot.phone || roleData.phone;
  const applicantLinkedin =
    currentApp?.user?.profile?.linkedinUrl || roleData.linkedinUrl || roleData.linkedin || snapshot.linkedin;
  const applicantWebsite =
    currentApp?.user?.profile?.websiteUrl || roleData.websiteUrl || roleData.website || snapshot.website;
  const evidenceFiles = currentApp?.evidenceFiles || [];

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      if (statusFilter === "pending") {
        if (item.status !== "pending") return false;
      } else if (statusFilter === "info_requested") {
        if (item.status !== "info_requested") return false;
      } else if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      if (roleFilter !== "all" && item.role !== roleFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchEmail = item.email?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchLoc) return false;
      }
      return true;
    });
  }, [applications, statusFilter, roleFilter, searchQuery]);

  // Counts
  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const infoReqCount = applications.filter((a) => a.status === "info_requested").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  const getInitials = (nameStr?: string) => {
    if (!nameStr) return "AP";
    const parts = nameStr.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0]?.slice(0, 2).toUpperCase() || "AP";
  };

  return (
    <div className="space-y-4 pb-12 max-w-7xl mx-auto">
      {/* ── Top Command Strip: Heading & Segmented Status Filters ───────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-light text-[#F5FAF6] tracking-tight">
            Applications Review
          </h1>
          <p className="text-xs sm:text-sm text-[#ECF1EF]/60 mt-0.5">
            Review admissions dossiers, verify startup credentials, and decide cohort access.
          </p>
        </div>

        {/* Status Pill Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-white/[0.03] border border-white/10 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={cn(
              "px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1.5",
              statusFilter === "pending"
                ? "bg-[#88DECC] text-[#03080B] font-semibold shadow-sm"
                : "text-[#ECF1EF]/70 hover:text-white"
            )}
          >
            <span>Pending</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                statusFilter === "pending"
                  ? "bg-[#03080B]/20 text-[#03080B] font-bold"
                  : "bg-white/10 text-[#88DECC]"
              )}
            >
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("info_requested")}
            className={cn(
              "px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1.5",
              statusFilter === "info_requested"
                ? "bg-amber-400 text-[#03080B] font-semibold shadow-sm"
                : "text-[#ECF1EF]/70 hover:text-white"
            )}
          >
            <span>Needs Info</span>
            {infoReqCount > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  statusFilter === "info_requested"
                    ? "bg-[#03080B]/20 text-[#03080B] font-bold"
                    : "bg-amber-500/20 text-amber-300"
                )}
              >
                {infoReqCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={cn(
              "px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1.5",
              statusFilter === "approved"
                ? "bg-emerald-400 text-[#03080B] font-semibold shadow-sm"
                : "text-[#ECF1EF]/70 hover:text-white"
            )}
          >
            <span>Approved</span>
            <span className="text-[10px] opacity-75 font-mono">({approvedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("rejected")}
            className={cn(
              "px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1.5",
              statusFilter === "rejected"
                ? "bg-rose-500 text-white font-semibold shadow-sm"
                : "text-[#ECF1EF]/70 hover:text-white"
            )}
          >
            <span>Rejected</span>
            <span className="text-[10px] opacity-75 font-mono">({rejectedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer",
              statusFilter === "all"
                ? "bg-white/20 text-white font-semibold shadow-sm"
                : "text-[#ECF1EF]/60 hover:text-white"
            )}
          >
            All ({applications.length})
          </button>
        </div>
      </div>

      {/* ── Sub-bar: Search, Role Filter, and Refresh ───────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] border border-white/10 p-2.5 rounded-2xl">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#ECF1EF]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or city..."
              className="w-full h-8.5 pl-8 pr-7 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#F5FAF6] placeholder:text-[#ECF1EF]/35 focus:outline-none focus:border-[#88DECC] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#ECF1EF]/40 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              style={{ colorScheme: "dark" }}
              className="h-8.5 px-3 pr-7 rounded-xl bg-[#070D12] border border-white/10 text-xs text-[#F5FAF6] appearance-none focus:outline-none focus:border-[#88DECC] cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="founder">Founders</option>
              <option value="mentor">Mentors</option>
              <option value="aspiring_entrepreneur">Aspiring Builders</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#88DECC] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Refresh Queue */}
          <button
            type="button"
            onClick={fetchApplications}
            title="Refresh queue"
            className="h-8.5 w-8.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#88DECC]/50 text-[#ECF1EF]/70 hover:text-[#88DECC] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Two-Panel Review Command Center ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Clean Applicant Queue */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between px-1 text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/50">
            <span>Queue ({filteredApplications.length})</span>
            <span>Select to Review</span>
          </div>

          {loadingList ? (
            <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-2">
              <RotateCw className="w-5 h-5 animate-spin text-[#88DECC] mx-auto" />
              <p className="text-xs text-[#ECF1EF]/50 font-mono">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/10 border-dashed text-center text-xs text-[#ECF1EF]/50 space-y-1">
              <p className="text-[#F5FAF6] font-medium">No matching applications</p>
              <p className="text-[11px]">Try clearing search or changing the status filter.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 auth-scrollbar">
              {filteredApplications.map((item) => {
                const isSelected = selectedAppId === item.id;
                const roleBadge =
                  item.role === "mentor"
                    ? "Mentor"
                    : item.role === "aspiring_entrepreneur" || item.role === "aspiring"
                    ? "Aspiring"
                    : "Founder";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAppId(item.id)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden select-none block",
                      isSelected
                        ? "bg-[#88DECC]/[0.08] border-[#88DECC] shadow-[0_0_25px_rgba(136,222,204,0.15)] ring-1 ring-[#88DECC]/30"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#88DECC]" />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border",
                          isSelected
                            ? "bg-[#88DECC]/20 text-[#88DECC] border-[#88DECC]/50"
                            : "bg-white/[0.04] text-[#ECF1EF]/70 border-white/10"
                        )}
                      >
                        {getInitials(item.name)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-medium text-xs text-[#F5FAF6] truncate">
                            {item.name}
                          </h4>
                          <span
                            className={cn(
                              "text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold shrink-0",
                              item.status === "approved"
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                : item.status === "rejected"
                                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                : item.status === "info_requested"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-[#88DECC]/15 text-[#88DECC] border border-[#88DECC]/30"
                            )}
                          >
                            {item.status === "info_requested" ? "Needs Info" : item.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#ECF1EF]/60 truncate mt-0.5">
                          {item.email}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-[#ECF1EF]/50 pt-2 font-mono">
                          <span className="text-[#88DECC] uppercase font-semibold">
                            {roleBadge}
                          </span>
                          <span className="flex items-center gap-1 text-[#ECF1EF]/40 truncate">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            {item.location || "Odisha"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Unified Applicant Dossier */}
        <div className="lg:col-span-8">
          {loadingDetail ? (
            <div className="p-20 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-3">
              <RotateCw className="w-6 h-6 animate-spin text-[#88DECC] mx-auto" />
              <p className="text-xs text-[#ECF1EF]/60 font-mono">Loading applicant dossier...</p>
            </div>
          ) : !currentApp ? (
            <div className="p-16 rounded-3xl bg-white/[0.02] border border-white/10 text-center text-xs text-[#ECF1EF]/50">
              Select an applicant from the left to start review.
            </div>
          ) : (
            <div className="space-y-4">
              {/* ── CARD: Dossier Header & Instant Decision Bar ─────────────────── */}
              <div className="rounded-3xl border border-white/10 p-5 sm:p-6 bg-white/[0.03] backdrop-blur-md shadow-2xl relative overflow-hidden space-y-4">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />

                {/* Top Applicant Identity Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#03080B] border border-[#88DECC]/40 flex items-center justify-center font-display text-lg text-[#88DECC] shrink-0 shadow-lg">
                      {getInitials(currentApp.user?.profile?.name || snapshot.name)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-display text-xl sm:text-2xl font-light text-[#F5FAF6] tracking-tight">
                          {currentApp.user?.profile?.name || snapshot.name || "Applicant"}
                        </h2>
                        <span className="text-[10px] font-mono uppercase bg-[#88DECC]/10 text-[#88DECC] px-2.5 py-0.5 rounded-full border border-[#88DECC]/30 font-semibold">
                          {applicantRole.replace("_", " ")}
                        </span>
                        {currentApp.user?.profile?.mentorVerified && (
                          <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-semibold">
                            <Award className="w-3 h-3 text-emerald-400" />
                            Verified Mentor
                          </span>
                        )}
                      </div>

                      {/* Contact Badges Row */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#ECF1EF]/70 pt-1">
                        <button
                          type="button"
                          onClick={() => copyEmailToClipboard(currentApp.user?.email || "")}
                          title="Click to copy email"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/20 text-[#F5FAF6] text-xs font-mono transition-colors cursor-pointer"
                        >
                          <Mail className="w-3 h-3 text-[#88DECC]" />
                          <span>{currentApp.user?.email}</span>
                          {copiedEmail ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-[#ECF1EF]/40" />
                          )}
                        </button>

                        {applicantPhone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{applicantPhone}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.02] border border-white/5 text-[#ECF1EF]/40 text-xs font-mono">
                            <Phone className="w-3 h-3" /> No phone
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.02] text-[#ECF1EF]/60 text-xs">
                          <MapPin className="w-3 h-3 text-[#88DECC]" />
                          <span>{currentApp.user?.profile?.city || snapshot.city || "Odisha"}</span>
                        </span>
                      </div>

                      {/* Social & Verification Links */}
                      <div className="flex flex-wrap items-center gap-2 pt-1.5">
                        {applicantLinkedin && (
                          <a
                            href={applicantLinkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-xs text-sky-300 hover:bg-sky-500/20 transition-colors"
                          >
                            <LinkedinIcon className="w-3 h-3" />
                            <span>LinkedIn Profile</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        )}

                        {applicantWebsite && (
                          <a
                            href={applicantWebsite}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#88DECC]/10 border border-[#88DECC]/25 text-xs text-[#88DECC] hover:bg-[#88DECC]/20 transition-colors"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Website / MVP</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator Pill */}
                  <span
                    className={cn(
                      "text-xs uppercase font-mono px-3.5 py-1.5 rounded-full font-semibold shrink-0 self-start",
                      decisionState === "approved"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : decisionState === "rejected"
                        ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                        : decisionState === "more_info"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-[#88DECC]/10 text-[#88DECC] border border-[#88DECC]/30"
                    )}
                  >
                    {decisionState === "more_info" ? "Needs Info" : decisionState}
                  </span>
                </div>

                {/* ── FAST DECISION BAR ────────────────────────────────────────── */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {decisionState !== "approved" ? (
                      <button
                        type="button"
                        disabled={submittingDecision}
                        onClick={() => handleDecision("approve")}
                        className="join-cta-pill group cursor-pointer disabled:opacity-40"
                      >
                        <span className="font-semibold text-xs tracking-tight">
                          {applicantRole === "mentor" && grantMentorVerified
                            ? "Approve & Award Verified Mentor"
                            : "Approve Admission"}
                        </span>
                        <div className="join-cta-disc shrink-0">
                          <Check className="w-4 h-4 text-emerald-300" />
                        </div>
                      </button>
                    ) : (
                      <div className="px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Admitted to Community</span>
                      </div>
                    )}

                    {decisionState !== "rejected" && (
                      <button
                        type="button"
                        disabled={submittingDecision}
                        onClick={() => setShowRejectModal(true)}
                        className="px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Reject</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={submittingDecision}
                      onClick={() => setShowInfoModal(true)}
                      className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:bg-amber-500/20 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Request More Info</span>
                    </button>
                  </div>

                  {/* Mentor distinction checkbox */}
                  {applicantRole === "mentor" && decisionState !== "approved" && (
                    <label className="flex items-center gap-2 text-xs text-[#ECF1EF]/80 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={grantMentorVerified}
                        onChange={(e) => setGrantMentorVerified(e.target.checked)}
                        className="w-4 h-4 rounded text-[#88DECC] focus:ring-0 cursor-pointer"
                      />
                      <span>Award &ldquo;Verified Mentor&rdquo; badge</span>
                    </label>
                  )}
                </div>
              </div>

              {/* ── Dossier Section Switcher Tabs ──────────────────────────────── */}
              <div className="flex border-b border-white/10 gap-6 px-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={cn(
                    "pb-3 flex items-center gap-2 transition-all cursor-pointer relative",
                    activeTab === "overview"
                      ? "text-[#88DECC] font-semibold"
                      : "text-[#ECF1EF]/60 hover:text-white"
                  )}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Venture &amp; Background</span>
                  {activeTab === "overview" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#88DECC]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("documents")}
                  className={cn(
                    "pb-3 flex items-center gap-2 transition-all cursor-pointer relative",
                    activeTab === "documents"
                      ? "text-[#88DECC] font-semibold"
                      : "text-[#ECF1EF]/60 hover:text-white"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Verification Documents</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
                    {evidenceFiles.length}
                  </span>
                  {activeTab === "documents" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#88DECC]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={cn(
                    "pb-3 flex items-center gap-2 transition-all cursor-pointer relative",
                    activeTab === "notes"
                      ? "text-[#88DECC] font-semibold"
                      : "text-[#ECF1EF]/60 hover:text-white"
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Committee Notes</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono">
                    {notesList.length}
                  </span>
                  {activeTab === "notes" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#88DECC]" />
                  )}
                </button>
              </div>

              {/* ── TAB 1: Venture & Background ────────────────────────────────── */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {/* Snapshot Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {applicantRole === "founder" && (
                      <>
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#ECF1EF]/50 block">
                            Startup Name
                          </span>
                          <p className="font-semibold text-[#F5FAF6] text-sm">
                            {roleData.startupName || "Startup"}
                          </p>
                          <p className="text-[11px] text-[#88DECC] font-medium">
                            {roleData.founderRole || "Founder / CEO"}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#ECF1EF]/50 block">
                            Stage &amp; Sectors
                          </span>
                          <p className="font-semibold text-[#F5FAF6] text-sm">
                            {roleData.stage || "Early Stage"}
                          </p>
                          <p className="text-[11px] text-[#ECF1EF]/60 truncate">
                            {Array.isArray(roleData.sectors) && roleData.sectors.length > 0
                              ? roleData.sectors.join(", ")
                              : "Technology"}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#ECF1EF]/50 block">
                            Entity Registration
                          </span>
                          <p className="font-semibold text-[#F5FAF6] text-sm capitalize">
                            {roleData.isRegistered === "registered"
                              ? "Registered (Pvt Ltd / MSME)"
                              : "Early Stage (MVP Proof)"}
                          </p>
                          <p className="text-[10px] text-[#ECF1EF]/50">
                            {roleData.isRegistered === "registered"
                              ? "Formal entity verified"
                              : "Pre-incorporation"}
                          </p>
                        </div>
                      </>
                    )}

                    {applicantRole === "mentor" && (
                      <>
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#ECF1EF]/50 block">
                            Organization
                          </span>
                          <p className="font-semibold text-[#F5FAF6] text-sm">
                            {roleData.currentCompany || "Organization"}
                          </p>
                          <p className="text-[11px] text-[#88DECC]">
                            {roleData.jobTitle || "Executive / Advisor"}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#ECF1EF]/50 block">
                            Industry Experience
                          </span>
                          <p className="font-semibold text-[#F5FAF6] text-sm">
                            {roleData.yearsExperience || "8+ years"}
                          </p>
                          <p className="text-[10px] text-[#ECF1EF]/50">Domain Mentorship</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#ECF1EF]/50 block">
                            Professional Reference
                          </span>
                          <p className="font-semibold text-[#F5FAF6] truncate text-sm">
                            {roleData.referenceName || "None provided"}
                          </p>
                          <p className="text-[10px] font-mono text-[#ECF1EF]/50 truncate">
                            {roleData.referenceContact || "—"}
                          </p>
                        </div>
                      </>
                    )}

                    {(applicantRole === "aspiring_entrepreneur" || applicantRole === "aspiring") && (
                      <>
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#ECF1EF]/50 block">
                            Primary Focus Area
                          </span>
                          <p className="font-semibold text-[#F5FAF6] text-sm">
                            {roleData.ideaDomain || "General Tech"}
                          </p>
                          <p className="text-[10px] text-[#88DECC]">Emerging Founder</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#ECF1EF]/50 block">
                            Target Sector
                          </span>
                          <p className="font-semibold text-[#F5FAF6] text-sm">
                            {Array.isArray(roleData.sectors) && roleData.sectors.length > 0
                              ? roleData.sectors.join(", ")
                              : "AI, AgriTech, SaaS"}
                          </p>
                          <p className="text-[10px] text-[#ECF1EF]/50">Cohort Matching</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                          <span className="text-[10px] font-mono uppercase text-[#ECF1EF]/50 block">
                            Admissions Track
                          </span>
                          <p className="font-semibold text-[#F5FAF6] text-sm">
                            Ideation / Builder
                          </p>
                          <p className="text-[10px] text-[#ECF1EF]/50">No company required</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Statement of Intent / Bio */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/60 block font-semibold">
                      Statement of Intent &amp; Venture Description
                    </span>
                    <p className="text-xs sm:text-sm text-[#F5FAF6] leading-relaxed whitespace-pre-wrap font-sans">
                      {currentApp.user?.profile?.bio ||
                        snapshot.bio ||
                        snapshot.description ||
                        "No bio or statement provided by applicant."}
                    </p>
                  </div>
                </div>
              )}

              {/* ── TAB 2: Verification Documents ──────────────────────────────── */}
              {activeTab === "documents" && (
                <div className="space-y-4">
                  {/* Gov ID Indicator Banner */}
                  {roleData.govIdProvided && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Government ID Declared</span>
                        <p className="text-[11px] text-[#ECF1EF]/70 leading-relaxed font-sans mt-0.5">
                          Applicant certified Government ID verification during submission.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Attach Document Header */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                    <div className="text-xs text-[#ECF1EF]/70">
                      <span>Store registration proofs, pitch decks, or founder verification files.</span>
                    </div>

                    <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#88DECC] hover:bg-[#7bc4b4] text-[#03080B] text-xs font-semibold cursor-pointer transition-colors shrink-0 shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload &amp; Attach File</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleAdminFileUpload}
                        className="hidden"
                        disabled={uploadingAdminDoc}
                      />
                    </label>
                  </div>

                  {uploadingAdminDoc && (
                    <div className="p-3 rounded-2xl bg-[#88DECC]/10 border border-[#88DECC]/30 text-[#88DECC] text-xs flex items-center gap-2">
                      <RotateCw className="w-4 h-4 animate-spin text-[#88DECC]" />
                      <span>Uploading document and linking to application...</span>
                    </div>
                  )}

                  {adminDocError && (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{adminDocError}</span>
                    </div>
                  )}

                  {/* Evidence Files List */}
                  {evidenceFiles.length === 0 ? (
                    <div className="p-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-[#ECF1EF]/60 text-center space-y-2">
                      <FileText className="w-8 h-8 text-[#ECF1EF]/30 mx-auto" />
                      <p className="italic text-[#ECF1EF]/50">No documents attached to this application yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {evidenceFiles.map((file: any) => (
                        <div
                          key={file.id}
                          className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/30 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-[#88DECC]" />
                            </div>
                            <div className="truncate">
                              <p className="text-[#F5FAF6] font-medium truncate">{file.filename}</p>
                              <span className="text-[10px] font-mono text-[#ECF1EF]/50 block">
                                {(file.sizeBytes / 1024).toFixed(0)} KB &middot; {file.purpose || "verification"}
                              </span>
                            </div>
                          </div>

                          <a
                            href={`/api/v1/files/attachment/${file.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[#F5FAF6] transition-colors flex items-center gap-1.5 text-xs font-medium shrink-0"
                          >
                            <Download className="w-3.5 h-3.5 text-[#88DECC]" />
                            <span>View</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 3: Committee Notes & Log ───────────────────────────────── */}
              {activeTab === "notes" && (
                <div className="space-y-4">
                  {notesList.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-[#ECF1EF]/50 text-center">
                      No internal reviewer notes yet. Be the first to leave an observation.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 auth-scrollbar">
                      {notesList.map((n: any, idx: number) => (
                        <div
                          key={n.id || idx}
                          className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] text-xs text-[#ECF1EF]/80 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#ECF1EF]/50">
                            <span className="font-semibold text-[#88DECC]">
                              {n.author?.profile?.name || "Admissions Committee"}
                            </span>
                            <span>
                              {n.createdAt
                                ? new Date(n.createdAt).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Just now"}
                            </span>
                          </div>
                          <p className="text-[#F5FAF6] leading-relaxed font-sans">{n.body}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <input
                      type="text"
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Leave a confidential note for other reviewers..."
                      className="flex-1 text-xs px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.04] text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 focus:outline-none focus:border-[#88DECC] transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!internalNote.trim()}
                      className="px-5 py-2.5 rounded-full bg-[#88DECC] text-[#03080B] hover:bg-[#7bc4b4] font-semibold text-xs transition-all cursor-pointer disabled:opacity-40 shadow-sm"
                    >
                      Post Note
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Reject Modal with 1-Click Presets ───────────────────────────────── */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03080B]/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-md border border-white/10 rounded-3xl p-6 bg-[#070D12] space-y-4 text-xs text-[#F5FAF6] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-lg font-light text-[#F5FAF6]">
                Reject Application
              </h3>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="w-7 h-7 rounded-full bg-white/[0.04] text-[#ECF1EF]/70 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/50 block">
                Quick Reason Presets
              </span>
              <div className="flex flex-col gap-1.5">
                {REJECT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className="text-left text-[11px] p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/[0.06] transition-colors cursor-pointer text-[#ECF1EF]/80"
                  >
                    &bull; {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/50 block">
                Feedback sent to applicant:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Type custom rejection reasoning..."
                className="w-full p-3 rounded-2xl border border-white/10 bg-white/[0.04] text-xs text-[#F5FAF6] placeholder:text-[#ECF1EF]/30 focus:outline-none focus:border-rose-400 resize-none font-sans"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-full text-xs text-[#ECF1EF]/70 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                onClick={() => handleDecision("reject", rejectReason)}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Request Info Modal with 1-Click Presets ──────────────────────────── */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03080B]/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-md border border-white/10 rounded-3xl p-6 bg-[#070D12] space-y-4 text-xs text-[#F5FAF6] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-lg font-light text-[#F5FAF6]">
                Request Additional Details
              </h3>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="w-7 h-7 rounded-full bg-white/[0.04] text-[#ECF1EF]/70 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/50 block">
                Quick Request Presets
              </span>
              <div className="flex flex-col gap-1.5">
                {REQUEST_INFO_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setInfoRequestText(preset)}
                    className="text-left text-[11px] p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/[0.06] transition-colors cursor-pointer text-[#ECF1EF]/80"
                  >
                    &bull; {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/50 block">
                Instruction for applicant:
              </label>
              <textarea
                rows={3}
                value={infoRequestText}
                onChange={(e) => setInfoRequestText(e.target.value)}
                placeholder="Specify what document or detail is needed..."
                className="w-full p-3 rounded-2xl border border-white/10 bg-white/[0.04] text-xs text-[#F5FAF6] placeholder:text-[#ECF1EF]/30 focus:outline-none focus:border-amber-400 resize-none font-sans"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 rounded-full text-xs text-[#ECF1EF]/70 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-[#03080B] font-semibold text-xs shadow-md transition-all cursor-pointer"
                onClick={() => handleDecision("request_info", infoRequestText)}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
