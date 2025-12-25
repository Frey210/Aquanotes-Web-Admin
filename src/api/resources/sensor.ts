import { apiFetchWithMeta } from "@/api/http";
import type { SensorData } from "@/api/types";

export function listSensorData(params: {
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
  return apiFetchWithMeta<SensorData[]>(`/sensor?${query.toString()}`);
}
