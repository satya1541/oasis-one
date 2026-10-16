"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Upload, Users, CheckCircle2, AlertTriangle, RefreshCw, Send, Check, RotateCw } from "lucide-react";

interface InviteItem {
  id: string;
  email: string;
  name?: string;
  preApprovedRole: string;
  status: "pending" | "used" | "expired";
  createdAt: string;
  expiresAt: string;
}

export default function AdminMigrationPage() {
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [inviteResentId, setInviteResentId] = useState<string | null>(null);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/invites");
      if (res.ok) {
        const json = await res.json();
        setInvites(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch invites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const total = invites.length;
  const claimedCount = invites.filter((i) => i.status === "used").length;
  const adoptionRate = total > 0 ? Math.round((claimedCount / total) * 100) : 0;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/admin/invites/import", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        setImportResult(json.data);
        await fetchInvites();
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to import CSV");
      }
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/invites/${id}/resend`, {
        method: "POST",
      });
      if (res.ok) {
        setInviteResentId(id);
        setTimeout(() => setInviteResentId(null), 3000);
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to resend invite");
      }
    } catch (err: any) {
      alert(err.message || "Failed to resend invite");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-light text-white tracking-tight">
          Batch Migration & Member Invitations
        </h1>
        <p className="text-xs text-[#A9A7C4] mt-1">
          Import verified cohort lists via CSV with cryptographic tokens, track enrollment progress, and resend invites.
        </p>
      </div>

      {/* Target Progress Bar */}
      <Card className="p-6 bg-[#1E1F33] border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#A9A7C4]">
              Odisha Ecosystem Migration Progress
            </div>
            <div className="text-xl font-display font-medium text-white mt-1">
              {adoptionRate}% <span className="text-xs font-sans text-[#A9A7C4] font-normal">({claimedCount} of {total} invitations activated)</span>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#141522] border border-white/10 text-[#F3D3A2]">
            Target: 60% Cohort Onboarding
          </span>
        </div>

        <div className="w-full bg-[#141522] h-2.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-[#F3D3A2] to-[#D4A373] h-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(adoptionRate, 2))}%` }}
          />
        </div>
      </Card>

      {/* Upload Box */}
      <Card className="p-6 bg-[#1E1F33] border-white/10">
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-[#141522]/50 text-center space-y-3">
          <Upload className="w-8 h-8 text-[#F3D3A2]" />
          <div>
            <h3 className="text-sm font-medium text-white">Upload Member Roster CSV</h3>
            <p className="text-xs text-[#A9A7C4] mt-1 max-w-md">
              CSV file must contain columns: <code className="font-mono text-[#F3D3A2]">email</code>, <code className="font-mono text-[#F3D3A2]">name</code>, <code className="font-mono text-[#F3D3A2]">role</code> (founder / mentor / aspiring).
            </p>
          </div>
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3D3A2] text-[#141522] text-xs font-semibold rounded-xl hover:bg-[#F3D3A2]/90 transition-colors">
              {uploading ? <RotateCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{uploading ? "Processing CSV..." : "Select CSV File"}</span>
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {importResult && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Import Completed: {importResult.imported} invitations created</span>
            </div>
            {importResult.skipped > 0 && (
              <div className="text-[#A9A7C4]">
                Skipped {importResult.skipped} duplicate or invalid rows.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Invitations Table */}
      <Card className="bg-[#1E1F33] border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between text-xs text-[#A9A7C4]">
          <span className="font-medium text-white">Active & Dispatched Invitations</span>
          <span>{invites.length} Total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-xs text-[#A9A7C4] gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[#F3D3A2]" />
            <span>Loading invitations registry...</span>
          </div>
        ) : invites.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A9A7C4]">
            No batch invitations dispatched yet. Upload a CSV file above to invite ecosystem members.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#A9A7C4] uppercase font-mono text-[10px] tracking-wider bg-[#141522]/50">
                  <th className="py-3 px-4 font-semibold">Recipient</th>
                  <th className="py-3 px-4 font-semibold">Pre-Approved Role</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Expires</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invites.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{inv.name || "Member"}</div>
                      <span className="text-[11px] font-mono text-[#A9A7C4]">{inv.email}</span>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-white">{inv.preApprovedRole.replace("_", " ")}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        inv.status === "used"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800"
                          : inv.status === "expired"
                          ? "bg-rose-950/60 text-rose-400 border border-rose-800"
                          : "bg-amber-950/60 text-amber-300 border border-amber-800"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#A9A7C4]">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {inv.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResendInvite(inv.id)}
                          className="text-xs text-[#F3D3A2] gap-1 cursor-pointer"
                        >
                          {inviteResentId === inv.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Sent</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Resend</span>
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
