"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Plus, Tag, Search, Edit2, GitMerge, Archive, AlertCircle, Check, RotateCw } from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  category: "sector" | "expertise" | "support" | string;
  usageCount?: number;
  status?: "active" | "retired";
}

export default function AdminTaxonomyPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagCategory, setNewTagCategory] = useState<"sector" | "expertise">("sector");
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/taxonomy/tags");
      if (res.ok) {
        const json = await res.json();
        setTags(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load taxonomy tags:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const filteredTags = tags.filter((t) => {
    const matchesCat = filterCategory === "all" || t.category === filterCategory;
    const matchesQuery = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/admin/taxonomy/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTagName.trim(),
          category: newTagCategory,
        }),
      });

      if (res.ok) {
        setActionFeedback(`Added new tag "${newTagName.trim()}"`);
        setNewTagName("");
        await fetchTags();
        setTimeout(() => setActionFeedback(null), 3000);
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to create tag");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create tag");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMergeTags = async () => {
    if (!selectedTag || !mergeTargetId) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/admin/taxonomy/tags/${selectedTag.id}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetTagId: mergeTargetId }),
      });

      if (res.ok) {
        setActionFeedback(`Merged "${selectedTag.name}" successfully.`);
        setSelectedTag(null);
        setMergeTargetId("");
        await fetchTags();
        setTimeout(() => setActionFeedback(null), 3000);
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to merge tags");
      }
    } catch (err: any) {
      alert(err.message || "Failed to merge tags");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-display font-medium text-[var(--text)]">
            Taxonomy & Sector Domain Registry
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Curate standardized industry sectors and founder competencies to maintain high search signal.
          </p>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-[var(--success)] flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* ── Add New Tag & Controls ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-[var(--accent)]" />
              <span>Register New Tag</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTag} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                  Tag Name
                </label>
                <input
                  type="text"
                  required
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g. BioMaterials"
                  className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                  Category
                </label>
                <select
                  value={newTagCategory}
                  onChange={(e) => setNewTagCategory(e.target.value as any)}
                  className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                  <option value="sector">Sector / Industry Domain</option>
                  <option value="expertise">Core Mentorship Expertise</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? "Adding..." : "Add to Registry"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Active Tag List ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered tags..."
                className="w-full h-10 pl-9 pr-3 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {["all", "sector", "expertise"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors cursor-pointer ${
                    filterCategory === cat
                      ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] font-medium"
                      : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <Card>
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
              <span>{filteredTags.length} registered tags</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12 text-xs text-[var(--muted)] gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
                <span>Loading tags from database...</span>
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="p-12 text-center text-xs text-[var(--muted)]">
                No tags found matching filter.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {filteredTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-[var(--accent)] shrink-0" />
                      <div>
                        <div className="font-medium text-xs text-[var(--text)]">{tag.name}</div>
                        <span className="text-[10px] uppercase font-mono text-[var(--muted)]">
                          {tag.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedTag(tag)}
                        className="text-xs gap-1"
                      >
                        <GitMerge className="w-3.5 h-3.5" />
                        <span>Merge</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Merge Modal ───────────────────────────────────────────────────── */}
      {selectedTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-display font-medium text-[var(--text)]">
              Merge Tag &quot;{selectedTag.name}&quot;
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Consolidate members and posts using &quot;{selectedTag.name}&quot; into another canonical tag.
            </p>

            <div>
              <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1 text-xs">
                Select Canonical Target Tag
              </label>
              <select
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              >
                <option value="">Choose target tag...</option>
                {tags
                  .filter((t) => t.id !== selectedTag.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!mergeTargetId || submitting}
                onClick={handleMergeTags}
              >
                {submitting ? "Merging..." : "Confirm Merge"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
