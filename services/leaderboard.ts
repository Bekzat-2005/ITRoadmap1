// services/leaderboard.ts
import { apiFetch } from "@/services/api";

export type LeaderboardEntry = {
  userId: number;
  fullName: string;
  avatar: string;
  country?: string | null;
  city?: string | null;
  university?: string | null;
  points: number;
  rank: number;
  completedTests?: number;
  passedTests?: number;
  failedTests?: number;
  roadmapProgressPercent?: number;
  badges?: string[];
};

export type LeaderboardResponse = {
  leaders: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
};

/** GET /api/leaderboard */
export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  return apiFetch<LeaderboardResponse>("/api/leaderboard", { method: "GET" });
}
