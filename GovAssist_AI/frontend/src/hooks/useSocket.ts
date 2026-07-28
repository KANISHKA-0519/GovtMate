"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppStore } from "@/store/useAppStore";
import type { Notification } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

export function useSocket(userId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const { addNotification, updateApplication } = useAppStore();

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("join", { userId });
    });

    socket.on("notification", (data: Notification) => {
      addNotification(data);
    });

    socket.on("application_update", (data: { id: string; status: string }) => {
      updateApplication(data.id, { status: data.status as never });
    });

    socket.on("connect_error", () => {
      // Silent fail — app works without real-time
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, addNotification, updateApplication]);

  return socketRef.current;
}
