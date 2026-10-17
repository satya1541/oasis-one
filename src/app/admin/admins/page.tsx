"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Shield,
  ShieldCheck,
  UserPlus,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Mail,
  UserCheck,
  UserX,
  X,
  Lock,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  adminLevel: "super_admin" | "moderator";
  accountStatus: string;
  lastLoginAt: string | null;
  profile?: {
    name: string;
  };
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserLevel, setCurrentUserLevel] = useState<string | null>(null);

  // Invite / Promote Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"super_admin" | "moderator">("moderator");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Edit / Revoke Modal State
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<"super_admin" | "moderator">("moderator");

  const fetchAdminsAndMe = async () => {
    try {
      setLoading(true);
      const [meRes, adminsRes] = await Promise.all([
        fetch("/api/v1/auth/me"),
        fetch("/api/v1/admin/admins"),
      ]);

      if (meRes.ok) {
        const meJson = await meRes.json();
        setCurrentUserId(meJson.data?.id || null);
        setCurrentUserLevel(meJson.data?.adminLevel || null);
      }

      if (adminsRes.ok) {
        const adminsJson = await adminsRes.json();
        const list = Array.isArray(adminsJson.data) ? adminsJson.data : (adminsJson.data?.items || []);
        setAdmins(list);
      } else if (adminsRes.status === 403) {
        setFeedback({
          type: "error",
          message: "Access restricted: Only Super Administrators can view and manage committee credentials.",
        });
      }
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminsAndMe();
  }, []);

  const handleCreateOrPromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          name: inviteName.trim(),
          adminLevel: inviteRole,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          message: json.error?.message || "Failed to grant admin privileges",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: `Administrative credentials generated for ${inviteEmail}. Setup link dispatched with mandatory MFA enrollment.`,
      });
      setInviteModalOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("moderator");
      await fetchAdminsAndMe();
      setTimeout(() => setFeedback(null), 7000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to grant administrator access" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async (targetAdmin: AdminUser, role: "super_admin" | "moderator") => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/admin/admins/${targetAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminLevel: role }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error?.message || "Failed to update admin role");
        return;
      }

      setFeedback({
        type: "success",
        message: `Updated role for ${targetAdmin.email} to ${role.replace("_", " ")}.`,
      });
      setRoleChangeModalOpen(false);
      setSelectedAdmin(null);
      await fetchAdminsAndMe();
      setTimeout(() => setFeedback(null), 6000);
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeAdmin = async (targetAdmin: AdminUser) => {
    const confirmed = window.confirm(
      `Are you sure you want to revoke administrative access for ${targetAdmin.profile?.name || targetAdmin.email}? They will immediately lose access to the Admin Console.`
    );
    if (!confirmed) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/admin/admins/${targetAdmin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminLevel: null }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error?.message || "Failed to revoke admin privileges");
        return;
      }

      setFeedback({
        type: "success",
        message: `Revoked administrative privileges for ${targetAdmin.email}.`,
      });
      await fetchAdminsAndMe();
      setTimeout(() => setFeedback(null), 6000);
    } catch (err: any) {
      alert(err.message || "Failed to revoke admin privileges");
    } finally {
      setSubmitting(false);
    }
  };

  if (currentUserLevel && currentUserLevel !== "super_admin") {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-display text-2xl font-light text-white">Super Administrator Access Required</h1>
        <p className="text-xs text-[#A9A7C4]">
          Committee credential provisioning and administrator access control are reserved exclusively for Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-light text-white tracking-tight">
              Administrator &amp; Committee Governance
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#D4AF37]/20 text-[#F3D3A2] border border-[#D4AF37]/40">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs text-[#A9A7C4] mt-1">
            Provision console access, delegate moderation roles, and enforce security policies.
          </p>
        </div>

        <Button
          onClick={() => setInviteModalOpen(true)}
          className="bg-[#D4AF37] hover:bg-[#c29f30] text-[#12131F] font-semibold text-xs flex items-center gap-2 rounded-xl"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision Administrator</span>
        </Button>
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

      {/* Role Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-[#1E1F33] border-white/10">
          <div className="flex items-center gap-2 text-[#F3D3A2] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono">Super Administrator</h3>
          </div>
          <p className="text-[11px] text-[#A9A7C4] leading-relaxed">
            Full root authority. Manages legal document versions, committee users, settings, tag merges, member role overrides, account revocations/blacklists, and accesses raw immutable audit logs.
          </p>
        </Card>

        <Card className="p-4 bg-[#1E1F33] border-white/10">
          <div className="flex items-center gap-2 text-indigo-300 mb-1">
            <Shield className="w-4 h-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono">Moderator</h3>
          </div>
          <p className="text-[11px] text-[#A9A7C4] leading-relaxed">
            Day-to-day operations. Reviews applications, moderates posts, replies, and achievements, issues initial member warnings and suspensions, manages community events, and reviews member profile change requests.
          </p>
        </Card>
      </div>

      {/* Admins Table */}
      <Card className="border-white/10 bg-[#1E1F33] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-xs text-[#A9A7C4] gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[#F3D3A2]" />
            <span>Loading administrative registry...</span>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A9A7C4]">
            No administrators found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#A9A7C4] uppercase font-mono text-[10px] tracking-wider bg-[#141522]/50">
                  <th className="py-3 px-4 font-semibold">Administrator</th>
                  <th className="py-3 px-4 font-semibold">Role Tier</th>
                  <th className="py-3 px-4 font-semibold">Account Status</th>
                  <th className="py-3 px-4 font-semibold">Last Console Activity</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {admins.map((admin) => {
                  const isSelf = admin.id === currentUserId;
                  const isSuper = admin.adminLevel === "super_admin";
                  return (
                    <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#141522] border border-white/10 flex items-center justify-center font-display font-medium text-xs text-[#F3D3A2]">
                            {(admin.profile?.name || admin.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white flex items-center gap-1.5">
                              <span>{admin.profile?.name || "Committee User"}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/10 text-[#F3D3A2]">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-[#A9A7C4]">
                              {admin.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold border",
                            isSuper
                              ? "bg-[#D4AF37]/15 text-[#F3D3A2] border-[#D4AF37]/30"
                              : "bg-indigo-950/60 text-indigo-300 border-indigo-800"
                          )}
                        >
                          {isSuper ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          <span>{admin.adminLevel.replace("_", " ")}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold",
                            admin.accountStatus === "active"
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800"
                              : "bg-amber-950/60 text-amber-300 border border-amber-800"
                          )}
                        >
                          {admin.accountStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#A9A7C4]">
                        {admin.lastLoginAt
                          ? new Date(admin.lastLoginAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never signed in"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setNewRole(admin.adminLevel);
                              setRoleChangeModalOpen(true);
                            }}
                            className="border-white/15 text-white hover:bg-white/5 text-[11px] h-8"
                          >
                            Change Role
                          </Button>
                          {!isSelf && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeAdmin(admin)}
                              className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-[11px] h-8"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Provision / Promote Admin Modal ── */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1E1F33] border border-white/15 rounded-2xl p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="absolute right-4 top-4 text-[#A9A7C4] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#F3D3A2]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-light text-white">Provision Administrator</h3>
                <p className="text-[11px] text-[#A9A7C4]">
                  Grants administrative authority and triggers mandatory MFA onboarding.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateOrPromoteAdmin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9A7C4] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full h-10 px-3 text-xs bg-[#141522] border border-white/15 rounded-xl text-white placeholder:text-[#A9A7C4]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9A7C4] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-10 px-3 text-xs bg-[#141522] border border-white/15 rounded-xl text-white placeholder:text-[#A9A7C4]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
                <span className="text-[10px] text-[#A9A7C4] mt-1 block">
                  If the user already exists in OASIS, their existing account will be elevated.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9A7C4] mb-1">
                  Administrative Tier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteRole("moderator")}
                    className={cn(
                      "p-3 rounded-xl border text-left text-xs transition-colors",
                      inviteRole === "moderator"
                        ? "bg-indigo-950/60 border-indigo-500 text-white font-medium"
                        : "bg-[#141522] border-white/10 text-[#A9A7C4] hover:text-white"
                    )}
                  >
                    <div className="font-semibold text-indigo-300">Moderator</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Reviews queue &amp; posts</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInviteRole("super_admin")}
                    className={cn(
                      "p-3 rounded-xl border text-left text-xs transition-colors",
                      inviteRole === "super_admin"
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-white font-medium"
                        : "bg-[#141522] border-white/10 text-[#A9A7C4] hover:text-white"
                    )}
                  >
                    <div className="font-semibold text-[#F3D3A2]">Super Admin</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Full governance &amp; root</div>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteModalOpen(false)}
                  className="border-white/15 text-white hover:bg-white/5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#D4AF37] hover:bg-[#c29f30] text-[#12131F] font-semibold text-xs"
                >
                  {submitting ? "Dispatching..." : "Send Admin Invitation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Role Change Modal ── */}
      {roleChangeModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#1E1F33] border border-white/15 rounded-2xl p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => {
                setRoleChangeModalOpen(false);
                setSelectedAdmin(null);
              }}
              className="absolute right-4 top-4 text-[#A9A7C4] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-base font-light text-white mb-1">
              Modify Administrative Role
            </h3>
            <p className="text-xs text-[#A9A7C4] mb-4">
              Updating permissions for <strong className="text-white">{selectedAdmin.email}</strong>.
            </p>

            <div className="space-y-3">
              <label className="block text-[11px] font-mono uppercase text-[#A9A7C4]">
                Select New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full h-10 px-3 text-xs bg-[#141522] border border-white/15 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                <option value="moderator">Moderator</option>
                <option value="super_admin">Super Administrator</option>
              </select>

              <div className="pt-3 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRoleChangeModalOpen(false);
                    setSelectedAdmin(null);
                  }}
                  className="border-white/15 text-white hover:bg-white/5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleUpdateRole(selectedAdmin, newRole)}
                  className="bg-[#D4AF37] hover:bg-[#c29f30] text-[#12131F] font-semibold text-xs"
                >
                  {submitting ? "Updating..." : "Save Role"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
