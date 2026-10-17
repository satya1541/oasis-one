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
      <div className="space-y-8 max-w-3xl mx-auto pb-20">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#86601F]/10 dark:bg-[#F3D3A2]/10 border border-[#86601F]/20 dark:border-[#F3D3A2]/20 mb-3">
              <Bell className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#86601F] dark:text-[#F3D3A2] font-semibold">
                Network Signals
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-[var(--text)] tracking-tight">
              Activity &amp; Signals
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 font-sans leading-relaxed">
              Real-time updates on discussions, admissions, connections, and milestone reviews.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllRead}
              className="gap-2 shrink-0 cursor-pointer text-xs rounded-xl"
            >
              <Check className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
              <span>Mark all as read</span>
            </Button>
          )}
        </div>

        {/* Notifications Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-xs text-[var(--muted)] gap-3">
            <RotateCw className="w-6 h-6 animate-spin text-[#86601F] dark:text-[#F3D3A2]" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Synchronizing activity stream...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-dashed border-[#D9CDAE]/80 dark:border-[#2C2E4A] bg-[var(--surface)]/50 backdrop-blur-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#86601F]/10 dark:bg-[#F3D3A2]/10 border border-[#86601F]/20 dark:border-[#F3D3A2]/20 flex items-center justify-center mx-auto text-[#86601F] dark:text-[#F3D3A2]">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-display text-base font-medium text-[var(--text)]">All Caught Up</h3>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
              No new signals or discussion replies. Incoming mentor requests and community responses will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE1CF]/70 dark:divide-[#2C2E4A]/80 border border-[#EAE1CF] dark:border-[#2C2E4A]/90 rounded-3xl bg-[var(--surface)] backdrop-blur-md shadow-xs overflow-hidden">
            {notifications.map((item) => {
              const isUnread = !item.readAt;
              return (
                <div
                  key={item.id}
                  className={`p-5 transition-all duration-200 flex items-start gap-4 ${
                    isUnread
                      ? "bg-[#86601F]/4 dark:bg-[#F3D3A2]/5"
                      : "hover:bg-[var(--surface-2)]/40"
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-[var(--surface-2)] border border-[#EAE1CF] dark:border-[#2C2E4A] flex items-center justify-center shrink-0 shadow-2xs">
                    {getIcon(item.notification.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={`text-xs sm:text-sm font-sans ${
                          isUnread
                            ? "font-semibold text-[var(--text)]"
                            : "font-normal text-[var(--text)]"
                        }`}
                      >
                        {item.notification.title}
                      </p>
                      <span className="text-[10px] font-mono text-[var(--muted)] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {item.notification.body && (
                      <p className="text-xs text-[var(--muted)] leading-relaxed font-sans">
                        {item.notification.body}
                      </p>
                    )}

                    {item.notification.actionUrl && (
                      <div className="pt-1">
                        <Link
                          href={item.notification.actionUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#86601F] dark:text-[#F3D3A2] hover:underline"
                        >
                          <span>Review Signal</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {isUnread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#86601F] dark:bg-[#F3D3A2] ring-4 ring-[#86601F]/20 dark:ring-[#F3D3A2]/20 shrink-0 mt-2 animate-pulse" />
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
