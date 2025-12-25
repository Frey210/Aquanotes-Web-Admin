import { apiFetch } from "@/api/http";
import type { Tambak } from "@/api/types";

export function listTambak() {
  return apiFetch<Tambak[]>("/tambak");
}

export function createTambak(payload: Omit<Tambak, "id">) {
  return apiFetch<Tambak>("/tambak", { method: "POST", json: payload });
}

export function updateTambak(tambakId: number, payload: Partial<Tambak>) {
  return apiFetch<Tambak>(`/tambak/${tambakId}`, { method: "PUT", json: payload });
}

export function deleteTambak(tambakId: number) {
  return apiFetch(`/tambak/${tambakId}`, { method: "DELETE" });
}
