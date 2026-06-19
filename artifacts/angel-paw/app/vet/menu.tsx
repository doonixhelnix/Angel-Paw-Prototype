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

import { APCard } from "@/components/APCard";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

function MenuItem({ icon, title, subtitle, color, onPress }: MenuItemProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, flex: 1 }]}
    >
      <APCard style={styles.menuCard} padding={16}>
        <View style={[styles.menuIcon, { backgroundColor: color + "22" }]}>
          <Feather name={icon} size={22} color={color} />
        </View>
        <Text style={[styles.menuTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{subtitle}</Text>
      </APCard>
    </Pressable>
  );
}

export default function VetMenuScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { logoutMedico, currentVetId, medicos, getAnamnesesPorMedico } = useApp();

  const medico = currentVetId ? medicos[currentVetId] : null;
  const anamnesesCount = currentVetId ? getAnamnesesPorMedico(currentVetId).length : 0;

  function handleSair() {
    logoutMedico();
    router.replace("/");
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.secondary }]}>
        <View style={styles.headerInfo}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Bem-vindo(a),</Text>
          <Text style={[styles.nomeDoc, { color: colors.foreground }]}>
            {medico?.nome ?? "Médico"}
          </Text>
          <Text style={[styles.idBadge, { color: colors.primary }]}>ID: {currentVetId}</Text>
        </View>
        <View style={[styles.docIcon, { backgroundColor: colors.primary + "22" }]}>
          <Feather name="user" size={28} color={colors.primary} />
        </View>
      </View>

      <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{anamnesesCount}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Anamneses</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {currentVetId ? getAnamnesesPorMedico(currentVetId).filter((a) => a.status === "Analisada").length : 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Analisadas</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>
            {currentVetId ? getAnamnesesPorMedico(currentVetId).filter((a) => a.status === "Pendente").length : 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pendentes</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          <MenuItem
            icon="file-text"
            title="Ver Anamneses"
            subtitle="Fichas recebidas"
            color={colors.primary}
            onPress={() => router.push("/vet/anamneses")}
          />
          <MenuItem
            icon="edit-3"
            title="Adicionar Notas"
            subtitle="Anotações clínicas"
            color={colors.success}
            onPress={() => router.push("/vet/notes")}
          />
          <MenuItem
            icon="search"
            title="Buscar Anamnese"
            subtitle="Por nome ou status"
            color={colors.warning}
            onPress={() => router.push("/vet/search")}
          />
          <MenuItem
            icon="download"
            title="Exportar PDF"
            subtitle="Gerar relatório"
            color="#6B9FEA"
            onPress={() => router.push("/vet/anamneses?mode=export")}
          />
          <MenuItem
            icon="bar-chart-2"
            title="Relatório Estatístico"
            subtitle="Visão geral"
            color="#EA9F6B"
            onPress={() => router.push("/vet/report")}
          />
          <MenuItem
            icon="log-out"
            title="Sair"
            subtitle="Encerrar sessão"
            color={colors.danger}
            onPress={handleSair}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  headerInfo: { flex: 1 },
  greeting: { fontFamily: "Poppins_400Regular", fontSize: 13 },
  nomeDoc: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 20 },
  idBadge: { fontFamily: "Poppins_500Medium", fontSize: 12, marginTop: 2 },
  docIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statsBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#A98BEA",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNumber: { fontFamily: "Poppins_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, marginHorizontal: 8 },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  menuCard: {
    gap: 8,
    minHeight: 110,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  menuSub: { fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 16 },
});
