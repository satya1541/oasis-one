"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Award, CheckCircle2, XCircle, Clock, Sparkles, RotateCw } from "lucide-react";

interface AchievementRecord {
  id: string;
  title: string;
  description?: string;
  status: "pending_review" | "approved" | "rejected";
  createdAt: string;
  author: {
    id: string;
    email: string;
    profile?: {
      name?: string;
    };
  };
}

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/achievements");
      if (res.ok) {
        const json = await res.json();
        setAchievements(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleDecision = async (id: string, decision: "approve" | "reject") => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/v1/admin/achievements/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });

      if (res.ok) {
        setAchievements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: decision === "approve" ? "approved" : "rejected" } : a))
        );
        setNotice(`Achievement ${decision === "approve" ? "approved for Member Showcase" : "rejected"}.`);
        setTimeout(() => setNotice(null), 3500);
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to process achievement decision");
      }
    } catch (err: any) {
      alert(err.message || "Failed to process achievement decision");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--text)]">
            Member Achievement Review Queue
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Review self-submitted milestone claims before they are pinned to the Member Home Showcase.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--success)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16 text-xs text-[var(--muted)] gap-2">
          <RotateCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
          <span>Loading submitted achievements...</span>
        </div>
      ) : achievements.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
          <Award className="w-8 h-8 text-[var(--muted)] mx-auto opacity-40" />
          <h3 className="font-display text-sm font-medium text-[var(--text)]">Queue Clear</h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            There are currently no member achievement milestones awaiting committee moderation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {achievements.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[var(--text)]">
                      {item.author.profile?.name || item.author.email}
                    </span>
                    <Badge variant={item.status === "approved" ? "success" : item.status === "rejected" ? "danger" : "warning"}>
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="text-xs font-mono text-[var(--muted)]">
                    Submitted {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === "pending_review" && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={processingId === item.id}
                        onClick={() => handleDecision(item.id, "reject")}
                        className="text-xs text-rose-600 dark:text-rose-400 gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        disabled={processingId === item.id}
                        onClick={() => handleDecision(item.id, "approve")}
                        className="text-xs gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve for Showcase
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                <div className="font-medium text-xs text-[var(--text)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                  <span>{item.title}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
