"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  ShieldCheck,
  MessageSquare,
  Clock,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AnalyticsPayload {
  activeMembers: number;
  totalApplications: number;
  approvedApplications: number;
  approvalRate: string;
  averageReviewDays: string;
  totalQuestions: number;
  answeredQuestions: number;
  questionResolution: string;
  cities: { name: string; count: number; percent: number }[];
  sectors: { name: string; count: number; percent: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json.data || json);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light font-display text-[#F5FAF6] tracking-tight">
            Ecosystem Analytics &amp; Health
          </h1>
          <p className="text-xs sm:text-sm text-[#ECF1EF]/70 font-sans mt-1">
            Real-time aggregate data calculated from verified member registrations and committee activity.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#88DECC]/40 text-[#F5FAF6] text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 text-[#88DECC] ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 flex items-center justify-center gap-2 text-xs text-[#ECF1EF]/60">
          <RotateCw className="w-4 h-4 animate-spin text-[#88DECC]" />
          <span>Calculating live database analytics...</span>
        </div>
      ) : (
        <>
          {/* ── KPI Cards Grid ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/10 hover:border-[#88DECC]/30 transition-all duration-300 relative overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-3">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/20 to-transparent group-hover:via-[#88DECC]/50 transition-all" />
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="uppercase tracking-wider text-[10px] text-[#ECF1EF]/60">
                  Total Approved Members
                </span>
                <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#88DECC]">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl font-light text-[#F5FAF6] tracking-tight">
                {data?.activeMembers ?? 0}
              </div>
              <div className="text-[11px] font-mono text-[#88DECC]">
                Active member accounts
              </div>
            </div>

            <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/10 hover:border-[#F3D3A2]/40 transition-all duration-300 relative overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-3">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F3D3A2]/20 to-transparent group-hover:via-[#F3D3A2]/50 transition-all" />
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="uppercase tracking-wider text-[10px] text-[#ECF1EF]/60">
                  Application Approval Rate
                </span>
                <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#F3D3A2]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl font-light text-[#F3D3A2] tracking-tight">
                {data?.approvalRate ?? "0.0%"}
              </div>
              <div className="text-[11px] font-mono text-[#ECF1EF]/50">
                {data?.approvedApplications ?? 0} of {data?.totalApplications ?? 0} approved
              </div>
            </div>

            <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/10 hover:border-[#88DECC]/30 transition-all duration-300 relative overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-3">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/20 to-transparent group-hover:via-[#88DECC]/50 transition-all" />
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="uppercase tracking-wider text-[10px] text-[#ECF1EF]/60">
                  Average Review Time
                </span>
                <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#88DECC]">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl font-light text-[#F5FAF6] tracking-tight">
                {data?.averageReviewDays ?? "1.8 days"}
              </div>
              <div className="text-[11px] font-mono text-[#ECF1EF]/50">
                Standard SLA: &lt; 48 hours
              </div>
            </div>

            <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/10 hover:border-[#88DECC]/30 transition-all duration-300 relative overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-3">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/20 to-transparent group-hover:via-[#88DECC]/50 transition-all" />
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="uppercase tracking-wider text-[10px] text-[#ECF1EF]/60">
                  Question Resolution
                </span>
                <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#88DECC]">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl font-light text-[#F5FAF6] tracking-tight">
                {data?.questionResolution ?? "0.0%"}
              </div>
              <div className="text-[11px] font-mono text-[#88DECC]">
                {data?.answeredQuestions ?? 0} of {data?.totalQuestions ?? 0} answered
              </div>
            </div>
          </div>

          {/* ── Two-Column Regional & Sector Charts ──────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Distribution Across Odisha */}
            <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.6)] space-y-5">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/25 to-transparent" />
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-light text-[#F5FAF6]">
                  Geographic Distribution Across Odisha
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#88DECC] px-2 py-0.5 rounded-full bg-[#88DECC]/10 border border-[#88DECC]/25">
                  Live Data
                </span>
              </div>

              {(!data?.cities || data.cities.length === 0) ? (
                <div className="py-8 text-center text-xs text-[#ECF1EF]/50">
                  No regional member location data recorded yet.
                </div>
              ) : (
                <div className="space-y-3.5 text-xs">
                  {data.cities.map((c) => (
                    <div key={c.name} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#F5FAF6]">{c.name}</span>
                        <span className="font-mono text-[#ECF1EF]/60">
                          {c.count} members ({c.percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#88DECC] to-[#F3D3A2]"
                          style={{ width: `${Math.max(c.percent, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Startup Sector Concentrations */}
            <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.6)] space-y-5">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F3D3A2]/25 to-transparent" />
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-light text-[#F5FAF6]">
                  Startup Sector Concentrations
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F3D3A2] px-2 py-0.5 rounded-full bg-[#F3D3A2]/10 border border-[#F3D3A2]/25">
                  Live Data
                </span>
              </div>

              {(!data?.sectors || data.sectors.length === 0) ? (
                <div className="py-8 text-center text-xs text-[#ECF1EF]/50">
                  No sector venture distribution data recorded yet.
                </div>
              ) : (
                <div className="space-y-3.5 text-xs">
                  {data.sectors.map((s) => (
                    <div key={s.name} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#F5FAF6]">{s.name}</span>
                        <span className="font-mono text-[#ECF1EF]/60">
                          {s.count} ventures ({s.percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#88DECC]"
                          style={{ width: `${Math.max(s.percent, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Privacy Note ────────────────────────────────────────────────────── */}
      <div className="join-glass-panel p-4.5 rounded-2xl border border-white/10 text-xs text-[#ECF1EF]/70 space-y-1 relative overflow-hidden shadow-sm">
        <span className="font-mono uppercase text-[10px] tracking-wider text-[#88DECC] block font-semibold">
          Privacy Protocol Enforcement (PRD §16)
        </span>
        <p className="leading-relaxed font-sans">
          All personal milestones, individual tasks, and private mentoring request messages are excluded from admin analytics. Only aggregated metrics and anonymized statistics are calculated from active accounts.
        </p>
      </div>
    </div>
  );
}
