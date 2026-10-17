"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MemberShell } from "@/components/layout/MemberShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Filter,
  X,
  Users,
  MessageSquare,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Shield,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SearchTab = "all" | "people" | "questions" | "events";

interface SearchPerson {
  id: string;
  name: string;
  role: string;
  roleLabel?: string;
  city?: string;
  headline?: string;
  bio?: string;
  verified?: boolean;
}

interface SearchQuestion {
  id: string;
  title: string;
  body?: string;
  author?: {
    name?: string;
  };
  city?: string;
  responseCount?: number;
  category?: string;
  createdAt?: string;
}

interface SearchEvent {
  id: string;
  title: string;
  startAt: string;
  venueOrLink?: string;
  registeredCount?: number;
  capacity?: number;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [selectedCity, setSelectedCity] = useState("All");

  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<SearchPerson[]>([]);
  const [questions, setQuestions] = useState<SearchQuestion[]>([]);
  const [events, setEvents] = useState<SearchEvent[]>([]);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    let isMounted = true;
    async function executeSearch() {
      try {
        setLoading(true);
        const typeParam =
          activeTab === "people"
            ? "people"
            : activeTab === "questions"
            ? "posts"
            : activeTab === "events"
            ? "events"
            : undefined;

        const url = `/api/v1/search?q=${encodeURIComponent(query || "")}${
          typeParam ? `&type=${typeParam}` : ""
        }`;

        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const data = json.data || {};
          if (isMounted) {
            setPeople(
              (data.people?.items || []).map((p: any) => ({
                id: p.id,
                name: p.name || "Member",
                role: p.role || "founder",
                roleLabel: p.role === "mentor" ? "Mentor" : p.role === "aspiring_entrepreneur" ? "Aspiring" : "Founder",
                city: p.city || "Odisha",
                headline: p.headline,
                bio: p.bio,
                verified: p.mentorVerified,
              }))
            );
            setQuestions(data.posts?.items || []);
            setEvents(data.events?.items || []);
          }
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [query, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const filteredPeople = people.filter(
    (p) => selectedCity === "All" || p.city?.toLowerCase() === selectedCity.toLowerCase()
  );

  return (
    <MemberShell>
      <div className="space-y-8 max-w-4xl mx-auto pb-20">
        {/* Header & Spotlight Search Bar */}
        <div className="space-y-6">
          <div className="pb-4 border-b border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#86601F]/10 dark:bg-[#F3D3A2]/10 border border-[#86601F]/20 dark:border-[#F3D3A2]/20 mb-3">
              <Search className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#86601F] dark:text-[#F3D3A2] font-semibold">
                Network Search
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-[var(--text)] tracking-tight">
              Spotlight Discovery
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 font-sans leading-relaxed">
              Instantly find vetted mentors, founder inquiries, and offline conclaves across Odisha.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="w-5 h-5 text-[#86601F] dark:text-[#F3D3A2] absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-focus-within:scale-110" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by topic, founder name, expertise, or upcoming conclave..."
              className="w-full h-14 pl-14 pr-12 text-sm sm:text-base bg-[var(--surface)] border border-[#D9CDAE]/80 dark:border-[#2C2E4A] rounded-2xl text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[#86601F]/30 dark:focus:ring-[#F3D3A2]/30 shadow-xs transition-all font-sans"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] p-1.5 rounded-full hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Filter Tabs & Location Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl bg-[#EFE8D8]/60 dark:bg-[#181928]/80 border border-[#D9CDAE]/50 dark:border-[#2C2E4A]">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer",
                activeTab === "all"
                  ? "bg-[#1E1F33] dark:bg-[#FBF7EE] text-[#FBF7EE] dark:text-[#1E1F33] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              All ({people.length + questions.length + events.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("people")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer",
                activeTab === "people"
                  ? "bg-[#1E1F33] dark:bg-[#FBF7EE] text-[#FBF7EE] dark:text-[#1E1F33] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              People ({people.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("questions")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer",
                activeTab === "questions"
                  ? "bg-[#1E1F33] dark:bg-[#FBF7EE] text-[#FBF7EE] dark:text-[#1E1F33] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              Questions ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer",
                activeTab === "events"
                  ? "bg-[#1E1F33] dark:bg-[#FBF7EE] text-[#FBF7EE] dark:text-[#1E1F33] font-semibold shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              Events ({events.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl bg-[var(--surface-2)] border border-[#D9CDAE]/60 dark:border-[#2C2E4A] text-[var(--text)] focus:outline-none cursor-pointer font-sans"
            >
              <option value="All">All Odisha Hubs</option>
              <option value="Bhubaneswar">Bhubaneswar</option>
              <option value="Cuttack">Cuttack</option>
              <option value="Rourkela">Rourkela</option>
              <option value="Sambalpur">Sambalpur</option>
            </select>
          </div>
        </div>

        {/* Results Stream */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--muted)] gap-3 text-xs">
            <RotateCw className="w-6 h-6 animate-spin text-[#86601F] dark:text-[#F3D3A2]" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Querying network index...</span>
          </div>
        ) : (
          <div className="space-y-10">
            {/* People Section */}
            {(activeTab === "all" || activeTab === "people") && filteredPeople.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                  <Users className="w-4 h-4 text-[#86601F] dark:text-[#F3D3A2]" />
                  <span>Members &amp; Advisors ({filteredPeople.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPeople.map((person) => (
                    <div
                      key={person.id}
                      className="group p-5 rounded-3xl bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/80 hover:border-[#86601F]/40 dark:hover:border-[#F3D3A2]/40 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-linear-to-b from-[#1E1F33] to-[#12131F] text-[#FBF7EE] font-display font-medium text-xs flex items-center justify-center border border-[#F3D3A2]/30 shadow-xs">
                              {person.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-[var(--text)] group-hover:text-[#86601F] dark:group-hover:text-[#F3D3A2] transition-colors">
                                  {person.name}
                                </span>
                                {person.verified && (
                                  <Shield className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#86601F]/10 text-[#86601F] dark:text-[#F3D3A2]">
                                  {person.roleLabel}
                                </span>
                                <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {person.city}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {person.headline && (
                          <p className="text-xs text-[var(--muted)] font-sans line-clamp-2 leading-relaxed">
                            {person.headline}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80 flex justify-end">
                        <Link
                          href={`/people/${person.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#86601F] dark:text-[#F3D3A2] hover:underline"
                        >
                          <span>View Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions Section */}
            {(activeTab === "all" || activeTab === "questions") && questions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                  <MessageSquare className="w-4 h-4 text-[#86601F] dark:text-[#F3D3A2]" />
                  <span>Founder Discussions ({questions.length})</span>
                </div>
                <div className="space-y-3">
                  {questions.map((q) => (
                    <Link
                      key={q.id}
                      href={`/community/${q.id}`}
                      className="block group p-5 rounded-3xl bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/80 hover:border-[#86601F]/40 dark:hover:border-[#F3D3A2]/40 shadow-xs hover:shadow-md transition-all duration-200"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                          <span className="font-mono text-[11px]">By {q.author?.name || "Anonymous Member"}</span>
                          <span className="flex items-center gap-1 text-[11px] font-mono text-[#86601F] dark:text-[#F3D3A2]">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {q.responseCount || 0} answers
                          </span>
                        </div>
                        <h3 className="font-display font-medium text-base text-[var(--text)] group-hover:text-[#86601F] dark:group-hover:text-[#F3D3A2] transition-colors leading-snug">
                          {q.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Events Section */}
            {(activeTab === "all" || activeTab === "events") && events.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                  <Calendar className="w-4 h-4 text-[#86601F] dark:text-[#F3D3A2]" />
                  <span>Scheduled Conclaves ({events.length})</span>
                </div>
                <div className="space-y-3">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="group p-5 rounded-3xl bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/80 hover:border-[#86601F]/40 dark:hover:border-[#F3D3A2]/40 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <h3 className="font-display font-medium text-base text-[var(--text)] group-hover:text-[#86601F] dark:group-hover:text-[#F3D3A2] transition-colors">
                          {ev.title}
                        </h3>
                        <p className="text-xs text-[var(--muted)] mt-1 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
                          <span>{ev.venueOrLink || "Bhubaneswar Innovation Center"}</span>
                        </p>
                      </div>
                      <Link href="/events">
                        <Button size="sm" variant="outline" className="rounded-xl text-xs">
                          <span>View Conclave</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {people.length === 0 && questions.length === 0 && events.length === 0 && (
              <div className="p-16 text-center rounded-3xl border border-dashed border-[#D9CDAE]/80 dark:border-[#2C2E4A] bg-[var(--surface)]/50 backdrop-blur-sm space-y-3">
                <Search className="w-10 h-10 text-[var(--muted)]/40 mx-auto" />
                <h3 className="font-display text-base font-medium text-[var(--text)]">No Matching Results</h3>
                <p className="text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
                  No records matched &ldquo;{query}&rdquo;. Try adjusting keywords or clearing city filters.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </MemberShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <SearchPageContent />
    </Suspense>
  );
}
