import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { apiFetch } from "@/services/api";

type MeUser = {
  id: number;
  email: string;
};

export default function HomeScreen() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiFetch<MeUser>("/api/auth/me", {
          method: "GET",
        });
        if (alive) setUser(data);
      } catch (e) {
        if (alive)
          setError(e instanceof Error ? e.message : "Не удалось загрузить профиль");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const name = user?.email?.split("@")[0] || "Ученик";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 24 }} />
        ) : (
          <>
            <View style={styles.hero}>
              <Text style={styles.greet}>Привет, {name}!</Text>
              <Text style={styles.sub}>
                Продолжай цепочку уроков как в Duolingo: теория → тест → следующая
                тема.
              </Text>
            </View>

            {error ? (
              <Text style={styles.err}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push("/(tabs)/roadmaps" as Href)}
            >
              <Text style={styles.cardTitle}>К roadmaps</Text>
              <Text style={styles.cardDesc}>
                Выбери направление и открой доступную тему.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, styles.cardOutline]}
              activeOpacity={0.9}
              onPress={() => router.push("/(tabs)/leaderboard" as Href)}
            >
              <Text style={[styles.cardTitle, { color: PRIMARY }]}>
                Лидерборд
              </Text>
              <Text style={styles.cardDesc}>Сравни очки с другими учениками.</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, padding: 20 },
  hero: { marginBottom: 20 },
  greet: {
    fontSize: 26,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 8,
  },
  sub: { fontSize: 15, color: TEXT_MUTED, lineHeight: 22 },
  err: { color: "#dc2626", marginBottom: 12 },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardOutline: {
    backgroundColor: "#faf5ff",
    borderColor: "#ddd6fe",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: TEXT, marginBottom: 6 },
  cardDesc: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20 },
});
