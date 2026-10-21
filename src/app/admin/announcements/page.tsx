"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Megaphone,
  CheckCircle2,
  Users,
  Eye,
  Calendar,
  Send,
  X,
  Sparkles,
  RotateCw,
} from "lucide-react";

interface AnnouncementRecord {
  id: string;
  title: string;
  body: string;
  targetRoles?: string[];
  expiresAt?: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [expiresAt, setExpiresAt] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/announcements");
      if (res.ok) {
        const json = await res.json();
        setAnnouncements(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    try {
      setSubmitting(true);
      const targetRoles = targetRole === "all" ? undefined : [targetRole];
      const res = await fetch("/api/v1/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          targetRoles,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      });

      if (res.ok) {
        setNotice("Announcement published instantly to all member dashboard announcement bars.");
        setTitle("");
        setBody("");
        setExpiresAt("");
        await fetchAnnouncements();
        setTimeout(() => setNotice(null), 4000);
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to publish announcement");
      }
    } catch (err: any) {
      alert(err.message || "Failed to publish announcement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light font-display text-[#F5FAF6] tracking-tight">
            Community Announcements &amp; Urgent Broadcasts
          </h1>
          <p className="text-xs sm:text-sm text-[#ECF1EF]/70 font-sans mt-1">
            Publish top-banner notifications visible across all member dashboards in Odisha.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Compose Form */}
      <form onSubmit={handlePublish} className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.6)] space-y-4">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
        
        <h2 className="font-display text-base font-light text-[#F5FAF6] flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center text-[#88DECC]">
            <Megaphone className="w-4 h-4" />
          </div>
          <span>Broadcast New Announcement</span>
        </h2>

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
              Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Odisha DeepTech Innovation Seed Grants 2026"
              className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
              Announcement Body
            </label>
            <textarea
              rows={3}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="State key details, eligibility criteria, or deadlines..."
              className="w-full p-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                Target Role Audience
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full h-10 px-3 bg-[#070D12] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
              >
                <option value="all">All Members (Founders, Mentors &amp; Aspiring)</option>
                <option value="founder">Founders Only</option>
                <option value="mentor">Mentors Only</option>
                <option value="aspiring_entrepreneur">Aspiring Builders Only</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EEF1EA] text-[#03080B] font-semibold text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(136,222,204,0.35)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? "Publishing..." : "Broadcast Announcement"}</span>
          </button>
        </div>
      </form>

      {/* Announcements List */}
      <div className="space-y-4 pt-2">
        <h3 className="font-mono uppercase text-xs tracking-wider text-[#ECF1EF]/60 font-semibold">
          Active &amp; Past Broadcasts
        </h3>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-xs text-[#ECF1EF]/60 gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[#88DECC]" />
            <span>Loading announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="join-glass-panel p-12 text-center rounded-2xl sm:rounded-3xl border border-white/10 text-xs text-[#ECF1EF]/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/20 to-transparent" />
            No active announcements. Use the form above to compose your first broadcast.
          </div>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className="join-glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden space-y-2 text-xs shadow-sm hover:border-[#88DECC]/30 transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/20 to-transparent" />
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-[#F5FAF6]">{a.title}</h4>
                <span className="text-[11px] font-mono text-[#88DECC]">
                  Published {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[#ECF1EF]/70 leading-relaxed font-sans">{a.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
