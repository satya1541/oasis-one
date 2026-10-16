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
    <div className="space-y-8">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--text)]">
            Ecosystem Analytics & Health
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Real-time aggregate data calculated from verified member registrations and committee activity.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading} className="gap-2">
          <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Metrics</span>
        </Button>
      </div>

      {loading ? (
        <div className="p-16 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
          <RotateCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
          <span>Calculating live database analytics...</span>
        </div>
      ) : (
        <>
          {/* ── KPI Cards Grid ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Total Approved Members
                </span>
                <Users className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div className="font-display text-3xl font-medium text-[var(--text)]">
                {data?.activeMembers ?? 0}
              </div>
              <div className="text-[11px] text-[var(--muted)]">
                Active member accounts
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Application Approval Rate
                </span>
                <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div className="font-display text-3xl font-medium text-[var(--text)]">
                {data?.approvalRate ?? "0.0%"}
              </div>
              <div className="text-[11px] text-[var(--muted)]">
                {data?.approvedApplications ?? 0} of {data?.totalApplications ?? 0} approved
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Average Review Time
                </span>
                <Clock className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div className="font-display text-3xl font-medium text-[var(--text)]">
                {data?.averageReviewDays ?? "1.8 days"}
              </div>
              <div className="text-[11px] text-[var(--muted)]">
                Standard SLA: &lt; 48 hours
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Question Resolution
                </span>
                <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div className="font-display text-3xl font-medium text-[var(--text)]">
                {data?.questionResolution ?? "0.0%"}
              </div>
              <div className="text-[11px] text-[var(--muted)]">
                {data?.answeredQuestions ?? 0} of {data?.totalQuestions ?? 0} answered
              </div>
            </div>
          </div>

          {/* ── Two-Column Regional & Sector Charts ──────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Distribution Across Odisha */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-medium text-[var(--text)]">
                  Geographic Distribution Across Odisha
                </h3>
                <span className="text-[10px] font-mono text-[var(--muted)]">Live Data</span>
              </div>

              {(!data?.cities || data.cities.length === 0) ? (
                <div className="py-8 text-center text-xs text-[var(--muted)]">
                  No regional member location data recorded yet.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {data.cities.map((c) => (
                    <div key={c.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[var(--text)]">{c.name}</span>
                        <span className="font-mono text-[var(--muted)]">
                          {c.count} members ({c.percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--brand-gold)]"
                          style={{ width: `${Math.max(c.percent, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Startup Sector Concentrations */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-medium text-[var(--text)]">
                  Startup Sector Concentrations
                </h3>
                <span className="text-[10px] font-mono text-[var(--muted)]">Live Data</span>
              </div>

              {(!data?.sectors || data.sectors.length === 0) ? (
                <div className="py-8 text-center text-xs text-[var(--muted)]">
                  No sector venture distribution data recorded yet.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {data.sectors.map((s) => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[var(--text)]">{s.name}</span>
                        <span className="font-mono text-[var(--muted)]">
                          {s.count} ventures ({s.percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--accent)]"
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
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)] space-y-1">
        <span className="font-semibold text-[var(--text)] block uppercase tracking-wider text-[10px]">
          Privacy Protocol Enforcement (PRD §16)
        </span>
        <p>
          All personal milestones, individual tasks, and private mentoring request messages are excluded from admin analytics. Only aggregated metrics and anonymized statistics are calculated from active accounts.
        </p>
      </div>
    </div>
  );
}
