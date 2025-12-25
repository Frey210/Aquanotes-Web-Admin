import { apiFetch } from "@/api/http";
import type { MonitoringResponse } from "@/api/types";

export function getMonitoring(lastN = 20) {
  return apiFetch<MonitoringResponse>(`/monitoring?last_n=${lastN}`);
}
