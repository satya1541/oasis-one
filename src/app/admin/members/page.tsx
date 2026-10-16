"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldOff,
  UserCheck,
  UserX,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  X,
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

export default function AdminMembersPage() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);

  // Restriction Drawer State
  const [restrictionType, setRestrictionType] = useState<"warning" | "suspension" | "revocation">("warning");
  const [restrictionReason, setRestrictionReason] = useState("");
  const [restrictionDrawerOpen, setRestrictionDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/members");
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (json.data?.items || []);
        setMembers(list);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
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

      if (!res.ok) {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to issue restriction");
        return;
      }

      setActionSuccess(`Successfully issued ${restrictionType} against ${selectedMember.name}`);
      setRestrictionDrawerOpen(false);
      setRestrictionReason("");
      await fetchMembers();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to apply restriction");
    } finally {
      setSubmitting(false);
    }
  };

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
              Member Governance & Safety
            </h1>
            <p className="text-xs text-[#A9A7C4] mt-1">
              Oversee account lifecycles, role permissions, and progressive enforcement actions.
            </p>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

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
                    <th className="py-3 px-4 font-semibold">Role</th>
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
                                <Shield className="w-3.5 h-3.5 text-[#F3D3A2]" />
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-[#A9A7C4]">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-white">
                          {member.role.replace("_", " ")}
                        </span>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMember(member);
                            setRestrictionDrawerOpen(true);
                          }}
                          className="border-white/15 text-white hover:bg-white/5 text-[11px]"
                        >
                          Enforce Safety
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Restriction Modal/Drawer */}
        {restrictionDrawerOpen && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-[#1E1F33] border border-white/10 rounded-2xl p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-display text-base font-medium text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  Issue Safety Restriction: {selectedMember.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setRestrictionDrawerOpen(false)}
                  className="text-[#A9A7C4] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApplyRestriction} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#A9A7C4] mb-1">
                    Enforcement Action Level
                  </label>
                  <select
                    value={restrictionType}
                    onChange={(e) => setRestrictionType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#141522] text-white focus:outline-none"
                  >
                    <option value="warning">Formal Warning (Logged to Member Record)</option>
                    <option value="suspension">Temporary Account Suspension</option>
                    <option value="revocation">Permanent Revocation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#A9A7C4] mb-1">
                    Justification / Reason (min 10 chars)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={restrictionReason}
                    onChange={(e) => setRestrictionReason(e.target.value)}
                    placeholder="Provide specific incident description, reported content link, or community guideline violation..."
                    className="w-full p-3 rounded-xl border border-white/10 bg-[#141522] text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setRestrictionDrawerOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting || restrictionReason.trim().length < 10}
                    className="bg-amber-600 hover:bg-amber-500 text-white"
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
