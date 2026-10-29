"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  UserCheck,
  UserX,
  UserCog,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  X,
  FileEdit,
  Clock,
  Sparkles,
  ChevronDown,
  Eye,
  FileText,
  ExternalLink,
  Globe,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
    </svg>
  );
}

interface MemberRecord {
  id: string;
  name?: string | null;
  email: string;
  role?: string | null;
  status: string;
  adminLevel?: string | null;
  mentorVerified?: boolean;
  createdAt: string;
}

interface ProfileChangeRequest {
  id: string;
  userId: string;
  fieldKey: string;
  proposedValue: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    profile?: {
      name: string;
    };
  };
}

export default function AdminMembersPage() {
  const [activeTab, setActiveTab] = useState<"members" | "profile_changes">("members");
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [profileChanges, setProfileChanges] = useState<ProfileChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentUserLevel, setCurrentUserLevel] = useState<string | null>(null);

  // Restriction Drawer State
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [restrictionType, setRestrictionType] = useState<"warning" | "suspension" | "revocation" | "blacklist">("warning");
  const [restrictionReason, setRestrictionReason] = useState("");
  const [restrictionDrawerOpen, setRestrictionDrawerOpen] = useState(false);

  // Role Change Modal State (Super Admin Only)
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<"founder" | "mentor" | "aspiring_entrepreneur">("founder");

  // Member Full Details & Documents Modal State
  const [viewingMember, setViewingMember] = useState<any | null>(null);
  const [memberDocs, setMemberDocs] = useState<any[]>([]);
  const [loadingMemberDocs, setLoadingMemberDocs] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meRes, membersRes, changesRes] = await Promise.all([
        fetch("/api/v1/auth/me"),
        fetch("/api/v1/admin/members"),
        fetch("/api/v1/admin/profile-changes"),
      ]);

      if (meRes.ok) {
        const meJson = await meRes.json();
        setCurrentUserLevel(meJson.data?.adminLevel || null);
      }

      if (membersRes.ok) {
        const json = await membersRes.json();
        const list = Array.isArray(json.data) ? json.data : (json.data?.items || []);
        setMembers(list.filter((m: any) => m.adminLevel !== "super_admin"));
      }

      if (changesRes.ok) {
        const changesJson = await changesRes.json();
        const list = Array.isArray(changesJson.data) ? changesJson.data : (changesJson.data?.items || []);
        setProfileChanges(list);
      }
    } catch (err) {
      console.error("Failed to fetch member data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMemberDetails = async (member: MemberRecord) => {
    try {
      setSelectedMember(member);
      setDetailsModalOpen(true);
      setLoadingMemberDocs(true);
      const res = await fetch(`/api/v1/admin/members/${member.id}`);
      if (res.ok) {
        const json = await res.json();
        setViewingMember(json.data);
        setMemberDocs(json.data?.documents || []);
      }
    } catch (e) {
      console.error("Failed to load member profile details:", e);
    } finally {
      setLoadingMemberDocs(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyRestriction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !restrictionReason.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/admin/members/${selectedMember.id}/restrictions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: restrictionType,
          reason: restrictionReason.trim(),
        }),
      });

      const errJson = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          message: errJson.error?.message || "Failed to issue restriction",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: `Successfully issued ${restrictionType} enforcement against ${selectedMember.name || "member"}.`,
      });
      setRestrictionDrawerOpen(false);
      setRestrictionReason("");
      await fetchData();
      setTimeout(() => setFeedback(null), 6000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to apply restriction" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/admin/members/${selectedMember.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          message: json.error?.message || "Failed to reassign role",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: `Successfully updated ${selectedMember.name || "member"}'s role to ${(newRole || "founder").replace(/_/g, " ")}.`,
      });
      setRoleChangeModalOpen(false);
      setSelectedMember(null);
      await fetchData();
      setTimeout(() => setFeedback(null), 6000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to change role" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMentorVerification = async (member: MemberRecord) => {
    const nextStatus = !member.mentorVerified;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/admin/members/${member.id}/mentor-verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: nextStatus }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          message: json.error?.message || "Failed to update mentor verification",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: nextStatus
          ? `Granted Verified Mentor status to ${member.name || "member"}.`
          : `Revoked Verified Mentor status for ${member.name || "member"}.`,
      });
      await fetchData();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Action failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileChangeDecision = async (id: string, decision: "approve" | "reject") => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/admin/profile-changes/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          message: json.error?.message || `Failed to ${decision} profile change`,
        });
        return;
      }

      setFeedback({
        type: "success",
        message: `Profile change request ${decision}d successfully.`,
      });
      await fetchData();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to process decision" });
    } finally {
      setSubmitting(false);
    }
  };

  const isSuperAdmin = currentUserLevel === "super_admin";

  const filteredMembers = members.filter((m) => {
    if (m.adminLevel === "super_admin") return false;
    const nameStr = m.name || "";
    const emailStr = m.email || "";
    const matchesSearch =
      nameStr.toLowerCase().includes(search.toLowerCase()) ||
      emailStr.toLowerCase().includes(search.toLowerCase());
    const memberRole = m.role || "member";
    const matchesRole = roleFilter === "all" || memberRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-light text-white tracking-tight">
            Member Governance &amp; Safety
          </h1>
          <p className="text-xs text-[#A9A7C4] mt-1">
            Manage member lifecycle, verify mentors, execute progressive sanctions, and approve profile modifications.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#1E1F33] border border-white/10 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
              activeTab === "members"
                ? "bg-[#D4AF37] text-[#12131F] font-semibold"
                : "text-[#A9A7C4] hover:text-white"
            )}
          >
            Members ({members.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("profile_changes")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5",
              activeTab === "profile_changes"
                ? "bg-[#D4AF37] text-[#12131F] font-semibold"
                : "text-[#A9A7C4] hover:text-white"
            )}
          >
            <span>Profile Changes</span>
            {profileChanges.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white">
                {profileChanges.length}
              </span>
            )}
          </button>
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

      {activeTab === "members" ? (
        <>
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A9A7C4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member name or email..."
                className="w-full h-11 pl-10 pr-4 text-xs bg-[#1E1F33] border border-white/10 rounded-xl text-white placeholder:text-[#A9A7C4]/60 focus:outline-none focus:ring-1 focus:ring-[#F3D3A2]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#A9A7C4]" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-11 px-3 text-xs rounded-xl bg-[#1E1F33] border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#F3D3A2] cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="founder">Founders</option>
                <option value="mentor">Mentors</option>
                <option value="aspiring_entrepreneur">Aspiring</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <Card className="border-white/10 bg-[#1E1F33] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-16 text-xs text-[#A9A7C4] gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-[#F3D3A2]" />
                <span>Loading member registry...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#A9A7C4]">
                No members found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[#A9A7C4] uppercase font-mono text-[10px] tracking-wider bg-[#141522]/50">
                      <th className="py-3 px-4 font-semibold">Member</th>
                      <th className="py-3 px-4 font-semibold">Role &amp; Verification</th>
                      <th className="py-3 px-4 font-semibold">Account Status</th>
                      <th className="py-3 px-4 font-semibold">Joined Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#141522] border border-white/10 flex items-center justify-center font-display font-medium text-xs text-[#F3D3A2]">
                              {(member.name || member.email || "Member").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-white flex items-center gap-1.5">
                                {member.name || "Member"}
                                {member.mentorVerified && (
                                  <span title="Verified Mentor">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#F3D3A2]" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-[#A9A7C4]">
                                {member.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="capitalize text-white">
                              {(member.role || "member").replace(/_/g, " ")}
                            </span>
                            {member.role === "mentor" && (
                              <button
                                type="button"
                                disabled={submitting}
                                onClick={() => handleToggleMentorVerification(member)}
                                title={member.mentorVerified ? "Click to revoke verification" : "Click to grant mentor verification badge"}
                                className={cn(
                                  "px-2 py-0.5 rounded text-[9px] font-mono border transition-colors",
                                  member.mentorVerified
                                    ? "bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#F3D3A2]"
                                    : "bg-white/5 border-white/10 text-[#A9A7C4] hover:text-white"
                                )}
                              >
                                {member.mentorVerified ? "Verified" : "+ Verify"}
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold",
                              (member.status || "active") === "active"
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800"
                                : member.status === "warned"
                                ? "bg-amber-950/60 text-amber-300 border border-amber-800"
                                : "bg-rose-950/60 text-rose-400 border border-rose-800"
                            )}
                          >
                            {member.status || "active"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[#A9A7C4]">
                          {member.createdAt
                            ? new Date(member.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenMemberDetails(member)}
                              className="border-white/15 text-[#88DECC] hover:bg-[#88DECC]/10 text-[11px] h-7 gap-1"
                            >
                              <Eye className="w-3 h-3 text-[#88DECC]" />
                              <span>Profile &amp; Vault</span>
                            </Button>
                            {isSuperAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setNewRole((member.role as any) || "founder");
                                  setRoleChangeModalOpen(true);
                                }}
                                className="border-white/15 text-white hover:bg-white/5 text-[11px] h-7 gap-1"
                              >
                                <UserCog className="w-3 h-3 text-[#F3D3A2]" />
                                <span>Role</span>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMember(member);
                                setRestrictionDrawerOpen(true);
                              }}
                              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-[11px] h-7"
                            >
                              Enforce Safety
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : (
        /* Pending Profile Changes Tab */
        <Card className="border-white/10 bg-[#1E1F33] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-16 text-xs text-[#A9A7C4] gap-2">
              <RotateCw className="w-4 h-4 animate-spin text-[#F3D3A2]" />
              <span>Loading profile change queue...</span>
            </div>
          ) : profileChanges.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#A9A7C4] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-medium text-white">No pending profile changes</p>
              <p className="text-[11px]">All member headline, bio, and identity modifications are up to date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#A9A7C4] uppercase font-mono text-[10px] tracking-wider bg-[#141522]/50">
                    <th className="py-3 px-4 font-semibold">Member</th>
                    <th className="py-3 px-4 font-semibold">Field Modified</th>
                    <th className="py-3 px-4 font-semibold">Proposed Value</th>
                    <th className="py-3 px-4 font-semibold">Submitted</th>
                    <th className="py-3 px-4 font-semibold text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profileChanges.map((change) => (
                    <tr key={change.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">
                          {change.user.profile?.name || "Member"}
                        </div>
                        <span className="text-[11px] font-mono text-[#A9A7C4]">
                          {change.user.email}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-white/5 text-[#F3D3A2] uppercase">
                          {change.fieldKey}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="max-w-md p-2 rounded-lg bg-[#141522] border border-white/10 font-mono text-xs text-white">
                          {change.proposedValue}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#A9A7C4]">
                        {new Date(change.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={submitting}
                            onClick={() => handleProfileChangeDecision(change.id, "reject")}
                            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-[11px] h-7"
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            disabled={submitting}
                            onClick={() => handleProfileChangeDecision(change.id, "approve")}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7"
                          >
                            Approve
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── Role Change Modal (Super Admin Only) ── */}
      {roleChangeModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#1E1F33] border border-white/15 rounded-2xl p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => {
                setRoleChangeModalOpen(false);
                setSelectedMember(null);
              }}
              className="absolute right-4 top-4 text-[#A9A7C4] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-base font-light text-white mb-1">
              Reassign Member Role
            </h3>
            <p className="text-xs text-[#A9A7C4] mb-4">
              Updating primary community standing for <strong className="text-white">{selectedMember.name || selectedMember.email}</strong>.
            </p>

            <form onSubmit={handleChangeRole} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9A7C4] mb-1">
                  Primary Community Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs bg-[#141522] border border-white/15 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  <option value="founder">Founder</option>
                  <option value="mentor">Mentor / Advisor</option>
                  <option value="aspiring_entrepreneur">Aspiring Entrepreneur</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRoleChangeModalOpen(false);
                    setSelectedMember(null);
                  }}
                  className="border-white/15 text-white hover:bg-white/5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#D4AF37] hover:bg-[#c29f30] text-[#12131F] font-semibold text-xs"
                >
                  {submitting ? "Updating..." : "Save Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Restriction Drawer / Modal ── */}
      {restrictionDrawerOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#1E1F33] border border-white/15 rounded-2xl p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setRestrictionDrawerOpen(false)}
              className="absolute right-4 top-4 text-[#A9A7C4] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-light text-white">
                  Issue Progressive Enforcement
                </h3>
                <p className="text-[11px] text-[#A9A7C4]">
                  Enforce safety policy against <strong className="text-white">{selectedMember.name || selectedMember.email}</strong> ({selectedMember.email}).
                </p>
              </div>
            </div>

            <form onSubmit={handleApplyRestriction} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9A7C4] mb-1">
                  Enforcement Action Level
                </label>
                <select
                  value={restrictionType}
                  onChange={(e) => setRestrictionType(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs bg-[#141522] border border-white/15 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                >
                  <option value="warning">Formal Warning (Logged to Member History)</option>
                  <option value="suspension">Temporary Account Suspension</option>
                  <option value="revocation" disabled={!isSuperAdmin}>
                    Permanent Revocation {!isSuperAdmin ? "(Super Admin Only)" : ""}
                  </option>
                  <option value="blacklist" disabled={!isSuperAdmin}>
                    Blacklist Identity &amp; Device {!isSuperAdmin ? "(Super Admin Only)" : ""}
                  </option>
                </select>
                {!isSuperAdmin && (
                  <span className="text-[10px] text-[#A9A7C4] mt-1 block">
                    Revocations and blacklisting require Super Administrator credentials per PRD §10.2.
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono uppercase text-[#A9A7C4]">
                    Justification / Reason (min 10 chars)
                  </label>
                  <span className="text-[10px] font-mono text-[#A9A7C4]">
                    {restrictionReason.length}/10 chars
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={restrictionReason}
                  onChange={(e) => setRestrictionReason(e.target.value)}
                  placeholder="Provide specific incident description, reported content link, or community guideline violation..."
                  className="w-full p-3 font-mono text-xs bg-[#141522] border border-white/15 rounded-xl text-white placeholder:text-[#A9A7C4]/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRestrictionDrawerOpen(false)}
                  className="border-white/15 text-white hover:bg-white/5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || restrictionReason.trim().length < 10}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
                >
                  {submitting ? "Applying..." : "Confirm Action"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Member Profile & Document Vault Modal ──────────────────────── */}
      {detailsModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12131F] border border-white/15 rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => {
                setDetailsModalOpen(false);
                setViewingMember(null);
                setMemberDocs([]);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-[#A9A7C4] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingMemberDocs ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-[#A9A7C4]">
                <RotateCw className="w-6 h-6 animate-spin text-[#F3D3A2]" />
                <span>Loading member profile &amp; documents vault...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4 border-b border-white/10 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#1E1F33] border border-white/15 flex items-center justify-center font-display font-medium text-lg text-[#F3D3A2] overflow-hidden shrink-0">
                    {viewingMember?.profile?.profilePhotoUrl ? (
                      <img
                        src={viewingMember.profile.profilePhotoUrl}
                        alt={selectedMember.name || "Member"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (selectedMember.name || selectedMember.email || "Member").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg sm:text-xl font-medium text-white flex items-center gap-2">
                      {selectedMember.name || "Member"}
                      {selectedMember.mentorVerified && (
                        <ShieldCheck className="w-4 h-4 text-[#F3D3A2]" />
                      )}
                    </h3>
                    <p className="text-xs text-[#A9A7C4] font-mono mt-0.5">{selectedMember.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-white font-semibold">
                        {(selectedMember.role || "member").replace(/_/g, " ")}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-950/70 text-emerald-300 border border-emerald-800">
                        {selectedMember.status || "active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Headline & Bio */}
                <div className="space-y-3 bg-[#1A1B2C] p-4 rounded-2xl border border-white/5 text-xs">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#A9A7C4] tracking-wider block font-semibold">
                      Headline
                    </span>
                    <p className="text-white mt-0.5">
                      {viewingMember?.profile?.headline || "No headline provided."}
                    </p>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#A9A7C4] tracking-wider block font-semibold">
                      Founder Bio
                    </span>
                    <p className="text-[#ECF1EF]/80 mt-1 leading-relaxed whitespace-pre-line">
                      {viewingMember?.profile?.bio || "No bio submitted yet."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 text-[11px]">
                    <div>
                      <span className="text-[#A9A7C4] block">Location:</span>
                      <span className="text-white">
                        {[viewingMember?.profile?.city, viewingMember?.profile?.state, viewingMember?.profile?.country]
                          .filter(Boolean)
                          .join(", ") || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#A9A7C4] block">Phone:</span>
                      <span className="text-white font-mono">{viewingMember?.phone || "Not provided"}</span>
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px]">
                    {viewingMember?.profile?.linkedinUrl && (
                      <a
                        href={viewingMember.profile.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#88DECC] hover:underline flex items-center gap-1"
                      >
                        <LinkedinIcon className="w-3 h-3" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {viewingMember?.profile?.websiteUrl && (
                      <a
                        href={viewingMember.profile.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#F3D3A2] hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>Website / Deck</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Member Uploaded Documents Vault */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-medium text-sm text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#F3D3A2]" />
                      Member Documents Vault ({memberDocs.length})
                    </h4>
                    <span className="text-[10px] font-mono text-[#A9A7C4]">
                      Accessible by Admins &amp; Superadmins
                    </span>
                  </div>

                  {memberDocs.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-[#1A1B2C] border border-white/5 text-center text-xs text-[#A9A7C4]">
                      No verification or identity documents uploaded by this member yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {memberDocs.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#1A1B2C] border border-white/10 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-[#F3D3A2] shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-white truncate max-w-xs">{doc.filename}</p>
                              <p className="text-[10px] font-mono text-[#A9A7C4] mt-0.5">
                                {(doc.sizeBytes / 1024).toFixed(1)} KB •{" "}
                                {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <a
                            href={doc.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#88DECC] text-[11px] font-medium transition-colors shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View / Download</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDetailsModalOpen(false);
                      setViewingMember(null);
                      setMemberDocs([]);
                    }}
                    className="border-white/15 text-white hover:bg-white/5 text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
