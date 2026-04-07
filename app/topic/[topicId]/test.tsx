// test.tsx
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  TEXT_MUTED,
} from "@/constants/config";
import { completeRoadmapNode } from "@/services/roadmap";
import { fetchTopicTest, submitTopicResult } from "@/services/topic";

type NormalizedQ = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
};

function optionLabel(opt: unknown): string {
  if (typeof opt === "string") return opt;
  if (opt && typeof opt === "object" && "label" in opt) {
    return String((opt as { label?: string }).label ?? "");
  }
  return "";
}

function normalizeQuestions(raw: unknown): NormalizedQ[] {
  if (!raw || typeof raw !== "object") return [];
  const qs = (raw as { questions?: unknown }).questions;
  if (!Array.isArray(qs)) return [];
  return qs
    .map((q: Record<string, unknown>, i: number) => {
      const rawOpts = q.options;
      let options: string[] = [];
      if (Array.isArray(rawOpts)) {
        options = rawOpts.map(optionLabel).filter(Boolean);
      }
      if (options.length < 2) {
        options = ["Вариант A", "Вариант B", "Вариант C", "Вариант D"];
      }
      let correctIndex = 0;
      if (typeof q.correctIndex === "number") correctIndex = q.correctIndex;
      else if (typeof q.correctOption === "number") correctIndex = q.correctOption;
      correctIndex = Math.max(0, Math.min(correctIndex, options.length - 1));
      return {
        id: String(q.id ?? i),
        question: String(q.question ?? ""),
        options,
        correctIndex,
      };
    })
    .filter((q) => q.question.length > 0);
}

export default function TopicTestScreen() {
  const { topicId, title } = useLocalSearchParams<{
    topicId: string;
    title?: string;
  }>();
  const navigation = useNavigation();
  const id = Array.isArray(topicId) ? topicId[0] : topicId;
  const displayTitle = Array.isArray(title) ? title[0] : title;

  const [questions, setQuestions] = useState<NormalizedQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState<{ correct: number; total: number } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (displayTitle) navigation.setOptions({ title: `Тест: ${displayTitle}` });
  }, [displayTitle, navigation]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTopicTest(id);
      let list = normalizeQuestions(data);
      setQuestions(list);
      setStep(0);
      setSelected(null);
      setAnswers([]);
      setPhase("quiz");
    } catch (e) {
      setQuestions([]);
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const current = questions[step];
  const isLast = step >= questions.length - 1;

  const goNext = async () => {
    if (selected === null || !current) return;
    const ok = selected === current.correctIndex;
    const nextAnswers = [...answers, ok];
    setAnswers(nextAnswers);
    setSelected(null);

    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    const correctCount = nextAnswers.filter(Boolean).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    setSummary({ correct: correctCount, total: questions.length });
    setScore(pct);
    setPhase("result");
    setSubmitting(true);
    try {
      await submitTopicResult(id!, pct);
      if (pct >= 70) {
        try {
          await completeRoadmapNode(id!);
        } catch {
          // разблокировка может уже быть учтена на сервере — не блокируем UI
        }
      }
    } catch (e) {
      Alert.alert(
        "Сервер",
        e instanceof Error ? e.message : "Не удалось сохранить результат"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resultLabel =
    score >= 90 ? "Отлично!" : score >= 70 ? "Зачёт!" : "Попробуй ещё";

  if (!id) {
    return (
      <View style={styles.center}>
        <Text>Некорректная тема</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (phase === "result") {
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.resultEmoji}>
            {score >= 70 ? "🎉" : "💪"}
          </Text>
          <Text style={styles.resultTitle}>{resultLabel}</Text>
          <Text style={styles.scoreBig}>{score}%</Text>
          <Text style={styles.sub}>
            Правильных: {summary?.correct ?? 0} из {summary?.total ?? questions.length}
          </Text>
          {error ? (
            <Text style={styles.hint}>
              Загружен демо-тест (сервер недоступен или пустой ответ).
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.replace("/(tabs)/roadmaps" as Href)}
          activeOpacity={0.9}
        >
          <Text style={styles.btnText}>Продолжить обучение</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.progress}>
        <Text style={styles.progressText}>
          Вопрос {step + 1} / {questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((step + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.q}>{current?.question}</Text>
        {current?.options.map((opt, idx) => {
          const active = selected === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.opt, active && styles.optActive]}
              onPress={() => setSelected(idx)}
              activeOpacity={0.85}
            >
              <View style={[styles.radio, active && styles.radioActive]} />
              <Text style={styles.optText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.btn, (selected === null || submitting) && styles.btnDisabled]}
        onPress={goNext}
        disabled={selected === null || submitting}
      >
        <Text style={styles.btnText}>
          {submitting ? "Сохраняем…" : isLast ? "Завершить" : "Далее"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48, backgroundColor: BG },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BG },
  progress: { marginBottom: 16 },
  progressText: { fontSize: 14, color: TEXT_MUTED, marginBottom: 8 },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: PRIMARY,
    borderRadius: 8,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 20,
  },
  q: { fontSize: 18, fontWeight: "700", color: TEXT, marginBottom: 16, lineHeight: 26 },
  opt: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  optActive: {
    borderColor: PRIMARY,
    backgroundColor: "#f5f3ff",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 12,
  },
  radioActive: { borderColor: PRIMARY, backgroundColor: PRIMARY },
  optText: { flex: 1, fontSize: 16, color: TEXT },
  btn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  resultEmoji: { fontSize: 48, textAlign: "center", marginBottom: 8 },
  resultTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    color: TEXT,
  },
  scoreBig: {
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    color: PRIMARY,
    marginVertical: 12,
  },
  sub: { textAlign: "center", color: TEXT_MUTED, fontSize: 15 },
  hint: { textAlign: "center", color: TEXT_MUTED, marginTop: 12, fontSize: 13 },
});
