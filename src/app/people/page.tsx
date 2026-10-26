"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Briefcase,
  UserCheck,
  Send,
  Clock,
  RotateCw,
  CheckCircle2,
  Mail,
  Phone,
  Inbox,
  SendHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "all" | "mentors" | "founders" | "aspiring" | "connections";

interface MentorItem {
  id: string;
  name: string;
  city?: string;
  state?: string;
  headline?: string;
  bio?: string;
  mentorVerified?: boolean;
  mentorAvailability?: string;
  profilePhotoUrl?: string | null;
  tags?: { id: string; name: string; category: string }[];
}

interface DirectoryPerson {
  id: string;
  name?: string;
  headline?: string;
  bio?: string;
  city?: string;
  state?: string;
  role?: string;
  primaryRole?: string;
  adminLevel?: string | null;
  profilePhotoUrl?: string | null;
  startup?: {
    name: string;
    industry?: string;
    stage?: string;
  };
}

interface ConnectionItem {
  id: string;
  status: string;
  message?: string | null;
  senderId?: string;
  recipientId?: string;
  otherUser: {
    id: string;
    name?: string;
    headline?: string;
    role?: string;
    avatarUrl?: string;
    city?: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
  expiresAt?: string;
}

export default function PeoplePage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");

  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [directory, setDirectory] = useState<DirectoryPerson[]>([]);
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [connectionBox, setConnectionBox] = useState<"active" | "incoming" | "outgoing">("active");
  const [incomingCount, setIncomingCount] = useState<number>(0);
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadIncomingCount = async () => {
    try {
      const res = await fetch("/api/v1/connections?box=incoming");
      if (res.ok) {
        const json = await res.json();
        setIncomingCount((json.data || []).length);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.id) {
          setCurrentUserId(json.data.id);
          loadIncomingCount();
        }
      })
      .catch(() => {});
  }, []);

  const loadConnections = async (box: "active" | "incoming" | "outgoing") => {
    try {
      const res = await fetch(`/api/v1/connections?box=${box}`);
      if (res.ok) {
        const json = await res.json();
        setConnections(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load connections:", err);
    }
  };

  const handleConnectionAction = async (
    connectionId: string,
    action: "accept" | "decline" | "cancel"
  ) => {
    try {
      setActionPendingId(connectionId);
      const res = await fetch(`/api/v1/connections/${connectionId}/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || errJson.message || `Failed to ${action} request`);
      }
      await loadConnections(connectionBox);
      await loadIncomingCount();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} request`);
    } finally {
      setActionPendingId(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        if (activeTab === "mentors") {
          const res = await fetch("/api/v1/mentors");
          if (res.ok) {
            const json = await res.json();
            if (isMounted) setMentors(json.data || []);
          }
        } else if (activeTab === "connections") {
          const res = await fetch(`/api/v1/connections?box=${connectionBox}`);
          if (res.ok) {
            const json = await res.json();
            if (isMounted) setConnections(json.data || []);
          }
          loadIncomingCount();
        } else {
          // "all", "founders", "aspiring"
          const res = await fetch("/api/v1/profiles");
          if (res.ok) {
            const json = await res.json();
            if (isMounted) setDirectory(json.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load people data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeTab, connectionBox]);

  const filteredMentors = mentors.filter((m) => {
    const matchesCity = selectedCity === "All" || m.city?.toLowerCase() === selectedCity.toLowerCase();
    const matchesQuery =
      !searchQuery.trim() ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesQuery;
  });

  const filteredDirectory = directory.filter((p) => {
    // 1. Strictly exclude admin / superadmin profiles
    if (p.adminLevel) return false;
    const headline = p.headline?.toLowerCase() || "";
    const name = p.name?.toLowerCase() || "";
    if (
      headline.includes("super administrator") ||
      headline.includes("platform administrator") ||
      headline.includes("oasis super administrator") ||
      headline.includes("governance lead")
    ) {
      return false;
    }
    if (name.includes("(super admin)") || name.includes("thynx admin")) {
      return false;
    }

    // 2. Tab role filter
    const role = p.primaryRole || p.role;
    if (activeTab === "founders" && role !== "founder") return false;
    if (activeTab === "aspiring" && role !== "aspiring_entrepreneur") return false;
    if (activeTab === "mentors" && role !== "mentor") return false;

    // 3. Dropdown role filter
    if (selectedRole !== "All" && role !== selectedRole) return false;

    // 4. City filter
    const matchesCity = selectedCity === "All" || p.city?.toLowerCase() === selectedCity.toLowerCase();

    // 5. Query filter
    const matchesQuery =
      !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesQuery;
  });

  return (
    <MemberShell>
      <div className="space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight">
              People
            </h1>
            <p className="text-xs text-[var(--muted)] mt-1">
              Connect with vetted founders, domain mentors, and aspiring builders across Odisha.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center rounded-2xl bg-[var(--surface-2)] p-1.5 border border-[var(--border)] text-xs shadow-xs w-full sm:w-auto overflow-x-auto gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
                setSelectedRole("All");
              }}
              className={cn(
                "flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl font-medium transition-all duration-200 cursor-pointer text-center whitespace-nowrap",
                activeTab === "all"
                  ? "bg-[var(--surface)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("mentors");
                setSelectedRole("mentor");
              }}
              className={cn(
                "flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl font-medium transition-all duration-200 cursor-pointer text-center whitespace-nowrap",
                activeTab === "mentors"
                  ? "bg-[var(--surface)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              Mentors
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("founders");
                setSelectedRole("founder");
              }}
              className={cn(
                "flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl font-medium transition-all duration-200 cursor-pointer text-center whitespace-nowrap",
                activeTab === "founders"
                  ? "bg-[var(--surface)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              Founders
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("aspiring");
                setSelectedRole("aspiring_entrepreneur");
              }}
              className={cn(
                "flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl font-medium transition-all duration-200 cursor-pointer text-center whitespace-nowrap",
                activeTab === "aspiring"
                  ? "bg-[var(--surface)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              Aspiring
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("connections");
              }}
              className={cn(
                "flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl font-medium transition-all duration-200 cursor-pointer text-center whitespace-nowrap flex items-center justify-center gap-1.5",
                activeTab === "connections"
                  ? "bg-[var(--surface)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              <span>Connections</span>
              {incomingCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#88DECC] text-[#030909] font-bold">
                  {incomingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, expertise, or startup..."
              className="w-full h-11 min-h-[44px] pl-10 pr-4 text-xs sm:text-sm bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--muted)] shrink-0 hidden sm:block" />
            <select
              value={selectedRole}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedRole(val);
                if (val === "All") setActiveTab("all");
                else if (val === "founder") setActiveTab("founders");
                else if (val === "mentor") setActiveTab("mentors");
                else if (val === "aspiring_entrepreneur") setActiveTab("aspiring");
              }}
              style={{ colorScheme: "dark" }}
              className="w-full sm:w-auto h-11 min-h-[44px] px-3.5 text-xs rounded-xl bg-[#070D12] border border-white/10 text-[#F5FAF6] focus:outline-none focus:ring-1 focus:ring-[#88DECC] cursor-pointer"
            >
              <option value="All" className="bg-[#070D12] text-[#F5FAF6]">All Roles</option>
              <option value="founder" className="bg-[#070D12] text-[#F5FAF6]">Founders</option>
              <option value="mentor" className="bg-[#070D12] text-[#F5FAF6]">Mentors</option>
              <option value="aspiring_entrepreneur" className="bg-[#070D12] text-[#F5FAF6]">Aspiring Builders</option>
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="w-full sm:w-auto h-11 min-h-[44px] px-3.5 text-xs rounded-xl bg-[#070D12] border border-white/10 text-[#F5FAF6] focus:outline-none focus:ring-1 focus:ring-[#88DECC] cursor-pointer"
            >
              <option value="All" className="bg-[#070D12] text-[#F5FAF6]">All Odisha Locations</option>
              <option value="Bhubaneswar" className="bg-[#070D12] text-[#F5FAF6]">Bhubaneswar</option>
              <option value="Cuttack" className="bg-[#070D12] text-[#F5FAF6]">Cuttack</option>
              <option value="Rourkela" className="bg-[#070D12] text-[#F5FAF6]">Rourkela</option>
              <option value="Sambalpur" className="bg-[#070D12] text-[#F5FAF6]">Sambalpur</option>
              <option value="Berhampur" className="bg-[#070D12] text-[#F5FAF6]">Berhampur</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Mentors */}
        {activeTab === "mentors" && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-[var(--muted)] gap-2 text-xs">
                <RotateCw className="w-5 h-5 animate-spin text-[var(--accent)]" />
                <span>Loading mentors...</span>
              </div>
            ) : filteredMentors.length === 0 ? (
              <Card className="p-12 text-center text-xs text-[var(--muted)] border-dashed">
                No verified mentors found matching your filters.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMentors.map((m) => {
                  const initials = m.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const isSelf = currentUserId && m.id === currentUserId;

                  return (
                    <Card key={m.id} hoverEffect className="p-5 flex flex-col justify-between border-[var(--border)]">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] text-[var(--accent)] font-display font-medium text-sm flex items-center justify-center border-2 border-[var(--brand-gold)] overflow-hidden shrink-0">
                            {m.profilePhotoUrl ? (
                              <img
                                src={m.profilePhotoUrl}
                                alt={m.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <Badge variant="verified-mentor">Verified Mentor</Badge>
                        </div>

                        <div>
                          <h3 className="font-display text-base font-semibold text-[var(--text)]">
                            {m.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mt-1">
                            <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span>{m.city || "Odisha"}</span>
                          </div>
                        </div>

                        <p className="text-xs font-medium text-[var(--text)] line-clamp-2">
                          {m.headline || "Ecosystem Mentor & Strategic Advisor"}
                        </p>

                        <p className="text-xs text-[var(--muted)] line-clamp-3 leading-relaxed">
                          {m.bio || "Active mentor advising founders across the Odisha startup network."}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[var(--muted)]">
                          {m.mentorAvailability === "active" ? "Available" : "Limited slots"}
                        </span>
                        {isSelf ? (
                          <Link
                            href="/profile"
                            className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
                          >
                            Your Profile →
                          </Link>
                        ) : (
                          <Link
                            href={`/people/${m.id}`}
                            className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
                          >
                            View Profile & Connect →
                          </Link>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Directory / All / Founders / Aspiring */}
        {(activeTab === "all" || activeTab === "founders" || activeTab === "aspiring") && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-[var(--muted)] gap-2 text-xs">
                <RotateCw className="w-5 h-5 animate-spin text-[var(--accent)]" />
                <span>Loading member directory...</span>
              </div>
            ) : filteredDirectory.length === 0 ? (
              <Card className="p-12 text-center text-xs text-[var(--muted)] border-dashed">
                No members found matching your search.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDirectory.map((p) => {
                  const initials = (p.name || "Member")
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const isSelf = currentUserId && p.id === currentUserId;
                  const role = p.primaryRole || p.role;

                  return (
                    <Card key={p.id} hoverEffect className="p-5 flex flex-col justify-between border-[var(--border)]">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] text-[var(--text)] font-display font-medium text-sm flex items-center justify-center border border-[var(--border)] overflow-hidden shrink-0">
                            {p.profilePhotoUrl ? (
                              <img
                                src={p.profilePhotoUrl}
                                alt={p.name || "Member"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          {role === "mentor" ? (
                            <Badge variant="verified-mentor">Verified Mentor</Badge>
                          ) : (
                            <Badge
                              variant={
                                role === "aspiring_entrepreneur"
                                  ? "aspiring"
                                  : "founder"
                              }
                            >
                              {role === "aspiring_entrepreneur"
                                ? "Aspiring"
                                : "Founder"}
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className="font-display text-base font-semibold text-[var(--text)]">
                            {p.name || "Member"}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mt-1">
                            <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span>{p.city || "Odisha"}</span>
                          </div>
                        </div>

                        <p className="text-xs font-medium text-[var(--text)] line-clamp-2">
                          {p.headline || (p.startup ? `Founder @ ${p.startup.name}` : "Odisha Cohort Member")}
                        </p>

                        <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                          {p.bio || "Active member in the OASIS entrepreneur network."}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[var(--border)]">
                        <Link
                          href={isSelf ? "/profile" : `/people/${p.id}`}
                          className="text-xs font-semibold text-[var(--accent)] hover:underline block text-right"
                        >
                          {isSelf ? "Your Profile →" : "View Profile →"}
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Connections */}
        {activeTab === "connections" && (
          <div className="space-y-6">
            {/* Connections Sub-Navigation */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setConnectionBox("active")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  connectionBox === "active"
                    ? "bg-[#88DECC]/10 text-[#88DECC] border border-[#88DECC]/30 font-semibold"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
                )}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Connected Members</span>
                {connectionBox === "active" && connections.length > 0 && (
                  <span className="text-[10px] opacity-75 font-mono">({connections.length})</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setConnectionBox("incoming")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  connectionBox === "incoming"
                    ? "bg-[#88DECC]/10 text-[#88DECC] border border-[#88DECC]/30 font-semibold"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
                )}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Incoming Requests</span>
                {incomingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#88DECC] text-[#030909] font-bold text-[10px]">
                    {incomingCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setConnectionBox("outgoing")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  connectionBox === "outgoing"
                    ? "bg-[#88DECC]/10 text-[#88DECC] border border-[#88DECC]/30 font-semibold"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
                )}
              >
                <SendHorizontal className="w-3.5 h-3.5" />
                <span>Sent Requests</span>
                {connectionBox === "outgoing" && connections.length > 0 && (
                  <span className="text-[10px] opacity-75 font-mono">({connections.length})</span>
                )}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-[var(--muted)] gap-2 text-xs">
                <RotateCw className="w-5 h-5 animate-spin text-[var(--accent)]" />
                <span>Loading connections...</span>
              </div>
            ) : connections.length === 0 ? (
              <Card className="p-12 text-center text-xs text-[var(--muted)] border-dashed">
                {connectionBox === "active" && (
                  <div className="space-y-1">
                    <UserCheck className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-[var(--text)]">No connected members yet</p>
                    <p>Connect with mentors, founders, or aspiring builders across Odisha!</p>
                  </div>
                )}
                {connectionBox === "incoming" && (
                  <div className="space-y-1">
                    <Inbox className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-[var(--text)]">No pending incoming requests</p>
                    <p>When another OASIS member requests to connect with you, it will appear here.</p>
                  </div>
                )}
                {connectionBox === "outgoing" && (
                  <div className="space-y-1">
                    <SendHorizontal className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-[var(--text)]">No pending sent requests</p>
                    <p>Browse members and request connections to grow your network.</p>
                  </div>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map((c) => {
                  const initials = (c.otherUser.name || "Member")
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const roleLabel = (c.otherUser.role || "Member").replace(/_/g, " ");
                  const isPendingAction = actionPendingId === c.id;

                  return (
                    <Card key={c.id} className="p-5 border-[var(--border)] space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] text-[var(--accent)] font-medium text-sm flex items-center justify-center border border-[var(--border)] shrink-0 overflow-hidden">
                            {c.otherUser.avatarUrl ? (
                              <img
                                src={c.otherUser.avatarUrl}
                                alt={c.otherUser.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-[var(--text)]">
                              {c.otherUser.name || "Member"}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-0.5">
                              <span className="capitalize">{roleLabel}</span>
                              {c.otherUser.city && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-3 h-3 text-[var(--accent)]" />
                                    {c.otherUser.city}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {connectionBox === "active" && (
                          <Badge variant="success">Connected</Badge>
                        )}
                        {connectionBox === "incoming" && (
                          <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">
                            Incoming
                          </Badge>
                        )}
                        {connectionBox === "outgoing" && (
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                            Pending
                          </Badge>
                        )}
                      </div>

                      {c.otherUser.headline && (
                        <p className="text-xs text-[var(--text)]/80 font-medium line-clamp-1">
                          {c.otherUser.headline}
                        </p>
                      )}

                      {/* Intro Message note if any */}
                      {c.message && (
                        <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted)] italic">
                          "{c.message}"
                        </div>
                      )}

                      {/* Active Connected Contacts (DPDP mutual consent) */}
                      {connectionBox === "active" && (c.otherUser.email || c.otherUser.phone) && (
                        <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-2 text-xs font-mono">
                          {c.otherUser.email && (
                            <a
                              href={`mailto:${c.otherUser.email}`}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--accent)] hover:underline"
                            >
                              <Mail className="w-3 h-3" />
                              <span>{c.otherUser.email}</span>
                            </a>
                          )}
                          {c.otherUser.phone && (
                            <a
                              href={`tel:${c.otherUser.phone}`}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--accent)] hover:underline"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{c.otherUser.phone}</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                        <Link
                          href={`/people/${c.otherUser.id}`}
                          className="text-xs font-semibold text-[var(--accent)] hover:underline"
                        >
                          View Profile →
                        </Link>

                        {connectionBox === "incoming" && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={isPendingAction}
                              onClick={() => handleConnectionAction(c.id, "accept")}
                              className="gap-1 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                              {isPendingAction ? (
                                <RotateCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={isPendingAction}
                              onClick={() => handleConnectionAction(c.id, "decline")}
                              className="cursor-pointer text-rose-400 hover:text-rose-300"
                            >
                              Decline
                            </Button>
                          </div>
                        )}

                        {connectionBox === "outgoing" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isPendingAction}
                            onClick={() => handleConnectionAction(c.id, "cancel")}
                            className="cursor-pointer text-[var(--muted)] hover:text-rose-400"
                          >
                            {isPendingAction ? (
                              <RotateCw className="w-3 h-3 animate-spin" />
                            ) : (
                              "Cancel Request"
                            )}
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </MemberShell>
  );
}
