"use client";
import { useState, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { adminService } from "@/services/api";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, FileText, Eye,
  User, FileCheck, BarChart3, GitBranch, Bot, AlertTriangle, Upload, ArrowLeft,
  Check, X as XIcon, AlertOctagon, File, FileJson, ListChecks, ThumbsUp, Paperclip
} from "lucide-react";
import { useToast } from "@/components/ui/toaster";
import type { Document as AppDocument, EligibilityResult, Scheme, TimelineEvent, WorkflowStage } from "@/types";

const STATUS_FILTERS = ["all", "submitted", "document_verification", "eligibility_verification", "scheme_recommendation", "waiting_admin_review", "admin_review", "approved", "rejected", "additional_documents_required", "documents_required"];

type TabKey = "citizen" | "documents" | "ocr" | "eligibility" | "schemes" | "workflow" | "timeline";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "citizen", label: "Citizen Details", icon: User },
  { key: "documents", label: "Documents", icon: Paperclip },
  { key: "ocr", label: "OCR Data", icon: FileJson },
  { key: "eligibility", label: "Eligibility", icon: ListChecks },
  { key: "schemes", label: "Schemes", icon: ThumbsUp },
  { key: "workflow", label: "AI Agent Results", icon: Bot },
  { key: "timeline", label: "Timeline", icon: GitBranch },
];

