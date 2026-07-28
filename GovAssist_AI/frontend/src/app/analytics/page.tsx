"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { statsService } from "@/services/api";
import { CardSkeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { FileText, CheckCircle, Clock, XCircle, TrendingUp, Star } from "lucide-react";

const COLORS = ["#8EC5FC", "#E0C3FC", "#B5EAD7", "#FFE5EC", "#FFF4CC", "#D6EEFF"];

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["citizen-analytics"],
    queryFn: () => statsService.getCitizenAnalytics(),
  });

  const analytics = data?.data as Record<string, unknown> | undefined;
  const byService = (analytics?.by_service as { name: string; value: number }[] | undefined) || [];
  const monthly = (analytics?.monthly as { month: string; applications: number }[] | undefined) || [];
  const recent = (analytics?.recent as { service: string; status: string; date: string }[] | undefined) || [];

  if (isLoading) return (
    <DashboardLayout title="Analytics" subtitle="Your application insights">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="My Analytics" subtitle="Insights based on your applications">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Submitted", value: analytics?.total || 0, icon: FileText, color: "#8EC5FC" },
            { label: "Approved", value: analytics?.approved || 0, icon: CheckCircle, color: "#34D399" },
            { label: "Pending", value: analytics?.pending || 0, icon: Clock, color: "#FBBF24" },
            { label: "Rejected", value: analytics?.rejected || 0, icon: XCircle, color: "#F87171" },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + "20" }}>
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                      <p className="text-2xl font-bold" style={{ color: item.color }}>{String(item.value)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D6EEFF] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-[#34D399]">{String(analytics?.success_rate || 0)}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBDCFF] flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg. Processing</p>
                <p className="text-2xl font-bold text-[#E0C3FC]">{String(analytics?.avg_processing || 0)} days</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF4CC] flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Most Used Service</p>
                <p className="text-sm font-bold text-[#FBBF24] leading-tight">{String(analytics?.most_used || "None")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card>
          <CardHeader><CardTitle>Monthly Applications</CardTitle></CardHeader>
          <CardContent>
            {monthly.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8EC5FC" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8EC5FC" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
                  <Area type="monotone" dataKey="applications" stroke="#8EC5FC" fill="url(#colorApps)" strokeWidth={2} name="Applications" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Service */}
          <Card>
            <CardHeader><CardTitle>Services Applied</CardTitle></CardHeader>
            <CardContent>
              {byService.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={byService} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {byService.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No recent activity</div>
              ) : (
                <div className="space-y-3">
                  {recent.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between py-2 border-b border-[#E5E7EB] dark:border-gray-700 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.service}</p>
                        <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
