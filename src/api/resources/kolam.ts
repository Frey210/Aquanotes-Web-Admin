import { apiFetch } from "@/api/http";
import type { Kolam } from "@/api/types";

export function listKolam(tambakId: number) {
  return apiFetch<Kolam[]>(`/kolam?tambak_id=${tambakId}`);
}

export function createKolam(payload: {
  nama: string;
  tipe: string;
  panjang: number;
  lebar: number;
  kedalaman: number;
  komoditas: string;
  tambak_id: number;
  device_id: number;
}) {
  return apiFetch<Kolam>("/kolam", { method: "POST", json: payload });
}

export function updateKolam(kolamId: number, payload: Partial<Kolam> & { device_id?: number | null }) {
  return apiFetch<Kolam>(`/kolam/${kolamId}`, { method: "PUT", json: payload });
}

export function deleteKolam(kolamId: number) {
  return apiFetch(`/kolam/${kolamId}`, { method: "DELETE" });
}
