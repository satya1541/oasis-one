"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { Radio, Bell, MessageSquare, CheckCircle, Award, Calendar, Shield, Zap } from "lucide-react";

export default function DevRealtimePage() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLog((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 8)]);
  };

  const simulateEvent = (name: string, description: string) => {
    addLog(`EMIT: ${name} — ${description}`);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("oasis-realtime-event", { detail: { name, description } }));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-navy)] text-[var(--brand-cream)] p-6 sm:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <BrandLockup variant="horizontal" href="/dashboard" />
          <span className="text-[10px] font-mono uppercase bg-[var(--brand-gold)] text-[var(--brand-navy)] px-2.5 py-1 rounded font-bold">
            DEV REALTIME SIMULATOR · §6A
          </span>
        </div>

        <div>
          <h1 className="font-display text-3xl font-light tracking-tight text-[var(--brand-cream)]">
            WebSocket & Signal Event Panel
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--brand-cream)]/70 leading-relaxed">
            Per PRD §6A, events are lightweight signals that trigger TanStack Query cache invalidations so REST stays the single source of truth without client polling.
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => simulateEvent("account.status_changed", "Account transitioned from pending to active")}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--brand-gold)] text-left space-y-1 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-gold)]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>account.status_changed</span>
            </div>
            <div className="text-[11px] text-[var(--brand-cream)]/70">
              Triggers live unlock animation on pending dashboard.
            </div>
          </button>

          <button
            type="button"
            onClick={() => simulateEvent("application.message", "Admin Anita sent: 'Please provide pitch deck link'")}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--brand-gold)] text-left space-y-1 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-cream)]">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>application.message</span>
            </div>
            <div className="text-[11px] text-[var(--brand-cream)]/70">
              Refreshes the inline admin messages thread.
            </div>
          </button>

          <button
            type="button"
            onClick={() => simulateEvent("notification.new", "Rakesh Panda replied to your question on DeepTech IP")}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--brand-gold)] text-left space-y-1 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-cream)]">
              <Bell className="w-3.5 h-3.5" />
              <span>notification.new</span>
            </div>
            <div className="text-[11px] text-[var(--brand-cream)]/70">
              Updates bell unread count and shows a quiet toast.
            </div>
          </button>

          <button
            type="button"
            onClick={() => simulateEvent("achievement.live", "Subhashree Das clinical pilot achievement approved")}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--brand-gold)] text-left space-y-1 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-cream)]">
              <Award className="w-3.5 h-3.5" />
              <span>achievement.live</span>
            </div>
            <div className="text-[11px] text-[var(--brand-cream)]/70">
              Refreshes the live achievement card on dashboard.
            </div>
          </button>

          <button
            type="button"
            onClick={() => simulateEvent("event.updated", "Capacity updated: Founders Meetup now 43 of 60")}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--brand-gold)] text-left space-y-1 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-cream)]">
              <Calendar className="w-3.5 h-3.5" />
              <span>event.updated</span>
            </div>
            <div className="text-[11px] text-[var(--brand-cream)]/70">
              Updates event capacity meter and waitlist queue position.
            </div>
          </button>

          <button
            type="button"
            onClick={() => simulateEvent("connection.updated", "Dr. Ananya Patnaik accepted your guidance request")}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--brand-gold)] text-left space-y-1 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand-cream)]">
              <Zap className="w-3.5 h-3.5" />
              <span>connection.updated</span>
            </div>
            <div className="text-[11px] text-[var(--brand-cream)]/70">
              Moves connection from Outgoing to Active and reveals shared contact info.
            </div>
          </button>
        </div>

        {/* Live Event Log */}
        <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--brand-gold)]">
            Simulated WebSocket Log (Last 8 events)
          </div>
          {log.length === 0 ? (
            <div className="text-xs text-[var(--brand-cream)]/40 font-mono py-2">
              No events emitted yet. Click any button above to test.
            </div>
          ) : (
            <div className="space-y-1">
              {log.map((item, idx) => (
                <div key={idx} className="text-xs font-mono text-[var(--brand-cream)]/80">
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[var(--brand-cream)]/50">
          <Link href="/dashboard" className="hover:text-[var(--brand-gold)] transition-colors">
            ← Return to Dashboard
          </Link>
          <Link href="/dev/unlock" className="hover:text-[var(--brand-gold)] transition-colors">
            Unlock Animation Tester →
          </Link>
        </div>
      </div>
    </div>
  );
}
