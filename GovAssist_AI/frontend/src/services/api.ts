import { apiClient } from "@/lib/api";
import type { Application, Document, Notification, DashboardStats, WorkflowRun, ApiResponse } from "@/types";

export const applicationService = {
  create: async (data: Partial<Application>) => {
    const res = await apiClient.post<ApiResponse<Application>>("/api/applications", data);
    return res.data;
  },
  getAll: async (userId?: string) => {
    const res = await apiClient.get<ApiResponse<Application[]>>("/api/applications", { params: { userId } });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Application>>(`/api/applications/${id}`);
    return res.data;
  },
  update: async (id: string, data: Partial<Application>) => {
    const res = await apiClient.put<ApiResponse<Application>>(`/api/applications/${id}`, data);
    return res.data;
  },
  runWorkflow: async (id: string) => {
    const res = await apiClient.post<ApiResponse<WorkflowRun>>(`/api/applications/${id}/workflow`);
    return res.data;
  },
};

export const documentService = {
  upload: async (file: File, type: string, applicationId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    if (applicationId) formData.append("applicationId", applicationId);
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("govassist_token") || "user_demo_citizen_123"
        : "user_demo_citizen_123";
    const res = await apiClient.post<ApiResponse<Document>>("/api/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  getAll: async (userId?: string) => {
    const res = await apiClient.get<ApiResponse<Document[]>>("/api/documents", { params: { userId } });
    return res.data;
  },
  verify: async (id: string) => {
    const res = await apiClient.post<ApiResponse<Document>>(`/api/documents/${id}/verify`);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/api/documents/${id}`);
    return res.data;
  },
};

export const notificationService = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<Notification[]>>("/api/notifications");
    return res.data;
  },
  markRead: async (id: string) => {
    const res = await apiClient.put<ApiResponse<Notification>>(`/api/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.put<ApiResponse<void>>("/api/notifications/read-all");
    return res.data;
  },
};

export const statsService = {
  getDashboard: async () => {
    const res = await apiClient.get<ApiResponse<DashboardStats>>("/api/stats/dashboard");
    return res.data;
  },
  getCitizenAnalytics: async () => {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>>>("/api/stats/citizen-analytics");
    return res.data;
  },
  getAdmin: async () => {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>>>("/api/stats/admin");
    return res.data;
  },
};

export const adminService = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<ApiResponse<{ token: string; admin: Record<string, unknown> }>>("/api/admin/login", { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>>>("/api/admin/me");
    return res.data;
  },
  getCitizens: async (page = 1, limit = 20, search = "") => {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>[]>>("/api/admin/citizens", { params: { page, limit, search } });
    return res.data;
  },
  getCitizenProfile: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/api/admin/citizens/${id}`);
    return res.data;
  },
  getApplications: async (page = 1, limit = 20, status = "", search = "") => {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>[]>>("/api/admin/applications", { params: { page, limit, status, search } });
    return res.data;
  },
  getApplicationDetail: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/api/admin/applications/${id}`);
    return res.data;
  },
  updateApplicationStatus: async (id: string, status: string, note?: string, officer?: string) => {
    const res = await apiClient.put<ApiResponse<Record<string, unknown>>>(`/api/admin/applications/${id}/status`, { status, note, officer });
    return res.data;
  },
  getAnalytics: async () => {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>>>("/api/admin/analytics");
    return res.data;
  },
  getNotifications: async () => {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>[]>>("/api/admin/notifications");
    return res.data;
  },
};

export const userService = {
  sync: async (clerkData: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<Record<string, unknown>>>("/api/users/sync", clerkData);
    return res.data;
  },
  update: async (data: Record<string, unknown>) => {
    const res = await apiClient.put<ApiResponse<Record<string, unknown>>>("/api/users/me", data);
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<Record<string, unknown>>>("/api/users/me");
    return res.data;
  },
};

export const agentService = {
  chat: async (message: string, context?: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<{ reply: string; suggestions: string[] }>>("/api/agents/chat", { message, context });
    return res.data;
  },
  getWorkflowStatus: async (applicationId: string) => {
    const res = await apiClient.get<ApiResponse<WorkflowRun>>(`/api/agents/workflow/${applicationId}`);
    return res.data;
  },
};
