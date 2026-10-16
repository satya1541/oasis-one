"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mail,
  Scale,
  Save,
  RotateCw,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [minAge, setMinAge] = useState("18");
  const [coolingOffDays, setCoolingOffDays] = useState("30");
  const [supportEmail, setSupportEmail] = useState("support@oasis.community");
  const [grievanceEmail, setGrievanceEmail] = useState("grievance@oasis.community");
  const [retentionDays, setRetentionDays] = useState("90");
  const [inviteExpiryDays, setInviteExpiryDays] = useState("14");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/settings");
      if (res.ok) {
        const json = await res.json();
        const list: { key: string; value: string }[] = json.data || [];
        const map: Record<string, string> = {};
        for (const s of list) {
          map[s.key] = s.value;
        }

        if (map.min_age) setMinAge(map.min_age);
        if (map.cooling_off_days) setCoolingOffDays(map.cooling_off_days);
        if (map.support_email) setSupportEmail(map.support_email);
        if (map.grievance_email) setGrievanceEmail(map.grievance_email);
        if (map.application_retention_days) setRetentionDays(map.application_retention_days);
        if (map.invite_expiry_days) setInviteExpiryDays(map.invite_expiry_days);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          min_age: String(minAge),
          cooling_off_days: String(coolingOffDays),
          support_email: supportEmail.trim(),
          grievance_email: grievanceEmail.trim(),
          application_retention_days: String(retentionDays),
          invite_expiry_days: String(inviteExpiryDays),
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to persist settings");
      }
    } catch (err: any) {
      alert(err.message || "Failed to persist settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-xs text-[var(--muted)] gap-2">
        <RotateCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
        <span>Loading governance configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--text)]">
            Admin Governance & Policy Configuration
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Global community thresholds, committee rubric criteria, and compliance settings per PRD §10.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--success)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Governance settings successfully saved and committed to system database.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Admissions & Age Gate */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <h3 className="font-display text-base font-medium text-[var(--text)] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[var(--accent)]" />
            <span>Admissions & Eligibility Gates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Minimum Age Gate
              </label>
              <input
                type="number"
                min={16}
                max={100}
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <p className="text-[10px] text-[var(--muted)] mt-1">Age gate verification requirement.</p>
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Rejection Cooling-Off Period (Days)
              </label>
              <input
                type="number"
                min={0}
                value={coolingOffDays}
                onChange={(e) => setCoolingOffDays(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <p className="text-[10px] text-[var(--muted)] mt-1">Days an applicant must wait before re-applying.</p>
            </div>
          </div>
        </div>

        {/* DPDP Legal Contacts */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <h3 className="font-display text-base font-medium text-[var(--text)] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[var(--accent)]" />
            <span>DPDP Legal & Grievance Contact Channels</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Grievance Officer Email
              </label>
              <input
                type="email"
                required
                value={grievanceEmail}
                onChange={(e) => setGrievanceEmail(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Support & Inquiries Email
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>
        </div>

        {/* Retention & Lifecycle */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <h3 className="font-display text-base font-medium text-[var(--text)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--accent)]" />
            <span>Retention & Invite Lifecycles</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Application Data Retention (Days)
              </label>
              <input
                type="number"
                min={7}
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Invite Link Expiry (Days)
              </label>
              <input
                type="number"
                min={1}
                value={inviteExpiryDays}
                onChange={(e) => setInviteExpiryDays(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Commit Settings"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
