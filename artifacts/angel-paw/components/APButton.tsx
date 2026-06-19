import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function APButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  fullWidth = true,
}: Props) {
  const colors = useColors();

  const bgMap = {
    primary: colors.primary,
    secondary: colors.secondary,
    ghost: "transparent",
    danger: colors.danger,
  };

  const textColorMap = {
    primary: colors.primaryForeground,
    secondary: colors.secondaryForeground,
    ghost: colors.primary,
    danger: colors.primaryForeground,
  };

  const borderMap = {
    primary: "transparent",
    secondary: colors.border,
    ghost: colors.primary,
    danger: "transparent",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgMap[variant],
          borderColor: borderMap[variant],
          borderWidth: variant === "ghost" || variant === "secondary" ? 1.5 : 0,
          opacity: pressed || disabled ? 0.7 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColorMap[variant]} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: textColorMap[variant] },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  text: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
