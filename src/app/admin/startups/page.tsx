"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Building2,
  GitMerge,
  Search,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Users,
  Globe,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StartupMember {
  userId: string;
  roleInStartup: string;
  user: {
    id: string;
    profile?: {
      name: string;
    };
  };
}

interface StartupRecord {
  id: string;
  name: string;
  legalName?: string;
  websiteUrl?: string;
  sector?: string;
  stage?: string;
  description?: string;
  city?: string;
  createdAt: string;
  members: StartupMember[];
}

export default function AdminStartupsPage() {
  const [startups, setStartups] = useState<StartupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Merge Modal State
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [sourceStartup, setSourceStartup] = useState<StartupRecord | null>(null);
  const [targetStartupId, setTargetStartupId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/startups");
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (json.data?.items || []);
        setStartups(list);
      }
    } catch (err) {
      console.error("Failed to fetch startups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  const handleMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceStartup || !targetStartupId) return;

    if (sourceStartup.id === targetStartupId) {
      alert("Source and target startups cannot be the same entity.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/admin/startups/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceStartupId: sourceStartup.id,
          targetStartupId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          message: json.error?.message || "Failed to merge startups",
        });
        return;
      }

      const target = startups.find((s) => s.id === targetStartupId);
      setFeedback({
        type: "success",
        message: `Successfully merged "${sourceStartup.name}" into "${target?.name || 'canonical startup'}". All team members migrated.`,
      });
      setMergeModalOpen(false);
      setSourceStartup(null);
      setTargetStartupId("");
      await fetchStartups();
      setTimeout(() => setFeedback(null), 7000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to merge startups" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStartups = startups.filter((s) => {
    const q = search.toLowerCase();
    const matchesName = s.name.toLowerCase().includes(q) || (s.legalName && s.legalName.toLowerCase().includes(q));
    const matchesSector = s.sector && s.sector.toLowerCase().includes(q);
    const matchesMember = s.members?.some((m) => m.user.profile?.name?.toLowerCase().includes(q));
    return matchesName || matchesSector || matchesMember;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-light text-white tracking-tight">
            Startup Directory &amp; Entity Resolution
          </h1>
          <p className="text-xs text-[#A9A7C4] mt-1">
            Audit founder venture submissions, resolve duplicates, and merge canonical company records.
          </p>
        </div>

        <div className="text-xs font-mono text-[#F3D3A2] px-3 py-1.5 rounded-xl bg-[#1E1F33] border border-white/10">
          {startups.length} Registered Ventures
        </div>
      </div>

      {feedback && (
        <div
          className={cn(
            "p-4 rounded-xl text-xs flex items-center gap-2.5",
            feedback.type === "success"
              ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
              : "bg-rose-950/60 border border-rose-800 text-rose-300"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#A9A7C4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search startups by name, sector, founder, or city..."
          className="w-full h-11 pl-10 pr-4 text-xs bg-[#1E1F33] border border-white/10 rounded-xl text-white placeholder:text-[#A9A7C4]/60 focus:outline-none focus:ring-1 focus:ring-[#F3D3A2]"
        />
      </div>

      {/* Table */}
      <Card className="border-white/10 bg-[#1E1F33] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-xs text-[#A9A7C4] gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[#F3D3A2]" />
            <span>Loading venture registry...</span>
          </div>
        ) : filteredStartups.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A9A7C4]">
            No startups found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#A9A7C4] uppercase font-mono text-[10px] tracking-wider bg-[#141522]/50">
                  <th className="py-3 px-4 font-semibold">Startup / Entity</th>
                  <th className="py-3 px-4 font-semibold">Sector &amp; Stage</th>
                  <th className="py-3 px-4 font-semibold">Founding Team</th>
                  <th className="py-3 px-4 font-semibold">Registered</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStartups.map((startup) => (
                  <tr key={startup.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#141522] border border-white/10 flex items-center justify-center font-display font-medium text-xs text-[#F3D3A2] shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-white flex items-center gap-1.5">
                            <span>{startup.name}</span>
                            {startup.websiteUrl && (
                              <a
                                href={startup.websiteUrl.startsWith("http") ? startup.websiteUrl : `https://${startup.websiteUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#A9A7C4] hover:text-[#F3D3A2]"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {startup.legalName && startup.legalName !== startup.name && (
                            <span className="text-[10px] font-mono text-[#A9A7C4] block">
                              Legal: {startup.legalName}
                            </span>
                          )}
                          {startup.city && (
                            <span className="text-[10px] text-[#A9A7C4]/70">
                              {startup.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] bg-white/5 text-[#F3D3A2]">
                          {startup.sector || "General"}
                        </span>
                        {startup.stage && (
                          <div className="text-[10px] text-[#A9A7C4] capitalize">
                            {startup.stage.replace("_", " ")}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {startup.members && startup.members.length > 0 ? (
                          startup.members.map((m) => (
                            <span
                              key={m.userId}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#141522] border border-white/10 text-white"
                            >
                              <Users className="w-2.5 h-2.5 text-[#F3D3A2]" />
                              <span>{m.user.profile?.name || "Member"}</span>
                              {m.roleInStartup && (
                                <span className="text-[#A9A7C4]">({m.roleInStartup})</span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#A9A7C4]">No linked members</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[#A9A7C4]">
                      {new Date(startup.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSourceStartup(startup);
                          setTargetStartupId("");
                          setMergeModalOpen(true);
                        }}
                        className="border-white/15 text-white hover:bg-white/5 text-[11px] h-7 gap-1"
                      >
                        <GitMerge className="w-3 h-3 text-[#F3D3A2]" />
                        <span>Merge</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Merge Modal ── */}
      {mergeModalOpen && sourceStartup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1E1F33] border border-white/15 rounded-2xl p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => {
                setMergeModalOpen(false);
                setSourceStartup(null);
              }}
              className="absolute right-4 top-4 text-[#A9A7C4] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#F3D3A2]">
                <GitMerge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-light text-white">Merge Startup Entity</h3>
                <p className="text-[11px] text-[#A9A7C4]">
                  Resolve duplicate submissions into one canonical profile.
                </p>
              </div>
            </div>

            <form onSubmit={handleMerge} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#141522] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-rose-400">
                  Duplicate Entity (To Be Removed)
                </span>
                <p className="text-xs font-semibold text-white">{sourceStartup.name}</p>
                <p className="text-[11px] text-[#A9A7C4]">
                  {sourceStartup.members.length} team member(s) will be migrated to canonical.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9A7C4] mb-1">
                  Canonical Target Entity (Keep)
                </label>
                <select
                  required
                  value={targetStartupId}
                  onChange={(e) => setTargetStartupId(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-[#141522] border border-white/15 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  <option value="">-- Choose canonical startup --</option>
                  {startups
                    .filter((s) => s.id !== sourceStartup.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.city ? `(${s.city})` : ""}
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-[11px]">
                <strong>Warning:</strong> The duplicate startup profile will be permanently deleted after all affiliated founders and team members are re-associated with the canonical entity.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMergeModalOpen(false);
                    setSourceStartup(null);
                  }}
                  className="border-white/15 text-white hover:bg-white/5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !targetStartupId}
                  className="bg-[#D4AF37] hover:bg-[#c29f30] text-[#12131F] font-semibold text-xs"
                >
                  {submitting ? "Merging..." : "Confirm & Merge"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
