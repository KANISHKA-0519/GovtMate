"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { timeAgo } from "@/lib/utils";
import type { Notification } from "@/types";
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

const TYPE_ICONS = {
  info: <Info className="w-5 h-5 text-blue-500" />,
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
};

const TYPE_BG = {
  info: "bg-blue-50 dark:bg-blue-900/20",
  success: "bg-green-50 dark:bg-green-900/20",
  warning: "bg-yellow-50 dark:bg-yellow-900/20",
  error: "bg-red-50 dark:bg-red-900/20",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { setNotifications, markNotificationRead } = useAppStore();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await notificationService.getAll();
      if (res.data) setNotifications(res.data);
      return res;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: (_, id) => {
      markNotificationRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications: Notification[] = data?.data || [];
  const unread = notifications.filter((n) => !n.read);

  return (
    <DashboardLayout title="Notifications" subtitle={`${unread.length} unread notifications`}>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header Actions */}
        {unread.length > 0 && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending}>
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">You'll be notified about your application updates here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !n.read && markReadMutation.mutate(n.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  n.read
                    ? "border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
                    : "border-[#8EC5FC]/40 bg-[#D6EEFF]/20 dark:bg-blue-900/10"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_BG[n.type]}`}>
                  {TYPE_ICONS[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium ${n.read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-gray-100"}`}>
                      {n.title}
                    </p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
