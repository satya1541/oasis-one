"use client";

import { useState, useEffect } from "react";
import { MemberShell } from "@/components/layout/MemberShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  CheckSquare,
  Plus,
  Check,
  Flag,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Trash2,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskRecord {
  id: string;
  title: string;
  notes?: string;
  kind: "task" | "deadline" | string;
  status: "open" | "in_progress" | "completed" | "cancelled" | string;
  dueAt?: string | null;
}

export default function PlannerPage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [isDeadline, setIsDeadline] = useState(false);
  const [dueDateInput, setDueDateInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/tasks");
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load planner tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "open" : "completed";
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch(`/api/v1/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskInput.trim(),
          kind: isDeadline ? "deadline" : "task",
          dueAt: dueDateInput ? new Date(dueDateInput).toISOString() : undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTasks((prev) => [json.data, ...prev]);
        }
        setNewTaskInput("");
        setDueDateInput("");
        setIsDeadline(false);
      }
    } catch (err) {
      console.error("Failed to add task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/v1/tasks/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const openTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <MemberShell>
      <div className="space-y-8 max-w-4xl mx-auto pb-20">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 pb-6 border-b border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#86601F]/10 dark:bg-[#F3D3A2]/10 border border-[#86601F]/20 dark:border-[#F3D3A2]/20 mb-3">
              <CheckSquare className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#86601F] dark:text-[#F3D3A2] font-semibold">
                Founder Execution
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-light text-[var(--text)] tracking-tight">
              Planner &amp; Milestones
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 font-sans leading-relaxed">
              Confidential milestone tracker and funding application deadline manager for your venture.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#EFE8D8]/70 dark:bg-[#181928]/90 border border-[#D9CDAE]/60 dark:border-[#2C2E4A] backdrop-blur-md self-start sm:self-auto">
            <span className="text-xs px-3 py-1 rounded-xl bg-[var(--surface)] text-[var(--text)] font-mono font-medium shadow-2xs">
              {openTasks.length} pending
            </span>
            <span className="text-xs px-3 py-1 text-[var(--muted)] font-mono">
              {completedTasks.length} completed
            </span>
          </div>
        </div>

        {/* Task Creation Input Card */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/90 shadow-sm backdrop-blur-md space-y-4">
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="What objective or venture deliverable are you completing next?"
                className="flex-1 h-12 px-4 text-xs sm:text-sm bg-[var(--surface-2)] border border-[#D9CDAE]/60 dark:border-[#2C2E4A] rounded-2xl text-[var(--text)] placeholder:text-[var(--muted)]/70 focus:outline-none focus:ring-2 focus:ring-[#86601F]/30 dark:focus:ring-[#F3D3A2]/30 transition-all font-sans"
              />
              <Button
                type="submit"
                disabled={!newTaskInput.trim() || submitting}
                className="w-full sm:w-auto gap-2 shrink-0 cursor-pointer h-12 min-h-[44px] px-6 rounded-2xl"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? "Adding..." : "Log Task"}</span>
              </Button>
            </div>

            <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-5 text-xs text-[var(--muted)] pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={isDeadline}
                  onChange={(e) => setIsDeadline(e.target.checked)}
                  className="rounded-md border-[#D9CDAE] text-[#86601F] focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="flex items-center gap-1.5 text-[var(--text)] font-medium group-hover:text-[#86601F] dark:group-hover:text-[#F3D3A2] transition-colors">
                  <Flag className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
                  <span>Funding / Grant Deadline</span>
                </span>
              </label>

              <div className="flex items-center gap-2 bg-[var(--surface-2)] px-3 py-1.5 rounded-xl border border-[#D9CDAE]/60 dark:border-[#2C2E4A] w-full xs:w-auto">
                <CalendarIcon className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2] shrink-0" />
                <input
                  type="datetime-local"
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  className="w-full xs:w-auto bg-transparent border-0 text-xs text-[var(--text)] focus:outline-none font-mono cursor-pointer"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Task Lists */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-xs text-[var(--muted)] gap-3">
            <RotateCw className="w-6 h-6 animate-spin text-[#86601F] dark:text-[#F3D3A2]" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Loading venture planner...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-dashed border-[#D9CDAE]/80 dark:border-[#2C2E4A] bg-[var(--surface)]/50 backdrop-blur-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#86601F]/10 dark:bg-[#F3D3A2]/10 border border-[#86601F]/20 dark:border-[#F3D3A2]/20 flex items-center justify-center mx-auto text-[#86601F] dark:text-[#F3D3A2]">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="font-display text-base font-medium text-[var(--text)]">No Milestones Logged</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
              Keep your grant filings, product sprints, and mentor deliverables on track. Add your first venture task above.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Open Tasks */}
            {openTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--muted)] px-1">
                  <Clock className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
                  <span>In Progress &amp; Scheduled ({openTasks.length})</span>
                </div>

                <div className="space-y-2.5">
                  {openTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/80 hover:border-[#86601F]/40 dark:hover:border-[#F3D3A2]/40 transition-all duration-200 flex items-center justify-between gap-4 shadow-2xs hover:shadow-md"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id, task.status)}
                          className="w-6 h-6 rounded-full border-2 border-[#D9CDAE] dark:border-[#43466B] hover:border-[#86601F] dark:hover:border-[#F3D3A2] flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer hover:scale-105 active:scale-95"
                          title="Mark complete"
                        >
                          {task.status === "completed" && (
                            <Check className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-[var(--text)] group-hover:text-[#1E1F33] dark:group-hover:text-[#FBF7EE] transition-colors truncate">
                            {task.title}
                          </div>
                          {task.dueAt && (
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#86601F] dark:text-[#F3D3A2] mt-1">
                              <CalendarIcon className="w-3 h-3" />
                              <span>Due {new Date(task.dueAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {task.kind === "deadline" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            Critical Deadline
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-[var(--muted)]/50 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                          aria-label="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--muted)] px-1">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Accomplished Milestones ({completedTasks.length})</span>
                </div>

                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group p-4 rounded-2xl bg-[var(--surface-2)]/40 border border-[#EAE1CF]/60 dark:border-[#2C2E4A]/50 flex items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id, task.status)}
                          className="w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 cursor-pointer"
                          title="Restore task"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs sm:text-sm text-[var(--muted)] line-through truncate">
                          {task.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-[var(--muted)]/40 hover:text-rose-500 p-1.5 transition-colors cursor-pointer"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MemberShell>
  );
}
