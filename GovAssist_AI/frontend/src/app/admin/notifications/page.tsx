"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { adminService } from "@/services/api";
import { timeAgo } from "@/lib/utils";
import { Bell, UserPlus, FileText, AlertTriangle, Info } from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  registration: { icon: <UserPlus className="w-5 h-5" />, bg: "bg-green-50 dark:bg-green-900/20", color: "text-green-600" },
  application: { icon: <FileText className="w-5 h-5" />, bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-600" },
  alert: { icon: <AlertTriangle className="w-5 h-5" />, bg: "bg-yellow-50 dark:bg-yellow-900/20", color: "text-yellow-600" },
  info: { icon: <Info className="w-5 h-5" />, bg: "bg-gray-50 dark:bg-gray-800", color: "text-gray-600" },
};

export default function AdminNotificationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => adminService.getNotifications(),
  });

  const notifications = (data?.data as Record<string, unknown>[] | undefined) || [];

  return (
    <AdminLayout title="Admin Notifications" subtitle="System alerts and activity feed">
      <div className="max-w-2xl mx-auto space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No notifications</p>
            </CardContent>
          </Card>
        ) : notifications.map((n, i) => {
          const type = String(n.type || "info");
          const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
          return (
            <motion.div
              key={String(n.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-4 p-4 rounded-2xl border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{String(n.title || "")}</p>
                <p className="text-sm text-gray-500 mt-0.5">{String(n.message || "")}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(String(n.time || new Date()))}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
