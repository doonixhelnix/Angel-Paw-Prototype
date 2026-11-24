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
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

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
          borderRadius: 22,
          shadowColor: colors.primary,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.primary }]} numberOfLines={2}>
          {title}
        </Text>
        <Text
          style={[styles.cardSub, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>
      <View style={[styles.arrowCircle, { backgroundColor: colors.secondary }]}>
        <Feather name="chevron-right" size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom;
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const compact = windowHeight < 760;
  const narrow = windowWidth < 380;

  const logoSize = compact ? (narrow ? 112 : 136) : windowWidth < 768 ? 176 : 220;
  const logoScaleValue = compact ? 1.1 : 1.35;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: botPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
        {/* A curva acompanha a altura real do conteúdo, sem comprimir a logo ou o título */}
        <View style={[styles.hero, { paddingBottom: compact ? 24 : 48 }]}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <Path
                d="M0,38 C 18,30 32,48 50,42 C 68,36 78,16 100,22 L100,80 C 82,90 68,72 50,78 C 32,84 18,96 0,86 Z"
                fill={colors.secondary}
              />
            </Svg>
          </View>

          <View style={[styles.logoSection, { paddingTop: topPad + (compact ? 8 : 28), gap: compact ? 12 : 18 }]}>
            <View style={[styles.logoGlowOuter, { width: logoSize, height: logoSize }]}>
              <View
                style={[
                  styles.logoGlowInner,
                  {
                    backgroundColor: "#ffffff",
                    width: logoSize * 0.9,
                    height: logoSize * 0.9,
                    borderRadius: (logoSize * 0.9) / 2,
                  },
                ]}
              />
              <View style={{ transform: [{ scale: logoScaleValue }] }}>
                <AngelPawLogo size="large" showText={false} />
              </View>
            </View>

            <Text style={[styles.brandTitle, { color: colors.primary, fontSize: compact ? 30 : 40 }]}>
              Angel <Text style={{ color: colors.mutedForeground }}>Paw</Text>
            </Text>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Feather name="heart" size={10} color={colors.primary} />
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
              Assistente veterinário inteligente para triagem de doenças em cães e gatos
            </Text>
          </View>
        </View>

        <View style={[styles.cardsWrap, compact && { gap: 12 }]}>
          <MenuCard
            icon="user"
            title="Sou Tutor"
            subtitle="Preencha a anamnese do seu pet e envie para o veterinário"
            onPress={() => router.push("/tutor/identification")}
          />
          <MenuCard
            icon="activity"
            title="Sou Médico Veterinário"
            subtitle="Acesse anamneses recebidas e gerencie seus pacientes"
            onPress={() => router.push("/vet/login")}
          />

          <Pressable
            onPress={() => router.push("/tutor/notifications")}
            style={({ pressed }) => [
              styles.notifLink,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="bell" size={14} color={colors.primary} />
            <Text style={[styles.notifLinkText, { color: colors.primary }]}>
              Já enviei uma anamnese · ver notificações
            </Text>
          </Pressable>
        </View>

        <Text
          style={[
            styles.footer,
            { color: colors.mutedForeground, marginTop: compact ? 16 : 28 },
          ]}
        >
          Aplicativo de triagem desenvolvido por Abner Augusto
        </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1 },
  hero: {
    position: "relative",
    flexGrow: 1,
    overflow: "hidden",
  },
  logoSection: {
    alignItems: "center",
    gap: 18,
    paddingHorizontal: 24,
  },
  logoGlowOuter: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlowInner: {
    position: "absolute",
    opacity: 0.35,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  brandTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    width: 28,
    height: 1,
  },
  tagline: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
    maxWidth: 440,
    width: "100%",
  },
  cardsWrap: {
    paddingHorizontal: 24,
    gap: 18,
    marginTop: 4,
  },
  notifLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  notifLinkText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12.5,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
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
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    marginBottom: 3,
  },
  cardSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
    paddingHorizontal: 24,
  },
});
