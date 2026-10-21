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
      <div className="flex items-center justify-center p-16 text-xs text-[#ECF1EF]/60 gap-2">
        <RotateCw className="w-4 h-4 animate-spin text-[#88DECC]" />
        <span>Loading governance configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light font-display text-[#F5FAF6] tracking-tight">
            Admin Governance &amp; Policy Configuration
          </h1>
          <p className="text-xs sm:text-sm text-[#ECF1EF]/70 font-sans mt-1">
            Global community thresholds, committee rubric criteria, and compliance settings per PRD §10.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Governance settings successfully saved and committed to system database.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Admissions & Age Gate */}
        <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.6)] space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
          <h3 className="font-display text-base font-light text-[#F5FAF6] flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center text-[#88DECC]">
              <Scale className="w-4 h-4" />
            </div>
            <span>Admissions &amp; Eligibility Gates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                Minimum Age Gate
              </label>
              <input
                type="number"
                min={16}
                max={100}
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
              />
              <p className="text-[10px] text-[#ECF1EF]/50 mt-1">Age gate verification requirement.</p>
            </div>

            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                Rejection Cooling-Off Period (Days)
              </label>
              <input
                type="number"
                min={0}
                value={coolingOffDays}
                onChange={(e) => setCoolingOffDays(e.target.value)}
                className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
              />
              <p className="text-[10px] text-[#ECF1EF]/50 mt-1">Days an applicant must wait before re-applying.</p>
            </div>
          </div>
        </div>

        {/* DPDP Legal Contacts */}
        <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.6)] space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
          <h3 className="font-display text-base font-light text-[#F5FAF6] flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center text-[#88DECC]">
              <Mail className="w-4 h-4" />
            </div>
            <span>DPDP Legal &amp; Grievance Contact Channels</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                Grievance Officer Email
              </label>
              <input
                type="email"
                required
                value={grievanceEmail}
                onChange={(e) => setGrievanceEmail(e.target.value)}
                className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                Support &amp; Inquiries Email
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Retention & Lifecycle */}
        <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.6)] space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
          <h3 className="font-display text-base font-light text-[#F5FAF6] flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center text-[#88DECC]">
              <Clock className="w-4 h-4" />
            </div>
            <span>Retention &amp; Invite Lifecycles</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                Application Data Retention (Days)
              </label>
              <input
                type="number"
                min={7}
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                Invite Link Expiry (Days)
              </label>
              <input
                type="number"
                min={1}
                value={inviteExpiryDays}
                onChange={(e) => setInviteExpiryDays(e.target.value)}
                className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EEF1EA] text-[#03080B] font-semibold text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(136,222,204,0.35)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Commit Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
