import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AngelPawLogo } from "@/components/AngelPawLogo";
import { useColors } from "@/hooks/useColors";

interface MenuCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function MenuCard({ icon, title, subtitle, onPress }: MenuCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: 20,
          shadowColor: colors.primary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.secondary },
        ]}
      >
        <Feather name={icon} size={26} color={colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      </View>
      <View
        style={[
          styles.arrowCircle,
          { backgroundColor: colors.secondary },
        ]}
      >
        <Feather name="chevron-right" size={18} color={colors.primary} />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.wave, { backgroundColor: colors.secondary }]} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 32, paddingBottom: botPad + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <AngelPawLogo size="large" showText />
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Assistente veterinário para triagem{"\n"}de doenças em cães e gatos.
          </Text>
        </View>

        <View style={styles.cards}>
          <MenuCard
            icon="user"
            title="Sou Tutor"
            subtitle={"Preencha a anamnese do seu pet\ne envie ao veterinário"}
            onPress={() => router.push("/tutor/identification")}
          />
          <MenuCard
            icon="activity"
            title="Sou Médico Veterinário"
            subtitle={"Acesse anamneses recebidas\ne gerencie seus pacientes"}
            onPress={() => router.push("/vet/login")}
          />
        </View>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Aplicativo de triagem desenvolvido por Abner Augusto 🐾
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  wave: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "48%",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  scroll: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 40,
  },
  logoSection: {
    alignItems: "center",
    gap: 16,
  },
  tagline: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  cards: {
    width: "100%",
    gap: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    marginBottom: 2,
  },
  cardSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    textAlign: "center",
  },
});
