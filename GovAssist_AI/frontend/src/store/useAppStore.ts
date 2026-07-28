import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Notification, Application } from "@/types";

interface AppState {
  user: User | null;
  notifications: Notification[];
  applications: Application[];
  unreadCount: number;
  sidebarOpen: boolean;
  setUser: (user: User | null) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  setApplications: (applications: Application[]) => void;
  addApplication: (application: Application) => void;
  updateApplication: (id: string, data: Partial<Application>) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      notifications: [],
      applications: [],
      unreadCount: 0,
      sidebarOpen: true,
      setUser: (user) => set({ user }),
      setNotifications: (notifications) =>
        set({ notifications, unreadCount: notifications.filter((n) => !n.read).length }),
      addNotification: (notification) => {
        const notifications = [notification, ...get().notifications];
        set({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
      },
      markNotificationRead: (id) => {
        const notifications = get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
        set({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
      },
      setApplications: (applications) => set({ applications }),
      addApplication: (application) => set({ applications: [application, ...get().applications] }),
      updateApplication: (id, data) =>
        set({ applications: get().applications.map((a) => (a.id === id ? { ...a, ...data } : a)) }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    { name: "govassist-store", partialize: (state) => ({ user: state.user, sidebarOpen: state.sidebarOpen }) }
  )
);
