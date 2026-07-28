"use client";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Application } from "@/types";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentApplicationsProps {
  applications: Application[];
}

export function RecentApplications({ applications }: RecentApplicationsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Applications</CardTitle>
        <Link href="/applications" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FileText className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">No applications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB] dark:divide-gray-700">
            {applications.slice(0, 5).map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#D6EEFF] dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{app.serviceName}</p>
                  <p className="text-xs text-gray-500">{formatDate(app.createdAt)}</p>
                </div>
                <StatusBadge status={app.status} />
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
