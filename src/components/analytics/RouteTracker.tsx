"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface ActiveVisit {
  visitId: string;
  path: string;
  fullPath: string;
  enteredAtMs: number;
  enteredAtIso: string;
  finalized: boolean;
}

const SENSITIVE_PARAMS = new Set([
  "token",
  "code",
  "state",
  "access_token",
  "refresh_token",
  "id_token",
  "password",
  "secret",
]);

function createVisitId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

function sanitizeSearchParams(rawSearch: string): string {
  if (!rawSearch) return "";
  const params = new URLSearchParams(rawSearch);
  const cleaned = new URLSearchParams();
  params.forEach((value, key) => {
    if (SENSITIVE_PARAMS.has(key.toLowerCase())) {
      cleaned.set(key, "REDACTED");
    } else {
      cleaned.set(key, value);
    }
  });
  return cleaned.toString();
}

function sendRouteVisit(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const csrf = getCookie("oasis_csrf");
  if (csrf) {
    headers["X-CSRF-Token"] = csrf;
  }

  fetch("/api/v1/analytics/events", {
    method: "POST",
    credentials: "include",
    keepalive: true,
    headers,
    body: JSON.stringify({
      name: "route_visit",
      props: payload,
    }),
  }).catch(() => {});
}

export function RouteTracker() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const rawSearch = searchParams?.toString() || "";
  const activeVisitRef = useRef<ActiveVisit | null>(null);
  const lastCompletedPathRef = useRef<string | null>(null);

  useEffect(() => {
    const sanitized = sanitizeSearchParams(rawSearch);
    const fullPath = sanitized ? `${pathname}?${sanitized}` : pathname;
    const prev = activeVisitRef.current;

    if (prev && prev.fullPath === fullPath && !prev.finalized) {
      return;
    }

    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    let fromPath: string | null = lastCompletedPathRef.current;

    if (prev && !prev.finalized) {
      prev.finalized = true;
      fromPath = prev.fullPath;
      lastCompletedPathRef.current = prev.fullPath;
      sendRouteVisit({
        visitId: prev.visitId,
        phase: "leave",
        trigger: "navigate",
        path: prev.path,
        fullPath: prev.fullPath,
        enteredAt: prev.enteredAtIso,
        leftAt: nowIso,
        durationMs: Math.max(0, nowMs - prev.enteredAtMs),
      });
    } else if (!fromPath && typeof document !== "undefined" && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin === window.location.origin) {
          const refSearch = sanitizeSearchParams(refUrl.search);
          fromPath = refSearch ? `${refUrl.pathname}?${refSearch}` : refUrl.pathname;
        }
      } catch {
        // Ignore malformed referrer
      }
    }

    const nextVisit: ActiveVisit = {
      visitId: createVisitId(),
      path: pathname,
      fullPath,
      enteredAtMs: nowMs,
      enteredAtIso: nowIso,
      finalized: false,
    };
    activeVisitRef.current = nextVisit;

    sendRouteVisit({
      visitId: nextVisit.visitId,
      phase: "enter",
      trigger: "enter",
      path: nextVisit.path,
      fullPath: nextVisit.fullPath,
      fromPath,
      enteredAt: nextVisit.enteredAtIso,
    });
  }, [pathname, rawSearch]);

  useEffect(() => {
    const handlePageHide = () => {
      const current = activeVisitRef.current;
      if (!current || current.finalized) return;
      current.finalized = true;
      const nowMs = Date.now();
      sendRouteVisit({
        visitId: current.visitId,
        phase: "leave",
        trigger: "pagehide",
        path: current.path,
        fullPath: current.fullPath,
        enteredAt: current.enteredAtIso,
        leftAt: new Date(nowMs).toISOString(),
        durationMs: Math.max(0, nowMs - current.enteredAtMs),
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      const current = activeVisitRef.current;
      if (!current || current.finalized) return;
      sendRouteVisit({
        visitId: current.visitId,
        phase: "heartbeat",
        trigger: "hidden",
        path: current.path,
        fullPath: current.fullPath,
        enteredAt: current.enteredAtIso,
        durationMs: Math.max(0, Date.now() - current.enteredAtMs),
      });
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}

