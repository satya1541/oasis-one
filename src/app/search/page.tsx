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
      <div className="space-y-6 max-w-4xl pb-16">
        {/* Header & Search Bar */}
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-3xl font-light text-[var(--text)] tracking-tight">
              Search Network
            </h1>
            <p className="text-xs text-[var(--muted)] mt-1">
              Search people, founder questions, and masterclasses across Odisha.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 text-[var(--muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across questions, mentors, and events..."
              className="w-full h-14 pl-12 pr-12 text-sm sm:text-base bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-xs transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Filter Tabs & Location Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer",
                activeTab === "all"
                  ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
              )}
            >
              All ({people.length + questions.length + events.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("people")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer",
                activeTab === "people"
                  ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
              )}
            >
              People ({people.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("questions")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer",
                activeTab === "questions"
                  ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
              )}
            >
              Questions ({questions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer",
                activeTab === "events"
                  ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
              )}
            >
              Events ({events.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--muted)]" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none cursor-pointer"
            >
              <option value="All">All Locations</option>
              <option value="Bhubaneswar">Bhubaneswar</option>
              <option value="Cuttack">Cuttack</option>
              <option value="Rourkela">Rourkela</option>
              <option value="Sambalpur">Sambalpur</option>
            </select>
          </div>
        </div>

        {/* Results Stream */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--muted)] gap-2 text-xs">
            <RotateCw className="w-5 h-5 animate-spin text-[var(--accent)]" />
            <span>Searching live network records...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* People Section */}
            {(activeTab === "all" || activeTab === "people") && filteredPeople.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  <Users className="w-4 h-4 text-[var(--accent)]" />
                  <span>People ({filteredPeople.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPeople.map((person) => (
                    <Card key={person.id} hoverEffect className="p-4 border-[var(--border)] space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] text-[var(--text)] font-display font-medium text-xs flex items-center justify-center border border-[var(--border)]">
                            {person.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-[var(--text)]">{person.name}</span>
                              <Badge variant={person.role as any}>{person.roleLabel}</Badge>
                            </div>
                            <span className="text-[11px] text-[var(--muted)]">{person.city}</span>
                          </div>
                        </div>
                        {person.verified && <Shield className="w-4 h-4 text-[var(--brand-gold)]" />}
                      </div>
                      <p className="text-xs text-[var(--muted)] line-clamp-2">{person.headline || person.bio}</p>
                      <div className="pt-2 border-t border-[var(--border)] text-right">
                        <Link href={`/people/${person.id}`} className="text-xs text-[var(--accent)] hover:underline">
                          View Profile →
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Questions Section */}
            {(activeTab === "all" || activeTab === "questions") && questions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
                  <span>Community Questions ({questions.length})</span>
                </div>
                <div className="space-y-3">
                  {questions.map((q) => (
                    <Card key={q.id} hoverEffect className="p-4 border-[var(--border)]">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                          <span>By {q.author?.name || "Member"}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {q.responseCount || 0} replies
                          </span>
                        </div>
                        <Link href={`/community/${q.id}`}>
                          <h3 className="font-medium text-sm text-[var(--text)] hover:text-[var(--accent)]">
                            {q.title}
                          </h3>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Events Section */}
            {(activeTab === "all" || activeTab === "events") && events.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  <Calendar className="w-4 h-4 text-[var(--accent)]" />
                  <span>Events ({events.length})</span>
                </div>
                <div className="space-y-3">
                  {events.map((ev) => (
                    <Card key={ev.id} hoverEffect className="p-4 border-[var(--border)] flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm text-[var(--text)]">{ev.title}</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">{ev.venueOrLink || "Bhubaneswar"}</p>
                      </div>
                      <Link href="/events">
                        <Button size="sm" variant="outline">
                          View Event
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {people.length === 0 && questions.length === 0 && events.length === 0 && (
              <Card className="p-12 text-center text-xs text-[var(--muted)] border-dashed">
                No matching results found for &ldquo;{query}&rdquo;. Try another term or clear the filter.
              </Card>
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
