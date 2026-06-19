import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
  error?: string;
}

export function APInput({ label, containerStyle, error, style, ...props }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.muted,
            borderColor: error ? colors.danger : colors.border,
            color: colors.foreground,
            borderRadius: 12,
          },
          style,
        ]}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    borderWidth: 1.5,
  },
  error: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
});
