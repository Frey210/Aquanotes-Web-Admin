import { ApiError, getApiBaseUrl, normalizeApiBaseUrl } from "@/api/http";
import type { AdminDevice, Device } from "@/api/types";

async function adminFetch<T>(path: string, apiKey: string, options: RequestInit & { json?: unknown } = {}) {
  const baseUrl = normalizeApiBaseUrl(getApiBaseUrl()).replace(/\/$/, "");
  const headers = new Headers(options.headers);
  headers.set("X-API-Key", apiKey);

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);
    throw new ApiError(
      typeof data === "string" ? data : (data as { detail?: string })?.detail || "Request failed",
      response.status,
      data
    );
  }

  return (await response.json()) as T;
}

export function listAdminDevices(apiKey: string) {
  return adminFetch<AdminDevice[]>("/admin/devices", apiKey, { method: "GET" });
}

export function registerAdminDevice(apiKey: string, uid: string) {
  return adminFetch<Device>("/admin/devices", apiKey, { method: "POST", json: { uid } });
}
