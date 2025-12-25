import { apiFetch, apiFetchWithMeta } from "@/api/http";
import type { AdminDevice, SensorData } from "@/api/types";

type AdminOverview = {
  total_users: number;
  total_devices: number;
  total_tambak: number;
  total_kolam: number;
  total_notifications: number;
  online_devices: number;
  offline_devices: number;
  maintenance_devices: number;
  inactive_devices: number;
  database_ok: boolean;
};

export function getAdminOverview() {
  return apiFetch<AdminOverview>("/admin/overview");
}

export function listAllDevices() {
  return apiFetch<AdminDevice[]>("/admin/devices/all");
}

export function setAdminDeviceStatus(deviceId: number, status: "online" | "offline" | "maintenance") {
  return apiFetch<AdminDevice>(`/admin/devices/${deviceId}/status`, {
    method: "PUT",
    json: { status }
  });
}

export function deactivateDevice(deviceId: number) {
  return apiFetch<AdminDevice>(`/admin/devices/${deviceId}/deactivate`, { method: "PUT" });
}

export function activateDevice(deviceId: number) {
  return apiFetch<AdminDevice>(`/admin/devices/${deviceId}/activate`, { method: "PUT" });
}

export function scheduleDeviceDeactivation(deviceId: number, deactivate_at: string | null) {
  return apiFetch<AdminDevice>(`/admin/devices/${deviceId}/schedule`, {
    method: "PUT",
    json: { deactivate_at }
  });
}

export function listAdminSensorData(params: {
  uid: string;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
  sort_dir?: "asc" | "desc";
}) {
  const query = new URLSearchParams();
  query.set("uid", params.uid);
  if (params.start_date) query.set("start_date", params.start_date);
  if (params.end_date) query.set("end_date", params.end_date);
  if (params.skip !== undefined) query.set("skip", params.skip.toString());
  if (params.limit !== undefined) query.set("limit", params.limit.toString());
  if (params.sort_dir) query.set("sort_dir", params.sort_dir);
  return apiFetchWithMeta<SensorData[]>(`/admin/sensor?${query.toString()}`);
}
