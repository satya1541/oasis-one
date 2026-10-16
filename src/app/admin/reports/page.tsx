"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  X,
  EyeOff,
  Eye,
  MessageSquare,
  Clock,
  RotateCw,
} from "lucide-react";

interface ContentReportRecord {
  id: string;
  targetType: string;
  targetId: string;
  reasonCategory: string;
  reasonDetail?: string;
  status: string;
  createdAt: string;
  reporter: {
    id: string;
    email: string;
    profile?: {
      name?: string;
    };
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ContentReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/reports");
      if (res.ok) {
        const json = await res.json();
        setReports(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load content reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string, outcome: "resolved" | "dismissed") => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/v1/admin/reports/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });

      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
        setNotice(`Content report has been marked as ${outcome}.`);
        setTimeout(() => setNotice(null), 3500);
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to resolve report");
      }
    } catch (err: any) {
      alert(err.message || "Failed to resolve report");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--text)]">
            Content Safety & Moderation Reports
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Review community-flagged posts and comments violating anti-spam or safety guidelines.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--success)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16 text-xs text-[var(--muted)] gap-2">
          <RotateCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
          <span>Loading content moderation queue...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
          <ShieldAlert className="w-8 h-8 text-[var(--muted)] mx-auto opacity-40" />
          <h3 className="font-display text-sm font-medium text-[var(--text)]">Queue Clear</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            Zero content reports pending review. The community feed is healthy and compliant.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[var(--text)]">
                      Report against {rep.targetType}
                    </span>
                    <Badge variant="warning">
                      {rep.reasonCategory}
                    </Badge>
                  </div>
                  <div className="text-xs text-[var(--muted)] font-mono">
                    Flagged by {rep.reporter.profile?.name || rep.reporter.email} • {new Date(rep.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={processingId === rep.id}
                    onClick={() => handleResolve(rep.id, "dismissed")}
                    className="text-xs"
                  >
                    Dismiss Report
                  </Button>
                  <Button
                    size="sm"
                    disabled={processingId === rep.id}
                    onClick={() => handleResolve(rep.id, "resolved")}
                    className="text-xs gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Take Action & Resolve
                  </Button>
                </div>
              </div>

              {rep.reasonDetail && (
                <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1">
                  <div className="font-medium text-[var(--text)]">Reporter Note:</div>
                  <p className="text-[var(--muted)] leading-relaxed">{rep.reasonDetail}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
