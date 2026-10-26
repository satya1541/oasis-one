"use client";

import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (typeof window === "undefined") {
    // Return dummy during SSR
    return null as any;
  }

  if (!socketInstance) {
    const defaultWsUrl =
      typeof window !== "undefined" && window.location.hostname.includes("oasisodisha.in")
        ? "https://back.oasisodisha.in/ws"
        : "http://127.0.0.1:7500/ws";
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || defaultWsUrl;
    
    socketInstance = io(wsUrl, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketInstance.on("connect", () => {
      console.log("[OASIS Realtime] Connected to WebSocket gateway:", socketInstance?.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[OASIS Realtime] Disconnected from WebSocket gateway:", reason);
    });

    socketInstance.on("connect_error", (err) => {
      console.debug("[OASIS Realtime] Connection notice:", err.message);
    });
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
}

export function subscribeToAccountStatus(
  callback: (payload: { accountStatus: string; applicationStatus?: string }) => void
): () => void {
  const socket = getSocket();
  if (!socket) return () => {};

  const handler = (data: any) => {
    console.log("[OASIS Realtime] account.status_changed event received:", data);
    callback(data);
  };

  socket.on("account.status_changed", handler);

  return () => {
    socket.off("account.status_changed", handler);
  };
}

export function subscribeToApplicationMessages(
  callback: (payload: any) => void
): () => void {
  const socket = getSocket();
  if (!socket) return () => {};

  const handler = (data: any) => {
    console.log("[OASIS Realtime] application.message received:", data);
    callback(data);
  };

  socket.on("application.message", handler);

  return () => {
    socket.off("application.message", handler);
  };
}

export function subscribeToAdminCounts(
  callback: (payload: { pendingApplications?: number; openReports?: number; pendingAchievements?: number }) => void
): () => void {
  const socket = getSocket();
  if (!socket) return () => {};

  const handler = (data: any) => {
    console.log("[OASIS Realtime] admin.counts received:", data);
    callback(data);
  };

  socket.on("admin.counts", handler);

  return () => {
    socket.off("admin.counts", handler);
  };
}


