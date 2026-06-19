import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const colors = useColors();
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: colors.primary,
              width: `${progress}%`,
            },
          ]}
        />
      </View>
      <Text style={[styles.text, { color: colors.mutedForeground }]}>
        {current} de {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    alignItems: "center",
  },
  track: {
    height: 6,
    borderRadius: 3,
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  text: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
});
