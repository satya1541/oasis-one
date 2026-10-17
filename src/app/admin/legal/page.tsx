"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  FileText,
  FileCheck,
  PlusCircle,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  X,
  ExternalLink,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LegalDoc {
  id: string;
  type: "privacy_notice" | "community_guidelines";
  version: string;
  title: string;
  body: string;
  isCurrent: boolean;
  publishedAt: string;
  publishedBy?: string;
}

export default function AdminLegalPage() {
  const [documents, setDocuments] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserLevel, setCurrentUserLevel] = useState<string | null>(null);

  // New Version Modal
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [docType, setDocType] = useState<"privacy_notice" | "community_guidelines">("privacy_notice");
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Preview Drawer
  const [previewDoc, setPreviewDoc] = useState<LegalDoc | null>(null);

  const fetchLegalDocs = async () => {
    try {
      setLoading(true);
      const [meRes, legalRes] = await Promise.all([
        fetch("/api/v1/auth/me"),
        fetch("/api/v1/admin/legal"),
      ]);

      if (meRes.ok) {
        const meJson = await meRes.json();
        setCurrentUserLevel(meJson.data?.adminLevel || null);
      }

      if (legalRes.ok) {
        const legalJson = await legalRes.json();
        const list = Array.isArray(legalJson.data) ? legalJson.data : (legalJson.data?.items || []);
        setDocuments(list);
      }
    } catch (err) {
      console.error("Failed to fetch legal documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegalDocs();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !title.trim() || !body.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/admin/legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: docType,
          version: version.trim(),
          title: title.trim(),
          body: body.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          message: json.error?.message || "Failed to publish document version",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: `Published ${title} (v${version}). Member re-consent broadcast emitted to active network.`,
      });
      setPublishModalOpen(false);
      setVersion("");
      setTitle("");
      setBody("");
      await fetchLegalDocs();
      setTimeout(() => setFeedback(null), 8000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to publish version" });
    } finally {
      setSubmitting(false);
    }
  };

  if (currentUserLevel && currentUserLevel !== "super_admin") {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-display text-2xl font-light text-white">Super Administrator Access Required</h1>
        <p className="text-xs text-[#A9A7C4]">
          Publishing statutory policies and terms of service that alter legal contracts requires Super Administrator privileges.
        </p>
      </div>
    );
  }

  const privacyDocs = documents.filter((d) => d.type === "privacy_notice");
  const guidelinesDocs = documents.filter((d) => d.type === "community_guidelines");

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-light text-white tracking-tight">
              Statutory &amp; Legal Governance
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#D4AF37]/20 text-[#F3D3A2] border border-[#D4AF37]/40">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs text-[#A9A7C4] mt-1">
            Author and deploy versioned legal frameworks, privacy notices, and community bylaws.
          </p>
        </div>

        <Button
          onClick={() => setPublishModalOpen(true)}
          className="bg-[#D4AF37] hover:bg-[#c29f30] text-[#12131F] font-semibold text-xs flex items-center gap-2 rounded-xl"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Version</span>
        </Button>
      </div>

      {feedback && (
        <div
          className={cn(
            "p-4 rounded-xl text-xs flex items-center gap-2.5",
            feedback.type === "success"
              ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
              : "bg-rose-950/60 border border-rose-800 text-rose-300"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200/90 text-xs flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300">Mandatory Re-consent Protocol (PRD §14.2 &amp; §21.2)</p>
          <p className="text-[11px] text-[#A9A7C4] leading-relaxed">
            Publishing a new document marks existing versions as archived and immediately requires all 650+ active members to review and accept the revised terms via a blocking modal dialog before accessing any platform feature.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16 text-xs text-[#A9A7C4] gap-2">
          <RotateCw className="w-4 h-4 animate-spin text-[#F3D3A2]" />
          <span>Loading legal document registry...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Privacy Notices Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-white">
                <FileCheck className="w-4 h-4 text-[#F3D3A2]" />
                <h2 className="font-display text-sm font-medium">Privacy Notice (DPDP)</h2>
              </div>
              <span className="text-[10px] font-mono text-[#A9A7C4]">
                {privacyDocs.length} versions
              </span>
            </div>

            {privacyDocs.length === 0 ? (
              <Card className="p-6 bg-[#1E1F33] border-white/10 text-center text-xs text-[#A9A7C4]">
                No Privacy Notice documents recorded yet.
              </Card>
            ) : (
              privacyDocs.map((doc) => (
                <Card
                  key={doc.id}
                  className={cn(
                    "p-4 bg-[#1E1F33] border transition-all",
                    doc.isCurrent
                      ? "border-[#D4AF37]/40 ring-1 ring-[#D4AF37]/20"
                      : "border-white/10 opacity-75 hover:opacity-100"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{doc.title}</span>
                        {doc.isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[#D4AF37]/20 text-[#F3D3A2] border border-[#D4AF37]/40">
                            Current Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/5 text-[#A9A7C4]">
                            Archived
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-[#A9A7C4]">
                        <span>v{doc.version}</span>
                        <span>·</span>
                        <span>
                          {new Date(doc.publishedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewDoc(doc)}
                      className="border-white/15 text-white hover:bg-white/5 text-[11px] h-7 gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Community Guidelines Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-white">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h2 className="font-display text-sm font-medium">Community Guidelines &amp; Bylaws</h2>
              </div>
              <span className="text-[10px] font-mono text-[#A9A7C4]">
                {guidelinesDocs.length} versions
              </span>
            </div>

            {guidelinesDocs.length === 0 ? (
              <Card className="p-6 bg-[#1E1F33] border-white/10 text-center text-xs text-[#A9A7C4]">
                No Community Guidelines recorded yet.
              </Card>
            ) : (
              guidelinesDocs.map((doc) => (
                <Card
                  key={doc.id}
                  className={cn(
                    "p-4 bg-[#1E1F33] border transition-all",
                    doc.isCurrent
                      ? "border-indigo-500/40 ring-1 ring-indigo-500/20"
                      : "border-white/10 opacity-75 hover:opacity-100"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{doc.title}</span>
                        {doc.isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-700">
                            Current Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/5 text-[#A9A7C4]">
                            Archived
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-[#A9A7C4]">
                        <span>v{doc.version}</span>
                        <span>·</span>
                        <span>
                          {new Date(doc.publishedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewDoc(doc)}
                      className="border-white/15 text-white hover:bg-white/5 text-[11px] h-7 gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Publish Modal ── */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#1E1F33] border border-white/15 rounded-2xl p-6 shadow-2xl relative text-left max-h-[90vh] flex flex-col">
            <button
              type="button"
              onClick={() => setPublishModalOpen(false)}
              className="absolute right-4 top-4 text-[#A9A7C4] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#F3D3A2]">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-light text-white">Publish Statutory Document</h3>
                <p className="text-[11px] text-[#A9A7C4]">
                  Registers an immutable statutory revision and issues member re-consent obligations.
                </p>
              </div>
            </div>

            <form onSubmit={handlePublish} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9A7C4] mb-1">
                    Document Classification
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full h-10 px-3 text-xs bg-[#141522] border border-white/15 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  >
                    <option value="privacy_notice">Privacy Notice (DPDP)</option>
                    <option value="community_guidelines">Community Guidelines &amp; Bylaws</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#A9A7C4] mb-1">
                    Version Identifier (SemVer or Date)
                  </label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g. 2.1.0 or 2026.1"
                    className="w-full h-10 px-3 text-xs bg-[#141522] border border-white/15 rounded-xl text-white placeholder:text-[#A9A7C4]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#A9A7C4] mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. OASIS ONE Privacy Notice &amp; Data Rights Framework"
                  className="w-full h-10 px-3 text-xs bg-[#141522] border border-white/15 rounded-xl text-white placeholder:text-[#A9A7C4]/50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono uppercase text-[#A9A7C4]">
                    Document Body (Markdown)
                  </label>
                  <span className="text-[10px] font-mono text-[#A9A7C4]">
                    {body.length} characters
                  </span>
                </div>
                <textarea
                  required
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="# 1. Scope and Applicability&#10;&#10;This document governs all interactions on OASIS ONE..."
                  className="w-full p-3 font-mono text-xs bg-[#141522] border border-white/15 rounded-xl text-white placeholder:text-[#A9A7C4]/40 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-[11px]">
                <strong>Warning:</strong> Once published, existing members will be prompted to re-accept this document before their next interaction.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPublishModalOpen(false)}
                  className="border-white/15 text-white hover:bg-white/5 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#D4AF37] hover:bg-[#c29f30] text-[#12131F] font-semibold text-xs"
                >
                  {submitting ? "Publishing..." : "Publish & Enforce"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Document Inspection Drawer ── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-[#1E1F33] border border-white/15 rounded-2xl p-6 shadow-2xl relative text-left max-h-[85vh] flex flex-col">
            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="absolute right-4 top-4 text-[#A9A7C4] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 shrink-0 pr-8">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-light text-white">{previewDoc.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#F3D3A2]">
                  v{previewDoc.version}
                </span>
                {previewDoc.isCurrent && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                    Active Version
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-[#A9A7C4] mt-1">
                Published on {new Date(previewDoc.publishedAt).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#141522] rounded-xl border border-white/10 font-mono text-xs text-[#FCF6E3] leading-relaxed whitespace-pre-wrap">
              {previewDoc.body}
            </div>

            <div className="pt-4 flex justify-end shrink-0">
              <Button
                variant="outline"
                onClick={() => setPreviewDoc(null)}
                className="border-white/15 text-white hover:bg-white/5 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
