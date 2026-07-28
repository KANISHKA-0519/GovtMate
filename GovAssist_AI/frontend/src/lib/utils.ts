import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM dd, yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "MMM dd, yyyy HH:mm");
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    approved: "text-green-600 bg-green-50",
    completed: "text-green-600 bg-green-50",
    rejected: "text-red-600 bg-red-50",
    pending: "text-yellow-600 bg-yellow-50",
    under_review: "text-blue-600 bg-blue-50",
    submitted: "text-blue-600 bg-blue-50",
    documents_required: "text-orange-600 bg-orange-50",
    draft: "text-gray-600 bg-gray-50",
    verified: "text-green-600 bg-green-50",
    processing: "text-blue-600 bg-blue-50",
  };
  return colors[status] || "text-gray-600 bg-gray-50";
}

export function getAgentColor(agent: string): string {
  const colors: Record<string, string> = {
    "Citizen Support": "#8EC5FC",
    "Form Filling": "#E0C3FC",
    "Document Verification": "#B5EAD7",
    "Eligibility Check": "#FFE5EC",
    "Scheme Recommendation": "#FFF4CC",
    "Workflow": "#D6EEFF",
    "Notification": "#DFF6E3",
    "Transparency": "#EBDCFF",
  };
  return colors[agent] || "#E5E7EB";
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const GOVERNMENT_SERVICES = [
  { id: "birth_certificate", name: "Birth Certificate", department: "Municipal Corporation", icon: "📋" },
  { id: "income_certificate", name: "Income Certificate", department: "Revenue Department", icon: "💰" },
  { id: "caste_certificate", name: "Caste Certificate", department: "Revenue Department", icon: "📄" },
  { id: "domicile_certificate", name: "Domicile Certificate", department: "Revenue Department", icon: "🏠" },
  { id: "ration_card", name: "Ration Card", department: "Food & Civil Supplies", icon: "🍚" },
  { id: "pension_scheme", name: "Old Age Pension", department: "Social Welfare", icon: "👴" },
  { id: "scholarship", name: "Scholarship Application", department: "Education Department", icon: "🎓" },
  { id: "health_card", name: "Ayushman Bharat Card", department: "Health Department", icon: "🏥" },
  { id: "pm_awas", name: "PM Awas Yojana", department: "Housing Department", icon: "🏡" },
  { id: "kisan_credit", name: "Kisan Credit Card", department: "Agriculture Department", icon: "🌾" },
];
