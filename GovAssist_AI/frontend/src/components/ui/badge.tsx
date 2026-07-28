import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
}

const variantClasses = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  success: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  error: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  outline: "border border-[#E5E7EB] text-gray-700 dark:border-gray-600 dark:text-gray-300",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variantClasses[variant], className)}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    approved: { label: "Approved", variant: "success" },
    completed: { label: "Completed", variant: "success" },
    rejected: { label: "Rejected", variant: "error" },
    pending: { label: "Pending", variant: "warning" },
    under_review: { label: "Under Review", variant: "info" },
    submitted: { label: "Submitted", variant: "info" },
    documents_required: { label: "Docs Required", variant: "warning" },
    additional_documents_required: { label: "Additional Docs Required", variant: "warning" },
    draft: { label: "Draft", variant: "default" },
    verified: { label: "Verified", variant: "success" },
    processing: { label: "Processing", variant: "info" },
    document_verification: { label: "Document Verification", variant: "info" },
    eligibility_verification: { label: "Eligibility Verification", variant: "info" },
    scheme_recommendation: { label: "Scheme Recommendation", variant: "info" },
    waiting_admin_review: { label: "Waiting for Admin Review", variant: "warning" },
    admin_review: { label: "Admin Review", variant: "info" },
  };
  const { label, variant } = config[status] || { label: status, variant: "default" };
  return <Badge variant={variant}>{label}</Badge>;
}
