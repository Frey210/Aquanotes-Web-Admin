import { downloadFile } from "@/api/http";

export function exportSensorCsv(payload: { device_id: number; start_date: string; end_date: string }) {
  const filename = `sensor_data_${payload.device_id}_${payload.start_date}_${payload.end_date}.csv`;
  return downloadFile("/export/csv", payload, filename);
}
