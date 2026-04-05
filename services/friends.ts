// services/friends.ts
import { apiFetch } from "@/services/api";

export type Friend = {
  userId: number;
  email: string;
  fullName: string;
  avatar: string;
  country?: string | null;
  city?: string | null;
  points: number;
  roadmapProgressPercent: number;
};

/** GET /api/friends */
export async function fetchFriends(): Promise<Friend[]> {
  return apiFetch<Friend[]>("/api/friends", { method: "GET" });
}

/** POST /api/friends/add body: { email } */
export async function addFriendByEmail(email: string): Promise<Friend[]> {
  return apiFetch<Friend[]>("/api/friends/add", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** DELETE /api/friends/:friendId */
export async function removeFriend(friendId: number): Promise<Friend[]> {
  return apiFetch<Friend[]>(`/api/friends/${friendId}`, {
    method: "DELETE",
  });
}
