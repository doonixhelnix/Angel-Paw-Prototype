import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
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
      <APCard style={styles.menuCard} padding={14}>
        <View style={[styles.menuIcon, { backgroundColor: color + "22" }]}>
          <Feather name={icon} size={22} color={color} />
        </View>
        <Text style={[styles.menuTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{subtitle}</Text>
      </APCard>
    </Pressable>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function VetMenuScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { logoutMedico, currentVetId, medicos, getAnamnesesPorMedico, definirDisponibilidadeMedico } = useApp();

  const medico = currentVetId ? medicos[currentVetId] : null;
  const anamnesesCount = currentVetId ? getAnamnesesPorMedico(currentVetId).length : 0;
  const disponibilidadeAtual = medico?.disponibilidade ?? "Inativo";
  const disponibilidadeOpcoes = [
    { valor: "Ativo" as const, cor: colors.success, icone: "check-circle" as const },
    { valor: "Ocupado" as const, cor: colors.warning, icone: "clock" as const },
    { valor: "Inativo" as const, cor: colors.mutedForeground, icone: "minus-circle" as const },
  ];

  function handleSair() {
    logoutMedico();
    router.replace("/");
  }

  const menuItems: MenuItemProps[] = [
    {
      icon: "file-text",
      title: "Ver Anamneses",
      subtitle: "Fichas recebidas",
      color: colors.primary,
      onPress: () => router.push("/vet/anamneses"),
    },
    {
      icon: "edit-3",
      title: "Adicionar Notas",
      subtitle: "Anotações clínicas",
      color: colors.success,
      onPress: () => router.push("/vet/notes"),
    },
    {
      icon: "send",
      title: "Enviar Notificação",
      subtitle: "Mensagem para o tutor",
      color: "#9B7EDE",
      onPress: () => router.push("/vet/notify"),
    },
    {
      icon: "search",
      title: "Buscar Anamnese",
      subtitle: "Por nome ou status",
      color: colors.warning,
      onPress: () => router.push("/vet/search"),
    },
    {
      icon: "download",
      title: "Exportar PDF",
      subtitle: "Gerar relatório",
      color: "#6B9FEA",
      onPress: () => router.push("/vet/anamneses?mode=export"),
    },
    {
      icon: "bar-chart-2",
      title: "Relatório Estatístico",
      subtitle: "Visão geral",
      color: "#EA9F6B",
      onPress: () => router.push("/vet/report"),
    },
    {
      icon: "log-out",
      title: "Sair",
      subtitle: "Encerrar sessão",
      color: colors.danger,
      onPress: handleSair,
    },
  ];
  const linhas = chunk(menuItems, 2);

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

      <View style={[styles.availabilityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.availabilityHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.availabilityTitle, { color: colors.foreground }]}>Disponibilidade para receber anamneses</Text>
            <Text style={[styles.availabilitySubtitle, { color: colors.mutedForeground }]}>Altere manualmente quando sua disponibilidade mudar</Text>
          </View>
          <View style={[styles.currentStatusBadge, { backgroundColor: (disponibilidadeOpcoes.find((o) => o.valor === disponibilidadeAtual)?.cor ?? colors.mutedForeground) + "20" }]}>
            <Text style={[styles.currentStatusText, { color: disponibilidadeOpcoes.find((o) => o.valor === disponibilidadeAtual)?.cor ?? colors.mutedForeground }]}>{disponibilidadeAtual}</Text>
          </View>
        </View>
        <View style={styles.availabilityOptions}>
          {disponibilidadeOpcoes.map((opcao) => {
            const selecionado = disponibilidadeAtual === opcao.valor;
            return (
              <Pressable
                key={opcao.valor}
                accessibilityRole="button"
                accessibilityState={{ selected: selecionado }}
                onPress={() => { void definirDisponibilidadeMedico(opcao.valor); }}
                style={[styles.availabilityOption, { borderColor: selecionado ? opcao.cor : colors.border, backgroundColor: selecionado ? opcao.cor + "18" : colors.background }]}
              >
                <Feather name={opcao.icone} size={15} color={opcao.cor} />
                <Text style={[styles.availabilityOptionText, { color: selecionado ? opcao.cor : colors.foreground }]}>{opcao.valor}</Text>
              </Pressable>
            );
          })}
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

      <View style={[styles.content, { paddingBottom: botPad + 16 }]}>
        <View style={styles.gridWrap}>
          {linhas.map((linha, i) => (
            <View key={i} style={styles.gridRow}>
              {linha.map((item) => (
                <MenuItem key={item.title} {...item} />
              ))}
              {linha.length === 1 && <View style={styles.gridSpacer} />}
            </View>
          ))}
        </View>
      </View>
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
  availabilityCard: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  availabilityHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  availabilityTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  availabilitySubtitle: { fontFamily: "Poppins_400Regular", fontSize: 10, marginTop: 2 },
  currentStatusBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  currentStatusText: { fontFamily: "Poppins_600SemiBold", fontSize: 11 },
  availabilityOptions: { flexDirection: "row", gap: 8 },
  availabilityOption: { flex: 1, minHeight: 38, borderWidth: 1, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 5 },
  availabilityOptionText: { fontFamily: "Poppins_600SemiBold", fontSize: 11 },
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
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  gridWrap: { flex: 1, gap: 12 },
  gridRow: { flex: 1, flexDirection: "row", gap: 14 },
  gridSpacer: { flex: 1 },
  menuCard: {
    flex: 1,
    gap: 6,
    justifyContent: "center",
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
