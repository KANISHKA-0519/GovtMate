import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

function isAdminApiRequest(url?: string): boolean {
  if (!url) return false;
  const path = url.startsWith("http") ? new URL(url).pathname : url;
  return path.startsWith("/api/admin");
}

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const isAdmin = isAdminApiRequest(config.url);
    const token = isAdmin
      ? localStorage.getItem("admin_token")
      : localStorage.getItem("govassist_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export const setAuthToken = (token: string) => {
  localStorage.setItem("govassist_token", token);
};

export const setAdminToken = (token: string) => {
  localStorage.setItem("admin_token", token);
};

export const clearAuthToken = () => {
  localStorage.removeItem("govassist_token");
};

export const clearAdminToken = () => {
  localStorage.removeItem("admin_token");
};
