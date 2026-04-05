import { Stack } from "expo-router";
import { PRIMARY } from "@/constants/config";

export default function TopicLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: PRIMARY,
        headerTitleStyle: { fontWeight: "700", color: "#111827" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#f3f4f6" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Теория" }} />
      <Stack.Screen name="test" options={{ title: "Тест" }} />
    </Stack>
  );
}
