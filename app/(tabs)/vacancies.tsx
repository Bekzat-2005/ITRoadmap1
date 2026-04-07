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

import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { BG, PRIMARY, TEXT, TEXT_MUTED } from "@/constants/config";
import { apiFetch } from "@/src/services/api";

type Vacancy = {
  id: string;
  title: string;
  company: string;
};

type VacanciesResponse = unknown;

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function normalizeVacancies(raw: VacanciesResponse): Vacancy[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && "vacancies" in raw
      ? (raw as { vacancies?: unknown }).vacancies
      : null;
  if (!Array.isArray(list)) return [];
  return list
    .map((v, idx): Vacancy | null => {
      if (!v || typeof v !== "object") return null;
      const obj = v as Record<string, unknown>;
      const id = asString(obj.id) ?? String(idx);
      const title = asString(obj.title ?? obj.position) ?? "";
      const company = asString(obj.company ?? obj.companyName) ?? "";
      if (!title || !company) return null;
      return { id, title, company };
    })
    .filter((v): v is Vacancy => v != null);
}

export default function VacanciesScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);

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
        const data = await apiFetch("/api/vacancies", { method: "GET" });
        const list = normalizeVacancies(data);
        if (alive) setVacancies(list);
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

  const openCount = vacancies.length;
  const companiesCount = useMemo(() => {
    const companySet = new Set(vacancies.map((v) => v.company));
    return companySet.size;
  }, [vacancies]);
  const showEmpty = useMemo(() => {
    return !loading && !error && vacancies.length === 0;
  }, [error, loading, vacancies.length]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Вакансии</Text>
        <Text style={styles.screenSub}>
          Актуальные предложения от компаний-партнёров и стажировки для
          выпускников треков.
        </Text>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{openCount}</Text>
            <Text style={styles.statLabel}>Открытые позиции</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{companiesCount}</Text>
            <Text style={styles.statLabel}>Компании</Text>
          </Card>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 18 }}>
            <ActivityIndicator color={PRIMARY} />
          </View>
        ) : null}

        {error ? (
          <Section>
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Ошибка</Text>
              <Text style={styles.emptyHint}>{error}</Text>
            </Card>
          </Section>
        ) : null}

        {showEmpty ? (
          <Section>
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Нет данных
              </Text>
              <Text style={styles.emptyHint}>
                Пока нет опубликованных вакансий
              </Text>
            </Card>
          </Section>
        ) : (
          <Section title="Список вакансий">
            {vacancies.map((v) => (
              <Card key={v.id} style={styles.vacancyCard}>
                <Text style={styles.vacancyTitle}>{v.title}</Text>
                <Text style={styles.vacancyCompany}>{v.company}</Text>
              </Card>
            ))}
          </Section>
        )}
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
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: "flex-start",
    minHeight: 96,
    justifyContent: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: PRIMARY,
    marginBottom: 4,
  },
  statLabel: { fontSize: 13, color: TEXT_MUTED, lineHeight: 18 },
  emptyCard: { paddingVertical: 24 },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
  },
  vacancyCard: { marginBottom: 12 },
  vacancyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 4,
  },
  vacancyCompany: { fontSize: 14, color: TEXT_MUTED },
});
