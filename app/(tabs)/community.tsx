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

type CommunityPost = {
  id: string;
  author: string;
  title: string;
  excerpt: string;
  createdAt: string;
};

type CommunityPostsResponse = unknown;

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function normalizePosts(raw: CommunityPostsResponse): CommunityPost[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && "posts" in raw
      ? (raw as { posts?: unknown }).posts
      : null;
  if (!Array.isArray(list)) return [];

  return list
    .map((p, idx): CommunityPost | null => {
      if (!p || typeof p !== "object") return null;
      const obj = p as Record<string, unknown>;
      const id = asString(obj.id) ?? String(idx);
      const author =
        asString(obj.author) ??
        asString(obj.authorName) ??
        asString(obj.userName) ??
        "Пользователь";
      const title = asString(obj.title) ?? "";
      const excerpt = asString(obj.excerpt ?? obj.text ?? obj.content) ?? "";
      const createdAt =
        asString(obj.createdAt ?? obj.created_at ?? obj.date) ?? "";
      if (!title && !excerpt) return null;
      return { id, author, title: title || "Публикация", excerpt, createdAt };
    })
    .filter((p): p is CommunityPost => p != null);
}

export default function CommunityScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);

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
        const data = await apiFetch("/api/community/posts", { method: "GET" });
        const list = normalizePosts(data);
        if (alive) setPosts(list);
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
    return !loading && !error && posts.length === 0;
  }, [error, loading, posts.length]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Сообщество</Text>
        <Text style={styles.screenSub}>
          Делитесь опытом, задавайте вопросы и находите единомышленников.
        </Text>

        <Button
          title="Опубликовать пост"
          onPress={() => {}}
          style={styles.publishBtn}
        />

        <Section title="Лента публикаций">
          {loading ? (
            <View style={{ paddingVertical: 18 }}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : null}
          {error ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Ошибка</Text>
              <Text style={styles.emptyText}>{error}</Text>
            </Card>
          ) : null}
          {showEmpty ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Нет данных</Text>
              <Text style={styles.emptyText}>Пока нет публикаций</Text>
            </Card>
          ) : (
            posts.map((p) => (
              <Card key={p.id} style={styles.postCard}>
                <Text style={styles.postMeta}>
                  {p.author} · {p.createdAt}
                </Text>
                <Text style={styles.postTitle}>{p.title}</Text>
                <Text style={styles.postExcerpt}>{p.excerpt}</Text>
              </Card>
            ))
          )}
        </Section>

        <Section title="Модерация моих постов">
          <Card>
            <View style={[styles.modRow, styles.modRowBorder]}>
              <View style={styles.dot} />
              <Text style={styles.modText}>Нет данных</Text>
            </View>
            <View style={styles.modRow}>
              <View style={styles.dot} />
              <Text style={styles.modText}>Модерация появится после публикаций</Text>
            </View>
          </Card>
        </Section>

        <Section title="Правила публикаций">
          <Card>
            <View style={[styles.ruleRow, styles.ruleRowBorder]}>
              <Text style={styles.ruleIndex}>1.</Text>
              <Text style={styles.ruleText}>Уважайте других участников.</Text>
            </View>
            <View style={[styles.ruleRow, styles.ruleRowBorder]}>
              <Text style={styles.ruleIndex}>2.</Text>
              <Text style={styles.ruleText}>Без спама и оскорблений.</Text>
            </View>
            <View style={styles.ruleRow}>
              <Text style={styles.ruleIndex}>3.</Text>
              <Text style={styles.ruleText}>Не публикуйте персональные данные.</Text>
            </View>
          </Card>
        </Section>
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
    marginBottom: 16,
  },
  publishBtn: { alignSelf: "stretch", marginBottom: 8 },
  emptyCard: { alignItems: "center", paddingVertical: 28 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  postCard: { marginBottom: 12 },
  postMeta: { fontSize: 12, color: TEXT_MUTED, marginBottom: 6 },
  postTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 6,
  },
  postExcerpt: { fontSize: 14, color: TEXT_MUTED, lineHeight: 20 },
  modRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 10 },
  modRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginTop: 6,
    marginRight: 10,
  },
  modText: { flex: 1, fontSize: 14, color: TEXT, lineHeight: 20 },
  ruleRow: { flexDirection: "row", paddingVertical: 10 },
  ruleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  ruleIndex: {
    width: 22,
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY,
  },
  ruleText: { flex: 1, fontSize: 14, color: TEXT_MUTED, lineHeight: 20 },
});
