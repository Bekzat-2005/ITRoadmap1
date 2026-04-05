// leaderboard.tsx
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
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
  LeaderboardEntry,
  fetchLeaderboard,
} from "@/services/leaderboard";

function Row({
  item,
  highlight,
}: {
  item: LeaderboardEntry;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.row, highlight && styles.rowHighlight]}>
      <Text style={styles.rank}>#{item.rank}</Text>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {item.fullName}
        </Text>
        <Text style={styles.points}>{item.points} очков</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard();
      setLeaders(data.leaders);
      setCurrentUserId(data.currentUser?.userId ?? null);
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
        <Text style={styles.title}>Лидерборд</Text>
        <Text style={styles.sub}>Ранг и очки по прогрессу на платформе.</Text>

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 28 }} />
        ) : null}
        {error ? <Text style={styles.err}>{error}</Text> : null}

        {!loading &&
          leaders.map((l) => (
            <Row
              key={l.userId}
              item={l}
              highlight={
                currentUserId != null &&
                Number(l.userId) === Number(currentUserId)
              }
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "800", color: TEXT, marginBottom: 6 },
  sub: { fontSize: 14, color: TEXT_MUTED, marginBottom: 16, lineHeight: 20 },
  err: { color: "#dc2626", marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  rowHighlight: {
    borderColor: PRIMARY,
    backgroundColor: "#f5f3ff",
  },
  rank: {
    width: 44,
    fontWeight: "800",
    color: PRIMARY,
    fontSize: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontWeight: "700", color: PRIMARY },
  body: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: TEXT },
  points: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
});
