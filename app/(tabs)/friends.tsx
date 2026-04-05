import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { Friend, addFriendByEmail, fetchFriends, removeFriend } from "@/services/friends";

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchFriends();
      setFriends(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onAdd = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert("Email", "Введите email друга");
      return;
    }
    setAdding(true);
    try {
      const list = await addFriendByEmail(trimmed);
      setFriends(list);
      setEmail("");
    } catch (e) {
      Alert.alert(
        "Ошибка",
        e instanceof Error ? e.message : "Не удалось добавить"
      );
    } finally {
      setAdding(false);
    }
  };

  const onRemove = (f: Friend) => {
    Alert.alert("Удалить друга?", f.fullName, [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            const list = await removeFriend(f.userId);
            setFriends(list);
          } catch (e) {
            Alert.alert(
              "Ошибка",
              e instanceof Error ? e.message : "Не удалось удалить"
            );
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Друзья</Text>
        <Text style={styles.sub}>Добавляй по email и соревнуйтесь на лидерборде.</Text>

        <View style={styles.addCard}>
          <TextInput
            style={styles.input}
            placeholder="Email друга"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity
            style={[styles.btn, adding && { opacity: 0.7 }]}
            onPress={onAdd}
            disabled={adding}
          >
            <Text style={styles.btnText}>
              {adding ? "Добавляем…" : "Добавить"}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 24 }} />
        ) : null}
        {error ? <Text style={styles.err}>{error}</Text> : null}

        {!loading &&
          friends.map((f) => (
            <View key={f.userId} style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{f.avatar}</Text>
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.name}>{f.fullName}</Text>
                <Text style={styles.email}>{f.email}</Text>
                <Text style={styles.meta}>Очки: {f.points}</Text>
              </View>
              <TouchableOpacity
                onPress={() => onRemove(f)}
                style={styles.removeBtn}
                hitSlop={12}
              >
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

        {!loading && friends.length === 0 ? (
          <Text style={styles.empty}>Пока нет друзей — добавь первого.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "800", color: TEXT, marginBottom: 6 },
  sub: { fontSize: 14, color: TEXT_MUTED, marginBottom: 18, lineHeight: 20 },
  addCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },
  btn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  err: { color: "#dc2626", marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: PRIMARY },
  rowBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: TEXT },
  email: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  meta: { fontSize: 12, color: TEXT_MUTED, marginTop: 4 },
  removeBtn: { padding: 8 },
  removeText: { fontSize: 18, color: "#dc2626" },
  empty: { textAlign: "center", color: TEXT_MUTED, marginTop: 24 },
});
