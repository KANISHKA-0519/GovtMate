"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/ui/badge";
import { adminService } from "@/services/api";
import { formatDate } from "@/lib/utils";
import { Users, FileText, CheckCircle, XCircle, Clock, TrendingUp, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";

const COLORS = ["#8EC5FC", "#E0C3FC", "#B5EAD7", "#FFE5EC", "#FFF4CC"];

export default function AdminDashboardPage() {
  const { data: analyticsData } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminService.getAnalytics(),
  });

  const { data: appsData } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => adminService.getApplications(1, 8),
  });

  const analytics = analyticsData?.data as Record<string, unknown> | undefined;
  const applications = (appsData?.data as Record<string, unknown>[] | undefined) || [];

  const statusDist = [
    { name: "Approved", value: (analytics?.approved as number) || 0 },
    { name: "Pending", value: (analytics?.pending as number) || 0 },
    { name: "Rejected", value: (analytics?.rejected as number) || 0 },
    { name: "Under Review", value: (analytics?.under_review as number) || 0 },
  ];

  const deptPerf = (analytics?.dept_performance as Record<string, unknown>[] | undefined) || [];

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Platform overview and management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Citizens" value={(analytics?.total_citizens as number) || 0} icon={<Users className="w-6 h-6" />} color="#E0C3FC" trend={{ value: 8, label: "this week" }} index={0} />
          <StatCard title="Total Applications" value={(analytics?.total as number) || 0} icon={<FileText className="w-6 h-6" />} color="#8EC5FC" trend={{ value: 15, label: "this month" }} index={1} />
          <StatCard title="Approved" value={(analytics?.approved as number) || 0} icon={<CheckCircle className="w-6 h-6" />} color="#34D399" index={2} />
          <StatCard title="Pending Review" value={(analytics?.pending as number) || 0} icon={<Clock className="w-6 h-6" />} color="#FBBF24" index={3} />
        </div>

        {/* Second row stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Rejected" value={(analytics?.rejected as number) || 0} icon={<XCircle className="w-6 h-6" /> as React.JSX.Element} color="#F87171" index={0} />
          <StatCard title="Waiting Admin Review" value={(analytics?.waiting_admin_review as number) || 0} icon={<Clock className="w-6 h-6" /> as React.JSX.Element} color="#FBBF24" index={1} />
          <StatCard title="Additional Docs" value={(analytics?.additional_documents_required as number) || 0} icon={<AlertCircle className="w-6 h-6" /> as React.JSX.Element} color="#A78BFA" index={2} />
          <StatCard title="Today's Applications" value={(analytics?.today_apps as number) || 0} icon={<TrendingUp className="w-6 h-6" /> as React.JSX.Element} color="#B5EAD7" index={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptPerf} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
                  <Legend />
                  <Bar dataKey="approved" fill="#34D399" radius={[4, 4, 0, 0]} name="Approved" />
                  <Bar dataKey="pending" fill="#FBBF24" radius={[4, 4, 0, 0]} name="Pending" />
                  <Bar dataKey="rejected" fill="#F87171" radius={[4, 4, 0, 0]} name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link href="/admin/applications" className="text-xs text-[#8EC5FC] hover:underline">View all →</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] dark:border-gray-700">
                    {["App ID", "Citizen", "Service", "Department", "Date", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-gray-700">
                  {applications.map((app, i) => (
                    <motion.tr
                      key={String(app.id)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-xs text-gray-400 font-mono">{String(app.id || "").slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{String(app.citizenName || "—")}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{String(app.serviceName || "—")}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{String(app.department || "—")}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(String(app.createdAt || new Date()))}</td>
                      <td className="px-6 py-4"><StatusBadge status={String(app.status || "submitted")} /></td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/applications?id=${app.id}`} className="text-[#8EC5FC] hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">No applications yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
