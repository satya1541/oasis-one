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
  Phone,
  Mail,
  Globe,
  FileText,
  Download,
  Building2,
  Award,
  Sparkles,
  Info,
  Check,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Linkedin({ className }: { className?: string }) {
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

export default function AdminApplicationReviewPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [currentApp, setCurrentApp] = useState<any>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "info_requested" | "approved" | "rejected">("pending");
  const [roleFilter, setRoleFilter] = useState<"all" | "founder" | "mentor" | "aspiring_entrepreneur">("all");

  const [internalNote, setInternalNote] = useState("");
  const [notesList, setNotesList] = useState<any[]>([]);
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Mentor verified badge toggle
  const [grantMentorVerified, setGrantMentorVerified] = useState(true);

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

  // 2. Fetch selected application detail & claim it
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
                : "pending"
            );
            // Default grantMentorVerified to true if applicant is mentor and not yet verified
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
          rubric,
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

  // Helper getters for snapshot data
  const snapshot = currentApp?.submittedProfileSnapshot || {};
  const roleData = snapshot.roleData || {};
  const applicantRole =
    currentApp?.user?.primaryRole || snapshot.role || "founder";

  const applicantPhone =
    currentApp?.user?.phone || snapshot.phone || roleData.phone;
  const applicantLinkedin =
    currentApp?.user?.profile?.linkedinUrl || roleData.linkedinUrl || roleData.linkedin || snapshot.linkedin;
  const applicantWebsite =
    currentApp?.user?.profile?.websiteUrl || roleData.websiteUrl || roleData.website || snapshot.website;

  const evidenceFiles = currentApp?.evidenceFiles || [];

  const filteredApplications = applications.filter((item) => {
    if (statusFilter === "pending") {
      // Pending review queue includes both pending and info_requested
      if (item.status !== "pending" && item.status !== "info_requested") return false;
    } else if (statusFilter === "info_requested") {
      if (item.status !== "info_requested") return false;
    } else if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    if (roleFilter !== "all" && item.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-light text-white tracking-tight">
            Application Review Queue
          </h1>
          <p className="text-xs text-[#A9A7C4] mt-1">
            Evaluate applicants with role-specific verification rubrics, documents, and credentials.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-[#1E1F33] p-1 border border-white/10 text-[11px]">
            {[
              { id: "pending", label: "Pending" },
              { id: "info_requested", label: "Needs Info" },
              { id: "approved", label: "Approved" },
              { id: "rejected", label: "Rejected" },
              { id: "all", label: "All" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={cn(
                  "px-3 py-1 rounded-lg capitalize transition-all cursor-pointer",
                  statusFilter === st.id
                    ? "bg-[#282942] text-[#F3D3A2] font-semibold"
                    : "text-[#A9A7C4] hover:text-white"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="h-8 px-2.5 rounded-xl bg-[#1E1F33] border border-white/10 text-xs text-[#A9A7C4] focus:outline-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="founder">Founders</option>
            <option value="mentor">Mentors</option>
            <option value="aspiring_entrepreneur">Aspiring</option>
          </select>
        </div>
      </div>

      {/* Layout: Master List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#A9A7C4]">
              Applications ({filteredApplications.length})
            </h2>
            <button
              onClick={fetchApplications}
              className="text-[11px] text-[#A9A7C4] hover:text-[#F3D3A2] flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {loadingList ? (
            <div className="flex items-center justify-center p-8 text-xs text-[#A9A7C4] gap-2">
              <RotateCw className="w-4 h-4 animate-spin text-[#F3D3A2]" />
              <span>Loading queue...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 rounded-xl border border-white/10 bg-[#1E1F33] text-center text-xs text-[#A9A7C4]">
              No applications match current filters.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
              {filteredApplications.map((item) => (
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
                          : item.status === "info_requested"
                          ? "bg-sky-950/60 text-sky-300 border border-sky-800"
                          : "bg-amber-950/60 text-amber-300 border border-amber-800"
                      )}
                    >
                      {item.status === "info_requested" ? "Needs Info" : item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A9A7C4] truncate">{item.email}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#A9A7C4] pt-1">
                    <span className="capitalize font-mono">
                      {item.role.replace("_", " ")}
                    </span>
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
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-display text-2xl font-light text-white">
                      {currentApp.user?.profile?.name || snapshot.name || "Applicant"}
                    </h2>
                    <span className="text-[10px] font-mono uppercase bg-[#141522] text-[#F3D3A2] px-2.5 py-0.5 rounded-full border border-white/10 font-semibold">
                      {applicantRole.replace("_", " ")}
                    </span>
                    {currentApp.user?.profile?.mentorVerified && (
                      <span className="text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-700 flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-400" />
                        Verified Mentor
                      </span>
                    )}
                  </div>

                  {/* Verification Contact Badges */}
                  <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-[#A9A7C4]">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Mail className="w-3.5 h-3.5 text-[#F3D3A2]" />
                      {currentApp.user?.email}
                    </span>

                    {applicantPhone ? (
                      <span className="flex items-center gap-1.5 font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">
                        <Phone className="w-3 h-3" />
                        {applicantPhone}
                        <span className="text-[9px] uppercase tracking-wider text-emerald-500 font-semibold">
                          (Mobile Verified)
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-mono text-amber-400/80">
                        <Phone className="w-3 h-3" /> No phone provided
                      </span>
                    )}

                    <span>•</span>
                    <span>{currentApp.user?.profile?.city || snapshot.city || "Odisha"}</span>
                  </div>

                  {/* External Links: LinkedIn & Website */}
                  <div className="flex flex-wrap gap-2 pt-3">
                    {applicantLinkedin && (
                      <a
                        href={applicantLinkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141522] border border-white/10 text-xs text-blue-400 hover:border-blue-500 transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>LinkedIn Profile</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}

                    {applicantWebsite && (
                      <a
                        href={applicantWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141522] border border-white/10 text-xs text-[#F3D3A2] hover:border-[#F3D3A2] transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Startup / Product Link / Portfolio</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
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

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* ROLE SPECIFIC COMMITTEE GUIDANCE & DETAILS */}
              {/* ══════════════════════════════════════════════════════════════ */}

              {/* ASPIRING ENTREPRENEUR DETAILS */}
              {(applicantRole === "aspiring_entrepreneur" || applicantRole === "aspiring") && (
                <div className="space-y-4">
                  {/* Committee Guidance Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 to-[#141522] border border-amber-800/40 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Admin Decision Rubric: Aspiring Entrepreneur</span>
                    </div>
                    <p className="text-[#A9A7C4] leading-relaxed text-[11px]">
                      • <strong>Proof of business registration:</strong> Not required; they may not have started a business yet.<br />
                      • <strong>Government ID:</strong> Usually not necessary just to join as an aspiring entrepreneur.<br />
                      • <strong>Decision:</strong> Approve based on a genuine profile, authentic intent, and platform eligibility criteria.
                    </p>
                  </div>

                  {/* Business Idea & Goals */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A9A7C4]">
                      Business Idea, Interests &amp; Goals
                    </h3>
                    <div className="p-4 rounded-xl border border-white/10 bg-[#141522] text-xs text-white leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-w-full overflow-hidden">
                      {currentApp.user?.profile?.bio || snapshot.bio || snapshot.description || "No description provided."}
                    </div>
                  </div>
                </div>
              )}

              {/* FOUNDER / CO-FOUNDER DETAILS */}
              {applicantRole === "founder" && (
                <div className="space-y-4">
                  {/* Committee Guidance Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-[#141522] border border-blue-800/40 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-300 font-semibold">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span>Admin Decision Rubric: Founder or Co-founder</span>
                    </div>
                    <p className="text-[#A9A7C4] leading-relaxed text-[11px]">
                      • <strong>Verify startup existence:</strong> Validated through live website, product demo, MVP, or incorporation certificate.<br />
                      • <strong>Verify connection:</strong> Ensure founder LinkedIn or credentials show leadership affiliation.<br />
                      • <strong>Pre-incorporation rule:</strong> Not every legitimate early-stage founder will have a registered company yet. Valid early-stage MVPs are eligible!
                    </p>
                  </div>

                  {/* Startup Snapshot Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-white/10 bg-[#141522]">
                      <span className="text-[10px] font-mono uppercase text-[#A9A7C4] block mb-1">
                        Startup Name &amp; Founder Role
                      </span>
                      <p className="font-semibold text-white">
                        {roleData.startupName || "Startup"}
                      </p>
                      <p className="text-[#A9A7C4] text-[11px] mt-0.5">
                        {roleData.founderRole || roleData.userRoleInStartup || "Founder"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-white/10 bg-[#141522]">
                      <span className="text-[10px] font-mono uppercase text-[#A9A7C4] block mb-1">
                        Registration Status
                      </span>
                      {roleData.isRegistered === "registered" ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Registered / Incorporated Entity</span>
                        </div>
                      ) : (
                        <div className="text-amber-300 font-medium">
                          <span>Early Stage / Pre-incorporation</span>
                          <span className="block text-[10px] text-[#A9A7C4] font-normal">
                            (Evaluated via MVP / demo &amp; profile)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pitch / Elevator Summary */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A9A7C4]">
                      Venture Pitch &amp; Progress
                    </h3>
                    <div className="p-4 rounded-xl border border-white/10 bg-[#141522] text-xs text-white leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-w-full overflow-hidden">
                      {currentApp.user?.profile?.bio || snapshot.bio || snapshot.description || "No pitch provided."}
                    </div>
                  </div>
                </div>
              )}

              {/* MENTOR / ADVISOR DETAILS */}
              {applicantRole === "mentor" && (
                <div className="space-y-4">
                  {/* Committee Guidance Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-[#141522] border border-emerald-800/40 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Admin Decision Rubric: Mentor or Advisor</span>
                    </div>
                    <p className="text-[#A9A7C4] leading-relaxed text-[11px]">
                      • <strong>Identity &amp; Credibility:</strong> Check professional track record, current organization, and years of experience.<br />
                      • <strong>References:</strong> Review professional references or claimed startup leadership.<br />
                      • <strong>Separately decide:</strong> Check mentor eligibility and award the <strong>Verified Mentor badge</strong> if supported by evidence.
                    </p>
                  </div>

                  {/* Mentor Credentials Snapshot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-white/10 bg-[#141522]">
                      <span className="text-[10px] font-mono uppercase text-[#A9A7C4] block mb-1">
                        Current Role &amp; Organization
                      </span>
                      <p className="font-semibold text-white">
                        {roleData.jobTitle || "Executive"} @ {roleData.currentCompany || "Organization"}
                      </p>
                      <p className="text-[#A9A7C4] text-[11px] mt-0.5">
                        Experience: {roleData.yearsExperience || "8+ years"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-white/10 bg-[#141522]">
                      <span className="text-[10px] font-mono uppercase text-[#A9A7C4] block mb-1">
                        Professional Reference
                      </span>
                      {roleData.referenceName ? (
                        <div>
                          <p className="font-medium text-white">{roleData.referenceName}</p>
                          <p className="text-[11px] text-[#A9A7C4] font-mono">{roleData.referenceContact}</p>
                        </div>
                      ) : (
                        <p className="text-[#A9A7C4] italic text-[11px]">No professional reference submitted.</p>
                      )}
                    </div>
                  </div>

                  {/* Mentoring Philosophy */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A9A7C4]">
                      Advisory Focus &amp; Mentoring Philosophy
                    </h3>
                    <div className="p-4 rounded-xl border border-white/10 bg-[#141522] text-xs text-white leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-w-full overflow-hidden">
                      {currentApp.user?.profile?.bio || snapshot.bio || snapshot.description || "No philosophy shared."}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* UPLOADED VERIFICATION DOCUMENTS / EVIDENCE */}
              {/* ══════════════════════════════════════════════════════════════ */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A9A7C4] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#F3D3A2]" />
                  <span>Submitted Verification Documents ({evidenceFiles.length})</span>
                </h3>

                {evidenceFiles.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-white/10 bg-[#141522]/50 text-xs text-[#A9A7C4] italic">
                    No physical document uploaded with this application. (Reviewed via verified digital credentials and links).
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {evidenceFiles.map((file: any) => (
                      <div
                        key={file.id}
                        className="p-3.5 rounded-xl border border-white/10 bg-[#141522] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className="w-5 h-5 text-[#F3D3A2] shrink-0" />
                          <div className="truncate">
                            <p className="text-white font-medium truncate">{file.filename}</p>
                            <span className="text-[10px] font-mono text-[#A9A7C4] block">
                              {(file.sizeBytes / 1024).toFixed(0)} KB • {file.purpose || "verification"}
                            </span>
                          </div>
                        </div>

                        <a
                          href={`/api/v1/files/attachment/${file.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#282942] hover:bg-[#F3D3A2] hover:text-[#141522] text-[#F3D3A2] transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View / Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rubric Checklist */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A9A7C4]">
                  Vetting Rubric Checklist
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

              {/* Mentor verified toggle option */}
              {applicantRole === "mentor" && decisionState !== "approved" && (
                <div className="p-4 rounded-xl border border-emerald-800/50 bg-emerald-950/20 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Award &ldquo;Verified Mentor&rdquo; Distinction
                    </span>
                    <p className="text-[11px] text-[#A9A7C4]">
                      Grants the verified advisory badge across the member directory upon approval.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={grantMentorVerified}
                    onChange={(e) => setGrantMentorVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              )}

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
                  {applicantRole === "mentor" && grantMentorVerified
                    ? "Approve & Award Verified Mentor"
                    : "Approve Admission"}
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
