import { useFocusEffect } from "@react-navigation/native";
import { router, type Href } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView, StyleSheet, Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  BG,
  PRIMARY,
  TEXT,
  TEXT_MUTED,
} from "@/constants/config";

import {
  deleteRoadmap,
  fetchRoadmaps,
  RoadmapMeta,
  sortRoadmapsByCategory,
} from "@/services/roadmap";

export default function RoadmapsScreen() {
  const [roadmaps, setRoadmaps] = useState<RoadmapMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRoadmaps();
      setRoadmaps(sortRoadmapsByCategory(data));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // 🔥 фейковый прогресс (потом заменим API)
  const getProgress = () => Math.floor(Math.random() * 100);

  // 🔥 уровень по названию
  const getLevel = (title: string) => {
    if (title.toLowerCase().includes("backend")) return "INTERMEDIATE";
    return "BEGINNER";
  };
  const handleDelete = async (id: string) => {
  try {
    await deleteRoadmap(id);
    load(); // обновляем список
  } catch (e) {
    console.log("DELETE ERROR:", e);
  }
};

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.screenTitle}>Мои дорожные карты</Text>

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* ✅ МОИ ROADMAPS */}
            {roadmaps.map((rm) => {
              const progress = getProgress();

              return (
                <View key={rm.id} style={styles.card}>
                  
                  <Text style={styles.level}>
                    {getLevel(rm.title)}
                  </Text>

                  <Text style={styles.title}>{rm.title}</Text>

                  <Text style={styles.desc}>
                    React, Vue және заманауи интерфейстер
                  </Text>

                  {/* Прогресс */}
                  <View style={styles.progressWrap}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.percent}>{progress}%</Text>
                  </View>

                  {/* Кнопки */}
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() =>
                        router.push(`/roadmap/${rm.id}` as Href)
                      }
                    >
                      <Text style={styles.buttonText}>
                        Открыть карту
                      </Text>
                    </TouchableOpacity>


                   <TouchableOpacity
  style={styles.deleteBtn}
  onPress={() => handleDelete(rm.id)}
>
  <Text style={styles.deleteText}>Удалить</Text>
</TouchableOpacity>
                 </View>

                </View>
              );
            })}

            {/* ✅ ДОБАВИТЬ НАПРАВЛЕНИЕ */}
            <Text style={styles.sectionTitle}>
              Добавить направление
            </Text>

            <View style={styles.card}>
              <Text style={styles.level}>INTERMEDIATE</Text>

              <Text style={styles.title}>DevOps Engineering</Text>

              <Text style={styles.desc}>
                CI/CD, Docker, Cloud
              </Text>

              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>
                  Пройти оценку
                </Text>
              </TouchableOpacity>
            </View>

          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  container: {
    padding: 16,
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: TEXT,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 12,
    color: TEXT,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 3,
  },

  level: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 4,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: TEXT,
  },

  desc: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 12,
  },

  progressWrap: {
    marginBottom: 12,
  },

  progressBar: {
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 6,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: PRIMARY,
  },

  percent: {
    marginTop: 4,
    fontSize: 12,
    color: TEXT_MUTED,
  },

  row: {
    flexDirection: "row",
    gap: 8,
  },

  button: {
    flex: 1,
    backgroundColor: PRIMARY,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  deleteBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: {
    color: PRIMARY,
    fontWeight: "600",
  },
});