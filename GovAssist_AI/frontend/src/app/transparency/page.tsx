"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/progress";
import { CardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { applicationService } from "@/services/api";
import { formatDate, formatDateTime, GOVERNMENT_SERVICES } from "@/lib/utils";
import { CheckCircle, Clock, Loader2, AlertCircle, Building2, Calendar, Bot, Eye, ArrowLeft } from "lucide-react";
import type { TimelineEvent, Application } from "@/types";

const STAGE_ICONS: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="w-5 h-5 text-green-500" />,
  active: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
  pending: <Clock className="w-5 h-5 text-gray-400" />,
  failed: <AlertCircle className="w-5 h-5 text-red-500" />,
};

const getProgress = (status: string) => {
  const map: Record<string, number> = {
    draft: 5, submitted: 12,
    document_verification: 25, eligibility_verification: 42, scheme_recommendation: 58,
    waiting_admin_review: 72, admin_review: 85,
    documents_required: 35, additional_documents_required: 40,
    under_review: 50, approved: 100, rejected: 100, completed: 100,
  };
  return map[status] || 0;
};

function ApplicationDetail({ appId }: { appId: string }) {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["application", appId],
    queryFn: () => applicationService.getById(appId),
    refetchInterval: 5000,
  });

  const app = data?.data;

  if (isLoading) return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );

  if (!app) return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Application not found</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/transparency")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="w-4 h-4" /> Back to Applications
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{app.serviceName}</h2>
                <p className="text-sm text-gray-500 mt-1">Application ID: {app.id}</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <StatusBadge status={app.status} />
                  {app.department && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Building2 className="w-3 h-3" /> {app.department}
                    </span>
                  )}
                  {app.assignedOfficer && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Bot className="w-3 h-3" /> Officer: {app.assignedOfficer}
                    </span>
                  )}
                  {app.estimatedCompletion && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" /> Est. {formatDateTime(app.estimatedCompletion)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <CircularProgress value={getProgress(app.status)} label="Complete" />
            <p className="text-sm text-gray-500 mt-3 text-center">Application Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader><CardTitle>Application Timeline</CardTitle></CardHeader>
        <CardContent>
          {app.timeline && app.timeline.length > 0 ? (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#E5E7EB] dark:bg-gray-700" />
              <div className="space-y-6">
                {app.timeline.map((event: TimelineEvent, i: number) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 relative"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      event.status === "completed" ? "bg-green-50 dark:bg-green-900/30" :
                      event.status === "active" ? "bg-blue-50 dark:bg-blue-900/30" : "bg-gray-50 dark:bg-gray-800"
                    }`}>
                      {STAGE_ICONS[event.status] || STAGE_ICONS.pending}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{event.stage}</h4>
                        <span className="text-xs text-gray-400">{formatDateTime(event.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                      {event.agent && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs bg-[#EBDCFF] dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full px-2 py-0.5">
                          <Bot className="w-3 h-3" /> {event.agent}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Timeline will appear as your application progresses</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Stages */}
      {app.workflowStage?.stages && (
        <Card>
          <CardHeader><CardTitle>AI Agent Workflow</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {app.workflowStage.stages.map((stage, i) => {
                const isFinalState = app.status === "approved" || app.status === "completed";
                const stageStatus = isFinalState ? "completed" : stage.status;
                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 rounded-xl border-2 text-center ${
                      stageStatus === "completed" ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800" :
                      stageStatus === "active" ? "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800" :
                      "border-[#E5E7EB] dark:border-gray-700"
                    }`}
                  >
                    <div className="flex justify-center mb-2">{STAGE_ICONS[stageStatus] || STAGE_ICONS.pending}</div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{stage.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{stageStatus}</p>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ApplicationsList() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationService.getAll(),
  });

  const applications: Application[] = data?.data || [];

  if (isLoading) return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );

  if (applications.length === 0) return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Bot className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">No applications yet</p>
        <p className="text-sm text-gray-400 mt-1">Submit an application to track its progress here</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-3">
      {applications.map((app, i) => {
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
                    {app.assignedOfficer && (
                      <p className="text-xs text-gray-400 mt-0.5">Officer: {app.assignedOfficer}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/transparency?id=${app.id}`)}
                  >
                    <Eye className="w-4 h-4" /> View Transparency
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function TransparencyContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("id");

  return (
    <DashboardLayout
      title="Transparency Dashboard"
      subtitle={appId ? "Real-time application tracking" : "All your applications"}
    >
      {appId ? <ApplicationDetail appId={appId} /> : <ApplicationsList />}
    </DashboardLayout>
  );
}

export default function TransparencyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#8EC5FC] border-t-transparent rounded-full" /></div>}>
      <TransparencyContent />
    </Suspense>
  );
}
