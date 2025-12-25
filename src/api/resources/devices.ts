import { apiFetch } from "@/api/http";
import type { Device, DeviceThreshold } from "@/api/types";

type ThresholdPayload = Partial<
  Pick<
    DeviceThreshold,
    | "temp_min"
    | "temp_max"
    | "ph_min"
    | "ph_max"
    | "do_min"
    | "tds_max"
    | "ammonia_max"
    | "salinitas_min"
    | "salinitas_max"
  >
>;

export function listDevices() {
  return apiFetch<Device[]>("/devices");
}

export function createDevice(payload: { uid: string; name: string }) {
  return apiFetch<Device>("/devices", { method: "POST", json: payload });
}

export function updateDevice(deviceId: number, payload: { name?: string; connection_interval?: number }) {
  return apiFetch<Device>(`/devices/${deviceId}`, { method: "PUT", json: payload });
}

export function deleteDevice(deviceUid: string) {
  return apiFetch(`/devices/${deviceUid}`, { method: "DELETE" });
}

export function getDeviceStatus() {
  return apiFetch<{ online: number; offline: number; maintenance: number; devices: Device[] }>("/devices/status/");
}

export function moveDevice(deviceId: number, targetKolamId: number) {
  return apiFetch(`/devices/${deviceId}/move`, { method: "POST", json: { target_kolam_id: targetKolamId } });
}

export function setMaintenance(deviceId: number) {
  return apiFetch(`/devices/${deviceId}/maintenance`, { method: "PUT" });
}

export function setOnline(deviceId: number) {
  return apiFetch(`/devices/${deviceId}/online`, { method: "PUT" });
}

export function updateInterval(deviceId: number, interval: number) {
  return apiFetch(`/devices/${deviceId}/interval?interval=${interval}`, { method: "PUT" });
}

export function getThresholds(deviceId: number) {
  return apiFetch<DeviceThreshold>(`/devices/${deviceId}/thresholds`);
}

export function updateThresholds(deviceId: number, payload: ThresholdPayload) {
  return apiFetch<DeviceThreshold>(`/devices/${deviceId}/thresholds`, { method: "PUT", json: payload });
}
