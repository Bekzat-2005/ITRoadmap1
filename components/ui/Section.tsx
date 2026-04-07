import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PRIMARY, TEXT_MUTED } from "@/constants/config";

type SectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export function Section({ title, description, children }: SectionProps) {
  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
    marginBottom: 12,
  },
});
