import { apiFetch, apiFetchWithMeta } from "@/api/http";
import type { User } from "@/api/types";

export function listUsers(params: {
  skip?: number;
  limit?: number;
  search?: string;
  role?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}) {
  const query = new URLSearchParams();
  if (params.skip !== undefined) query.set("skip", params.skip.toString());
  if (params.limit !== undefined) query.set("limit", params.limit.toString());
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.sort_dir) query.set("sort_dir", params.sort_dir);
  return apiFetchWithMeta<User[]>(`/users?${query.toString()}`);
}

export function createUser(payload: { name: string; email: string; password: string; role: string }) {
  return apiFetch<User>("/users", { method: "POST", json: payload });
}

export function updateUser(userId: number, payload: { name?: string; email?: string; password?: string; role?: string }) {
  return apiFetch<User>(`/users/${userId}`, { method: "PUT", json: payload });
}

export function deleteUser(userId: number) {
  return apiFetch(`/users/${userId}`, { method: "DELETE" });
}
