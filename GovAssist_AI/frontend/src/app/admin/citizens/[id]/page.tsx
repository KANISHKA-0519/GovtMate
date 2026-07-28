"use client";
import { use, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { adminService } from "@/services/api";
import { formatDate, formatDateTime, timeAgo } from "@/lib/utils";
import type { TimelineEvent } from "@/types";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Building,
  Briefcase, GraduationCap, FileText, AlertCircle, Bell, Clock,
  CheckCircle, Edit, Activity, Bot,
} from "lucide-react";

const ACTIVE_STATUSES = new Set(["draft", "submitted", "under_review", "documents_required"]);
const COMPLETED_STATUSES = new Set(["approved", "completed"]);
const REJECTED_STATUSES = new Set(["rejected"]);

export default function CitizenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-citizen", id],
    queryFn: () => adminService.getCitizenProfile(id),
  });

  const citizen = data?.data as Record<string, unknown> | undefined;
  const applications = useMemo(
    () => (citizen?.applications as Record<string, unknown>[] | undefined) || [],
    [citizen?.applications]
  );

  const stats = useMemo(() => ({
    total: applications.length,
    active: applications.filter((a) => ACTIVE_STATUSES.has(String(a.status))).length,
    approved: applications.filter((a) => COMPLETED_STATUSES.has(String(a.status))).length,
    rejected: applications.filter((a) => REJECTED_STATUSES.has(String(a.status))).length,
  }), [applications]);

  const activeApplications = useMemo(
    () => applications.filter((a) => ACTIVE_STATUSES.has(String(a.status))),
    [applications]
  );

  const timelineEvents = useMemo(() => {
    const events: (TimelineEvent & { serviceName?: string })[] = [];
    for (const app of applications) {
      const appTimeline = (app.timeline as TimelineEvent[] | undefined) || [];
      for (const event of appTimeline) {
        events.push({ ...event, serviceName: String(app.serviceName || "Application") });
      }
    }
    return events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [applications]);

  const recentNotifications = useMemo(() => {
    return timelineEvents.slice(0, 5).map((event) => ({
      id: event.id,
      title: event.stage,
      message: event.description,
      type: event.status === "completed" ? "success" : event.status === "active" ? "info" : "warning",
      createdAt: event.timestamp,
      serviceName: event.serviceName,
    }));
  }, [timelineEvents]);

  if (isLoading) return (
    <AdminLayout title="Citizen Profile" subtitle="Loading...">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    </AdminLayout>
  );

  if (!citizen) return (
    <AdminLayout title="Citizen Profile" subtitle="Not found">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500">Citizen not found</p>
        </CardContent>
      </Card>
    </AdminLayout>
  );

  const infoRows = [
    { icon: User, label: "Full Name", value: String(citizen.fullName || citizen.name || "—") },
    { icon: Mail, label: "Email", value: String(citizen.email || "—") },
    { icon: Phone, label: "Phone Number", value: String(citizen.phone || "—") },
    { icon: Building, label: "District", value: String(citizen.district || "—") },
    { icon: MapPin, label: "State", value: String(citizen.state || "—") },
    { icon: Briefcase, label: "Occupation", value: String(citizen.occupation || "—") },
    { icon: User, label: "Annual Income", value: citizen.annualIncome ? `₹${citizen.annualIncome}` : "—" },
    { icon: User, label: "Community", value: String(citizen.community || "—") },
    { icon: GraduationCap, label: "Education", value: String(citizen.education || "—") },
    { icon: Calendar, label: "Registration Date", value: formatDate(String(citizen.createdAt || new Date())) },
  ];

  return (
    <AdminLayout title="Citizen Profile" subtitle={String(citizen.name || citizen.fullName || "")}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => router.push("/admin/citizens")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Citizens
          </button>
          <button
            onClick={() => router.push(`/admin/applications?search=${encodeURIComponent(String(citizen.email || ""))}`)}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-gray-600 hover:bg-[#D6EEFF]/30 transition-colors"
          >
            <Edit className="w-4 h-4" /> View Applications
          </button>
        </div>

        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8EC5FC] to-[#E0C3FC] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {citizen.photoUrl ? (
                    <img src={String(citizen.photoUrl)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {String(citizen.fullName || citizen.name || "Unknown")}
                  </h2>
                  <p className="text-gray-500">{String(citizen.email || "")}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <StatusBadge status={citizen.profileCompleted ? "verified" : "pending"} />
                    <span className="text-xs bg-[#DFF6E3] text-green-700 rounded-full px-2.5 py-0.5 font-medium">
                      Current Status: {citizen.profileCompleted ? "Active Citizen" : "Profile Incomplete"}
                    </span>
                    <span className="text-xs text-gray-400">
                      Registered {formatDate(String(citizen.createdAt || new Date()))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Application Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Applications" value={stats.total} icon={<FileText className="w-6 h-6" />} color="#8EC5FC" index={0} />
          <StatCard title="Active Applications" value={stats.active} icon={<Activity className="w-6 h-6" />} color="#FBBF24" index={1} />
          <StatCard title="Approved" value={stats.approved} icon={<CheckCircle className="w-6 h-6" />} color="#34D399" index={2} />
          <StatCard title="Rejected" value={stats.rejected} icon={<AlertCircle className="w-6 h-6" />} color="#F87171" index={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {infoRows.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2 border-b border-[#E5E7EB] dark:border-gray-700 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-[#D6EEFF] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#8EC5FC]" /> Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentNotifications.map((notif) => (
                      <div key={notif.id} className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-gray-800/50 border border-[#E5E7EB] dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[#8EC5FC]">{notif.serviceName}</span>
                          <span className="text-xs text-gray-400">{timeAgo(notif.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Current Active Applications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#FBBF24]" /> Current Active Applications ({activeApplications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activeApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Activity className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No active applications</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] dark:border-gray-700">
                        {["Service", "Date", "Department", "Status"].map((h) => (
                          <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] dark:divide-gray-700">
                      {activeApplications.map((app, i) => (
                        <motion.tr
                          key={String(app.id)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{String(app.serviceName || "—")}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(String(app.createdAt || new Date()))}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{String(app.department || "—")}</td>
                          <td className="px-4 py-3"><StatusBadge status={String(app.status || "submitted")} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Application History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8EC5FC]" /> Application History ({applications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FileText className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No applications submitted</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] dark:border-gray-700">
                        {["Service", "Date", "Department", "Status"].map((h) => (
                          <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] dark:divide-gray-700">
                      {applications.map((app, i) => (
                        <motion.tr
                          key={String(app.id)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{String(app.serviceName || "—")}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(String(app.createdAt || new Date()))}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{String(app.department || "—")}</td>
                          <td className="px-4 py-3"><StatusBadge status={String(app.status || "submitted")} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Application Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#E0C3FC]" /> Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timelineEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Timeline will appear as applications progress</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#E5E7EB] dark:bg-gray-700" />
                  <div className="space-y-6">
                    {timelineEvents.slice(0, 10).map((event, i) => (
                      <motion.div
                        key={`${event.id}-${i}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-4 relative"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          event.status === "completed" ? "bg-green-50 dark:bg-green-900/30" :
                          event.status === "active" ? "bg-blue-50 dark:bg-blue-900/30" : "bg-gray-50 dark:bg-gray-800"
                        }`}>
                          <Clock className={`w-5 h-5 ${
                            event.status === "completed" ? "text-green-600" :
                            event.status === "active" ? "text-blue-600" : "text-gray-400"
                          }`} />
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{event.stage}</h4>
                            <span className="text-xs text-gray-400">{formatDateTime(event.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {event.serviceName && (
                              <span className="text-xs bg-[#D6EEFF] text-blue-700 rounded-full px-2 py-0.5">{event.serviceName}</span>
                            )}
                            {event.agent && (
                              <span className="inline-flex items-center gap-1 text-xs bg-[#EBDCFF] dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full px-2 py-0.5">
                                <Bot className="w-3 h-3" /> {event.agent}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
