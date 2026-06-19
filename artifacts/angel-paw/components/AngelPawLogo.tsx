import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

export function AngelPawLogo({ size = "large", showText = true }: Props) {
  const colors = useColors();

  const dimensions = {
    small: { img: 60, title: 22, sub: 12 },
    medium: { img: 90, title: 28, sub: 14 },
    large: { img: 120, title: 36, sub: 15 },
  }[size];

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/icon.png")}
        style={[styles.image, { width: dimensions.img, height: dimensions.img }]}
        resizeMode="contain"
      />
      {showText && (
        <>
          <View style={styles.titleRow}>
            <Text style={[styles.titleAngel, { fontSize: dimensions.title, color: colors.purpleDark }]}>
              Angel{" "}
            </Text>
            <Text style={[styles.titlePaw, { fontSize: dimensions.title, color: colors.primary }]}>
              Paw
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.purpleLight }]} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  image: {
    borderRadius: 999,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  titleAngel: {
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
  titlePaw: {
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
  divider: {
    width: 40,
    height: 2,
    borderRadius: 2,
    marginTop: 2,
  },
});
