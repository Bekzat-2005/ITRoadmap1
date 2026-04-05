import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  BG,
  BORDER,
  CARD,
  PRIMARY,
  TEXT,
} from "@/constants/config";
import { fetchTopicContent } from "@/services/topic";

export default function TopicTheoryScreen() {
  const { topicId, title } = useLocalSearchParams<{
    topicId: string;
    title?: string;
  }>();
  const navigation = useNavigation();
  const id = Array.isArray(topicId) ? topicId[0] : topicId;

  const [theory, setTheory] = useState<string | null>(null);
  const [topicTitle, setTopicTitle] = useState(
    (Array.isArray(title) ? title[0] : title) || "Тема"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = Array.isArray(title) ? title[0] : title;
    if (t) {
      setTopicTitle(t);
      navigation.setOptions({ title: t });
    }
  }, [title, navigation]);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchTopicContent(id);
        const row = rows[0];
        if (alive && row?.theory) setTheory(row.theory);
        else if (alive) setTheory("Материал скоро появится.");
      } catch (e) {
        if (alive)
          setError(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (!id) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Некорректная тема</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.h1}>{topicTitle}</Text>
        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 24 }} />
        ) : null}
        {error ? <Text style={styles.err}>{error}</Text> : null}
        {!loading && theory ? (
          <Text style={styles.theory}>{theory}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.btn}
        activeOpacity={0.9}
        onPress={() =>
          router.push(
            `/topic/${id}/test?title=${encodeURIComponent(topicTitle)}` as Href
          )
        }
      >
        <Text style={styles.btnText}>Начать тест</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40, backgroundColor: BG },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
  },
  h1: { fontSize: 22, fontWeight: "800", color: TEXT, marginBottom: 12 },
  theory: { fontSize: 16, lineHeight: 26, color: TEXT },
  err: { color: "#dc2626", marginTop: 8 },
  btn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
