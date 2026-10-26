"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MemberShell } from "@/components/layout/MemberShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  MapPin,
  Users,
  Video,
  Clock,
  CheckCircle2,
  RotateCw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  CalendarCheck,
  Compass,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventItem {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  venueOrLink?: string;
  meetingLink?: string;
  capacity?: number;
  registeredCount?: number;
  waitlistEnabled?: boolean;
  status: string;
  isRegistered?: boolean;
}

function EventsContent() {
  const searchParams = useSearchParams();
  const targetEventId = searchParams.get("id");

  const tabParam = searchParams.get("tab") || searchParams.get("filter");
  const [activeFilter, setActiveFilter] = useState<"all" | "registered" | "available">(
    tabParam === "registered" || tabParam === "passes" || tabParam === "my-passes"
      ? "registered"
      : tabParam === "available"
      ? "available"
      : "all"
  );
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedAgendas, setExpandedAgendas] = useState<Record<string, boolean>>({});

  const handleTabChange = (filter: "all" | "registered" | "available") => {
    setActiveFilter(filter);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (filter === "all") {
        url.searchParams.delete("tab");
        url.searchParams.delete("filter");
      } else {
        url.searchParams.set("tab", filter);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/events?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
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

  // When a target ID is provided via query parameter (?id=...), expand its agenda and scroll into view
  useEffect(() => {
    if (targetEventId && events.length > 0) {
      setExpandedAgendas((prev) => ({ ...prev, [targetEventId]: true }));
      const timer = setTimeout(() => {
        const el = document.getElementById(`event-${targetEventId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [targetEventId, events]);

  const toggleAgenda = (eventId: string) => {
    setExpandedAgendas((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

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
        fetchEvents();
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (res.status === 409 || errJson.error?.code === "CONFLICT") {
          // Already claimed/registered in backend: immediately synchronize status
          setEvents((prev) =>
            prev.map((e) =>
              e.id === eventId
                ? {
                    ...e,
                    isRegistered: true,
                  }
                : e
            )
          );
          fetchEvents();
          return;
        }
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
        fetchEvents();
      }
    } catch (err: any) {
      console.error("Cancel registration error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Helper that formats both date stub and complete time range (start time & end time)
   */
  const formatEventTiming = (startAtStr: string, endAtStr?: string) => {
    try {
      const startDate = new Date(startAtStr);
      const month = startDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const day = startDate.getDate().toString().padStart(2, "0");
      const year = startDate.getFullYear();

      const startTime = startDate.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      if (!endAtStr) {
        return {
          month,
          day,
          year,
          startTime,
          endTime: null,
          timeRange: `${startTime} IST`,
          durationText: null,
        };
      }

      const endDate = new Date(endAtStr);
      const endTime = endDate.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      // Calculate approximate duration in hours
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffHrs = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
      const durationText = diffHrs > 0 ? (diffHrs === 1 ? "1 hour" : `${diffHrs} hours`) : null;

      const isSameDay =
        startDate.getFullYear() === endDate.getFullYear() &&
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getDate() === endDate.getDate();

      if (isSameDay) {
        return {
          month,
          day,
          year,
          startTime,
          endTime,
          timeRange: `${startTime} – ${endTime} IST`,
          durationText,
        };
      } else {
        const endMonth = endDate.toLocaleString("en-US", { month: "short" }).toUpperCase();
        const endDay = endDate.getDate().toString().padStart(2, "0");
        return {
          month,
          day,
          year,
          startTime,
          endTime,
          timeRange: `${month} ${day}, ${startTime} – ${endMonth} ${endDay}, ${endTime} IST`,
          durationText,
        };
      }
    } catch {
      return {
        month: "OCT",
        day: "25",
        year: 2026,
        startTime: "10:00 AM",
        endTime: "1:00 PM",
        timeRange: "10:00 AM – 1:00 PM IST",
        durationText: null,
      };
    }
  };

  const registeredEvents = events.filter((e) => Boolean(e.isRegistered));
  const availableEvents = events.filter((e) => !e.isRegistered);

  const filteredEvents =
    activeFilter === "registered"
      ? registeredEvents
      : activeFilter === "available"
      ? availableEvents
      : events;

  return (
    <MemberShell>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#88DECC]/10 border border-[#88DECC]/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#88DECC]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#88DECC] font-semibold">
                Sanctuary Calendar
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-light text-[#F5FAF6] tracking-tight">
              Masterclasses &amp; Conclaves
            </h1>
            <p className="text-xs sm:text-sm text-[#ECF1EF]/60 mt-1.5 max-w-xl font-sans leading-relaxed">
              Curated offline founder roundtables, investor demo days, and private mentor clinics across Odisha.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-2 min-h-[38px] rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5",
                activeFilter === "all"
                  ? "bg-[#EEF1EA] text-[#03080B] shadow-md font-semibold scale-[1.02]"
                  : "text-[#ECF1EF]/70 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <span>All Events</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-colors",
                  activeFilter === "all"
                    ? "bg-[#03080B]/15 text-[#03080B]"
                    : "bg-white/[0.08] text-[#ECF1EF]/70"
                )}
              >
                {events.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("registered")}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-2 min-h-[38px] rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5",
                activeFilter === "registered"
                  ? "bg-[#EEF1EA] text-[#03080B] shadow-md font-semibold scale-[1.02]"
                  : "text-[#ECF1EF]/70 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <span>My Passes</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-colors",
                  activeFilter === "registered"
                    ? "bg-[#03080B]/15 text-[#03080B]"
                    : "bg-[#88DECC]/20 text-[#88DECC]"
                )}
              >
                {registeredEvents.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("available")}
              className={cn(
                "flex-1 sm:flex-initial px-4 py-2 min-h-[38px] rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5",
                activeFilter === "available"
                  ? "bg-[#EEF1EA] text-[#03080B] shadow-md font-semibold scale-[1.02]"
                  : "text-[#ECF1EF]/70 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <span>Available</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-colors",
                  activeFilter === "available"
                    ? "bg-[#03080B]/15 text-[#03080B]"
                    : "bg-white/[0.08] text-[#ECF1EF]/70"
                )}
              >
                {availableEvents.length}
              </span>
            </button>
          </div>
        </div>

        {/* View mode banner hint */}
        <div className="flex items-center justify-between text-xs text-[#ECF1EF]/60 font-sans -mt-3">
          <span>
            {activeFilter === "registered"
              ? `Showing your reserved admission passes (${registeredEvents.length})`
              : activeFilter === "available"
              ? `Showing open conclaves available for admission registration (${availableEvents.length})`
              : `Showing all upcoming events (${events.length})`}
          </span>
          {activeFilter !== "all" && (
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className="text-[#88DECC] hover:underline cursor-pointer font-mono text-[11px]"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Events Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#ECF1EF]/50 gap-3 text-xs">
            <RotateCw className="w-6 h-6 animate-spin text-[#88DECC]" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Synchronizing calendar schedule...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-10 sm:p-16 text-center text-xs text-[#ECF1EF]/70 border-dashed border-white/10 bg-white/[0.02] backdrop-blur-sm rounded-3xl space-y-3">
            <Calendar className="w-10 h-10 text-white/30 mx-auto" />
            <h3 className="font-display text-base font-medium text-[#F5FAF6]">
              {activeFilter === "registered"
                ? "No Reserved Passes Yet"
                : activeFilter === "available"
                ? "All Available Passes Claimed"
                : "No Scheduled Conclaves"}
            </h3>
            <p className="max-w-md mx-auto text-xs leading-relaxed text-[#ECF1EF]/60">
              {activeFilter === "registered"
                ? "You haven't reserved admission to any upcoming events yet. Explore open conclaves under 'Available' or 'All Events' and claim your pass."
                : activeFilter === "available"
                ? "You have reserved admission to every currently scheduled conclave! You can view your confirmed passes under 'My Passes'."
                : "No new events have been posted yet. Check back soon for the next cohort demo day."}
            </p>
            {activeFilter !== "all" && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleTabChange("all")}
                  className="px-4 py-2 rounded-full bg-[#88DECC]/15 hover:bg-[#88DECC]/25 text-[#88DECC] border border-[#88DECC]/30 text-xs font-semibold cursor-pointer transition-all"
                >
                  View All Events ({events.length})
                </button>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:gap-6">
            {filteredEvents.map((evt) => {
              const { month, day, year, timeRange, durationText } = formatEventTiming(evt.startAt, evt.endAt);
              const capacity = evt.capacity || 50;
              const registered = evt.registeredCount || 0;
              const isFull = registered >= capacity;
              const fillPercentage = Math.min(100, Math.round((registered / capacity) * 100));
              const isOnline =
                evt.venueOrLink?.toLowerCase().includes("zoom") ||
                evt.venueOrLink?.toLowerCase().includes("meet") ||
                evt.venueOrLink?.toLowerCase().includes("virtual");

              const isTargeted = targetEventId === evt.id;
              const isExpanded = expandedAgendas[evt.id] ?? false;

              return (
                <div
                  id={`event-${evt.id}`}
                  key={evt.id}
                  className={cn(
                    "group relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-[var(--surface)] border transition-all duration-300 backdrop-blur-md",
                    isTargeted
                      ? "border-[#88DECC] dark:border-[#88DECC] ring-2 ring-[#88DECC]/40 shadow-xl shadow-[#88DECC]/10"
                      : "border-[#EAE1CF] dark:border-[#2C2E4A]/90 hover:border-[#86601F]/40 dark:hover:border-[#F3D3A2]/40 shadow-xs hover:shadow-xl hover:shadow-[#1E1F33]/5"
                  )}
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
                        {year}
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

                          {isTargeted && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#88DECC]/15 text-[#88DECC] border border-[#88DECC]/30 font-mono">
                              Selected Agenda
                            </span>
                          )}

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

                      {/* Title */}
                      <div>
                        <h2 className="font-display text-xl sm:text-2xl font-light text-[var(--text)] group-hover:text-[#86601F] dark:group-hover:text-[#F3D3A2] transition-colors">
                          {evt.title}
                        </h2>
                      </div>

                      {/* Metadata Row: Displays both Start & End Time + Venue/Link */}
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[var(--muted)] pt-1">
                        {/* Time Range with Start & End Time */}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#86601F] dark:text-[#F3D3A2] shrink-0" />
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-semibold text-[var(--text)]">
                              {timeRange}
                            </span>
                            {durationText && (
                              <span className="text-[10px] font-mono text-[var(--muted)]/80 px-1.5 py-0.5 rounded-md bg-[#EAE1CF]/40 dark:bg-white/[0.05]">
                                ({durationText})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Venue or Virtual Link */}
                        <div className="flex items-center gap-2">
                          {isOnline ? (
                            <Video className="w-4 h-4 text-[#86601F] dark:text-[#F3D3A2] shrink-0" />
                          ) : (
                            <MapPin className="w-4 h-4 text-[#86601F] dark:text-[#F3D3A2] shrink-0" />
                          )}
                          <span className="truncate max-w-[280px]">
                            {evt.venueOrLink || "Bhubaneswar Innovation Center, Odisha"}
                          </span>
                          {evt.meetingLink && (evt.meetingLink.includes("maps.google.com") || evt.meetingLink.includes("google.com/maps")) && (
                            <a
                              href={evt.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-[#88DECC] hover:underline shrink-0 ml-1"
                              title="Open in Google Maps"
                            >
                              <span>Map</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Dedicated Agenda & Details Section */}
                      <div className="mt-3 rounded-2xl bg-[#FBF7EE]/60 dark:bg-[#181928]/70 border border-[#EAE1CF] dark:border-[#2C2E4A] p-4 sm:p-5 transition-all">
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#86601F] dark:text-[#F3D3A2]" />
                            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[#86601F] dark:text-[#F3D3A2]">
                              Event Agenda &amp; Program
                            </span>
                          </div>
                          {evt.description && evt.description.length > 180 && (
                            <button
                              type="button"
                              onClick={() => toggleAgenda(evt.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#86601F] dark:text-[#F3D3A2] hover:underline cursor-pointer"
                            >
                              <span>{isExpanded ? "Collapse Agenda" : "Expand Full Agenda"}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>

                        {evt.description ? (
                          <div
                            className={cn(
                              "text-xs sm:text-[13px] text-[var(--text)]/90 leading-relaxed font-sans whitespace-pre-line",
                              !isExpanded && evt.description.length > 180 ? "line-clamp-3" : ""
                            )}
                          >
                            {evt.description}
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--muted)] italic">
                            Full session agenda, mentor lineup, and discussion points will be updated shortly.
                          </p>
                        )}
                      </div>

                      {/* Footer Registration Actions (Members can only register through this events page) */}
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
                            className="w-full sm:w-auto text-xs min-h-[42px] border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl cursor-pointer"
                          >
                            {processingId === evt.id ? "Updating Pass..." : "Cancel Reserved Pass"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={processingId === evt.id || (isFull && !evt.waitlistEnabled)}
                            onClick={() => handleRegister(evt.id)}
                            className="w-full sm:w-auto text-xs min-h-[42px] rounded-xl px-5 py-2.5 cursor-pointer font-semibold shadow-sm"
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

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#03080B] flex items-center justify-center text-xs font-mono text-[#88DECC]">
          Loading Events...
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
