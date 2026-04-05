// login.tsx
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
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
import { apiFetch, setToken } from "@/services/api";

type LoginResponse = {
  token: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    setBusy(true);
    try {
      const data = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      await setToken(data.token);
      router.replace("/(tabs)" as Href);
    } catch (err) {
      Alert.alert(
        "Ошибка",
        err instanceof Error ? err.message : "Сервер недоступен"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>SKILLO</Text>

        <Text style={styles.title}>Вход в личный кабинет</Text>

        <Text style={styles.subtitle}>
          Продолжайте обучение и отслеживайте прогресс
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Пароль"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={busy}
        >
          <Text style={styles.buttonText}>{busy ? "Входим…" : "Войти"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register" as Href)}>
          <Text style={styles.link}>Нет аккаунта? Зарегистрироваться</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  logo: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY,
    letterSpacing: 1,
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    color: TEXT,
  },

  subtitle: {
    color: TEXT_MUTED,
    marginBottom: 22,
    fontSize: 15,
    lineHeight: 22,
  },

  input: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    fontSize: 16,
    color: TEXT,
  },

  button: {
    backgroundColor: PRIMARY,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    marginTop: 18,
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 15,
  },
});
