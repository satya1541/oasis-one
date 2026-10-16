"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Download, Shield, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
  ipAddress?: string;
  timestamp: string;
  actor?: {
    id: string;
    name?: string;
    email?: string;
    adminLevel?: string;
  } | null;
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/audit-logs");
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCsv = () => {
    window.open("/api/v1/admin/audit-logs/export", "_blank");
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.actor?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.targetType || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.reason || "").toLowerCase().includes(search.toLowerCase());
    const matchesAction =
      actionFilter === "all" ||
      (actionFilter === "admissions" && log.action.includes("application")) ||
      (actionFilter === "moderation" && log.action.includes("restriction")) ||
      (actionFilter === "export" && log.action.includes("export"));
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 pb-20">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-medium text-white">
                System Audit Trail & Governance Logs
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-[#F3D3A2] font-semibold border border-[#F3D3A2]/30">
                Super Admin Read-Only
              </span>
            </div>
            <p className="text-xs text-[#A9A7C4] mt-1">
              Immutable security log recording all administrator admissions decisions, moderation actions, and CSV data exports.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="border-white/15 text-[#FCF6E3] hover:bg-white/5 gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4 text-[#F3D3A2]" />
            Export Audit CSV
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-[#A9A7C4] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search action, actor, or ref ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-white/10 bg-[#1E1F33] text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#F3D3A2]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {["all", "admissions", "moderation", "export"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActionFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  actionFilter === cat
                    ? "bg-[#F3D3A2] text-[#1E1F33] font-semibold"
                    : "bg-[#1E1F33] text-[#A9A7C4] border border-white/10 hover:text-white"
                }`}
              >
                {cat === "all" ? "All Logs" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Table */}
        <div className="rounded-2xl border border-white/10 bg-[#1E1F33] overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center p-16 text-xs text-[#A9A7C4] gap-2">
              <RotateCw className="w-4 h-4 animate-spin text-[#F3D3A2]" />
              <span>Querying immutable security audit logs...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#A9A7C4]">
              No audit log entries matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141522] text-[#A9A7C4] font-mono uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Action</th>
                    <th className="py-3 px-4 font-semibold">Actor</th>
                    <th className="py-3 px-4 font-semibold">Target Entity</th>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold">IP / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {filteredLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white">{entry.action}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#A9A7C4] font-sans">
                        {entry.actor?.name || entry.actor?.email || "System"}
                      </td>
                      <td className="py-3.5 px-4 text-[#F3D3A2] font-sans font-medium">
                        {entry.targetType} {entry.targetId ? `#${entry.targetId.slice(0, 8)}` : ""}
                      </td>
                      <td className="py-3.5 px-4 text-[#A9A7C4] text-[11px] whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#A9A7C4] font-sans">
                        <div className="font-mono text-[10px] text-[#F3D3A2]/80">
                          {entry.ipAddress || "Internal"}
                        </div>
                        <div className="line-clamp-1">{entry.reason || "Action logged"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
}
