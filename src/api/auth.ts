import { apiFetch, setAccessToken } from "./http";
import type { User } from "./types";

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export async function login(email: string, password: string) {
  const data = await apiFetch<LoginResponse>("/users/login", {
    method: "POST",
    json: { email, password }
  });
  setAccessToken(data.access_token);
  return data;
}

export async function logout() {
  await apiFetch("/users/logout", { method: "POST" });
  setAccessToken(null);
}

export async function getMe() {
  return apiFetch<User>("/users/me");
}

export async function updateProfile(payload: {
  name?: string;
  old_password?: string;
  new_password?: string;
  notification_cooldown_minutes?: number;
}) {
  return apiFetch<User>("/users/profile", { method: "PUT", json: payload });
}
