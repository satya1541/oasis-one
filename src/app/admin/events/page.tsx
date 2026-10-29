"use client";

import { useState, useEffect, useRef } from "react";
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
  ExternalLink,
  Search,
  Building2,
  Video,
  Layers,
  Compass,
  AlertCircle,
  Sparkles,
  Navigation,
  Check,
  Mail,
  Phone,
  UserCheck,
  Copy,
  CheckCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { MapPickerModal, SelectedLocationData } from "@/components/ui/MapPickerModal";

interface AdminEventRecord {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  venueOrLink?: string;
  meetingLink?: string;
  visibility: string;
  capacity?: number;
  status: string;
  _count?: {
    registrations: number;
  };
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  status: "registered" | "waitlisted" | "cancelled" | "promoted";
  waitlistPosition: number | null;
  checkedInAt: string | null;
  registeredAt: string;
  responses?: Record<string, any> | null;
  user: {
    id: string;
    email: string;
    phone?: string | null;
    primaryRole?: string | null;
    accountStatus?: string;
    profile?: {
      name: string;
      headline?: string | null;
      city?: string | null;
      state?: string | null;
      profilePhotoUrl?: string | null;
      linkedinUrl?: string | null;
    } | null;
  };
}

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface PlaceDetails {
  name: string;
  formattedAddress: string;
  googleMapsUrl: string;
  location: { lat: number; lng: number } | null;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Event Deletion State
  const [eventToDelete, setEventToDelete] = useState<AdminEventRecord | null>(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  // Registered Attendees State
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<AdminEventRecord | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [attendeeFilter, setAttendeeFilter] = useState<"all" | "registered" | "checked_in" | "waitlisted">("all");
  const [togglingRegId, setTogglingRegId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // New Event Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [format, setFormat] = useState<"in_person" | "virtual" | "hybrid">("in_person");
  const [venueName, setVenueName] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [capacity, setCapacity] = useState<number | "">(40);
  const [visibility, setVisibility] = useState("all_members");

  // Google Maps API State
  const [locationSearch, setLocationSearch] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [manualAddressFallback, setManualAddressFallback] = useState(false);
  const [manualAddress, setManualAddress] = useState("");

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const locationWrapperRef = useRef<HTMLDivElement | null>(null);

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

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationWrapperRef.current &&
        !locationWrapperRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Google Places Autocomplete Search
  const handleLocationSearchChange = (val: string) => {
    setLocationSearch(val);
    setShowLocationDropdown(true);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!val || val.trim().length < 2) {
      setPredictions([]);
      setIsSearchingLocation(false);
      return;
    }

    setIsSearchingLocation(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/location/autocomplete?input=${encodeURIComponent(val.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setPredictions(data.predictions || []);
        }
      } catch (err) {
        console.error("Autocomplete search error:", err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 300);
  };

  // Google Places Details fetch
  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    setShowLocationDropdown(false);
    setIsLoadingDetails(true);
    try {
      const res = await fetch(
        `/api/location/details?placeId=${encodeURIComponent(prediction.placeId)}`
      );
      if (res.ok) {
        const details: PlaceDetails = await res.json();
        setSelectedPlace(details);
        // If venueName is empty, prefill with place name
        if (!venueName.trim()) {
          setVenueName(details.name || prediction.mainText);
        }
        setLocationSearch("");
      }
    } catch (err) {
      console.error("Place details fetch error:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Duration Helper Pill
  const handleSetDurationHours = (hours: number) => {
    if (!startAt) return;
    const startDate = new Date(startAt);
    const endDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
    // Format to YYYY-MM-DDTHH:mm
    const tzOffset = endDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(endDate.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    setEndAt(localISOTime);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startAt.trim()) return;

    try {
      setSubmitting(true);

      // Build venueOrLink & meetingLink
      let computedVenueOrLink = "";
      let computedMeetingLink = "";

      if (format === "virtual") {
        computedVenueOrLink = meetingUrl.trim() || "Virtual Event (Online)";
        computedMeetingLink = meetingUrl.trim();
      } else if (format === "in_person") {
        const parts: string[] = [];
        if (venueName.trim()) parts.push(venueName.trim());
        if (selectedPlace?.formattedAddress) {
          parts.push(selectedPlace.formattedAddress);
        } else if (manualAddress.trim()) {
          parts.push(manualAddress.trim());
        } else if (locationSearch.trim()) {
          parts.push(locationSearch.trim());
        }

        computedVenueOrLink = parts.join(" • ") || "Bhubaneswar Innovation Hub";
        computedMeetingLink = selectedPlace?.googleMapsUrl || "";
      } else {
        // Hybrid
        const parts: string[] = [];
        if (venueName.trim()) parts.push(venueName.trim());
        if (selectedPlace?.formattedAddress) {
          parts.push(selectedPlace.formattedAddress);
        }
        computedVenueOrLink = `${parts.join(" • ") || "In-Person"} (Hybrid)`;
        computedMeetingLink =
          meetingUrl.trim() || selectedPlace?.googleMapsUrl || "";
      }

      const res = await fetch("/api/v1/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          startAt: new Date(startAt).toISOString(),
          endAt: endAt
            ? new Date(endAt).toISOString()
            : new Date(
                new Date(startAt).getTime() + 2 * 60 * 60 * 1000
              ).toISOString(),
          venueOrLink: computedVenueOrLink.trim(),
          meetingLink: computedMeetingLink.trim() || null,
          capacity: capacity === "" ? null : Number(capacity),
          visibility,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const eventId = created.data?.id;
        if (eventId) {
          // Immediately publish event
          await fetch(`/api/v1/admin/events/${eventId}/publish`, {
            method: "POST",
          });
        }
        setCreateModalOpen(false);
        setTitle("");
        setDescription("");
        setStartAt("");
        setEndAt("");
        setMeetingUrl("");
        await fetchEvents();
        setExportNotice("Event published with verified Google Maps navigation!");
        setTimeout(() => setExportNotice(null), 4000);
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

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setDeletingEvent(true);
    try {
      const res = await fetch(`/api/v1/admin/events/${eventToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
        setExportNotice(`Successfully removed event "${eventToDelete.title}".`);
        setTimeout(() => setExportNotice(null), 3500);
        if (selectedEventForAttendees?.id === eventToDelete.id) {
          setAttendeesModalOpen(false);
          setSelectedEventForAttendees(null);
        }
        setEventToDelete(null);
      } else {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.message || "Failed to remove event.");
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Network error while removing event.");
    } finally {
      setDeletingEvent(false);
    }
  };

  const handleOpenAttendees = async (evt: AdminEventRecord) => {
    setSelectedEventForAttendees(evt);
    setAttendeesModalOpen(true);
    setAttendeeSearch("");
    setAttendeeFilter("all");
    setLoadingAttendees(true);
    try {
      const res = await fetch(`/api/v1/admin/events/${evt.id}/registrations`);
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json) ? json : json.data || [];
        setAttendees(list);
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.error("Failed to load attendees:", errJson);
        setAttendees([]);
      }
    } catch (err) {
      console.error("Failed to load attendees:", err);
      setAttendees([]);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleToggleCheckIn = async (regId: string) => {
    if (!selectedEventForAttendees) return;
    setTogglingRegId(regId);
    try {
      const res = await fetch(
        `/api/v1/admin/events/${selectedEventForAttendees.id}/registrations/${regId}/check-in`,
        { method: "POST" }
      );
      if (res.ok) {
        const json = await res.json();
        const updated = json.data;
        setAttendees((prev) =>
          prev.map((a) =>
            a.id === regId ? { ...a, checkedInAt: updated.checkedInAt } : a
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle check-in:", err);
    } finally {
      setTogglingRegId(null);
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const filteredAttendees = attendees.filter((a) => {
    if (attendeeFilter === "checked_in" && !a.checkedInAt) return false;
    if (attendeeFilter === "registered" && a.status !== "registered") return false;
    if (attendeeFilter === "waitlisted" && a.status !== "waitlisted") return false;

    if (attendeeSearch.trim()) {
      const q = attendeeSearch.toLowerCase();
      const name = a.user?.profile?.name?.toLowerCase() || "";
      const email = a.user?.email?.toLowerCase() || "";
      const role = a.user?.primaryRole?.toLowerCase() || "";
      const city = a.user?.profile?.city?.toLowerCase() || "";
      const headline = a.user?.profile?.headline?.toLowerCase() || "";
      return (
        name.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        city.includes(q) ||
        headline.includes(q)
      );
    }
    return true;
  });

  const filteredEvents = events.filter((evt) => {
    if (activeTab === "published" && evt.status !== "published") return false;
    if (activeTab === "draft" && evt.status !== "draft") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = evt.title.toLowerCase().includes(q);
      const matchVenue = evt.venueOrLink?.toLowerCase().includes(q);
      return matchTitle || matchVenue;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#88DECC]/10 border border-[#88DECC]/25 text-[11px] font-mono uppercase tracking-wider text-[#88DECC] mb-2">
            <Sparkles className="w-3 h-3 text-[#88DECC]" />
            OASIS Community Hub &bull; Event Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-light font-display text-[#F5FAF6] tracking-tight">
            Community Events &amp; Roundtable Builder
          </h1>
          <p className="text-xs sm:text-sm text-[#ECF1EF]/70 font-sans mt-1 max-w-2xl">
            Publish curated closed-door roundtables with verified Google Maps venue coordinates, track RSVPs in real time, and export attendee manifests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-between gap-3 px-5 py-2.5 rounded-full bg-[#EEF1EA] text-[#03080B] font-semibold text-xs sm:text-sm hover:bg-white hover:shadow-[0_0_24px_rgba(136,222,204,0.4)] transition-all cursor-pointer group shrink-0"
        >
          <span>Schedule New Event</span>
          <span className="w-6 h-6 rounded-full bg-[#03080B] flex items-center justify-center text-[#EEF1EA] group-hover:rotate-90 transition-transform">
            <Plus className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>

      {/* ── Status Notice Banner ────────────────────────────────────────────── */}
      {exportNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-emerald-300 flex items-center justify-between gap-3 shadow-lg shadow-emerald-950/20 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-medium">{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-emerald-400/60 hover:text-emerald-300 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Filter & Search Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-[#88DECC]/15 text-[#88DECC] border border-[#88DECC]/30 font-semibold"
                : "text-[#ECF1EF]/60 hover:text-[#F5FAF6]"
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("published")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === "published"
                ? "bg-[#88DECC]/15 text-[#88DECC] border border-[#88DECC]/30 font-semibold"
                : "text-[#ECF1EF]/60 hover:text-[#F5FAF6]"
            }`}
          >
            Published (
            {events.filter((e) => e.status === "published").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("draft")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === "draft"
                ? "bg-[#88DECC]/15 text-[#88DECC] border border-[#88DECC]/30 font-semibold"
                : "text-[#ECF1EF]/60 hover:text-[#F5FAF6]"
            }`}
          >
            Drafts ({events.filter((e) => e.status === "draft").length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#ECF1EF]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, venue..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#F5FAF6] placeholder-[#ECF1EF]/40 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* ── Events Grid / List ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-xs text-[#ECF1EF]/60 gap-3">
          <RotateCw className="w-5 h-5 animate-spin text-[#88DECC]" />
          <span>Syncing community events &amp; Google Map locations...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-16 text-center border border-white/10 relative overflow-hidden space-y-3 shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
          <Calendar className="w-10 h-10 text-[#88DECC] mx-auto opacity-70" />
          <h3 className="font-display text-base font-light text-[#F5FAF6]">
            No Events Found
          </h3>
          <p className="text-xs text-[#ECF1EF]/60 max-w-sm mx-auto">
            {searchQuery
              ? `No events matching "${searchQuery}". Clear your search query to see all events.`
              : "No upcoming roundtables scheduled. Click Schedule New Event above to create one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvents.map((evt) => {
            const hasGoogleMapLink =
              evt.meetingLink?.includes("maps.google.com") ||
              evt.meetingLink?.includes("google.com/maps") ||
              evt.meetingLink?.includes("goo.gl/maps");
            const isVirtualMeeting =
              evt.meetingLink?.includes("zoom") ||
              evt.meetingLink?.includes("meet.google") ||
              evt.meetingLink?.includes("teams.live");

            const regCount = evt._count?.registrations || 0;
            const cap = evt.capacity || 0;
            const pct = cap > 0 ? Math.min(100, Math.round((regCount / cap) * 100)) : 0;

            const startDate = new Date(evt.startAt);

            return (
              <div
                key={evt.id}
                className="join-glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-[#88DECC]/40 transition-all duration-300 relative overflow-hidden group shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/20 to-transparent group-hover:via-[#88DECC]/60 transition-all" />

                {/* Left: Date Badge + Content */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Calendar Pill Tile */}
                  <div className="hidden sm:flex flex-col items-center justify-center w-14 h-16 rounded-xl bg-white/[0.04] border border-white/12 text-center shrink-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#88DECC] font-bold">
                      {startDate.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-xl font-light font-display text-[#F5FAF6] leading-none mt-1">
                      {startDate.getDate()}
                    </span>
                    <span className="text-[9px] text-[#ECF1EF]/50 font-mono mt-0.5">
                      {startDate.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-medium text-base sm:text-lg text-[#F5FAF6] tracking-tight">
                        {evt.title}
                      </h3>
                      <span
                        className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full border font-semibold ${
                          evt.status === "published"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {evt.status}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#ECF1EF]/60 border border-white/10">
                        {(evt.visibility || "").replace(/_/g, " ")}
                      </span>
                    </div>

                    {evt.description && (
                      <p className="text-xs text-[#ECF1EF]/70 line-clamp-2 max-w-2xl font-sans">
                        {evt.description}
                      </p>
                    )}

                    {/* Metadata Items */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#ECF1EF]/80 font-sans pt-1">
                      <span className="flex items-center gap-1.5 font-mono text-[#ECF1EF]/90">
                        <Clock className="w-3.5 h-3.5 text-[#88DECC]" />
                        {startDate.toLocaleDateString()} &bull;{" "}
                        {startDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        IST
                      </span>

                      {evt.venueOrLink && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#F3D3A2] shrink-0" />
                          <span className="truncate max-w-[280px] sm:max-w-md">
                            {evt.venueOrLink}
                          </span>
                        </span>
                      )}

                      {/* Google Maps direct link pill */}
                      {hasGoogleMapLink && (
                        <a
                          href={evt.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium hover:bg-emerald-500/20 transition-colors"
                        >
                          <Navigation className="w-3 h-3 text-emerald-400" />
                          <span>Google Maps Pin</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      )}

                      {/* Virtual link pill */}
                      {isVirtualMeeting && (
                        <a
                          href={evt.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium hover:bg-cyan-500/20 transition-colors"
                        >
                          <Video className="w-3 h-3 text-cyan-400" />
                          <span>Join Link</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: RSVP Stats & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10 shrink-0">
                  {/* Capacity Bar (Clickable to view attendees) */}
                  <div
                    onClick={() => handleOpenAttendees(evt)}
                    className="w-full sm:w-44 text-right space-y-1 cursor-pointer group p-1.5 -m-1.5 rounded-xl hover:bg-white/[0.04] transition-all"
                    title="Click to view registered members"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#ECF1EF]/70">
                      <span className="flex items-center gap-1 group-hover:text-[#88DECC] transition-colors">
                        <Users className="w-3 h-3 text-[#88DECC]" />
                        <span className="underline decoration-[#88DECC]/40 underline-offset-2">RSVP</span>
                      </span>
                      <span className="text-[#F5FAF6] font-medium group-hover:text-[#88DECC] transition-colors">
                        {regCount} / {cap ? `${cap} seats` : "Unlimited"}
                      </span>
                    </div>
                    {cap > 0 && (
                      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#88DECC] to-[#F3D3A2] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* View Attendees */}
                    <button
                      type="button"
                      onClick={() => handleOpenAttendees(evt)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-[#88DECC]/40 bg-[#88DECC]/15 hover:bg-[#88DECC]/25 text-[#88DECC] text-xs font-semibold shadow-[0_0_12px_rgba(136,222,204,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Attendees ({regCount})</span>
                    </button>

                    {hasGoogleMapLink && (
                      <a
                        href={evt.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-[#ECF1EF]/80 text-xs font-medium transition-all"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#88DECC]" />
                        <span>Map</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleExportCSV(evt.id, evt.title)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-[#F5FAF6] text-xs font-medium transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#88DECC]" />
                      <span>Export CSV</span>
                    </button>

                    {/* Remove Event */}
                    <button
                      type="button"
                      onClick={() => setEventToDelete(evt)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/25 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-xs font-medium transition-all cursor-pointer group"
                      title="Remove Event"
                    >
                      <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Community Event Modal ────────────────────────────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-hidden">
          <div className="join-glass-panel border border-white/12 rounded-3xl w-full max-w-5xl xl:max-w-6xl max-h-[94vh] flex flex-col shadow-[0_24px_90px_rgba(0,0,0,0.95)] relative text-left my-auto overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC] to-transparent z-20" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-white/10 shrink-0 bg-[#050D10]/95 backdrop-blur-md">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider text-[#88DECC]">
                  <Sparkles className="w-3 h-3 text-[#88DECC]" />
                  <span>Curated Roundtable Builder</span>
                </div>
                <h2 className="text-base sm:text-lg font-display font-light text-[#F5FAF6] tracking-tight">
                  Create Community Event / Roundtable
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-[#ECF1EF]/50 hover:text-[#F5FAF6] p-1.5 rounded-full hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Horizontal Form Layout */}
            <form onSubmit={handleCreateEvent} className="flex-1 overflow-y-auto flex flex-col justify-between">
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start text-xs">
                {/* ── Left Column: Event Core Info & Schedule ── */}
                <div className="space-y-4">
                  {/* 1. Title */}
                  <div>
                    <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                      Event Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. DeepTech Supply Chain Roundtable"
                      className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/30 outline-none transition-all"
                    />
                  </div>

                  {/* 2. Description */}
                  <div>
                    <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                      Description &amp; Agenda
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide context, speaker introductions, and prerequisites for attendees..."
                      className="w-full p-2.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/30 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* 3. Schedule: Date & Times */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#88DECC] flex items-center gap-1.5 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Session Schedule</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9.5px] text-[#ECF1EF]/40 font-mono mr-1">
                          Duration:
                        </span>
                        {[
                          { label: "+1 hr", hours: 1 },
                          { label: "+2 hrs", hours: 2 },
                          { label: "+3 hrs", hours: 3 },
                        ].map((dur) => (
                          <button
                            key={dur.label}
                            type="button"
                            onClick={() => handleSetDurationHours(dur.hours)}
                            className="px-2 py-0.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-[9.5px] font-mono text-[#ECF1EF]/80 transition-colors"
                          >
                            {dur.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-mono text-[10px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                          Start Date &amp; Time <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={startAt}
                          onChange={(e) => setStartAt(e.target.value)}
                          className="w-full h-9 px-2.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                          End Date &amp; Time
                        </label>
                        <input
                          type="datetime-local"
                          value={endAt}
                          onChange={(e) => setEndAt(e.target.value)}
                          className="w-full h-9 px-2.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Capacity & Visibility */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-[#ECF1EF]/70">
                          Capacity
                        </label>
                        <div className="flex items-center gap-1">
                          {[25, 50, 100].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setCapacity(c)}
                              className="px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[9px] font-mono text-[#ECF1EF]/70"
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={capacity}
                        onChange={(e) =>
                          setCapacity(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="e.g. 40 (unlimited if empty)"
                        className="w-full h-9 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                        Access Level
                      </label>
                      <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="w-full h-9 px-2.5 bg-[#050D10] border border-white/12 rounded-xl text-xs text-[#F5FAF6] focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all cursor-pointer"
                      >
                        <option value="all_members">All OASIS Members</option>
                        <option value="founders_only">Founders Cohort Only</option>
                        <option value="mentors_only">Mentors &amp; Angels Only</option>
                        <option value="public">Open Public Registration</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── Right Column: Format & Location Details ── */}
                <div className="space-y-4">
                  {/* Format Selector */}
                  <div className="space-y-1">
                    <label className="font-mono text-[10.5px] uppercase tracking-wider text-[#ECF1EF]/70 block">
                      Event Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormat("in_person")}
                        className={`h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium border transition-all cursor-pointer ${
                          format === "in_person"
                            ? "bg-[#88DECC]/15 border-[#88DECC] text-[#88DECC] shadow-[0_0_15px_rgba(136,222,204,0.2)] font-semibold"
                            : "bg-white/[0.03] border-white/10 text-[#ECF1EF]/70 hover:bg-white/[0.06]"
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>In-Person</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormat("virtual")}
                        className={`h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium border transition-all cursor-pointer ${
                          format === "virtual"
                            ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)] font-semibold"
                            : "bg-white/[0.03] border-white/10 text-[#ECF1EF]/70 hover:bg-white/[0.06]"
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Virtual / Online</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormat("hybrid")}
                        className={`h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs font-medium border transition-all cursor-pointer ${
                          format === "hybrid"
                            ? "bg-[#F3D3A2]/15 border-[#F3D3A2] text-[#F3D3A2] shadow-[0_0_15px_rgba(243,211,162,0.2)] font-semibold"
                            : "bg-white/[0.03] border-white/10 text-[#ECF1EF]/70 hover:bg-white/[0.06]"
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Hybrid (Both)</span>
                      </button>
                    </div>
                  </div>

                  {/* Physical Venue & Google Maps Integration */}
                  {(format === "in_person" || format === "hybrid") && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/12 space-y-3">
                      {/* Search Bar + Pick on Map Button */}
                      <div ref={locationWrapperRef} className="space-y-1.5 relative">
                        <div className="flex items-center justify-between">
                          <label className="font-mono text-[10px] uppercase tracking-wider text-[#ECF1EF]/70 flex items-center gap-1">
                            <span>Google Maps Venue Location <span className="text-rose-400">*</span></span>
                          </label>
                          {selectedPlace && (
                            <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                              <Check className="w-3 h-3" /> Location Linked
                            </span>
                          )}
                        </div>

                        <div className="relative flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 text-[#88DECC] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={locationSearch}
                              onChange={(e) => handleLocationSearchChange(e.target.value)}
                              onFocus={() => {
                                if (predictions.length > 0) setShowLocationDropdown(true);
                              }}
                              placeholder="Search venue name or address (e.g. Omm Vihar, Infocity, Patia)..."
                              className="w-full h-9 pl-9 pr-8 bg-white/[0.05] border border-white/15 rounded-xl text-xs text-[#F5FAF6] placeholder-[#ECF1EF]/40 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/30 outline-none transition-all shadow-inner"
                            />
                            {(isSearchingLocation || isLoadingDetails) && (
                              <RotateCw className="w-3.5 h-3.5 animate-spin text-[#88DECC] absolute right-3 top-1/2 -translate-y-1/2" />
                            )}
                            {locationSearch && !isSearchingLocation && !isLoadingDetails && (
                              <button
                                type="button"
                                onClick={() => {
                                  setLocationSearch("");
                                  setPredictions([]);
                                  setShowLocationDropdown(false);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ECF1EF]/50 hover:text-[#F5FAF6] p-0.5 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setMapModalOpen(true)}
                            className="h-9 px-3 rounded-xl bg-[#88DECC]/15 hover:bg-[#88DECC]/25 border border-[#88DECC]/40 text-[#88DECC] text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-[0_0_12px_rgba(136,222,204,0.15)]"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Pick on Map</span>
                          </button>
                        </div>

                        {/* Live Dropdown Suggestions */}
                        {showLocationDropdown && predictions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#071318]/98 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] max-h-52 overflow-y-auto divide-y divide-white/8 animate-fade-in">
                            <div className="px-3 py-1.5 text-[9.5px] uppercase tracking-wider text-[#88DECC] font-mono flex items-center justify-between bg-white/[0.02]">
                              <span>Google Places Suggestions</span>
                              <span>Click to Pin</span>
                            </div>
                            {predictions.map((p) => (
                              <button
                                key={p.placeId}
                                type="button"
                                onClick={() => handleSelectPrediction(p)}
                                className="w-full text-left px-3.5 py-2.5 hover:bg-white/[0.09] transition-colors flex items-start gap-2.5 cursor-pointer group"
                              >
                                <MapPin className="w-3.5 h-3.5 text-[#88DECC] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-[#F5FAF6] font-medium leading-snug">
                                    {p.mainText}
                                  </div>
                                  {p.secondaryText && (
                                    <div className="text-[10.5px] text-[#ECF1EF]/60 leading-tight mt-0.5 truncate">
                                      {p.secondaryText}
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className="w-3 h-3 text-white/30 group-hover:text-[#88DECC] shrink-0 mt-1" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Verified Location Card (when selected) */}
                        {selectedPlace && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/30 space-y-2 shadow-sm animate-fade-in mt-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                                  <Navigation className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-xs text-[#F5FAF6] truncate max-w-[170px] sm:max-w-[220px]">
                                      {selectedPlace.name || "Selected Location"}
                                    </span>
                                    <span className="text-[8.5px] uppercase font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                      Verified
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#ECF1EF]/70 truncate max-w-[240px] sm:max-w-[300px]">
                                    {selectedPlace.formattedAddress}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setMapModalOpen(true)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#88DECC]/15 hover:bg-[#88DECC]/25 border border-[#88DECC]/40 text-[#88DECC] text-[10.5px] font-medium transition-all cursor-pointer"
                                >
                                  <Compass className="w-3 h-3" />
                                  <span>Adjust</span>
                                </button>
                                <a
                                  href={selectedPlace.googleMapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10.5px] font-medium transition-all"
                                >
                                  <span>Maps</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPlace(null);
                                    setLocationSearch("");
                                  }}
                                  className="px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-rose-300 text-[10.5px] transition-colors cursor-pointer"
                                >
                                  Clear
                                </button>
                              </div>
                            </div>

                            {/* Embedded Mini-Map Preview */}
                            {selectedPlace.location && (
                              <div
                                onClick={() => setMapModalOpen(true)}
                                className="relative w-full h-24 rounded-lg overflow-hidden border border-white/12 group cursor-pointer shadow-inner bg-[#03080B]"
                              >
                                <iframe
                                  title="Venue Location Preview"
                                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedPlace.location.lng - 0.008}%2C${selectedPlace.location.lat - 0.006}%2C${selectedPlace.location.lng + 0.008}%2C${selectedPlace.location.lat + 0.006}&layer=mapnik&marker=${selectedPlace.location.lat}%2C${selectedPlace.location.lng}`}
                                  className="w-full h-full border-0 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                                  tabIndex={-1}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#03080B]/90 via-transparent to-transparent flex items-end justify-between p-1.5">
                                  <span className="text-[9px] font-mono text-[#88DECC] bg-[#03080B]/90 px-2 py-0.5 rounded border border-[#88DECC]/40 flex items-center gap-1">
                                    <Compass className="w-2.5 h-2.5 text-[#88DECC]" />
                                    <span>Click to adjust pin</span>
                                  </span>
                                  <span className="text-[9px] font-mono text-[#F3D3A2] bg-[#03080B]/90 px-1.5 py-0.5 rounded border border-white/10">
                                    {selectedPlace.location.lat.toFixed(4)}°, {selectedPlace.location.lng.toFixed(4)}°
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Optional Room / Hall / Floor Input */}
                      <div>
                        <label className="font-mono text-[10px] uppercase tracking-wider text-[#ECF1EF]/70 block mb-1">
                          Room, Hall or Floor (Optional)
                        </label>
                        <input
                          type="text"
                          value={venueName}
                          onChange={(e) => setVenueName(e.target.value)}
                          placeholder="e.g. Auditorium Hall B, 3rd Floor"
                          className="w-full h-9 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/30 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Virtual Meeting URL (Virtual or Hybrid) */}
                  {(format === "virtual" || format === "hybrid") && (
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 font-semibold">
                          <Video className="w-3.5 h-3.5" />
                          <span>Virtual Meeting URL</span>
                        </label>
                        <span className="text-[9.5px] font-mono text-[#ECF1EF]/50">
                          Zoom / Meet / Teams
                        </span>
                      </div>
                      <input
                        type="url"
                        value={meetingUrl}
                        onChange={(e) => setMeetingUrl(e.target.value)}
                        placeholder="https://meet.google.com/abc-defg-hij or Zoom link"
                        className="w-full h-9 px-3 bg-white/[0.04] border border-white/12 rounded-xl text-xs text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Bottom Action Bar */}
              <div className="shrink-0 px-6 py-3 border-t border-white/10 bg-[#050D10]/95 backdrop-blur-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] text-[#ECF1EF]/60 font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#88DECC] animate-pulse" />
                  <span>
                    {format === "in_person"
                      ? "In-Person Session"
                      : format === "virtual"
                      ? "Virtual Session"
                      : "Hybrid Session"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
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
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#EEF1EA] text-[#03080B] font-semibold text-xs sm:text-sm hover:bg-white hover:shadow-[0_0_24px_rgba(136,222,204,0.4)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting && (
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-[#03080B]" />
                    )}
                    <span>{submitting ? "Publishing Event..." : "Publish Roundtable"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Interactive Google Maps Place Picker Modal ─────────────────────── */}
      <MapPickerModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onSelectLocation={(data: SelectedLocationData) => {
          setSelectedPlace(data);
          setLocationSearch(data.name || data.formattedAddress);
          if (!venueName.trim()) {
            setVenueName(data.name);
          }
        }}
        initialLocation={selectedPlace?.location}
        initialPlaceName={selectedPlace?.name}
        initialAddress={selectedPlace?.formattedAddress}
        initialQuery={locationSearch || venueName}
      />

      {/* ── Registered Attendees & RSVP Roster Modal ──────────────────────── */}
      {attendeesModalOpen && selectedEventForAttendees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-hidden">
          <div className="join-glass-panel border border-white/12 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_24px_90px_rgba(0,0,0,0.95)] relative text-left my-auto overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC] to-transparent z-20" />

            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-white/10 shrink-0 bg-[#050D10]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider text-[#88DECC] mb-0.5">
                  <Users className="w-3.5 h-3.5 text-[#88DECC]" />
                  <span>Event RSVP Roster &bull; Registered Members</span>
                </div>
                <h3 className="text-base sm:text-lg font-display font-light text-[#F5FAF6] tracking-tight">
                  {selectedEventForAttendees.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#ECF1EF]/60 mt-1 font-sans">
                  <span className="flex items-center gap-1 font-mono text-[#88DECC]">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedEventForAttendees.startAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-mono text-[#F3D3A2]">
                    <Clock className="w-3 h-3" />
                    {new Date(selectedEventForAttendees.startAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {selectedEventForAttendees.venueOrLink && (
                    <>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 truncate max-w-xs text-[#ECF1EF]/70">
                        <MapPin className="w-3 h-3 text-[#88DECC]" />
                        {selectedEventForAttendees.venueOrLink}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() =>
                    handleExportCSV(
                      selectedEventForAttendees.id,
                      selectedEventForAttendees.title
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-[#F5FAF6] text-xs font-medium transition-all cursor-pointer"
                  title="Download CSV Manifest"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#88DECC]" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEventToDelete(selectedEventForAttendees)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/25 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-xs font-medium transition-all cursor-pointer"
                  title="Remove this event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove Event</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAttendees(selectedEventForAttendees)}
                  className="p-1.5 rounded-full hover:bg-white/[0.08] text-[#ECF1EF]/60 hover:text-[#F5FAF6] transition-colors cursor-pointer"
                  title="Refresh Attendees"
                >
                  <RotateCw
                    className={`w-4 h-4 ${
                      loadingAttendees ? "animate-spin text-[#88DECC]" : ""
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setAttendeesModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/[0.08] text-[#ECF1EF]/60 hover:text-[#F5FAF6] transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="px-5 sm:px-6 py-3 border-b border-white/8 bg-white/[0.015] grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/8">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#ECF1EF]/60 block">
                  Total RSVPs
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-semibold text-[#F5FAF6]">
                    {attendees.length}
                  </span>
                  <span className="text-[11px] text-[#ECF1EF]/50 font-mono">
                    / {selectedEventForAttendees.capacity ? `${selectedEventForAttendees.capacity} max` : "unlimited"}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20">
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 block">
                  Checked In
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-semibold text-emerald-400">
                    {attendees.filter((a) => a.checkedInAt).length}
                  </span>
                  <span className="text-[11px] text-emerald-400/60 font-mono">
                    present
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/20">
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-300 block">
                  Attendance Rate
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-semibold text-cyan-300">
                    {attendees.length > 0
                      ? Math.round(
                          (attendees.filter((a) => a.checkedInAt).length /
                            attendees.length) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/8">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#ECF1EF]/60 block">
                  Audience Scope
                </span>
                <span className="text-xs font-medium text-[#F3D3A2] capitalize mt-1 block truncate">
                  {(selectedEventForAttendees.visibility || "").replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="px-5 sm:px-6 py-3 border-b border-white/8 bg-[#050D10]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 w-fit">
                {[
                  { id: "all", label: "All", count: attendees.length },
                  {
                    id: "registered",
                    label: "Confirmed",
                    count: attendees.filter((a) => a.status === "registered").length,
                  },
                  {
                    id: "checked_in",
                    label: "Checked In",
                    count: attendees.filter((a) => a.checkedInAt).length,
                  },
                  {
                    id: "waitlisted",
                    label: "Waitlist",
                    count: attendees.filter((a) => a.status === "waitlisted").length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAttendeeFilter(tab.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      attendeeFilter === tab.id
                        ? "bg-[#88DECC] text-[#03080B] font-semibold shadow-sm"
                        : "text-[#ECF1EF]/70 hover:text-[#F5FAF6] hover:bg-white/[0.05]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        attendeeFilter === tab.id
                          ? "bg-black/20 text-[#03080B]"
                          : "bg-white/[0.06] text-[#ECF1EF]/60"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#88DECC] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  placeholder="Filter name, email, role..."
                  className="w-full h-8 pl-8 pr-7 bg-white/[0.04] border border-white/12 rounded-xl text-xs text-[#F5FAF6] placeholder-[#ECF1EF]/40 focus:border-[#88DECC] focus:ring-1 focus:ring-[#88DECC]/20 outline-none transition-all"
                />
                {attendeeSearch && (
                  <button
                    type="button"
                    onClick={() => setAttendeeSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Attendees Scrollable List */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-2.5 divide-y divide-white/6">
              {loadingAttendees ? (
                <div className="flex flex-col items-center justify-center py-16 text-xs text-[#ECF1EF]/60 space-y-3">
                  <RotateCw className="w-6 h-6 animate-spin text-[#88DECC]" />
                  <span>Loading registered members...</span>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#88DECC]">
                    <Users className="w-6 h-6 opacity-60" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#F5FAF6]">
                      {attendees.length === 0
                        ? "No Registrations Yet"
                        : "No matching members found"}
                    </h4>
                    <p className="text-xs text-[#ECF1EF]/60 max-w-sm mt-0.5">
                      {attendees.length === 0
                        ? "Members who RSVP to this event will appear in this manifest with contact details and check-in options."
                        : `No members match "${attendeeSearch}". Try clearing your search filter.`}
                    </p>
                  </div>
                </div>
              ) : (
                filteredAttendees.map((att) => {
                  const profile = att.user?.profile;
                  const name = profile?.name || "OASIS Member";
                  const initials = name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();
                  const role = att.user?.primaryRole || "member";
                  const isCheckedIn = Boolean(att.checkedInAt);

                  return (
                    <div
                      key={att.id}
                      className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/8 transition-all group"
                    >
                      {/* Left: Avatar + Details */}
                      <div className="flex items-start gap-3 min-w-0">
                        {profile?.profilePhotoUrl ? (
                          <img
                            src={profile.profilePhotoUrl}
                            alt={name}
                            className="w-10 h-10 rounded-full object-cover border border-[#88DECC]/40 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#88DECC]/20 to-teal-950/60 border border-[#88DECC]/30 flex items-center justify-center font-mono text-xs font-semibold text-[#88DECC] shrink-0 shadow-inner">
                            {initials}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs sm:text-sm text-[#F5FAF6] truncate">
                              {name}
                            </span>

                            {/* Role Badge */}
                            <span
                              className={`text-[9px] uppercase font-mono px-2 py-0.2 rounded-full font-semibold border ${
                                role === "founder"
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : role === "investor"
                                  ? "bg-[#F3D3A2]/15 text-[#F3D3A2] border-[#F3D3A2]/30"
                                  : role === "mentor"
                                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                                  : "bg-white/[0.06] text-[#ECF1EF]/70 border-white/10"
                              }`}
                            >
                              {role}
                            </span>

                            {/* Status Chip if waitlisted */}
                            {att.status === "waitlisted" && (
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Waitlist #{att.waitlistPosition || "?"}
                              </span>
                            )}
                          </div>

                          {profile?.headline && (
                            <p className="text-[11px] text-[#ECF1EF]/70 truncate max-w-md font-sans">
                              {profile.headline}
                            </p>
                          )}

                          {/* Contact Info Row */}
                          <div className="flex flex-wrap items-center gap-3 text-[10.5px] text-[#ECF1EF]/60 font-mono mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#88DECC]" />
                              <span className="text-[#ECF1EF]/80 select-all">
                                {att.user?.email || "No email"}
                              </span>
                              {att.user?.email && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyEmail(att.user.email)}
                                  title="Copy Email"
                                  className="text-white/40 hover:text-[#88DECC] p-0.5 cursor-pointer"
                                >
                                  {copiedEmail === att.user.email ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5" />
                                  )}
                                </button>
                              )}
                            </div>

                            {att.user?.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#88DECC]" />
                                <span>{att.user.phone}</span>
                              </div>
                            )}

                            {profile?.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#F3D3A2]" />
                                <span>
                                  {profile.city}
                                  {profile.state ? `, ${profile.state}` : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Registration Time & Live Check-In Toggle */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] font-mono text-[#ECF1EF]/50 block">
                            Registered
                          </span>
                          <span className="text-[10.5px] font-mono text-[#ECF1EF]/80">
                            {new Date(att.registeredAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )}
                            ,{" "}
                            {new Date(att.registeredAt).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>

                        {/* Check-In Action Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleCheckIn(att.id)}
                          disabled={togglingRegId === att.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            isCheckedIn
                              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                              : "bg-white/[0.04] border border-white/12 text-[#ECF1EF]/70 hover:border-[#88DECC]/50 hover:bg-[#88DECC]/10 hover:text-[#88DECC]"
                          }`}
                          title={
                            isCheckedIn
                              ? `Checked in at ${new Date(
                                  att.checkedInAt!
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}. Click to undo.`
                              : "Click to check in attendee"
                          }
                        >
                          {togglingRegId === att.id ? (
                            <RotateCw className="w-3.5 h-3.5 animate-spin text-[#88DECC]" />
                          ) : isCheckedIn ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5 text-[#88DECC]" />
                          )}
                          <span>
                            {isCheckedIn ? "Checked In" : "Check In"}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="shrink-0 px-6 py-3 border-t border-white/10 bg-[#050D10]/95 backdrop-blur-md flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[#ECF1EF]/60">
                Showing {filteredAttendees.length} of {attendees.length} registered members
              </span>
              <button
                type="button"
                onClick={() => setAttendeesModalOpen(false)}
                className="px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#F5FAF6] text-xs font-medium transition-all cursor-pointer"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove Event Confirmation Modal ─────────────────────────────────── */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#050D10] border border-red-500/30 rounded-3xl p-6 shadow-[0_24px_90px_rgba(0,0,0,0.95)] overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[#F5FAF6] tracking-tight">
                  Remove Event
                </h3>
                <p className="text-xs text-[#ECF1EF]/70 mt-1 leading-relaxed">
                  Are you sure you want to delete this event? This action is permanent and will remove all attendee registrations and form configurations.
                </p>
              </div>
            </div>

            {/* Event Summary Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2 mb-6">
              <div className="text-xs font-semibold text-[#F5FAF6] truncate">
                {eventToDelete.title}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-[#ECF1EF]/60">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#88DECC]" />
                  {new Date(eventToDelete.startAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#F3D3A2]" />
                  {eventToDelete._count?.registrations ?? 0} registered member(s)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deletingEvent}
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#ECF1EF]/80 hover:text-[#F5FAF6] text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingEvent}
                onClick={handleDeleteEvent}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-semibold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {deletingEvent ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm & Remove</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
