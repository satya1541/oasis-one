"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Download,
  Shield,
  RotateCw,
  Cloud,
  Archive,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Clock,
  FileText,
} from "lucide-react";
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

interface S3ArchiveItem {
  id: string;
  s3Key: string;
  timestamp: string;
  reason?: string;
  metadata?: {
    s3Key?: string;
    archivedCount?: number;
    cutoffDate?: string;
    fileSizeBytes?: number;
  };
  downloadUrl?: string | null;
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  // S3 Archive State
  const [archiving, setArchiving] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archivesList, setArchivesList] = useState<S3ArchiveItem[]>([]);
  const [loadingArchives, setLoadingArchives] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

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

  const fetchArchives = async () => {
    try {
      setLoadingArchives(true);
      const res = await fetch("/api/v1/admin/audit-logs/archives");
      if (res.ok) {
        const json = await res.json();
        setArchivesList(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch S3 archives:", err);
    } finally {
      setLoadingArchives(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCsv = () => {
    window.open("/api/v1/admin/audit-logs/export", "_blank");
  };

  const handleTriggerS3Archive = async () => {
    if (!window.confirm("Archive all audit logs older than 7 days to AWS S3 and purge them from the active MySQL database?")) {
      return;
    }

    try {
      setArchiving(true);
      const res = await fetch("/api/v1/admin/audit-logs/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retentionDays: 7 }),
      });

      const json = await res.json();
      if (res.ok) {
        setNotice({
          type: "success",
          message: json.data?.message || "Successfully archived 7-day logs to AWS S3.",
        });
        await fetchLogs();
        setTimeout(() => setNotice(null), 6000);
      } else {
        setNotice({
          type: "error",
          message: json.error?.message || "Failed to trigger S3 archive",
        });
      }
    } catch (err: any) {
      setNotice({
        type: "error",
        message: err.message || "Failed to trigger S3 archive",
      });
    } finally {
      setArchiving(false);
    }
  };

  const handleOpenArchivesModal = () => {
    setArchiveModalOpen(true);
    fetchArchives();
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
      (actionFilter === "export" && log.action.includes("export")) ||
      (actionFilter === "s3" && log.action.includes("s3"));
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-medium text-white">
              System Audit Trail &amp; Governance Logs
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-[#F3D3A2] font-semibold border border-[#F3D3A2]/30">
              Super Admin Read-Only
            </span>
          </div>
          <p className="text-xs text-[#A9A7C4] mt-1">
            Automated 7-day active window with persistent cold storage archiving to AWS S3. Records all administrator admissions decisions, moderation, and data exports.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenArchivesModal}
            className="border-white/15 text-[#88DECC] hover:bg-[#88DECC]/10 gap-1.5 shrink-0 text-xs"
          >
            <Cloud className="w-3.5 h-3.5 text-[#88DECC]" />
            <span>S3 Cloud Archives</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={archiving}
            onClick={handleTriggerS3Archive}
            className="border-amber-500/30 text-[#F3D3A2] hover:bg-amber-500/10 gap-1.5 shrink-0 text-xs"
          >
            {archiving ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin text-[#F3D3A2]" />
            ) : (
              <Archive className="w-3.5 h-3.5 text-[#F3D3A2]" />
            )}
            <span>{archiving ? "Archiving..." : "Archive >7d to S3"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="border-white/15 text-[#FCF6E3] hover:bg-white/5 gap-1.5 shrink-0 text-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#F3D3A2]" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {notice && (
        <div
          className={cn(
            "p-4 rounded-xl text-xs flex items-center gap-2.5",
            notice.type === "success"
              ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
              : "bg-rose-950/60 border border-rose-800 text-rose-300"
          )}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

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
          {["all", "admissions", "moderation", "export", "s3"].map((cat) => (
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
              {cat === "all" ? "All Logs" : cat === "s3" ? "S3 Archives" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-2xl border border-white/10 bg-[#1E1F33] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-xs text-[#A9A7C4] gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[#F3D3A2]" />
            <span>Querying active security audit logs...</span>
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

      {/* S3 Archives Modal */}
      {archiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12131F] border border-white/15 rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setArchiveModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-[#A9A7C4] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#88DECC]/15 border border-[#88DECC]/30 flex items-center justify-center text-[#88DECC]">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-white">
                  AWS S3 Cold Storage Archives
                </h3>
                <p className="text-xs text-[#A9A7C4]">
                  Permanent immutable archives of audit logs rotated out every 7 days.
                </p>
              </div>
            </div>

            {loadingArchives ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-[#A9A7C4]">
                <RotateCw className="w-6 h-6 animate-spin text-[#88DECC]" />
                <span>Loading S3 archive manifests...</span>
              </div>
            ) : archivesList.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#A9A7C4] bg-white/[0.02] border border-white/10 rounded-2xl">
                No archived S3 logs found yet. Older logs will be moved here automatically every 7 days, or when clicking "Archive &gt;7d to S3".
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {archivesList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1A1B2C] border border-white/10 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-[#88DECC] shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium font-mono text-white truncate max-w-sm">
                          {item.s3Key}
                        </p>
                        <p className="text-[11px] font-mono text-[#A9A7C4] mt-0.5">
                          {item.metadata?.archivedCount ?? 0} records •{" "}
                          {item.metadata?.fileSizeBytes
                            ? `${(item.metadata.fileSizeBytes / 1024).toFixed(1)} KB • `
                            : ""}
                          {new Date(item.timestamp).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {item.downloadUrl ? (
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#88DECC]/15 hover:bg-[#88DECC]/25 text-[#88DECC] text-[11px] font-medium transition-colors shrink-0 border border-[#88DECC]/30"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-[#A9A7C4] italic">Presign Expired</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-5 border-t border-white/10 mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setArchiveModalOpen(false)}
                className="border-white/15 text-white hover:bg-white/5 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
