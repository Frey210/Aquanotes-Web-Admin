import { apiFetch } from "@/api/http";
import type { Notification } from "@/api/types";

export function listNotifications(params: {
  days?: number;
  unread_only?: boolean;
  skip?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.days) query.set("days", params.days.toString());
  if (params.unread_only) query.set("unread_only", "true");
  if (params.skip) query.set("skip", params.skip.toString());
  if (params.limit) query.set("limit", params.limit.toString());
  return apiFetch<Notification[]>(`/notifications?${query.toString()}`);
}

export function markNotificationRead(id: number) {
  return apiFetch(`/notifications/${id}/read`, { method: "PUT" });
}

export function markAllNotificationsRead() {
  return apiFetch(`/notifications/read-all`, { method: "PUT" });
}

export function getUnreadCount() {
  return apiFetch<number>("/notifications/unread-count");
}
