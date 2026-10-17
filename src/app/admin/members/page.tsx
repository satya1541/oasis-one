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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
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
        setMembers(list);
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
        message: `Successfully issued ${restrictionType} enforcement against ${selectedMember.name}.`,
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
        message: `Successfully updated ${selectedMember.name}'s role to ${newRole.replace("_", " ")}.`,
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
          ? `Granted Verified Mentor status to ${member.name}.`
          : `Revoked Verified Mentor status for ${member.name}.`,
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
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
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
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-white flex items-center gap-1.5">
                                {member.name}
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
                              {member.role.replace("_", " ")}
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
                              member.status === "active"
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800"
                                : member.status === "warned"
                                ? "bg-amber-950/60 text-amber-300 border border-amber-800"
                                : "bg-rose-950/60 text-rose-400 border border-rose-800"
                            )}
                          >
                            {member.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[#A9A7C4]">
                          {new Date(member.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isSuperAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMember(member);
                                  setNewRole(member.role as any);
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
              Updating primary community standing for <strong className="text-white">{selectedMember.name}</strong>.
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
                  Enforce safety policy against <strong className="text-white">{selectedMember.name}</strong> ({selectedMember.email}).
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
    </div>
  );
}
