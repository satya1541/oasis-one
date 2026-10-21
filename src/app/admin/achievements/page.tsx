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
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light font-display text-[#F5FAF6] tracking-tight">
            Member Achievement Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#ECF1EF]/70 font-sans mt-1">
            Review self-submitted milestone claims before they are pinned to the Member Home Showcase.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16 text-xs text-[#ECF1EF]/60 gap-2">
          <RotateCw className="w-4 h-4 animate-spin text-[#88DECC]" />
          <span>Loading submitted achievements...</span>
        </div>
      ) : achievements.length === 0 ? (
        <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-16 text-center border border-white/10 relative overflow-hidden space-y-3 shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F3D3A2]/30 to-transparent" />
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#F3D3A2] mx-auto shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-display text-base font-light text-[#F5FAF6]">Queue Clear</h3>
          <p className="text-xs text-[#ECF1EF]/60 max-w-sm mx-auto font-sans leading-relaxed">
            There are currently no member achievement milestones awaiting committee moderation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {achievements.map((item) => (
            <div
              key={item.id}
              className="join-glass-panel rounded-2xl p-6 border border-white/10 hover:border-[#F3D3A2]/40 transition-all relative overflow-hidden space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F3D3A2]/25 to-transparent" />
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-sm text-[#F5FAF6]">
                      {item.author.profile?.name || item.author.email}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full font-semibold border ${
                        item.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : item.status === "rejected"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#ECF1EF]/60">
                    Submitted {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === "pending_review" && (
                    <>
                      <button
                        type="button"
                        disabled={processingId === item.id}
                        onClick={() => handleDecision(item.id, "reject")}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-xs text-rose-300 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        disabled={processingId === item.id}
                        onClick={() => handleDecision(item.id, "approve")}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EEF1EA] text-[#03080B] hover:bg-white text-xs font-semibold hover:shadow-[0_0_20px_rgba(136,222,204,0.35)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve for Showcase</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="font-medium text-xs text-[#F5FAF6] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F3D3A2]" />
                  <span>{item.title}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-[#ECF1EF]/70 leading-relaxed font-sans">
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
