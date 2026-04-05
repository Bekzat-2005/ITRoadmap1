// services/api.ts
import { API_BASE_URL } from "@/constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "token";

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

export async function apiFetch<T = Json>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body != null) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const err = data as Record<string, string | undefined>;
    const msg =
      (typeof err?.message === "string" && err.message) ||
      (typeof err?.error === "string" && err.error) ||
      `Ошибка ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}
