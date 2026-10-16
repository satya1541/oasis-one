"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  FileCheck2,
  Users,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  RotateCw,
} from "lucide-react";

interface OverviewStats {
  pendingApplications: number;
  activeMembers: number;
  openReports: number;
  pendingAchievements: number;
  totalStartups: number;
  upcomingEvents: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats>({
    pendingApplications: 0,
    activeMembers: 0,
    openReports: 0,
    pendingAchievements: 0,
    totalStartups: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [oldestApp, setOldestApp] = useState<{ id: string; name: string; date: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, appsRes] = await Promise.all([
        fetch("/api/v1/admin/overview"),
        fetch("/api/v1/admin/applications?status=pending&pageSize=1"),
      ]);

      if (overviewRes.ok) {
        const json = await overviewRes.json();
        if (json.data) setStats(json.data);
      }

      if (appsRes.ok) {
        const json = await appsRes.json();
        const apps = json.data?.items || json.data || [];
        if (apps.length > 0) {
          const first = apps[0];
          setOldestApp({
            id: first.id,
            name: first.user?.profile?.name || first.user?.email || "Applicant",
            date: new Date(first.submittedAt || first.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            }),
          });
        } else {
          setOldestApp(null);
        }
      }
    } catch (err) {
      console.error("Failed to load admin overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-medium text-[var(--text)]">
            Admin Overview
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Live operational telemetry for OASIS membership committee and governance.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2">
          <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* ── Four KPI Metric Cards (Connected to Live Database) ───────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
            <span>Members</span>
            <Users className="w-3.5 h-3.5 text-[var(--brand-navy)]" />
          </div>
          <div className="text-3xl font-display font-light text-[var(--text)]">
            {stats.activeMembers}
          </div>
          <div className="mt-1 text-[11px] text-[var(--muted)] font-medium">Active accounts</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
            <span>Pending Review</span>
            <FileCheck2 className="w-3.5 h-3.5 text-[var(--accent)]" />
          </div>
          <div className="text-3xl font-display font-light text-[var(--brand-navy)]">
            {stats.pendingApplications}
          </div>
          <div className="mt-1 text-[11px] text-[var(--warning)] font-medium">
            {stats.pendingApplications > 0 ? "Awaiting decision" : "Queue clear"}
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
            <span>Upcoming events</span>
            <Calendar className="w-3.5 h-3.5 text-[var(--info)]" />
          </div>
          <div className="text-3xl font-display font-light text-[var(--text)]">
            {stats.upcomingEvents}
          </div>
          <div className="mt-1 text-[11px] text-[var(--muted)]">Scheduled</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
            <span>Reports</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--danger)]" />
          </div>
          <div className="text-3xl font-display font-light text-[var(--danger)]">
            {stats.openReports}
          </div>
          <div className="mt-1 text-[11px] text-[var(--muted)]">
            {stats.openReports > 0 ? "Requires review" : "Zero open flags"}
          </div>
        </div>
      </div>

      {/* ── Needs Your Attention Section ───────────────────────────────────────── */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 lg:p-7 shadow-[var(--shadow-1)] space-y-4">
        <h2 className="text-xs font-display uppercase tracking-wider text-[var(--brand-navy)] font-semibold">
          Needs Your Attention
        </h2>

        <div className="divide-y divide-[var(--border)]/70">
          {/* Row 1: Applications */}
          <div className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--brand-navy)]">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {stats.pendingApplications > 0
                    ? `${stats.pendingApplications} application${stats.pendingApplications > 1 ? "s" : ""} waiting for committee decision`
                    : "No applications pending review"}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {oldestApp
                    ? `Earliest submission by ${oldestApp.name} on ${oldestApp.date}`
                    : "The applicant review pipeline is completely up to date."}
                </p>
              </div>
            </div>
            <Link href="/admin/applications">
              <Button size="sm" className="gap-1.5 w-full sm:w-auto">
                <span>Review queue</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {/* Row 2: Reports */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center justify-center shrink-0 text-[var(--danger)]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {stats.openReports > 0
                    ? `${stats.openReports} community post${stats.openReports > 1 ? "s" : ""} reported for review`
                    : "Zero content reports pending"}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {stats.openReports > 0
                    ? "Review flagged messages or potential guidelines infractions."
                    : "All community discussions comply with standard guidelines."}
                </p>
              </div>
            </div>
            <Link href="/admin/reports">
              <Button variant="secondary" size="sm" className="gap-1.5 w-full sm:w-auto">
                <span>Review reports</span>
              </Button>
            </Link>
          </div>

          {/* Row 3: Achievements */}
          <div className="py-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-center shrink-0 text-[var(--brand-gold)]">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {stats.pendingAchievements > 0
                    ? `${stats.pendingAchievements} member achievement${stats.pendingAchievements > 1 ? "s" : ""} pending review`
                    : "Zero member achievements pending review"}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {stats.pendingAchievements > 0
                    ? "Approve milestone submissions for the 24-hour member dashboard carousel."
                    : "No pending member celebrations awaiting approval."}
                </p>
              </div>
            </div>
            <Link href="/admin/achievements">
              <Button variant="secondary" size="sm" className="gap-1.5 w-full sm:w-auto">
                <span>Approve achievements</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
