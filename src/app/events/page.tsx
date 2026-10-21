"use client";

import { useState, useEffect } from "react";
import { MemberShell } from "@/components/layout/MemberShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calendar, MapPin, Users, Video, Clock, CheckCircle2, RotateCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventItem {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  venueOrLink?: string;
  capacity?: number;
  registeredCount?: number;
  waitlistEnabled?: boolean;
  status: string;
  isRegistered?: boolean;
}

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "registered">("all");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/events");
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

  const handleRegister = async (eventId: string) => {
    try {
      setProcessingId(eventId);
      const res = await fetch(`/api/v1/events/${eventId}/register`, {
        method: "POST",
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  isRegistered: true,
                  registeredCount: (e.registeredCount || 0) + 1,
                }
              : e
          )
        );
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Registration failed");
      }
    } catch (err: any) {
      alert(err.message || "Could not register for event");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    try {
      setProcessingId(eventId);
      const res = await fetch(`/api/v1/events/${eventId}/register`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  isRegistered: false,
                  registeredCount: Math.max(0, (e.registeredCount || 1) - 1),
                }
              : e
          )
        );
      }
    } catch (err: any) {
      console.error("Cancel registration error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const day = d.getDate().toString().padStart(2, "0");
      const time = d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return { month, day, time };
    } catch {
      return { month: "OCT", day: "20", time: "15:00 IST" };
    }
  };

  const filteredEvents =
    activeFilter === "registered"
      ? events.filter((e) => e.isRegistered)
      : events;

  return (
    <MemberShell>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 border-b border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#86601F]/10 dark:bg-[#F3D3A2]/10 border border-[#86601F]/20 dark:border-[#F3D3A2]/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#86601F] dark:text-[#F3D3A2] font-semibold">
                Sanctuary Calendar
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-light text-[var(--text)] tracking-tight">
              Masterclasses &amp; Conclaves
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-xl font-sans leading-relaxed">
              Curated offline founder roundtables, investor demo days, and private mentor clinics across Odisha.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-2xl bg-[#EFE8D8]/70 dark:bg-[#181928]/90 border border-[#D9CDAE]/60 dark:border-[#2C2E4A] backdrop-blur-md shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-2 min-h-[40px] rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer text-center",
                activeFilter === "all"
                  ? "bg-[#1E1F33] dark:bg-[#FBF7EE] text-[#FBF7EE] dark:text-[#1E1F33] shadow-sm font-semibold scale-[1.02]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              All Events ({events.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("registered")}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-2 min-h-[40px] rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5",
                activeFilter === "registered"
                  ? "bg-[#1E1F33] dark:bg-[#FBF7EE] text-[#FBF7EE] dark:text-[#1E1F33] shadow-sm font-semibold scale-[1.02]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              <span>My Passes</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-[#86601F]/20 dark:bg-[#86601F]/30 text-[#86601F] dark:text-[#F3D3A2]">
                {events.filter((e) => e.isRegistered).length}
              </span>
            </button>
          </div>
        </div>

        {/* Events Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--muted)] gap-3 text-xs">
            <RotateCw className="w-6 h-6 animate-spin text-[#86601F] dark:text-[#F3D3A2]" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Synchronizing calendar schedule...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-10 sm:p-16 text-center text-xs text-[var(--muted)] border-dashed border-[#D9CDAE]/80 dark:border-[#2C2E4A] bg-[var(--surface)]/50 backdrop-blur-sm rounded-3xl space-y-3">
            <Calendar className="w-10 h-10 text-[var(--muted)]/40 mx-auto" />
            <h3 className="font-display text-base font-medium text-[var(--text)]">
              {activeFilter === "registered" ? "No Reserved Passes" : "No Scheduled Conclaves"}
            </h3>
            <p className="max-w-md mx-auto text-xs leading-relaxed">
              {activeFilter === "registered"
                ? "You haven't reserved admission to any upcoming events yet. Explore all open conclaves above."
                : "No new events have been posted yet. Check back soon for the next cohort demo day."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:gap-6">
            {filteredEvents.map((evt) => {
              const { month, day, time } = formatEventDate(evt.startAt);
              const capacity = evt.capacity || 50;
              const registered = evt.registeredCount || 0;
              const isFull = registered >= capacity;
              const fillPercentage = Math.min(100, Math.round((registered / capacity) * 100));
              const isOnline =
                evt.venueOrLink?.toLowerCase().includes("zoom") ||
                evt.venueOrLink?.toLowerCase().includes("meet") ||
                evt.venueOrLink?.toLowerCase().includes("virtual");

              return (
                <div
                  key={evt.id}
                  className="group relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/90 hover:border-[#86601F]/40 dark:hover:border-[#F3D3A2]/40 shadow-xs hover:shadow-xl hover:shadow-[#1E1F33]/5 transition-all duration-300 backdrop-blur-md"
                >
                  <div className="flex flex-col xs:flex-row gap-4 sm:gap-6 xs:items-start">
                    {/* Ticket Stub Date Badge */}
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-b from-[#1E1F33] to-[#12131F] text-[#FBF7EE] border border-[#F3D3A2]/30 flex flex-col items-center justify-center text-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                      <span className="font-display text-[10px] font-bold tracking-widest uppercase text-[#F3D3A2]">
                        {month}
                      </span>
                      <span className="font-display text-2xl font-light tracking-tight text-[#FBF7EE] mt-0.5">
                        {day}
                      </span>
                      <span className="text-[9px] font-mono text-white/50 uppercase tracking-tighter">
                        2026
                      </span>
                    </div>

                    {/* Details Body */}
                    <div className="flex-1 space-y-4">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
                              isOnline
                                ? "bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20"
                                : "bg-[#86601F]/10 text-[#86601F] dark:text-[#F3D3A2] border-[#86601F]/20"
                            )}
                          >
                            {isOnline ? "Virtual Clinic" : "In-Person Conclave"}
                          </span>

                          {isFull && !evt.isRegistered && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                              {evt.waitlistEnabled ? "Waitlist Open" : "Full Capacity"}
                            </span>
                          )}

                          {evt.isRegistered && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Pass Confirmed</span>
                            </span>
                          )}
                        </div>

                        {/* Capacity meter */}
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--muted)]">
                          <Users className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
                          <span>{registered}/{capacity}</span>
                          <div className="w-16 h-1.5 rounded-full bg-[#EFE8D8] dark:bg-[#2C2E4A] overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-[#86601F] to-[#D4AF37] rounded-full transition-all duration-500"
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h2 className="font-display text-xl sm:text-2xl font-light text-[var(--text)] group-hover:text-[#86601F] dark:group-hover:text-[#F3D3A2] transition-colors">
                          {evt.title}
                        </h2>
                        {evt.description && (
                          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-sans line-clamp-2">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[var(--muted)] pt-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2] shrink-0" />
                          <span className="font-mono">{time} IST</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOnline ? (
                            <Video className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2] shrink-0" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2] shrink-0" />
                          )}
                          <span className="truncate max-w-[280px]">
                            {evt.venueOrLink || "Bhubaneswar Innovation Center, Odisha"}
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-[11px] text-[var(--muted)] font-mono">
                          {isFull && !evt.isRegistered
                            ? "All standard admissions reserved."
                            : "Pre-verified admission • OASIS Member access"}
                        </div>

                        {evt.isRegistered ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processingId === evt.id}
                            onClick={() => handleCancelRegistration(evt.id)}
                            className="w-full sm:w-auto text-xs min-h-[44px] border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl cursor-pointer"
                          >
                            {processingId === evt.id ? "Updating Pass..." : "Cancel Reserved Pass"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={processingId === evt.id || (isFull && !evt.waitlistEnabled)}
                            onClick={() => handleRegister(evt.id)}
                            className="w-full sm:w-auto text-xs min-h-[44px] rounded-xl px-5 py-2.5 cursor-pointer font-medium"
                          >
                            {processingId === evt.id
                              ? "Reserving..."
                              : isFull
                              ? "Join Waitlist"
                              : "Claim Admission Pass"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MemberShell>
  );
}
