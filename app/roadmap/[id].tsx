// [id].tsx
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams, type Href } from "expo-router";
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
    RoadmapTopic,
    fetchRoadmapTree,
} from "@/services/roadmap";

export default function RoadmapScreen() {
  const { id } = useLocalSearchParams();

  const [tree, setTree] = useState<Record<string, RoadmapTopic[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const t = await fetchRoadmapTree();
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

  const mapTopicsWithAccess = (topics: RoadmapTopic[]) => {
    let unlocked = true;

    return topics.map((topic) => {
      const result = {
        ...topic,
        unlocked,
      };

      if (topic.status !== "completed") {
        unlocked = false;
      }

      return result;
    });
  };

  // ✅ ВАЖНО: логика вне JSX
  const topics = tree[id as string] ?? [];
  const mappedTopics = mapTopicsWithAccess(topics);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.screenTitle}>Roadmap</Text>

        {loading && (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 32 }} />
        )}

        {error && <Text style={styles.err}>{error}</Text>}

        {!loading && (
          <View style={styles.section}>
            {topics.length === 0 ? (
              <Text style={styles.empty}>Нет тем</Text>
            ) : (
              mappedTopics.map((topic) => {
                const locked = !topic.unlocked;

                return (
                  <TouchableOpacity
                    key={topic.id}
                    style={[styles.topicRow, locked && styles.topicLocked]}
                    onPress={() => {
                      if (locked) return;
                      router.push(
                        `/topic/${topic.id}?title=${encodeURIComponent(
                          topic.title
                        )}` as Href
                      );
                    }}
                    disabled={locked}
                  >
                    <View style={styles.topicMain}>
                      <Text
                        style={[
                          styles.topicTitle,
                          locked && styles.topicTitleDisabled,
                        ]}
                      >
                        {topic.title}
                      </Text>

                      <Text style={styles.topicStatus}>
                        {topic.status}
                      </Text>
                    </View>

                    <Text>{locked ? "🔒" : "›"}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
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
