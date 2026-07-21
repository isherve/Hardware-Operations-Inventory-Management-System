import type { ApiError, AuthUser } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export class ApiClientError extends Error {
  status: number;
  fieldErrors?: ApiError["fieldErrors"];

  constructor(message: string, status: number, fieldErrors?: ApiError["fieldErrors"]) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function getToken(): string | null {
  return localStorage.getItem("builtin_token");
}

export function setAuth(user: AuthUser) {
  localStorage.setItem("builtin_token", user.token);
  localStorage.setItem("builtin_user", JSON.stringify(user));
}

export function getAuth(): AuthUser | null {
  const raw = localStorage.getItem("builtin_user");
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem("builtin_token");
  localStorage.removeItem("builtin_user");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    let body: ApiError = { message: "Request failed" };
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiClientError(body.message || res.statusText, res.status, body.fieldErrors);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  download: async (path: string, filename: string) => {
    const token = getToken();
    const res = await fetch(`${API_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new ApiClientError("Download failed", res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
