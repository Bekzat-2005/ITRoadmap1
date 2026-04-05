// services/roadmaps.ts
import { apiFetch } from "@/services/api";

export type TopicStatus = "locked" | "not_started" | "in_progress" | "completed";

export type RoadmapTopic = {
  id: string;
  title: string;
  status: TopicStatus;
};

export type RoadmapTree = Record<string, RoadmapTopic[]>;

export type RoadmapMeta = {
  id: string;
  title: string;
};

/** GET /api/roadmaps/tree */
export async function fetchRoadmapTree(): Promise<RoadmapTree> {
  return apiFetch<RoadmapTree>("/api/roadmaps/tree", { method: "GET" });
}

/** GET /api/roadmaps — список направлений (id → название) */
export async function fetchRoadmaps(): Promise<RoadmapMeta[]> {
  return apiFetch<RoadmapMeta[]>("/api/roadmaps", { method: "GET" });
}

/** POST /api/roadmaps/complete-node — открыть следующую тему после успешного теста */
export async function completeRoadmapNode(nodeId: string): Promise<void> {
  await apiFetch("/api/roadmaps/complete-node", {
    method: "POST",
    body: JSON.stringify({ nodeId }),
  });
}

/** Порядок категорий как в ТЗ (по подстроке в title) */
const CATEGORY_ORDER = [
  "backend",
  "frontend",
  "ai",
  "devops",
  "uiux",
] as const;

function categoryRank(title: string): number {
  const t = title.toLowerCase();
  const idx = CATEGORY_ORDER.findIndex((key) => {
    if (key === "uiux") return t.includes("ui") || t.includes("ux");
    if (key === "ai")
      return (
        t.includes("ai") ||
        t.includes("ml") ||
        t.includes("machine") ||
        t.includes("интеллект")
      );
    return t.includes(key);
  });
  return idx === -1 ? 99 : idx;
}

export function sortRoadmapsByCategory(roadmaps: RoadmapMeta[]): RoadmapMeta[] {
  return [...roadmaps].sort(
    (a, b) => categoryRank(a.title) - categoryRank(b.title)
  );
}
