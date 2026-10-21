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
    <div className="space-y-6 pb-16">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light font-display text-[#F5FAF6] tracking-tight">
            Community Events &amp; Roundtable Builder
          </h1>
          <p className="text-xs sm:text-sm text-[#ECF1EF]/70 font-sans mt-1">
            Publish curated closed-door roundtables, monitor real-time RSVP counts, and export attendee manifests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-between gap-2.5 px-4 py-2 rounded-full bg-[#EEF1EA] text-[#03080B] font-semibold text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(136,222,204,0.35)] transition-all cursor-pointer group shrink-0"
        >
          <span>New Community Event</span>
          <span className="w-5 h-5 rounded-full bg-[#03080B] flex items-center justify-center text-[#EEF1EA] group-hover:rotate-90 transition-transform">
            <Plus className="w-3 h-3" />
          </span>
        </button>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16 text-xs text-[#ECF1EF]/60 gap-2">
          <RotateCw className="w-4 h-4 animate-spin text-[#88DECC]" />
          <span>Loading scheduled events...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-16 text-center border border-white/10 relative overflow-hidden space-y-3 shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
          <Calendar className="w-8 h-8 text-[#88DECC] mx-auto opacity-70" />
          <h3 className="font-display text-base font-light text-[#F5FAF6]">No Events Scheduled</h3>
          <p className="text-xs text-[#ECF1EF]/60 max-w-sm mx-auto">
            Your community has no active or upcoming roundtables. Click &quot;New Community Event&quot; to schedule one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="join-glass-panel rounded-2xl p-5 border border-white/10 hover:border-[#88DECC]/40 transition-all duration-300 relative overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/20 to-transparent group-hover:via-[#88DECC]/50 transition-all" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-medium text-sm sm:text-base text-[#F5FAF6]">{evt.title}</h3>
                  <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[#88DECC] border border-[#88DECC]/30 font-semibold">
                    {evt.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#ECF1EF]/70 font-sans">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#88DECC]" />
                    {new Date(evt.startAt).toLocaleDateString()} • {new Date(evt.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {evt.venueOrLink && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F3D3A2]" />
                      {evt.venueOrLink}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#88DECC]" />
                    {evt._count?.registrations || 0} registered / {evt.capacity || "Unlimited"} cap
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleExportCSV(evt.id, evt.title)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-[#F5FAF6] text-xs font-medium transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#88DECC]" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Event Modal ────────────────────────────────────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="join-glass-panel border border-white/10 rounded-2xl sm:rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.9)] space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-display font-light text-[#F5FAF6]">
                Create Community Event / Roundtable
              </h2>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-[#ECF1EF]/50 hover:text-[#F5FAF6] p-1 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DeepTech Supply Chain Roundtable"
                  className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                  Description &amp; Agenda
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context and prerequisites for attendees..."
                  className="w-full p-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                    Start Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                    End Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                    Venue or Meeting Link
                  </label>
                  <input
                    type="text"
                    value={venueOrLink}
                    onChange={(e) => setVenueOrLink(e.target.value)}
                    placeholder="e.g. O-Hub Bhubaneswar or Zoom link"
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                    Attendee Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#F5FAF6] text-xs font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-[#EEF1EA] text-[#03080B] font-semibold text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(136,222,204,0.35)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

