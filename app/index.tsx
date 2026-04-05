// index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { BG, PRIMARY } from "@/constants/config";

export default function Index() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!cancelled) {
          if (token) router.replace("/(tabs)" as Href);
          else router.replace("/(auth)/login" as Href);
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={PRIMARY} animating={booting} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
});