function DetailView({ appId, onBack }: { appId: string; onBack: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("citizen");
  const [actionNote, setActionNote] = useState("");
  const [pendingAction, setPendingAction] = useState<"approved" | "rejected" | "additional_documents_required" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-application-detail", appId],
    queryFn: () => adminService.getApplicationDetail(appId),
    refetchInterval: 8000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note: string }) =>
      adminService.updateApplicationStatus(id, status, note),
    onSuccess: (_, vars) => {
      const labels: Record<string, string> = {
        approved: "approved",
        rejected: "rejected",
        additional_documents_required: "marked for additional documents",
      };
      toast({ title: `Application ${labels[vars.status] || vars.status} successfully`, type: "success" });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-application-detail"] });
      setPendingAction(null);
      setActionNote("");
      onBack();
    },
    onError: () => toast({ title: "Failed to update status", type: "error" }),
  });

  const handleConfirmAction = () => {
    if (!pendingAction || !data?.data) return;
    updateMutation.mutate({ id: String(data.data.id), status: pendingAction, note: actionNote });
  };

  const app = data?.data as Record<string, unknown> | undefined;
  const citizen = app?.citizen as Record<string, unknown> | undefined;
  const documents = (app?.documents as AppDocument[]) || [];
  const eligibility = app?.eligibilityResult as EligibilityResult | undefined;
  const schemes = (app?.recommendations as Scheme[]) || [];
  const workflowStage = app?.workflowStage as Record<string, unknown> | undefined;
  const timeline = (app?.timeline as TimelineEvent[]) || [];

  if (isLoading || !app) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </button>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const contentByTab: Record<TabKey, React.ReactNode> = {
    citizen: (
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Citizen Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { label: "Full Name", value: citizen?.name || citizen?.fullName || "—" },
                { label: "Email", value: citizen?.email || "—" },
                { label: "Phone", value: citizen?.phone || "—" },
                { label: "Aadhaar", value: citizen?.aadhaar || "—" },
                { label: "Date of Birth", value: citizen?.dateOfBirth || "—" },
                { label: "Gender", value: citizen?.gender || "—" },
                { label: "Category", value: citizen?.category ? String(citizen.category).toUpperCase() : "—" },
                { label: "Annual Income", value: citizen?.annualIncome ? `₹${Number(citizen.annualIncome).toLocaleString()}` : "—" },
                { label: "State", value: citizen?.state || "—" },
                { label: "District", value: citizen?.district || "—" },
                { label: "Pincode", value: citizen?.pincode || "—" },
                { label: "Occupation", value: citizen?.occupation || "—" },
                { label: "Education", value: citizen?.education || "—" },
                { label: "Community", value: citizen?.community || "—" },
                { label: "Address", value: citizen?.address || "—", span: 2 },
              ].map((f) => (
                <div key={f.label} className={(f as { span?: number }).span === 2 ? "md:col-span-2" : ""}>
                  <p className="text-xs text-gray-500 mb-0.5">{f.label}</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{String(f.value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    documents: (
      <div className="space-y-3">
        {documents.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400"><Upload className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No documents uploaded</p></CardContent></Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D6EEFF] dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <File className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">Type: {doc.type.replace("_", " ")}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Uploaded {formatDateTime(doc.uploadedAt)}</p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-[#8EC5FC] hover:underline font-medium">
                      <Eye className="w-3 h-3" /> View Document
                    </a>
                  )}
                  {doc.verificationResult && (
                    <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs space-y-1">
                      <p className="font-medium text-gray-700 dark:text-gray-300">Verification Result</p>
                      <p>Confidence: {doc.verificationResult.confidence || 0}%</p>
                      <p>Valid: {doc.verificationResult.isValid ? <span className="text-green-600">Yes</span> : <span className="text-red-600">No</span>}</p>
                      {doc.verificationResult.issues?.length > 0 && (
                        <p className="text-amber-600">Issues: {doc.verificationResult.issues.join(", ")}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    ),
    ocr: (
      <div className="space-y-3">
        {documents.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400"><FileJson className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No OCR data available</p></CardContent></Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><FileCheck className="w-4 h-4" /> OCR: {doc.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {doc.ocrData && Object.keys(doc.ocrData as Record<string, unknown>).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {Object.entries(doc.ocrData as Record<string, unknown>).map(([k, v]) => (
                      <div key={k} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 capitalize mb-0.5">{k.replace(/([A-Z])/g, " $1")}</p>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">{String(v || "—")}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No OCR extracted data for this document</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    ),
    eligibility: (
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Eligibility Report</CardTitle></CardHeader>
          <CardContent>
            {eligibility ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-xs text-gray-500 mb-1">Eligibility</p>
                    <p className={`text-2xl font-bold ${eligibility.isEligible ? "text-green-600" : "text-red-600"}`}>
                      {eligibility.isEligible ? "Eligible" : "Not Eligible"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-xs text-gray-500 mb-1">Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{eligibility.score}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                    <p className="text-xs text-gray-500 mb-1">Checked</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-2">{formatDateTime(eligibility.checkedAt)}</p>
                  </div>
                </div>
                <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Reason:</strong> {eligibility.reason}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Criteria Checked</p>
                  {eligibility.criteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      {c.passed ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Required: {c.required} • Actual: {c.actual}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-gray-400"><BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">Eligibility report not available yet</p></div>
            )}
          </CardContent>
        </Card>
      </div>
    ),
    schemes: (
      <div className="space-y-3">
        {schemes.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400"><ThumbsUp className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No recommended schemes yet</p></CardContent></Card>
        ) : (
          schemes.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{s.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Ministry: {s.ministry} • Category: {s.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                      Match: {s.matchScore}%
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{s.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1.5">Benefits</p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-0.5">
                      {s.benefits.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1.5">Eligibility</p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-0.5">
                      {s.eligibility.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    ),
    workflow: (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Workflow Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={String(app.status || "submitted")} />
                <span className="text-sm text-gray-500">Department: {String(app.department || "—")}</span>
              </div>
              <p className="text-xs text-gray-500">Officer: {String(app.assignedOfficer || "—")}</p>
            </div>
            {(() => {
              const workflowTyped = workflowStage as unknown as WorkflowStage | undefined;
              const stagesArray = workflowTyped?.stages;
              if (!stagesArray || stagesArray.length === 0) return null;
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {stagesArray.map((stage, i) => (
                    <motion.div key={stage.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                      className={`p-4 rounded-xl border-2 text-center ${
                        stage.status === "completed" ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800" :
                        stage.status === "active" ? "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800" :
                        "border-[#E5E7EB] dark:border-gray-700"
                      }`}>
                      <div className="flex justify-center mb-2">
                        {stage.status === "completed" ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                         stage.status === "active" ? <Clock className="w-5 h-5 text-blue-500 animate-pulse" /> :
                         stage.status === "failed" ? <AlertOctagon className="w-5 h-5 text-red-500" /> :
                         <Clock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{stage.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{stage.status}</p>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">{stage.agent}</p>
                    </motion.div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    ),
    timeline: (
      <Card>
        <CardHeader><CardTitle>Application Timeline</CardTitle></CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="py-12 text-center text-gray-400"><GitBranch className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">Timeline events will appear here</p></div>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#E5E7EB] dark:bg-gray-700" />
              <div className="space-y-6">
                {timeline.map((event, i) => (
                  <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex gap-4 relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      event.status === "completed" ? "bg-green-50 dark:bg-green-900/30" :
                      event.status === "active" ? "bg-blue-50 dark:bg-blue-900/30" : "bg-gray-50 dark:bg-gray-800"
                    }`}>
                      {event.status === "completed" ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                       event.status === "active" ? <Clock className="w-5 h-5 text-blue-500 animate-spin" /> :
                       <Clock className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{event.stage}</h4>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{formatDateTime(event.timestamp)}</span>
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
          )}
        </CardContent>
      </Card>
    ),
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="w-4 h-4" /> Back to Applications
      </button>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{String(app.serviceName || "")}</h2>
                <StatusBadge status={String(app.status || "submitted")} />
              </div>
              <p className="text-sm text-gray-500 mt-1">Application ID: {String(app.id || "")}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> Citizen: {String(citizen?.name || citizen?.fullName || "—")}</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Submitted {formatDate(String(app.createdAt || ""))}</span>
                {Boolean(app.department) && <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {String(app.department)}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap gap-1 p-2 border-b border-[#E5E7EB] dark:border-gray-700 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] text-gray-800 shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}>
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                {contentByTab[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Admin Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Add a review note (sent to citizen in notification)..."
              rows={3}
              className="w-full rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#8EC5FC] resize-none"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button onClick={() => setPendingAction("approved")} disabled={updateMutation.isPending}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors text-sm">
                <Check className="w-4 h-4" /> Approve Application
              </button>
              <button onClick={() => setPendingAction("rejected")} disabled={updateMutation.isPending}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-medium transition-colors text-sm">
                <XIcon className="w-4 h-4" /> Reject Application
              </button>
              <button onClick={() => setPendingAction("additional_documents_required")} disabled={updateMutation.isPending}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium transition-colors text-sm">
                <AlertTriangle className="w-4 h-4" /> Request Additional Documents
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {pendingAction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  pendingAction === "approved" ? "bg-green-100 dark:bg-green-900/30" :
                  pendingAction === "rejected" ? "bg-red-100 dark:bg-red-900/30" :
                  "bg-amber-100 dark:bg-amber-900/30"
                }`}>
                  {pendingAction === "approved" ? <Check className="w-6 h-6 text-green-600 dark:text-green-400" /> :
                   pendingAction === "rejected" ? <XIcon className="w-6 h-6 text-red-600 dark:text-red-400" /> :
                   <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    {pendingAction === "approved" ? "Confirm Approval" :
                     pendingAction === "rejected" ? "Confirm Rejection" :
                     "Confirm Additional Documents Request"}
                  </h3>
                  <p className="text-sm text-gray-500">Application: {String(app.serviceName || "")}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                {pendingAction === "approved"
                  ? "This application will be marked as approved. The citizen will be notified and the certificate will be issued. This action cannot be undone."
                  : pendingAction === "rejected"
                  ? "This application will be rejected. Citizen will receive the rejection note. This action cannot be undone."
                  : "The application status will change to 'Additional Documents Required'. The citizen will be notified to upload missing documents and the application will return to review once they are uploaded."}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setPendingAction(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button onClick={handleConfirmAction} disabled={updateMutation.isPending}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 ${
                    pendingAction === "approved" ? "bg-green-600 hover:bg-green-700 text-white" :
                    pendingAction === "rejected" ? "bg-red-600 hover:bg-red-700 text-white" :
                    "bg-amber-600 hover:bg-amber-700 text-white"
                  }`}>
                  {updateMutation.isPending && <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />}
                  {pendingAction === "approved" ? "Yes, Approve" :
                   pendingAction === "rejected" ? "Yes, Reject" :
                   "Yes, Request Docs"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApplicationsListContent({ onOpen }: { onOpen: (id: string) => void }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-applications", page, statusFilter, search],
    queryFn: () => adminService.getApplications(page, 20, statusFilter, search),
  });

  const applications = (data?.data as Record<string, unknown>[] | undefined) || [];
  const total = (data as Record<string, unknown> | undefined)?.total as number || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by service or ID..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-[#8EC5FC]"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] text-gray-800 rounded-xl text-sm font-medium">Search</button>
            </form>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); queryClient.invalidateQueries({ queryKey: ["admin-applications"] }); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
                    statusFilter === s ? "bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] text-gray-800" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}>
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-gray-700">
                  {["App ID", "Citizen", "Service", "Date", "Department", "Status", "Priority", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-gray-700">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                    ))}</tr>
                  ))
                ) : applications.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">No applications found</td></tr>
                ) : applications.map((app, i) => (
                  <motion.tr key={String(app.id)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{String(app.id || "").slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{String(app.citizenName || "—")}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{String(app.serviceName || "—")}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(String(app.createdAt || new Date()))}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{String(app.department || "—")}</td>
                    <td className="px-4 py-3"><StatusBadge status={String(app.status || "submitted")} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        app.priority === "high" ? "bg-red-50 text-red-600" :
                        app.priority === "medium" ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-600"
                      }`}>{String(app.priority || "medium")}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => onOpen(String(app.id))} className="flex items-center gap-1 text-xs text-[#8EC5FC] hover:text-blue-600 font-medium">
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] dark:border-gray-700">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-[#E5E7EB] dark:border-gray-600 disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ApplicationsContentInner({ initialAppId }: { initialAppId?: string }) {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(initialAppId || null);

  return selectedAppId ? (
    <DetailView appId={selectedAppId} onBack={() => setSelectedAppId(null)} />
  ) : (
    <ApplicationsListContent onOpen={(id) => setSelectedAppId(id)} />
  );
}

function ApplicationsContent() {
  return (
    <AdminLayout title="Application Management" subtitle="Review and manage citizen applications">
      <ApplicationsContentInner />
    </AdminLayout>
  );
}

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#8EC5FC] border-t-transparent rounded-full" /></div>}>
      <ApplicationsContent />
    </Suspense>
  );
}
