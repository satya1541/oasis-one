"use client";

import { useState, useEffect } from "react";
import { MemberShell } from "@/components/layout/MemberShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calendar, MapPin, Users, Video, Clock, CheckCircle2, RotateCw } from "lucide-react";
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
      <div className="space-y-6 max-w-4xl pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-light text-[var(--text)] tracking-tight">
              Events
            </h1>
            <p className="text-xs text-[var(--muted)] mt-1">
              Curated masterclasses, offline roundtables, and mentor clinics for OASIS members.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeFilter === "all" ? "primary" : "secondary"}
              onClick={() => setActiveFilter("all")}
            >
              All Events ({events.length})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "registered" ? "primary" : "secondary"}
              onClick={() => setActiveFilter("registered")}
            >
              Registered ({events.filter((e) => e.isRegistered).length})
            </Button>
          </div>
        </div>

        {/* Events Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--muted)] gap-2 text-xs">
            <RotateCw className="w-5 h-5 animate-spin text-[var(--accent)]" />
            <span>Loading community events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-12 text-center text-xs text-[var(--muted)] border-dashed">
            {activeFilter === "registered"
              ? "You haven't registered for any events yet. Check out the available events!"
              : "No upcoming events scheduled right now. Check back soon!"}
          </Card>
        ) : (
          <div className="space-y-5">
            {filteredEvents.map((evt) => {
              const { month, day, time } = formatEventDate(evt.startAt);
              const capacity = evt.capacity || 50;
              const registered = evt.registeredCount || 0;
              const isFull = registered >= capacity;
              const isOnline =
                evt.venueOrLink?.toLowerCase().includes("zoom") ||
                evt.venueOrLink?.toLowerCase().includes("meet") ||
                evt.venueOrLink?.toLowerCase().includes("virtual");

              return (
                <Card key={evt.id} hoverEffect className="p-6 border-[var(--border)]">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Date Block */}
                    <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col items-center justify-center text-center shrink-0">
                      <span className="font-display text-xs font-semibold uppercase text-[var(--accent)]">
                        {month}
                      </span>
                      <span className="font-display text-xl font-bold text-[var(--text)]">
                        {day}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="primary">
                          {isOnline ? "Virtual Clinic" : "In-Person Conclave"}
                        </Badge>
                        {isFull && !evt.isRegistered && (
                          <Badge variant="warning">
                            {evt.waitlistEnabled ? "Waitlist Open" : "Full Capacity"}
                          </Badge>
                        )}
                        {evt.isRegistered && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Registered
                          </span>
                        )}
                      </div>

                      <h2 className="font-display text-xl font-medium text-[var(--text)]">
                        {evt.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--muted)] pt-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[var(--accent)] shrink-0" />
                          <span>{time} IST</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isOnline ? (
                            <Video className="w-4 h-4 text-[var(--accent)] shrink-0" />
                          ) : (
                            <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0" />
                          )}
                          <span className="truncate">{evt.venueOrLink || "Odisha Startup Corridor"}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <Users className="w-4 h-4 text-[var(--accent)] shrink-0" />
                          <span>
                            {registered} of {capacity} seats filled
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                        <div className="text-[11px] text-[var(--muted)]">
                          {isFull && !evt.isRegistered
                            ? "Capacity reached."
                            : "Pre-approved OASIS member admission"}
                        </div>

                        {evt.isRegistered ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processingId === evt.id}
                            onClick={() => handleCancelRegistration(evt.id)}
                            className="text-xs border-rose-200 text-[var(--danger)] hover:bg-rose-50"
                          >
                            {processingId === evt.id ? "Updating..." : "Cancel Seat"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={processingId === evt.id || (isFull && !evt.waitlistEnabled)}
                            onClick={() => handleRegister(evt.id)}
                          >
                            {processingId === evt.id
                              ? "Registering..."
                              : isFull
                              ? "Join Waitlist"
                              : "Register Now"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MemberShell>
  );
}
