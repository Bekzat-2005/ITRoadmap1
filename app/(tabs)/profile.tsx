// layout.tsx
import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { apiFetch, clearToken } from "@/services/api";

type Profile = {
  fullName: string;
  email: string;
  points: number;
  completedTests: number;
  country?: string;
  city?: string;
  university?: string;
  achievements: string[];
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiFetch<Profile>("/api/profile", { method: "GET" });
        if (alive) setProfile(data);
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

  const logout = () => {
    Alert.alert("Выйти?", "Понадобится снова войти по email.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Выйти",
        style: "destructive",
        onPress: async () => {
          await clearToken();
          router.replace("/(auth)/login" as Href);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Профиль</Text>

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 32 }} />
        ) : null}
        {error ? <Text style={styles.err}>{error}</Text> : null}

        {profile ? (
          <View style={styles.card}>
            <Text style={styles.name}>{profile.fullName}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{profile.points}</Text>
                <Text style={styles.statLabel}>очков</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{profile.completedTests}</Text>
                <Text style={styles.statLabel}>тестов</Text>
              </View>
            </View>
            {(profile.city || profile.country) && (
              <Text style={styles.meta}>
                {[profile.city, profile.country].filter(Boolean).join(", ")}
              </Text>
            )}
            {profile.university ? (
              <Text style={styles.meta}>{profile.university}</Text>
            ) : null}
          </View>
        ) : null}

        {profile?.achievements?.length ? (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Достижения</Text>
            {profile.achievements.map((a, i) => (
              <Text key={i} style={styles.badge}>
                · {a}
              </Text>
            ))}
          </View>
        ) : null}

        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "800", color: TEXT, marginBottom: 16 },
  err: { color: "#dc2626", marginBottom: 12 },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  name: { fontSize: 22, fontWeight: "800", color: TEXT },
  email: { fontSize: 14, color: TEXT_MUTED, marginTop: 4 },
  stats: { flexDirection: "row", marginTop: 20, gap: 24 },
  stat: { marginRight: 24 },
  statVal: { fontSize: 24, fontWeight: "800", color: PRIMARY },
  statLabel: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  meta: { marginTop: 12, fontSize: 14, color: TEXT_MUTED },
  sectionLabel: {
    fontWeight: "700",
    color: TEXT,
    marginBottom: 8,
    fontSize: 16,
  },
  badge: { fontSize: 14, color: TEXT_MUTED, marginBottom: 4 },
  logout: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: "#b91c1c", fontWeight: "700", fontSize: 16 },
});
