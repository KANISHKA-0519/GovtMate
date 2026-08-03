"use client";
import { useState, useCallback, useEffect, Suspense } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { documentService, applicationService } from "@/services/api";
import { GOVERNMENT_SERVICES } from "@/lib/utils";
import {
  Upload, FileText, X, CheckCircle, Loader2, CloudUpload, Sparkles, AlertCircle
} from "lucide-react";

interface UploadedFile {
  id: string;
  file: File;
  type: string;
  status: "uploading" | "processing" | "verified" | "error";
  progress: number;
  preview?: string;
  documentId?: string;
  error?: string;
}

// Required documents per service
const SERVICE_REQUIRED_DOCS: Record<string, { value: string; label: string }[]> = {
  income_certificate: [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "residence_proof", label: "Address Proof" },
    { value: "photo", label: "Passport Photo" },
    { value: "income_certificate", label: "Income Proof" },
  ],
  caste_certificate: [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "birth_certificate", label: "Birth Certificate" },
    { value: "caste_certificate", label: "Parent Community Certificate" },
    { value: "photo", label: "Passport Photo" },
  ],
  scholarship: [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "income_certificate", label: "Income Certificate" },
    { value: "caste_certificate", label: "Community Certificate" },
    { value: "other", label: "Previous Marksheet" },
    { value: "residence_proof", label: "Bonafide Certificate" },
    { value: "photo", label: "Passport Photo" },
  ],
  pension_scheme: [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "birth_certificate", label: "Age Proof" },
    { value: "income_certificate", label: "Income Certificate" },
    { value: "bank_passbook", label: "Bank Passbook" },
    { value: "photo", label: "Passport Photo" },
  ],
  birth_certificate: [
    { value: "other", label: "Hospital Record" },
    { value: "aadhaar", label: "Parent Aadhaar" },
    { value: "residence_proof", label: "Address Proof" },
  ],
  domicile_certificate: [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "residence_proof", label: "Residence Proof" },
    { value: "photo", label: "Passport Photo" },
  ],
  ration_card: [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "residence_proof", label: "Address Proof" },
    { value: "income_certificate", label: "Income Proof" },
    { value: "photo", label: "Passport Photo" },
  ],
  health_card: [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "income_certificate", label: "Income Certificate" },
    { value: "residence_proof", label: "Address Proof" },
    { value: "photo", label: "Passport Photo" },
  ],
  pm_awas: [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "income_certificate", label: "Income Certificate" },
    { value: "residence_proof", label: "Address Proof" },
    { value: "bank_passbook", label: "Bank Passbook" },
    { value: "photo", label: "Passport Photo" },
  ],
  kisan_credit: [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "residence_proof", label: "Land Records" },
    { value: "bank_passbook", label: "Bank Passbook" },
    { value: "photo", label: "Passport Photo" },
  ],
};

const DEFAULT_DOCS = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "residence_proof", label: "Address Proof" },
  { value: "photo", label: "Passport Photo" },
];

function UploadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceId = searchParams.get("service") || "";
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedService, setSelectedService] = useState(serviceId);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: existingDocsData } = useQuery({
    queryKey: ["documents"],
    queryFn: () => documentService.getAll(),
  });

  useEffect(() => {
    if (existingDocsData?.data) {
      const docs = existingDocsData.data as Record<string, unknown>[];
      const loadedFiles: UploadedFile[] = docs.map((d) => ({
        id: String(d.id || Math.random()),
        file: new File([], String(d.name || "document")),
        type: String(d.type || "other"),
        status: "verified" as const,
        progress: 100,
        documentId: String(d.id),
        preview: String(d.url || ""),
      }));
      setFiles((prev) => {
        const existingIds = new Set(prev.map((f) => f.documentId || f.id));
        const newAdditions = loadedFiles.filter((f) => !existingIds.has(f.documentId) && !existingIds.has(f.id));
        return [...prev, ...newAdditions];
      });
    }
  }, [existingDocsData]);

  const requiredDocs = selectedService
    ? (SERVICE_REQUIRED_DOCS[selectedService] || DEFAULT_DOCS)
    : [];

  const uploadedTypes = files.filter((f) => f.status === "verified").map((f) => f.type);

  const onDrop = useCallback(
    (accepted: File[], _: unknown, docType?: string) => {
      const newFiles: UploadedFile[] = accepted.map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        type: docType || (requiredDocs[0]?.value || "other"),
        status: "uploading" as const,
        progress: 0,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach((f) => uploadFile(f));
    },
    [requiredDocs]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted, _rejected) => onDrop(accepted, _rejected),
    accept: { "image/*": [], "application/pdf": [] },
    maxSize: 10 * 1024 * 1024,
    disabled: !selectedService,
  });

  const uploadFile = async (uploadedFile: UploadedFile) => {
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id && f.progress < 80 ? { ...f, progress: f.progress + 10 } : f
        )
      );
    }, 200);

    try {
      const res = await documentService.upload(uploadedFile.file, uploadedFile.type);
      clearInterval(interval);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: "processing", progress: 90, documentId: res.data?.id }
            : f
        )
      );
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, status: "verified", progress: 100 } : f
          )
        );
      }, 2000);
    } catch {
      clearInterval(interval);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: "error", progress: 0, error: "Upload failed. Check backend connection." }
            : f
        )
      );
    }
  };

  const handleDocUpload = (docType: string, accepted: File[]) => {
    onDrop(accepted, undefined, docType);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleSubmit = async () => {
    if (!selectedService) {
      toast({ title: "Select a service", type: "warning" });
      return;
    }
    const verified = files.filter((f) => f.status === "verified");
    if (verified.length === 0) {
      toast({ title: "Upload at least one document", type: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      const svc = GOVERNMENT_SERVICES.find((s) => s.id === selectedService);
      const app = await applicationService.create({
        serviceType: selectedService,
        serviceName: svc?.name || selectedService,
        documents: verified.map((f) => f.documentId!).filter(Boolean),
      });
      if (app.data?.id) {
        await applicationService.runWorkflow(app.data.id);
      }
      toast({ title: "Application submitted!", description: "AI agents are processing your documents.", type: "success" });
      setFiles([]);
      setTimeout(() => {
        router.push("/applications");
      }, 1000);
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = requiredDocs.filter((doc) => uploadedTypes.includes(doc.value)).length;
  const progressPct = requiredDocs.length > 0 ? Math.round((completedCount / requiredDocs.length) * 100) : 0;

  return (
    <DashboardLayout title="Upload Documents" subtitle="Select a service to see required documents">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Service Selection */}
        <Card>
          <CardHeader><CardTitle>Select Government Service</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {GOVERNMENT_SERVICES.map((svc) => (
                <motion.button
                  key={svc.id}
                  suppressHydrationWarning
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedService(svc.id); setFiles([]); }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                    selectedService === svc.id
                      ? "border-[#8EC5FC] bg-[#D6EEFF]/40"
                      : "border-[#E5E7EB] dark:border-gray-700 hover:border-[#8EC5FC]/50"
                  }`}
                >
                  <span className="text-xl">{svc.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{svc.name}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Required Documents */}
        {selectedService && requiredDocs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Required Documents</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{completedCount}/{requiredDocs.length} uploaded</span>
                    <div className="w-24">
                      <Progress value={progressPct} size="sm" />
                    </div>
                    <span className="text-sm font-medium text-[#8EC5FC]">{progressPct}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requiredDocs.map((doc) => {
                    const uploaded = files.filter((f) => f.type === doc.value && f.status === "verified");
                    const isUploaded = uploaded.length > 0;
                    return (
                      <div key={doc.value} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                        isUploaded ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800" : "border-[#E5E7EB] dark:border-gray-700"
                      }`}>
                        <div className="flex items-center gap-3">
                          {isUploaded
                            ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            : <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          }
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.label}</span>
                        </div>
                        {!isUploaded && (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleDocUpload(doc.value, [f]);
                              }}
                            />
                            <span className="text-xs bg-[#D6EEFF] text-blue-700 rounded-lg px-3 py-1.5 font-medium hover:bg-[#8EC5FC]/30 transition-colors">
                              Upload
                            </span>
                          </label>
                        )}
                        {isUploaded && (
                          <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Dropzone */}
        {selectedService && (
          <Card>
            <CardContent className="p-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-[#8EC5FC] bg-[#D6EEFF]/30"
                    : "border-[#E5E7EB] dark:border-gray-600 hover:border-[#8EC5FC]/60 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                <input {...getInputProps()} />
                <motion.div animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}>
                  <CloudUpload className="w-12 h-12 text-[#8EC5FC] mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {isDragActive ? "Drop files here..." : "Or drag & drop any document here"}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">Supports PDF, JPG, PNG up to 10MB</p>
                  <Button variant="outline" className="mt-4" type="button">
                    <Upload className="w-4 h-4" /> Browse Files
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        )}

        {!selectedService && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Select a service above to see required documents</p>
            </CardContent>
          </Card>
        )}

        {/* Uploaded Files */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card>
                <CardHeader><CardTitle>Uploaded Documents ({files.length})</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {files.map((f) => (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-700"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        {f.preview ? (
                          <img src={f.preview} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{f.file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-0.5">
                            {requiredDocs.find((d) => d.value === f.type)?.label || f.type}
                          </span>
                          <StatusBadge status={f.status} />
                        </div>
                        {(f.status === "uploading" || f.status === "processing") && (
                          <div className="mt-2"><Progress value={f.progress} size="sm" /></div>
                        )}
                        {f.error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{f.error}</p>}
                      </div>
                      <div className="flex-shrink-0">
                        {f.status === "uploading" && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                        {f.status === "processing" && (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                            <Sparkles className="w-5 h-5 text-purple-500" />
                          </motion.div>
                        )}
                        {f.status === "verified" && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {f.status === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
                      </div>
                      <button suppressHydrationWarning onClick={() => removeFile(f.id)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setFiles([])}>Clear All</Button>
                <Button onClick={handleSubmit} loading={submitting} disabled={files.every((f) => f.status !== "verified")}>
                  <Sparkles className="w-4 h-4" />
                  Submit Application
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#8EC5FC] border-t-transparent rounded-full" /></div>}>
      <UploadContent />
    </Suspense>
  );
}
