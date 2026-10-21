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
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "mentors" | "directory" | "connections";

interface MentorItem {
  id: string;
  name: string;
  city?: string;
  state?: string;
  headline?: string;
  bio?: string;
  mentorVerified?: boolean;
  mentorAvailability?: string;
  tags?: { id: string; name: string; category: string }[];
}

interface DirectoryPerson {
  id: string;
  name?: string;
  headline?: string;
  bio?: string;
  city?: string;
  state?: string;
  role: string;
  startup?: {
    name: string;
    industry?: string;
    stage?: string;
  };
}

interface ConnectionItem {
  id: string;
  status: string;
  otherUser: {
    id: string;
    name?: string;
    headline?: string;
    role?: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
}

export default function PeoplePage() {
  const [activeTab, setActiveTab] = useState<Tab>("mentors");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");

  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [directory, setDirectory] = useState<DirectoryPerson[]>([]);
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        } else if (activeTab === "directory") {
          const res = await fetch("/api/v1/profiles");
          if (res.ok) {
            const json = await res.json();
            if (isMounted) setDirectory(json.data || []);
          }
        } else if (activeTab === "connections") {
          const res = await fetch("/api/v1/connections?box=active");
          if (res.ok) {
            const json = await res.json();
            if (isMounted) setConnections(json.data || []);
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
  }, [activeTab]);

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
    const matchesCity = selectedCity === "All" || p.city?.toLowerCase() === selectedCity.toLowerCase();
    const matchesQuery =
      !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.headline?.toLowerCase().includes(searchQuery.toLowerCase());
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
          <div className="flex items-center rounded-2xl bg-[var(--surface-2)] p-1.5 border border-[var(--border)] text-xs shadow-xs w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => setActiveTab("mentors")}
              className={cn(
                "flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl font-medium transition-all duration-200 cursor-pointer text-center",
                activeTab === "mentors"
                  ? "bg-[var(--surface)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              Mentors
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("directory")}
              className={cn(
                "flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl font-medium transition-all duration-200 cursor-pointer text-center",
                activeTab === "directory"
                  ? "bg-[var(--surface)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              Directory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("connections")}
              className={cn(
                "flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl font-medium transition-all duration-200 cursor-pointer text-center",
                activeTab === "connections"
                  ? "bg-[var(--surface)] text-[var(--text)] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              Connections
            </button>
          </div>
        </div>

        {/* Search & Location Bar */}
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

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--muted)] shrink-0 hidden sm:block" />
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

                  return (
                    <Card key={m.id} hoverEffect className="p-5 flex flex-col justify-between border-[var(--border)]">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] text-[var(--accent)] font-display font-medium text-sm flex items-center justify-center border-2 border-[var(--brand-gold)]">
                            {initials}
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
                        <Link
                          href={`/people/${m.id}`}
                          className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          View Profile & Connect →
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Directory */}
        {activeTab === "directory" && (
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

                  return (
                    <Card key={p.id} hoverEffect className="p-5 flex flex-col justify-between border-[var(--border)]">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] text-[var(--text)] font-display font-medium text-sm flex items-center justify-center border border-[var(--border)]">
                            {initials}
                          </div>
                          <Badge
                            variant={
                              p.role === "mentor"
                                ? "mentor"
                                : p.role === "aspiring_entrepreneur"
                                ? "aspiring"
                                : "founder"
                            }
                          >
                            {p.role === "mentor"
                              ? "Mentor"
                              : p.role === "aspiring_entrepreneur"
                              ? "Aspiring"
                              : "Founder"}
                          </Badge>
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
                          href={`/people/${p.id}`}
                          className="text-xs font-semibold text-[var(--accent)] hover:underline block text-right"
                        >
                          View Profile →
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
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-[var(--muted)] gap-2 text-xs">
                <RotateCw className="w-5 h-5 animate-spin text-[var(--accent)]" />
                <span>Loading your connections...</span>
              </div>
            ) : connections.length === 0 ? (
              <Card className="p-12 text-center text-xs text-[var(--muted)] border-dashed">
                You do not have any active connections yet. Request a mentor or connect with a peer founder above!
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map((c) => (
                  <Card key={c.id} className="p-5 border-[var(--border)] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-[var(--text)]">
                        {c.otherUser.name || "Member"}
                      </h4>
                      <Badge variant="success">Connected</Badge>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      {c.otherUser.headline || c.otherUser.role || "Member"}
                    </p>
                    {c.otherUser.email && (
                      <p className="text-xs font-mono text-[var(--accent)]">
                        {c.otherUser.email}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MemberShell>
  );
}
