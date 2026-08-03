"use client";
import { useAppAuth as useUser } from "@/hooks/useAppAuth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { AgentStatusPanel } from "@/components/agents/AgentStatusPanel";
import { AIChat } from "@/components/agents/AIChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { statsService, applicationService } from "@/services/api";
import { GOVERNMENT_SERVICES } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { FileText, Upload, CheckCircle, Clock, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser();
  useSocket(user?.id);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => statsService.getDashboard(),
    enabled: !!user,
  });

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationService.getAll(),
    enabled: !!user,
  });

  const applications = appsData?.data || [];
  const s = stats?.data;

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.firstName || "Citizen"}`}>
      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="bg-gradient-to-r from-[#8EC5FC]/20 to-[#E0C3FC]/20 rounded-2xl p-6 border border-[#8EC5FC]/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8EC5FC]" />
                Start a New Application
              </h2>
              <p className="text-sm text-gray-500 mt-1">Upload your documents and let AI handle the rest</p>
            </div>
            <Link href="/upload">
              <Button>
                <Upload className="w-4 h-4" />
                Upload Documents
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Applications" value={s?.totalApplications ?? 0} icon={<FileText className="w-6 h-6" />} color="#8EC5FC" trend={{ value: 12, label: "this month" }} index={0} />
            <StatCard title="Pending Review" value={s?.pendingApplications ?? 0} icon={<Clock className="w-6 h-6" />} color="#FBBF24" index={1} />
            <StatCard title="Approved" value={s?.approvedApplications ?? 0} icon={<CheckCircle className="w-6 h-6" />} color="#34D399" trend={{ value: 8, label: "this week" }} index={2} />
            <StatCard title="Schemes Matched" value={s?.schemesRecommended ?? 0} icon={<Sparkles className="w-6 h-6" />} color="#E0C3FC" index={3} />
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {appsLoading ? <CardSkeleton /> : <RecentApplications applications={applications} />}
        </div>
        <AgentStatusPanel />
      </div>

      {/* Services Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Available Government Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {GOVERNMENT_SERVICES.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
              >
                <Link href={`/upload?service=${service.id}`}>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-700 hover:border-[#8EC5FC] hover:bg-[#D6EEFF]/30 transition-all cursor-pointer text-center">
                    <span className="text-2xl">{service.icon}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{service.name}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AIChat />
    </DashboardLayout>
  );
}
