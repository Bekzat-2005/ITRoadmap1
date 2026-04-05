// services/topics.ts
import { apiFetch } from "@/services/api";

export type TopicContentItem = {
  topicId: string;
  theory: string;
};

/** GET /api/topics/:topicId/content — массив с одним элементом */
export async function fetchTopicContent(
  topicId: string
): Promise<TopicContentItem[]> {
  return apiFetch<TopicContentItem[]>(
    `/api/topics/${encodeURIComponent(topicId)}/content`,
    { method: "GET" }
  );
}

export type TopicTestPayload = {
  questions?: unknown[];
};

/** GET /api/topics/:topicId/test */
export async function fetchTopicTest(
  topicId: string
): Promise<TopicTestPayload> {
  return apiFetch<TopicTestPayload>(
    `/api/topics/${encodeURIComponent(topicId)}/test`,
    { method: "GET" }
  );
}

export type SubmitResultResponse = {
  status: string;
  completed: boolean;
};

/**
 * POST /api/topics/:topicId/submit
 * (на бэкенде маршрут называется submit, не result)
 */
export async function submitTopicResult(
  topicId: string,
  score: number
): Promise<SubmitResultResponse> {
  return apiFetch<SubmitResultResponse>(
    `/api/topics/${encodeURIComponent(topicId)}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ score }),
    }
  );
}
