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
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light font-display text-[#F5FAF6] tracking-tight">
            Content Safety &amp; Moderation Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#ECF1EF]/70 font-sans mt-1">
            Review community-flagged posts and comments violating anti-spam or safety guidelines.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16 text-xs text-[#ECF1EF]/60 gap-2">
          <RotateCw className="w-4 h-4 animate-spin text-[#88DECC]" />
          <span>Loading content moderation queue...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-16 text-center border border-white/10 relative overflow-hidden space-y-3 shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#88DECC] mx-auto shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-display text-base font-light text-[#F5FAF6]">Queue Clear</h3>
          <p className="text-xs text-[#ECF1EF]/60 max-w-sm mx-auto font-sans leading-relaxed">
            Zero content reports pending review. The community feed is healthy and compliant.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="join-glass-panel rounded-2xl p-6 border border-white/10 hover:border-rose-500/30 transition-all relative overflow-hidden space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-sm text-[#F5FAF6]">
                      Report against {rep.targetType}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold">
                      {rep.reasonCategory}
                    </span>
                  </div>
                  <div className="text-xs text-[#ECF1EF]/60 font-mono">
                    Flagged by {rep.reporter.profile?.name || rep.reporter.email} &bull; {new Date(rep.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={processingId === rep.id}
                    onClick={() => handleResolve(rep.id, "dismissed")}
                    className="px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#ECF1EF]/70 hover:text-[#F5FAF6] text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                  >
                    Dismiss Report
                  </button>
                  <button
                    type="button"
                    disabled={processingId === rep.id}
                    onClick={() => handleResolve(rep.id, "resolved")}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Take Action &amp; Resolve</span>
                  </button>
                </div>
              </div>

              {rep.reasonDetail && (
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-1">
                  <div className="font-mono uppercase text-[10px] text-[#ECF1EF]/60">Reporter Note:</div>
                  <p className="text-[#ECF1EF]/80 leading-relaxed font-sans">{rep.reasonDetail}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
