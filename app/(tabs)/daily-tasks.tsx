import { router, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { apiFetch } from "@/src/services/api";
import {
  BG,
  BORDER,
  PRIMARY,
  TEXT,
  TEXT_MUTED,
} from "@/constants/config";

type DailyTask = {
  id: string;
  topicId: string;
  title: string;
  description: string;
  status: string;
  reward: number;
};

type RoadmapCategory = {
  id: string;
  name: string;
  progressPercent: number;
  tasks: DailyTask[];
};

type MainTask = {
  topicId: string;
  title: string;
  description: string;
  reward: number;
};

type DailyTasksResponse = {
  mainTask?: unknown;
  categories?: unknown;
};

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function asNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function normalizeMainTask(raw: unknown): MainTask | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const topicId = asString(obj.topicId ?? obj.topic_id ?? obj.topic);
  const title = asString(obj.title ?? obj.name);
  const description = asString(obj.description ?? obj.desc ?? obj.text);
  const reward = asNumber(obj.reward ?? obj.points ?? obj.xp);
  if (!topicId || !title || !description || reward == null) return null;
  return { topicId, title, description, reward };
}

function normalizeTask(raw: unknown, fallbackId: string): DailyTask | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = asString(obj.id) ?? fallbackId;
  const topicId = asString(obj.topicId ?? obj.topic_id ?? obj.topic);
  const title = asString(obj.title ?? obj.name);
  const description = asString(obj.description ?? obj.desc ?? obj.text) ?? "";
  const status = asString(obj.status) ?? "Ожидает выполнения";
  const reward = asNumber(obj.reward ?? obj.points ?? obj.xp) ?? 0;
  if (!topicId || !title) return null;
  return { id, topicId, title, description, status, reward };
}

function normalizeCategory(raw: unknown, fallbackId: string): RoadmapCategory | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = asString(obj.id) ?? fallbackId;
  const name = asString(obj.name ?? obj.title) ?? "Категория";
  const progressPercent =
    asNumber(obj.progressPercent ?? obj.progress_percent ?? obj.progress) ?? 0;
  const rawTasks = obj.tasks ?? obj.items;
  const tasks: DailyTask[] = Array.isArray(rawTasks)
    ? rawTasks
        .map((t, idx) => normalizeTask(t, `${id}-${idx}`))
        .filter((t): t is DailyTask => t != null)
    : [];
  return {
    id,
    name,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    tasks,
  };
}

function openTopic(topicId: string, title: string) {
  router.push(
    `/topic/${topicId}?title=${encodeURIComponent(title)}` as Href
  );
}

export default function DailyTasksScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainTask, setMainTask] = useState<MainTask | null>(null);
  const [categories, setCategories] = useState<RoadmapCategory[]>([]);

  useEffect(() => {
    const token =
      typeof localStorage === "undefined" ? null : localStorage.getItem("token");
    if (!token) {
      router.replace("/login" as Href);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = (await apiFetch("/api/daily-tasks", {
          method: "GET",
        })) as DailyTasksResponse;

        const mt = normalizeMainTask(data?.mainTask);
        const catsRaw = data?.categories;
        const cats: RoadmapCategory[] = Array.isArray(catsRaw)
          ? catsRaw
              .map((c, idx) => normalizeCategory(c, String(idx)))
              .filter((c): c is RoadmapCategory => c != null)
          : [];

        if (alive) {
          setMainTask(mt);
          setCategories(cats);
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Ошибка");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const showEmpty = useMemo(() => {
    const hasMain = mainTask != null;
    const hasCats = categories.length > 0;
    return !loading && !error && !hasMain && !hasCats;
  }, [categories.length, error, loading, mainTask]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Ежедневные задания</Text>
        <Text style={styles.screenSub}>
          Выполняйте задания по направлениям и получайте награды за тесты.
        </Text>

        {loading ? (
          <View style={{ paddingVertical: 18 }}>
            <ActivityIndicator color={PRIMARY} />
          </View>
        ) : null}

        {error ? (
          <Card style={styles.mainCard}>
            <Text style={styles.mainTitle}>Ошибка</Text>
            <Text style={styles.mainDesc}>{error}</Text>
          </Card>
        ) : null}

        {showEmpty ? (
          <Card style={styles.mainCard}>
            <Text style={styles.mainTitle}>Нет данных</Text>
            <Text style={styles.mainDesc}>На сегодня задания не найдены.</Text>
          </Card>
        ) : null}

        {mainTask ? (
          <Card style={styles.mainCard}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>День</Text>
              </View>
              <Text style={styles.reward}>+{mainTask.reward}</Text>
            </View>
            <Text style={styles.mainTitle}>{mainTask.title}</Text>
            <Text style={styles.mainDesc}>{mainTask.description}</Text>
            <Button
              title="Пройти тест"
              onPress={() => openTopic(mainTask.topicId, mainTask.title)}
              style={styles.mainButton}
            />
          </Card>
        ) : null}

        {categories.map((cat) => (
          <Section key={cat.id} title={cat.name}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Прогресс</Text>
              <Text style={styles.progressValue}>{cat.progressPercent}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, cat.progressPercent)}%` },
                ]}
              />
            </View>

            {cat.tasks.map((task) => (
              <Card key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.rewardSmall}>+{task.reward}</Text>
                </View>
                <Text style={styles.taskDesc}>{task.description}</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{task.status}</Text>
                </View>
                <Button
                  title="Пройти тест"
                  onPress={() => openTopic(task.topicId, task.title)}
                  style={styles.taskButton}
                />
              </Card>
            ))}
          </Section>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { padding: 18, paddingBottom: 36 },
  screenTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 6,
  },
  screenSub: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
    marginBottom: 18,
  },
  mainCard: { marginBottom: 8 },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  badge: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: "700", color: PRIMARY },
  reward: { fontSize: 16, fontWeight: "800", color: PRIMARY },
  mainTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 8,
  },
  mainDesc: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
    marginBottom: 14,
  },
  mainButton: { alignSelf: "stretch" },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: { fontSize: 13, color: TEXT_MUTED },
  progressValue: { fontSize: 13, fontWeight: "700", color: TEXT },
  progressTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: BORDER,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: PRIMARY,
  },
  taskCard: { marginBottom: 12 },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
  },
  rewardSmall: { fontSize: 14, fontWeight: "800", color: PRIMARY },
  taskDesc: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
    marginBottom: 10,
  },
  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: BG,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statusText: { fontSize: 12, fontWeight: "600", color: TEXT_MUTED },
  taskButton: { alignSelf: "stretch" },
});
