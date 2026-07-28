"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TableSkeleton } from "@/components/ui/skeleton";
import { applicationService } from "@/services/api";
import { formatDate, GOVERNMENT_SERVICES } from "@/lib/utils";
import type { Application } from "@/types";
import { FileText, Search, Filter, Eye, RefreshCw, ChevronRight } from "lucide-react";
import Link from "next/link";

const STATUS_FILTERS = ["all", "submitted", "under_review", "approved", "rejected", "documents_required"];

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationService.getAll(),
  });

  const applications: Application[] = data?.data || [];

  const filtered = applications.filter((app) => {
    const matchSearch = app.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getProgress = (status: string) => {
    const map: Record<string, number> = {
      draft: 10, submitted: 25, under_review: 50,
      documents_required: 40, approved: 100, rejected: 100, completed: 100,
    };
    return map[status] || 0;
  };

  return (
    <DashboardLayout title="My Applications" subtitle="Track all your government service applications">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search applications..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#8EC5FC]"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
                      statusFilter === s
                        ? "bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] text-gray-800"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No applications found</p>
              <p className="text-sm text-gray-400 mt-1">Start by uploading your documents</p>
              <Link href="/upload" className="mt-4">
                <Button>Upload Documents</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((app, i) => {
              const svc = GOVERNMENT_SERVICES.find((s) => s.id === app.serviceType);
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="card-hover">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#D6EEFF] dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 text-2xl">
                          {svc?.icon || "📄"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{app.serviceName}</h3>
                            <StatusBadge status={app.status} />
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {app.department || svc?.department} • Submitted {formatDate(app.createdAt)}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <Progress value={getProgress(app.status)} size="sm" className="flex-1 max-w-48" />
                            <span className="text-xs text-gray-400">{getProgress(app.status)}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={`/transparency?id=${app.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" /> Track
                            </Button>
                          </Link>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
