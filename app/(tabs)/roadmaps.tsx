// roadmaps.tsx
import { useFocusEffect } from "@react-navigation/native";
import { router, type Href } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BG,
  BORDER,
  CARD,
  PRIMARY,
  TEXT,
  TEXT_MUTED,
} from "@/constants/config";
import {
  RoadmapMeta,
  RoadmapTopic,
  fetchRoadmapTree,
  fetchRoadmaps,
  sortRoadmapsByCategory,
} from "@/services/roadmap";

export default function RoadmapsScreen() {
  const [roadmaps, setRoadmaps] = useState<RoadmapMeta[]>([]);
  const [tree, setTree] = useState<Record<string, RoadmapTopic[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, t] = await Promise.all([
        fetchRoadmaps(),
        fetchRoadmapTree(),
      ]);
      setRoadmaps(sortRoadmapsByCategory(list));
      setTree(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>Roadmaps</Text>
        <Text style={styles.screenSub}>
          Backend · Frontend · AI · DevOps · UI/UX — темы с прогрессом с сервера.
        </Text>

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 32 }} />
        ) : null}
        {error ? <Text style={styles.err}>{error}</Text> : null}

        {!loading &&
          roadmaps.map((rm) => {
            const topics = tree[rm.id] ?? [];
            return (
              <View key={rm.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{rm.title}</Text>
                {topics.length === 0 ? (
                  <Text style={styles.empty}>Нет тем в этом направлении</Text>
                ) : (
                  topics.map((topic) => {
                    const locked = topic.status === "locked";
                    const onPress = () => {
                      if (locked) return;
                      router.push(
                        `/topic/${topic.id}?title=${encodeURIComponent(topic.title)}` as Href
                      );
                    };
                    return (
                      <TouchableOpacity
                        key={topic.id}
                        style={[styles.topicRow, locked && styles.topicLocked]}
                        onPress={onPress}
                        disabled={locked}
                        activeOpacity={locked ? 1 : 0.7}
                      >
                        <View style={styles.topicMain}>
                          <Text
                            style={[
                              styles.topicTitle,
                              locked && styles.topicTitleDisabled,
                            ]}
                            numberOfLines={2}
                          >
                            {topic.title}
                          </Text>
                          <Text style={styles.topicStatus}>{topic.status}</Text>
                        </View>
                        <Text style={styles.chev}>{locked ? "🔒" : "›"}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, paddingBottom: 40 },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 6,
  },
  screenSub: { fontSize: 14, color: TEXT_MUTED, marginBottom: 20, lineHeight: 20 },
  err: { color: "#dc2626", marginBottom: 12 },
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 10,
  },
  empty: { color: TEXT_MUTED, fontSize: 14 },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  topicLocked: { opacity: 0.55 },
  topicMain: { flex: 1 },
  topicTitle: { fontSize: 16, fontWeight: "600", color: TEXT },
  topicTitleDisabled: { color: TEXT_MUTED },
  topicStatus: {
    marginTop: 4,
    fontSize: 12,
    color: TEXT_MUTED,
    textTransform: "capitalize",
  },
  chev: { fontSize: 20, color: PRIMARY, marginLeft: 8 },
});
