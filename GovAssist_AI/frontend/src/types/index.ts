export interface User {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  aadhaar?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  category?: "general" | "obc" | "sc" | "st";
  annualIncome?: number;
  state?: string;
  district?: string;
  pincode?: string;
  occupation?: string;
  education?: string;
  community?: string;
  emergencyContact?: string;
  fullName?: string;
  profileCompleted?: boolean;
  photoUrl?: string;
  role: "citizen" | "admin" | "officer";
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  lastLogin?: string;
  photoUrl?: string;
}

export interface Document {
  id: string;
  userId: string;
  applicationId?: string;
  name: string;
  type: DocumentType;
  url: string;
  cloudinaryId: string;
  status: "pending" | "verified" | "rejected" | "processing";
  ocrData?: Record<string, unknown>;
  verificationResult?: VerificationResult;
  uploadedAt: string;
}

export type DocumentType =
  | "aadhaar"
  | "pan"
  | "income_certificate"
  | "caste_certificate"
  | "birth_certificate"
  | "residence_proof"
  | "photo"
  | "bank_passbook"
  | "other";

export interface VerificationResult {
  isValid: boolean;
  confidence: number;
  extractedData: Record<string, string>;
  issues: string[];
  verifiedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  serviceType: string;
  serviceName: string;
  status: ApplicationStatus;
  priority: "low" | "medium" | "high";
  documents: string[];
  formData: Record<string, unknown>;
  eligibilityResult?: EligibilityResult;
  recommendations?: Scheme[];
  workflowStage: WorkflowStage;
  department?: string;
  assignedOfficer?: string;
  timeline: TimelineEvent[];
  estimatedCompletion?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "document_verification"
  | "eligibility_verification"
  | "scheme_recommendation"
  | "waiting_admin_review"
  | "admin_review"
  | "additional_documents_required"
  | "documents_required"
  | "approved"
  | "rejected"
  | "under_review"
  | "completed";

export interface WorkflowStage {
  current: string;
  stages: Stage[];
  completedAt?: string;
}

export interface Stage {
  id: string;
  name: string;
  status: "pending" | "active" | "completed" | "failed";
  agent: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  stage: string;
  description: string;
  status: "completed" | "active" | "pending";
  timestamp: string;
  agent?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  score: number;
  criteria: EligibilityCriteria[];
  reason: string;
  checkedAt: string;
}

export interface EligibilityCriteria {
  name: string;
  required: string;
  actual: string;
  passed: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  ministry: string;
  benefits: string[];
  eligibility: string[];
  applicationUrl?: string;
  matchScore: number;
  category: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  applicationId?: string;
  createdAt: string;
}

export interface AgentStatus {
  name: string;
  status: "idle" | "running" | "completed" | "error";
  progress: number;
  message?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkflowRun {
  id: string;
  applicationId: string;
  agents: AgentStatus[];
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
}

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  documentsUploaded: number;
  schemesRecommended: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
