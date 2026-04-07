const API_BASE_URL = "http://localhost:5002";

function getToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = (await res.json()) as unknown;

  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "message" in data
        ? String((data as { message?: unknown }).message ?? "Ошибка")
        : "Ошибка";
    throw new Error(msg);
  }

  return data;
}

