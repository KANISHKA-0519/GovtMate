"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService } from "@/services/api";
import { CardSkeleton } from "@/components/ui/skeleton";

const COLORS = ["#8EC5FC", "#E0C3FC", "#B5EAD7", "#FFE5EC", "#FFF4CC", "#D6EEFF"];

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminService.getAnalytics(),
  });

  const analytics = data?.data as Record<string, unknown> | undefined;
  const byService = (analytics?.by_service as { name: string; value: number }[] | undefined) || [];
  const byDistrict = (analytics?.by_district as { name: string; value: number }[] | undefined) || [];
  const monthly = (analytics?.monthly as { month: string; applications: number; approved: number }[] | undefined) || [];
  const deptPerf = (analytics?.dept_performance as Record<string, unknown>[] | undefined) || [];

  if (isLoading) return (
    <AdminLayout title="Analytics" subtitle="Real-time platform analytics">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Analytics Dashboard" subtitle="Real analytics from database">
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Applications", value: analytics?.total || 0, color: "#8EC5FC" },
            { label: "Approval Rate", value: `${analytics?.approval_rate || 0}%`, color: "#34D399" },
            { label: "Rejection Rate", value: `${analytics?.rejection_rate || 0}%`, color: "#F87171" },
            { label: "Today's Apps", value: analytics?.today_apps || 0, color: "#FBBF24" },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: item.color }}>{String(item.value)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Monthly Trend */}
        <Card>
          <CardHeader><CardTitle>Monthly Applications Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8EC5FC" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8EC5FC" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
                <Legend />
                <Area type="monotone" dataKey="applications" stroke="#8EC5FC" fill="url(#colorApps)" strokeWidth={2} name="Total" />
                <Area type="monotone" dataKey="approved" stroke="#34D399" fill="url(#colorApproved)" strokeWidth={2} name="Approved" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Service */}
          <Card>
            <CardHeader><CardTitle>Applications by Service</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byService} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {byService.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* By District */}
          <Card>
            <CardHeader><CardTitle>Applications by District</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byDistrict.slice(0, 8)} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
                  <Bar dataKey="value" fill="#8EC5FC" radius={[4, 4, 0, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance */}
        <Card>
          <CardHeader><CardTitle>Department Performance</CardTitle></CardHeader>
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
      </div>
    </AdminLayout>
  );
}
