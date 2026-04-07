import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { CARD, PRIMARY } from "@/constants/config";

type ButtonVariant = "primary" | "outline";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  icon?: ReactNode;
};

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
  style,
  icon,
}: ButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        pressed && !disabled && !loading && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? CARD : PRIMARY} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text
            style={[styles.label, isPrimary ? styles.labelOnPrimary : styles.labelOutline]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    minHeight: 48,
  },
  primary: {
    backgroundColor: PRIMARY,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.5 },
  label: { fontSize: 15, fontWeight: "700" },
  labelOnPrimary: { color: CARD },
  labelOutline: { color: PRIMARY },
});
