"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Megaphone,
  CheckCircle2,
  Users,
  Eye,
  Calendar,
  Send,
  X,
  Sparkles,
  RotateCw,
  Trash2,
  Edit3,
  Clock,
  AlertTriangle,
  Search,
  Copy,
  Check,
  Timer,
  Archive,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementRecord {
  id: string;
  title: string;
  body: string;
  targetRoles?: string[];
  expiresAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [expiresAt, setExpiresAt] = useState("");
  const [expiryPreset, setExpiryPreset] = useState<"persistent" | "24h" | "3d" | "7d" | "30d" | "custom">("7d");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filter & Search
  const [activeTab, setActiveTab] = useState<"all" | "active" | "expired">("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<AnnouncementRecord | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editTargetRole, setEditTargetRole] = useState("all");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [updating, setUpdating] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Set default expiration date based on preset
  useEffect(() => {
    const now = new Date();
    if (expiryPreset === "persistent") {
      setExpiresAt("");
    } else if (expiryPreset === "24h") {
      const d = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      setExpiresAt(d.toISOString().slice(0, 10));
    } else if (expiryPreset === "3d") {
      const d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      setExpiresAt(d.toISOString().slice(0, 10));
    } else if (expiryPreset === "7d") {
      const d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setExpiresAt(d.toISOString().slice(0, 10));
    } else if (expiryPreset === "30d") {
      const d = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      setExpiresAt(d.toISOString().slice(0, 10));
    }
  }, [expiryPreset]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/announcements");
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        setAnnouncements(list);
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const isItemActive = (item: AnnouncementRecord) => {
    if (!item.expiresAt) return true;
    return new Date(item.expiresAt).getTime() > Date.now();
  };

  // Stats
  const activeCount = useMemo(() => {
    return announcements.filter(isItemActive).length;
  }, [announcements]);

  const expiredCount = useMemo(() => {
    return announcements.filter((a) => !isItemActive(a)).length;
  }, [announcements]);

  // Filtered List
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      const isActive = isItemActive(item);
      if (activeTab === "active" && !isActive) return false;
      if (activeTab === "expired" && isActive) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchBody = item.body.toLowerCase().includes(q);
        const matchRoles = (item.targetRoles || []).join(" ").toLowerCase().includes(q);
        if (!matchTitle && !matchBody && !matchRoles) return false;
      }

      return true;
    });
  }, [announcements, activeTab, searchQuery]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    try {
      setSubmitting(true);
      const targetRoles = targetRole === "all" ? undefined : [targetRole];
      const res = await fetch("/api/v1/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          targetRoles,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      });

      if (res.ok) {
        setNotice({
          type: "success",
          message: "Announcement broadcasted live across all member dashboards in Odisha.",
        });
        setTitle("");
        setBody("");
        setExpiryPreset("7d");
        await fetchAnnouncements();
        setTimeout(() => setNotice(null), 5000);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setNotice({
          type: "error",
          message: errJson.error?.message || errJson.message || "Failed to publish announcement",
        });
      }
    } catch (err: any) {
      setNotice({
        type: "error",
        message: err.message || "Failed to publish announcement",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpireNow = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresAt: new Date(Date.now() - 1000).toISOString(),
        }),
      });
      if (res.ok) {
        await fetchAnnouncements();
        setNotice({
          type: "success",
          message: "Announcement expired and removed from member dashboards.",
        });
        setTimeout(() => setNotice(null), 3000);
      }
    } catch {
      alert("Failed to expire announcement");
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      // Extend for 7 days
      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch(`/api/v1/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresAt: newExpiry }),
      });
      if (res.ok) {
        await fetchAnnouncements();
        setNotice({
          type: "success",
          message: "Announcement reactivated for 7 days on member dashboards.",
        });
        setTimeout(() => setNotice(null), 3000);
      }
    } catch {
      alert("Failed to reactivate announcement");
    }
  };

  const openEditModal = (item: AnnouncementRecord) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditBody(item.body);
    setEditTargetRole(
      !item.targetRoles || item.targetRoles.length === 0 ? "all" : item.targetRoles[0]
    );
    setEditExpiresAt(item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 10) : "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim() || !editBody.trim()) return;

    try {
      setUpdating(true);
      const targetRoles = editTargetRole === "all" ? [] : [editTargetRole];
      const res = await fetch(`/api/v1/admin/announcements/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          body: editBody.trim(),
          targetRoles,
          expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
        }),
      });

      if (res.ok) {
        setEditingItem(null);
        await fetchAnnouncements();
        setNotice({
          type: "success",
          message: "Announcement successfully updated.",
        });
        setTimeout(() => setNotice(null), 3000);
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.error?.message || "Failed to update announcement");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update announcement");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/v1/admin/announcements/${deletingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeletingId(null);
        await fetchAnnouncements();
        setNotice({
          type: "success",
          message: "Announcement permanently deleted.",
        });
        setTimeout(() => setNotice(null), 3000);
      } else {
        alert("Failed to delete announcement");
      }
    } catch {
      alert("Failed to delete announcement");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatAudience = (roles?: string[]) => {
    if (!roles || roles.length === 0) return "All Members";
    return roles
      .map((r) =>
        r === "founder"
          ? "Founders"
          : r === "mentor"
          ? "Mentors"
          : r === "aspiring_entrepreneur"
          ? "Aspiring Builders"
          : r
      )
      .join(", ");
  };

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      {/* ── Top Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono text-[#88DECC] tracking-wider font-semibold">
              Broadcast System
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#88DECC] animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-light font-display text-[#F5FAF6] tracking-tight mt-1">
            Community Announcements &amp; Broadcasts
          </h1>
          <p className="text-xs sm:text-sm text-[#ECF1EF]/70 font-sans mt-0.5">
            Deliver top-banner alerts to active founders, mentors, and innovators across Odisha.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnnouncements}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-[#ECF1EF] text-xs transition-colors self-start cursor-pointer"
          title="Refresh announcements list"
        >
          <RotateCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-[#88DECC]")} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Metric Stats Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="join-glass-panel p-4 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#ECF1EF]/60">Active Now</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <div className="text-2xl font-light font-display text-[#F5FAF6] mt-2">
            {activeCount}
          </div>
          <p className="text-[11px] text-[#ECF1EF]/50 mt-1">
            Currently visible on member dashboards
          </p>
        </div>

        <div className="join-glass-panel p-4 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#ECF1EF]/60">Expired / Archived</span>
            <Archive className="w-4 h-4 text-[#ECF1EF]/40" />
          </div>
          <div className="text-2xl font-light font-display text-[#F5FAF6] mt-2">
            {expiredCount}
          </div>
          <p className="text-[11px] text-[#ECF1EF]/50 mt-1">
            Past broadcasts kept in audit record
          </p>
        </div>

        <div className="join-glass-panel p-4 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#ECF1EF]/60">Total Lifetime</span>
            <Megaphone className="w-4 h-4 text-[#88DECC]" />
          </div>
          <div className="text-2xl font-light font-display text-[#F5FAF6] mt-2">
            {announcements.length}
          </div>
          <p className="text-[11px] text-[#ECF1EF]/50 mt-1">
            Total ecosystem broadcasts dispatched
          </p>
        </div>
      </div>

      {/* ── Status Toast ──────────────────────────────────────────────────────── */}
      {notice && (
        <div
          className={cn(
            "p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200",
            notice.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          )}
        >
          <div className="flex items-center gap-2.5">
            {notice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-current opacity-70 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Compose Broadcast Form with Live Preview ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <form
          onSubmit={handlePublish}
          className="lg:col-span-7 join-glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 relative overflow-hidden shadow-2xl space-y-4"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />

          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-light text-[#F5FAF6] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center text-[#88DECC]">
                <Megaphone className="w-4 h-4" />
              </div>
              <span>Compose Broadcast</span>
            </h2>
            <span className="text-[10px] font-mono text-[#88DECC] bg-[#88DECC]/10 px-2 py-0.5 rounded-full border border-[#88DECC]/20">
              Live Instant Push
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Headline */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70">
                  Headline / Title <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] font-mono text-[#ECF1EF]/40">
                  {title.length}/100 chars
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Odisha DeepTech Innovation Seed Grants 2026"
                className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
              />
            </div>

            {/* Announcement Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70">
                  Announcement Details <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] font-mono text-[#ECF1EF]/40">
                  {body.length}/500 chars
                </span>
              </div>
              <textarea
                rows={3}
                required
                maxLength={500}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="State key eligibility criteria, dates, portal links, or action items..."
                className="w-full p-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all resize-none"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                Target Role Audience
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "all", label: "All Members" },
                  { id: "founder", label: "Founders" },
                  { id: "mentor", label: "Mentors" },
                  { id: "aspiring_entrepreneur", label: "Aspiring" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTargetRole(item.id)}
                    className={cn(
                      "py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer font-medium text-[11px]",
                      targetRole === item.id
                        ? "bg-[#88DECC]/15 border-[#88DECC] text-[#88DECC] shadow-[0_0_12px_rgba(136,222,204,0.2)]"
                        : "bg-white/[0.03] border-white/10 text-[#ECF1EF]/70 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Expiration Presets */}
            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                Display Duration
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  { id: "24h", label: "24 Hours" },
                  { id: "3d", label: "3 Days" },
                  { id: "7d", label: "7 Days" },
                  { id: "30d", label: "30 Days" },
                  { id: "persistent", label: "Persistent (Never expires)" },
                  { id: "custom", label: "Custom Date" },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setExpiryPreset(preset.id as any)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg border text-[10.5px] transition-all cursor-pointer font-mono",
                      expiryPreset === preset.id
                        ? "bg-white/15 border-white/30 text-white font-semibold"
                        : "bg-white/[0.03] border-white/10 text-[#ECF1EF]/60 hover:text-white"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {expiryPreset === "custom" && (
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full h-10 px-3 bg-[#070D12] border border-white/12 rounded-xl text-xs text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-[11px] text-[#ECF1EF]/50">
              Instantly delivered via WebSockets to online members.
            </span>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !body.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EEF1EA] text-[#03080B] font-semibold text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(136,222,204,0.35)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Broadcasting..." : "Broadcast Announcement"}</span>
            </button>
          </div>
        </form>

        {/* Live Banner Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="join-glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-[#ECF1EF]/60">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#88DECC]" />
                Live Member Preview
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                Member View
              </span>
            </div>
            <p className="text-[11px] text-[#ECF1EF]/50">
              Here is exactly how members will see this banner at the top of their dashboard:
            </p>

            {/* Mock Dashboard Top Banner */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#030909] border border-[#88DECC]/30 shadow-[0_0_20px_rgba(136,222,204,0.15)] flex items-start justify-between gap-3 relative overflow-hidden transition-all">
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#88DECC] to-emerald-400" />
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#88DECC]/15 border border-[#88DECC]/30 flex items-center justify-center shrink-0 text-[#88DECC] mt-0.5">
                  <Megaphone className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs leading-relaxed min-w-0">
                  <strong className="font-semibold text-[#F5FAF6] block sm:inline">
                    {title.trim() || "Odisha DeepTech Innovation Seed Grants 2026"}
                  </strong>
                  <span className="hidden sm:inline text-[#ECF1EF]/60 mx-1.5">—</span>
                  <span className="text-[#ECF1EF]/80 text-[11px] sm:text-xs block sm:inline mt-0.5 sm:mt-0">
                    {body.trim() || "Applications open for high-potential hardware and biotech ventures. Apply before March 31."}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="p-1 rounded-lg hover:bg-white/10 text-[#ECF1EF]/50 hover:text-white shrink-0 pointer-events-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-2 text-[10.5px] text-[#ECF1EF]/50 font-mono space-y-1">
              <div className="flex justify-between">
                <span>Audience:</span>
                <span className="text-[#88DECC]">
                  {targetRole === "all"
                    ? "All Members"
                    : targetRole === "founder"
                    ? "Founders Only"
                    : targetRole === "mentor"
                    ? "Mentors Only"
                    : "Aspiring Builders Only"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expiration:</span>
                <span className="text-[#F5FAF6]">
                  {expiresAt ? new Date(expiresAt).toLocaleDateString() : "Never (Persistent)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Broadcast History Section ─────────────────────────────────────────── */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs: Active / Expired / All */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.03] border border-white/10 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={cn(
                "px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium flex items-center gap-1.5",
                activeTab === "active"
                  ? "bg-[#88DECC] text-[#03080B] font-semibold shadow-xs"
                  : "text-[#ECF1EF]/60 hover:text-white"
              )}
            >
              <span>Active</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                {activeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("expired")}
              className={cn(
                "px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium flex items-center gap-1.5",
                activeTab === "expired"
                  ? "bg-[#88DECC] text-[#03080B] font-semibold shadow-xs"
                  : "text-[#ECF1EF]/60 hover:text-white"
              )}
            >
              <span>Expired</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                {expiredCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium flex items-center gap-1.5",
                activeTab === "all"
                  ? "bg-[#88DECC] text-[#03080B] font-semibold shadow-xs"
                  : "text-[#ECF1EF]/60 hover:text-white"
              )}
            >
              <span>All History</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                {announcements.length}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-[#ECF1EF]/40 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or content..."
              className="w-full h-9 pl-9 pr-8 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-[#F5FAF6] placeholder-[#ECF1EF]/40 focus:border-[#88DECC]/50 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-[#ECF1EF]/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Broadcast List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-xs text-[#ECF1EF]/60 gap-3 join-glass-panel rounded-3xl border border-white/10">
            <RotateCw className="w-5 h-5 animate-spin text-[#88DECC]" />
            <span className="font-mono">Loading announcements...</span>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="join-glass-panel p-16 text-center rounded-3xl border border-white/10 text-xs text-[#ECF1EF]/60 shadow-sm relative overflow-hidden space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-[#ECF1EF]/40">
              <Megaphone className="w-5 h-5" />
            </div>
            <p className="font-medium text-[#F5FAF6]">No broadcasts found in this view</p>
            <p className="text-[11px] text-[#ECF1EF]/40">
              {searchQuery
                ? "Try clearing your search query"
                : activeTab === "active"
                ? "No active announcements currently live. Use the form above to compose one."
                : "No expired announcements in history."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnnouncements.map((a) => {
              const active = isItemActive(a);
              return (
                <div
                  key={a.id}
                  className={cn(
                    "join-glass-panel p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden shadow-sm",
                    active
                      ? "border-white/10 hover:border-[#88DECC]/40 bg-white/[0.02]"
                      : "border-white/5 bg-white/[0.01] opacity-75"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium text-sm text-[#F5FAF6] tracking-tight">
                          {a.title}
                        </h4>

                        {/* Status Badge */}
                        <span
                          className={cn(
                            "text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1",
                            active
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              : "bg-white/[0.04] border-white/10 text-[#ECF1EF]/40"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              active ? "bg-emerald-400" : "bg-[#ECF1EF]/40"
                            )}
                          />
                          {active ? "Active" : "Expired"}
                        </span>

                        {/* Target Role Badge */}
                        <span className="text-[10px] font-mono bg-[#88DECC]/10 text-[#88DECC] px-2 py-0.5 rounded-full border border-[#88DECC]/25">
                          {formatAudience(a.targetRoles)}
                        </span>
                      </div>

                      <p className="text-xs text-[#ECF1EF]/70 leading-relaxed font-sans pt-1">
                        {a.body}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`${a.title} — ${a.body}`, a.id)}
                        className="p-2 rounded-xl text-[#ECF1EF]/60 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                        title="Copy announcement text"
                      >
                        {copiedId === a.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(a)}
                        className="p-2 rounded-xl text-[#ECF1EF]/60 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                        title="Edit announcement"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {active ? (
                        <button
                          type="button"
                          onClick={() => handleExpireNow(a.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:bg-amber-500/20 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
                          title="Expire now (deactivate banner)"
                        >
                          <Timer className="w-3 h-3" />
                          <span>Expire Now</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleReactivate(a.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
                          title="Reactivate for 7 days"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Extend 7d</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDeletingId(a.id)}
                        className="p-2 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Permanently delete announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Footer */}
                  <div className="flex flex-wrap items-center gap-3 text-[10.5px] font-mono text-[#ECF1EF]/40 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#88DECC]/60" />
                      Published: {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#88DECC]/60" />
                      {a.expiresAt
                        ? `Expires: ${new Date(a.expiresAt).toLocaleDateString()}`
                        : "No Expiration (Persistent)"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Edit Modal ────────────────────────────────────────────────────────── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg join-glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-base font-light text-[#F5FAF6] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#88DECC]" />
                <span>Edit Announcement</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-[#ECF1EF]/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs text-[#F5FAF6] focus:border-[#88DECC] outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                  Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full p-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs text-[#F5FAF6] focus:border-[#88DECC] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                    Target Role
                  </label>
                  <select
                    value={editTargetRole}
                    onChange={(e) => setEditTargetRole(e.target.value)}
                    className="w-full h-10 px-3 bg-[#070D12] border border-white/12 rounded-xl text-xs text-[#F5FAF6] focus:border-[#88DECC] outline-none"
                  >
                    <option value="all">All Members</option>
                    <option value="founder">Founders Only</option>
                    <option value="mentor">Mentors Only</option>
                    <option value="aspiring_entrepreneur">Aspiring Builders Only</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                    Expiration (Leave blank for persistent)
                  </label>
                  <input
                    type="date"
                    value={editExpiresAt}
                    onChange={(e) => setEditExpiresAt(e.target.value)}
                    className="w-full h-10 px-3 bg-[#070D12] border border-white/12 rounded-xl text-xs text-[#F5FAF6] focus:border-[#88DECC] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-full border border-white/10 text-xs text-[#ECF1EF]/70 hover:text-white hover:bg-white/[0.04] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating || !editTitle.trim() || !editBody.trim()}
                  className="px-5 py-2 rounded-full bg-[#88DECC] text-[#03080B] text-xs font-semibold hover:bg-white transition-all cursor-pointer disabled:opacity-40"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────────────────── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm join-glass-panel rounded-3xl p-6 border border-rose-500/30 shadow-2xl relative space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-display text-base font-light text-[#F5FAF6]">
                Delete Announcement?
              </h3>
              <p className="text-xs text-[#ECF1EF]/60">
                This will permanently delete this broadcast record and remove it from all member feeds.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-full border border-white/10 text-xs text-[#ECF1EF]/70 hover:text-white hover:bg-white/[0.04] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-40"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
