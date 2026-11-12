"use client";

import { useState } from "react";
import { Trophy, Send, X } from "lucide-react";
import { MemberAvatar } from "./MemberAvatar";
import { COMMUNITY_CATEGORIES, CommunityPost, CurrentMember } from "./types";

interface PostComposerProps {
  me: CurrentMember | null;
  onPostCreated: (post: CommunityPost) => void;
  onOpenMilestoneModal: () => void;
}

export function PostComposer({
  me,
  onPostCreated,
  onOpenMilestoneModal,
}: PostComposerProps) {
  const [expanded, setExpanded] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>("General");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarSrc = me?.profilePhotoUrl || me?.avatarUrl || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("/api/v1/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: showTitle ? title.trim() : "",
          body: body.trim(),
          category,
          type: "question",
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.error?.message || errJson.message || "Could not publish post"
        );
      }

      const json = await res.json();
      if (json?.data) {
        onPostCreated(json.data);
      }

      setTitle("");
      setBody("");
      setCategory("General");
      setShowTitle(false);
      setExpanded(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish post";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-1)]">
      {!expanded ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MemberAvatar name={me?.name} src={avatarSrc} size="md" />
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex-1 text-left px-4 py-2.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)] text-sm text-[var(--muted)] transition-colors cursor-pointer"
            >
              Start a post...
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]/60">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                Write update or question
              </button>
              <button
                type="button"
                onClick={onOpenMilestoneModal}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Share milestone</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <MemberAvatar name={me?.name} src={avatarSrc} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text)] truncate">
                  {me?.name || "Member"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label="Post topic"
                    className="text-xs px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                  >
                    {COMMUNITY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {!showTitle && (
                    <button
                      type="button"
                      onClick={() => setShowTitle(true)}
                      className="text-xs text-[var(--muted)] hover:text-[var(--text)] underline underline-offset-2 cursor-pointer"
                    >
                      + Add title
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setError(null);
              }}
              aria-label="Close post composer"
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-[var(--danger)]">
              {error}
            </div>
          )}

          {showTitle && (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Title (optional)"
              className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
            />
          )}

          <textarea
            rows={4}
            required
            autoFocus
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={10000}
            placeholder="What do you want to talk about? Ask a question, share a lesson, or post an update..."
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] resize-y leading-relaxed"
          />

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenMilestoneModal}
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Share milestone instead</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setExpanded(false);
                  setError(null);
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? "Posting..." : "Post"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

