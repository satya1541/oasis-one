"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import { Button } from "@/components/ui/Button";
import {
  Bell,
  MessageSquare,
  Award,
  Calendar,
  ShieldCheck,
  Check,
  ArrowRight,
  Clock,
  RotateCw,
} from "lucide-react";

interface NotificationDeliveryRecord {
  id: string;
  readAt: string | null;
  createdAt: string;
  notification: {
    id: string;
    type: string;
    title: string;
    body: string;
    actionUrl?: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data?.items || json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );
    try {
      await fetch("/api/v1/notifications/read-all", { method: "POST" });
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "post_reply":
      case "reply":
        return <MessageSquare className="w-4 h-4 text-[var(--accent)]" />;
      case "achievement_published":
      case "achievement":
        return <Award className="w-4 h-4 text-[var(--brand-gold)]" />;
      case "event_reminder":
      case "event":
        return <Calendar className="w-4 h-4 text-[var(--info)]" />;
      case "connection_request":
      case "mentor":
      default:
        return <ShieldCheck className="w-4 h-4 text-[var(--success)]" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <MemberShell>
      <div className="space-y-6 max-w-3xl pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-light text-[var(--text)] tracking-tight">
              Activity & Notifications
            </h1>
            <p className="text-xs text-[var(--muted)] mt-1">
              Real-time updates on discussions, event admissions, milestone approvals, and connections.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllRead}
              className="gap-2 shrink-0 cursor-pointer text-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </Button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-xs text-[var(--muted)] gap-2">
            <RotateCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
            <Bell className="w-8 h-8 text-[var(--muted)] mx-auto opacity-40" />
            <h3 className="font-display text-sm font-medium text-[var(--text)]">No Notifications</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              You are completely caught up. New responses, connection approvals, and event reminders will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-2xl bg-[var(--surface)] overflow-hidden">
            {notifications.map((item) => {
              const isUnread = !item.readAt;
              return (
                <div
                  key={item.id}
                  className={`p-4 transition-colors flex items-start gap-3.5 ${
                    isUnread ? "bg-[var(--surface-2)]/60" : "hover:bg-[var(--surface-2)]/30"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(item.notification.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs ${isUnread ? "font-semibold text-[var(--text)]" : "text-[var(--text)]"}`}>
                        {item.notification.title}
                      </p>
                      <span className="text-[10px] font-mono text-[var(--muted)] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {item.notification.body && (
                      <p className="text-xs text-[var(--muted)] leading-relaxed">
                        {item.notification.body}
                      </p>
                    )}

                    {item.notification.actionUrl && (
                      <Link
                        href={item.notification.actionUrl}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)] hover:underline pt-1"
                      >
                        <span>View details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-[var(--brand-gold)] shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MemberShell>
  );
}
