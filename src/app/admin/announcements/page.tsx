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
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--text)]">
            Community Announcements & Urgent Broadcasts
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Publish top-banner notifications visible across all member dashboards in Odisha.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--success)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Compose Form */}
      <form onSubmit={handlePublish} className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
        <h2 className="font-display text-base font-medium text-[var(--text)] flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-[var(--accent)]" />
          <span>Broadcast New Announcement</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
              Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Odisha DeepTech Innovation Seed Grants 2026"
              className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
              Announcement Body
            </label>
            <textarea
              rows={3}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="State key details, eligibility criteria, or deadlines..."
              className="w-full p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Target Role Audience
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              >
                <option value="all">All Members (Founders, Mentors & Aspiring)</option>
                <option value="founder">Founders Only</option>
                <option value="mentor">Mentors Only</option>
                <option value="aspiring_entrepreneur">Aspiring Builders Only</option>
              </select>
            </div>
            <div>
              <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? "Publishing..." : "Broadcast Announcement"}</span>
          </Button>
        </div>
      </form>

      {/* Announcements List */}
      <div className="space-y-4">
        <h3 className="font-display text-sm font-medium text-[var(--text)]">Active & Past Broadcasts</h3>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-xs text-[var(--muted)] gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
            <span>Loading announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--muted)]">
            No active announcements. Use the form above to compose your first broadcast.
          </div>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-[var(--text)]">{a.title}</h4>
                <span className="text-[11px] font-mono text-[var(--muted)]">
                  Published {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[var(--muted)] leading-relaxed">{a.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
