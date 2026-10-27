import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface Props {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  dividerWithHeart?: boolean;
}

export function AngelPawLogo({ size = "large", showText = true, dividerWithHeart = false }: Props) {
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
            <Text style={[styles.titleAngel, { fontSize: dimensions.title, color: colors.primary }]}>
              Angel{" "}
            </Text>
            <Text style={[styles.titlePaw, { fontSize: dimensions.title, color: colors.mutedForeground }]}>
              Paw
            </Text>
          </View>
          {dividerWithHeart ? (
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.purpleLight }]} />
              <Feather name="heart" size={9} color={colors.primary} />
              <View style={[styles.dividerLine, { backgroundColor: colors.purpleLight }]} />
            </View>
          ) : (
            <View style={[styles.divider, { backgroundColor: colors.purpleLight }]} />
          )}
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  dividerLine: {
    width: 20,
    height: 1,
  },
});
