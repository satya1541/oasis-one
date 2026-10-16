"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Plus,
  Users,
  Download,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight,
  RotateCw,
} from "lucide-react";

interface AdminEventRecord {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  venueOrLink?: string;
  visibility: string;
  capacity?: number;
  status: string;
  _count?: {
    registrations: number;
  };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [venueOrLink, setVenueOrLink] = useState("KIIT-TBI Auditorium, Bhubaneswar");
  const [capacity, setCapacity] = useState(40);
  const [visibility, setVisibility] = useState("all_members");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/events");
      if (res.ok) {
        const json = await res.json();
        setEvents(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startAt.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          startAt: new Date(startAt).toISOString(),
          endAt: endAt ? new Date(endAt).toISOString() : new Date(new Date(startAt).getTime() + 2 * 60 * 60 * 1000).toISOString(),
          venueOrLink: venueOrLink.trim(),
          capacity: Number(capacity) || 50,
          visibility,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const eventId = created.data?.id;
        if (eventId) {
          // Immediately publish event
          await fetch(`/api/v1/admin/events/${eventId}/publish`, { method: "POST" });
        }
        setCreateModalOpen(false);
        setTitle("");
        setDescription("");
        setStartAt("");
        setEndAt("");
        await fetchEvents();
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to create event");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = (eventId: string, eventTitle: string) => {
    window.open(`/api/v1/admin/events/${eventId}/export.csv`, "_blank");
    setExportNotice(`Exported attendee manifest for "${eventTitle}".`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--text)]">
            Community Events & Roundtable Builder
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Publish curated closed-door roundtables, monitor real-time RSVP counts, and export attendee manifests.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setCreateModalOpen(true)}
          className="gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Community Event</span>
        </Button>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--success)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16 text-xs text-[var(--muted)] gap-2">
          <RotateCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
          <span>Loading scheduled events...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
          <Calendar className="w-8 h-8 text-[var(--muted)] mx-auto opacity-40" />
          <h3 className="font-display text-sm font-medium text-[var(--text)]">No Events Scheduled</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            Your community has no active or upcoming roundtables. Click &quot;New Community Event&quot; to schedule one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm text-[var(--text)]">{evt.title}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]">
                    {evt.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(evt.startAt).toLocaleDateString()} • {new Date(evt.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {evt.venueOrLink && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {evt.venueOrLink}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {evt._count?.registrations || 0} registered / {evt.capacity || "Unlimited"} cap
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleExportCSV(evt.id, evt.title)}
                  className="gap-1.5 text-xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Event Modal ────────────────────────────────────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h2 className="text-base font-display font-medium text-[var(--text)]">
                Create Community Event / Roundtable
              </h2>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DeepTech Supply Chain Roundtable"
                  className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                  Description & Agenda
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context and prerequisites for attendees..."
                  className="w-full p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                    Venue or Meeting Link
                  </label>
                  <input
                    type="text"
                    value={venueOrLink}
                    onChange={(e) => setVenueOrLink(e.target.value)}
                    placeholder="e.g. O-Hub Bhubaneswar or Zoom link"
                    className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                    Attendee Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="gap-1.5"
                >
                  {submitting ? "Publishing..." : "Publish Event"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
