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
  icon?: React.ReactNode;
}

export function APInput({ label, containerStyle, error, style, icon, ...props }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      )}
      <View style={styles.inputWrap}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.muted,
              borderColor: error ? colors.danger : colors.border,
              color: colors.foreground,
              borderRadius: 12,
              paddingRight: icon ? 44 : 16,
            },
            style,
          ]}
          placeholderTextColor={colors.mutedForeground}
          {...props}
        />
        {icon && <View style={styles.iconSlot}>{icon}</View>}
      </View>
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
  inputWrap: {
    position: "relative",
    justifyContent: "center",
  },
  iconSlot: {
    position: "absolute",
    right: 14,
    opacity: 0.55,
  },
  error: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
});
