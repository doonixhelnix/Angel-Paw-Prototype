import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { Anamnese } from "@/lib/storage";

function AnamneseCard({ ficha, index, exportMode }: { ficha: Anamnese; index: number; exportMode: boolean }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const probColor =
    ficha.resultado.probabilidade >= 60
      ? colors.danger
      : ficha.resultado.probabilidade >= 30
      ? colors.warning
      : colors.success;

  const statusColor = ficha.status === "Analisada" ? colors.success : colors.warning;

  function handleExport() {
    Alert.alert("PDF gerado com sucesso", `Anamnese de ${ficha.dados.nome} exportada.`);
  }

  return (
    <APCard style={styles.anamneseCard}>
      <Pressable onPress={() => setExpanded((v) => !v)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.petNome, { color: colors.foreground }]}>{ficha.dados.nome}</Text>
            <Text style={[styles.petInfo, { color: colors.mutedForeground }]}>
              {ficha.dados.especie === "cao" ? "Cão" : "Gato"} · {ficha.dados.raca} ·{" "}
              {ficha.dados.idadeAnos}a {ficha.dados.idadeMeses}m
            </Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{ficha.status}</Text>
            </View>
            <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
          </View>
        </View>

        <View style={styles.probRow}>
          <Text style={[styles.probText, { color: probColor }]}>
            {ficha.resultado.probabilidade}%
          </Text>
          <Text style={[styles.probLabel, { color: colors.mutedForeground }]}>
            {ficha.resultado.doenca}
          </Text>
          <Text style={[styles.confiancaChip, { color: colors.primary }]}>
            Confiança: {ficha.resultado.confianca}
          </Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
          <InfoRow label="Vacinação" value={{ C: "Completa", I: "Incompleta", D: "Desconhecida" }[ficha.dados.vacinacao]} colors={colors} />
          <InfoRow label="Dias com sintomas" value={String(ficha.dados.diasSintomas)} colors={colors} />
          <InfoRow label="Urgência" value={ficha.resultado.urgencia} colors={colors} />
          <InfoRow label="Interpretação" value={ficha.resultado.interpretacao} colors={colors} />
          <InfoRow label="Data de envio" value={ficha.dataEnvio} colors={colors} />
          {ficha.dataAnalise && <InfoRow label="Data de análise" value={ficha.dataAnalise} colors={colors} />}

          {ficha.resultado.sinaisPositivos.length > 0 && (
            <View style={styles.sinaisSection}>
              <Text style={[styles.sinaisTitle, { color: colors.foreground }]}>Sinais Positivos</Text>
              {ficha.resultado.sinaisPositivos.map((s, i) => (
                <View key={i} style={styles.signalRow}>
                  <Feather name="check-circle" size={12} color={colors.success} />
                  <Text style={[styles.signalText, { color: colors.foreground }]}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {ficha.resultado.sinaisNegativos.length > 0 && (
            <View style={styles.sinaisSection}>
              <Text style={[styles.sinaisTitle, { color: colors.foreground }]}>Sinais Negativos</Text>
              {ficha.resultado.sinaisNegativos.map((s, i) => (
                <View key={i} style={styles.signalRow}>
                  <Feather name="minus-circle" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.signalText, { color: colors.mutedForeground }]}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {ficha.notasMedico ? (
            <View style={[styles.notasBox, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.notasLabel, { color: colors.mutedForeground }]}>Notas do Médico</Text>
              <Text style={[styles.notasText, { color: colors.foreground }]}>{ficha.notasMedico}</Text>
            </View>
          ) : null}

          {exportMode && (
            <Pressable
              onPress={handleExport}
              style={[styles.exportBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="download" size={14} color="#fff" />
              <Text style={styles.exportBtnText}>Exportar PDF</Text>
            </Pressable>
          )}
        </View>
      )}
    </APCard>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground, flex: 1 }]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

export default function AnamnesesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { currentVetId, getAnamnesesPorMedico } = useApp();
  const params = useLocalSearchParams<{ mode?: string }>();
  const exportMode = params.mode === "export";

  const fichas = currentVetId ? getAnamnesesPorMedico(currentVetId) : [];
  const title = exportMode ? "Exportar PDF" : "Anamneses Recebidas";

  if (!currentVetId) {
    router.replace("/vet/login");
    return null;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.secondary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.countBadge, { color: colors.primary }]}>{fichas.length}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {fichas.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Nenhuma anamnese recebida ainda.
            </Text>
          </View>
        ) : (
          fichas.map((ficha, i) => (
            <AnamneseCard key={ficha.id} ficha={ficha} index={i} exportMode={exportMode} />
          ))
        )}
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
    paddingBottom: 16,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18 },
  countBadge: { fontFamily: "Poppins_700Bold", fontSize: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  anamneseCard: {},
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  cardHeaderLeft: { flex: 1 },
  cardHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  petNome: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  petInfo: { fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontFamily: "Poppins_600SemiBold", fontSize: 11 },
  probRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" },
  probText: { fontFamily: "Poppins_700Bold", fontSize: 20 },
  probLabel: { fontFamily: "Poppins_400Regular", fontSize: 12, flex: 1 },
  confiancaChip: { fontFamily: "Poppins_500Medium", fontSize: 11 },
  expandedContent: { borderTopWidth: 1, marginTop: 12, paddingTop: 12, gap: 8 },
  infoRow: { flexDirection: "row", gap: 8 },
  infoLabel: { fontFamily: "Poppins_500Medium", fontSize: 12, width: 110 },
  infoValue: { fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18 },
  sinaisSection: { marginTop: 4, gap: 4 },
  sinaisTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 12, marginBottom: 4 },
  signalRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  signalText: { fontFamily: "Poppins_400Regular", fontSize: 12, flex: 1, lineHeight: 17 },
  notasBox: { padding: 12, borderRadius: 12, gap: 4, marginTop: 4 },
  notasLabel: { fontFamily: "Poppins_500Medium", fontSize: 11 },
  notasText: { fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19 },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  exportBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 13, color: "#fff" },
  empty: { alignItems: "center", paddingTop: 80, gap: 16 },
  emptyText: { fontFamily: "Poppins_400Regular", fontSize: 15, textAlign: "center" },
});
