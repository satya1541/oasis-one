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
      <div className="space-y-6 max-w-4xl pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-light text-[var(--text)] tracking-tight">
              Planner & Tasks
            </h1>
            <p className="text-xs text-[var(--muted)] mt-1">
              Private task manager and funding opportunity deadline tracker for your venture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] font-mono">
              {openTasks.length} pending · {completedTasks.length} done
            </span>
          </div>
        </div>

        {/* Task Creation Input */}
        <Card className="p-4 bg-[var(--surface)] border-[var(--border)]">
          <form onSubmit={handleAddTask} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="What milestone or task are you working on next?"
                className="flex-1 h-11 px-4 text-xs sm:text-sm bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <Button
                type="submit"
                disabled={!newTaskInput.trim() || submitting}
                className="gap-2 shrink-0 cursor-pointer h-11 px-5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDeadline}
                  onChange={(e) => setIsDeadline(e.target.checked)}
                  className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-0"
                />
                <span className="flex items-center gap-1 text-[var(--text)]">
                  <Flag className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
                  Grant / Hard Deadline
                </span>
              </label>

              <div className="flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-[var(--muted)]" />
                <input
                  type="datetime-local"
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  className="bg-transparent border border-[var(--border)] rounded-lg px-2 py-1 text-xs text-[var(--text)] focus:outline-none"
                />
              </div>
            </div>
          </form>
        </Card>

        {/* Task Lists */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs text-[var(--muted)] gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
            <span>Loading your venture planner...</span>
          </div>
        ) : tasks.length === 0 ? (
          <Card className="p-16 text-center text-xs text-[var(--muted)] border-dashed border-[var(--border)] space-y-2">
            <CheckSquare className="w-8 h-8 text-[var(--muted)] mx-auto opacity-40" />
            <h3 className="font-display text-sm font-medium text-[var(--text)]">No Tasks Logged</h3>
            <p>Keep your funding deliverables and execution milestones organized. Add your first task above.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Open Tasks */}
            {openTasks.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                  In Progress & Upcoming ({openTasks.length})
                </h2>
                <div className="space-y-2">
                  {openTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id, task.status)}
                          className="w-5 h-5 rounded-md border border-[var(--border-strong)] hover:border-[var(--accent)] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                        >
                          {task.status === "completed" && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-[var(--text)] truncate">
                            {task.title}
                          </div>
                          {task.dueAt && (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--muted)] mt-0.5">
                              <Clock className="w-3 h-3 text-[var(--brand-gold)]" />
                              <span>Due {new Date(task.dueAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {task.kind === "deadline" && (
                          <Badge variant="warning">
                            Deadline
                          </Badge>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-[var(--muted)] hover:text-rose-500 p-1 transition-colors cursor-pointer"
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
              <div className="space-y-2">
                <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
                  Completed ({completedTasks.length})
                </h2>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] flex items-center justify-between gap-3 opacity-70"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id, task.status)}
                          className="w-5 h-5 rounded-md bg-[var(--accent)] text-white flex items-center justify-center shrink-0 cursor-pointer"
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
                        className="text-[var(--muted)] hover:text-rose-500 p-1 transition-colors cursor-pointer"
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
