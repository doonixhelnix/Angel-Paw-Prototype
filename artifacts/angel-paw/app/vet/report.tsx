import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
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

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string | number;
  color: string;
}) {
  const colors = useColors();
  return (
    <APCard style={styles.statCard} padding={14}>
      <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </APCard>
  );
}

export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { currentVetId, getAnamnesesPorMedico } = useApp();

  if (!currentVetId) {
    router.replace("/vet/login");
    return null;
  }

  const fichas = getAnamnesesPorMedico(currentVetId);

  const stats = useMemo(() => {
    const total = fichas.length;
    const pendentes = fichas.filter((f) => f.status === "Pendente").length;
    const analisadas = fichas.filter((f) => f.status === "Analisada").length;

    const probs = fichas.map((f) => f.resultado.probabilidade);
    const probMedia = total > 0 ? Math.round(probs.reduce((a, b) => a + b, 0) / total) : 0;
    const probMax = total > 0 ? Math.max(...probs) : 0;
    const probMin = total > 0 ? Math.min(...probs) : 0;

    const altaConfianca = fichas.filter((f) => f.resultado.confianca === "Alta").length;
    const moderadaConfianca = fichas.filter((f) => f.resultado.confianca === "Moderada").length;
    const baixaConfianca = fichas.filter((f) => f.resultado.confianca === "Baixa").length;

    const emergencias = fichas.filter(
      (f) =>
        f.resultado.urgencia.toLowerCase().includes("emergência") ||
        f.resultado.urgencia.toLowerCase().includes("urgente")
    ).length;

    const avaliacaoRapida = fichas.filter(
      (f) => f.resultado.urgencia.toLowerCase().includes("média") || f.resultado.urgencia.toLowerCase().includes("media")
    ).length;

    const semUrgencia = fichas.filter(
      (f) =>
        !f.resultado.urgencia.toLowerCase().includes("emergência") &&
        !f.resultado.urgencia.toLowerCase().includes("urgente") &&
        !f.resultado.urgencia.toLowerCase().includes("média")
    ).length;

    const idades = fichas.map((f) => f.dados.idadeAnos + f.dados.idadeMeses / 12);
    const idadeMedia = total > 0 ? (idades.reduce((a, b) => a + b, 0) / total).toFixed(1) : "0";

    const racaCount: Record<string, number> = {};
    fichas.forEach((f) => {
      const r = f.dados.raca || "desconhecida";
      racaCount[r] = (racaCount[r] ?? 0) + 1;
    });
    const racasFreq = Object.entries(racaCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      total,
      pendentes,
      analisadas,
      probMedia,
      probMax,
      probMin,
      altaConfianca,
      moderadaConfianca,
      baixaConfianca,
      emergencias,
      avaliacaoRapida,
      semUrgencia,
      idadeMedia,
      racasFreq,
    };
  }, [fichas]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.secondary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Relatório Estatístico</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Visão Geral
        </Text>
        <View style={styles.grid}>
          <StatCard icon="inbox" label="Total de anamneses" value={stats.total} color={colors.primary} />
          <StatCard icon="clock" label="Pendentes" value={stats.pendentes} color={colors.warning} />
          <StatCard icon="check-circle" label="Analisadas" value={stats.analisadas} color={colors.success} />
          <StatCard icon="users" label="Idade média (anos)" value={stats.idadeMedia} color="#6B9FEA" />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Probabilidade
        </Text>
        <View style={styles.grid}>
          <StatCard icon="trending-up" label="Média" value={`${stats.probMedia}%`} color={colors.primary} />
          <StatCard icon="arrow-up" label="Máxima" value={`${stats.probMax}%`} color={colors.danger} />
          <StatCard icon="arrow-down" label="Mínima" value={`${stats.probMin}%`} color={colors.success} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Confiança do Diagnóstico
        </Text>
        <APCard>
          <BarRow label="Alta" value={stats.altaConfianca} total={stats.total} color={colors.success} colors={colors} />
          <BarRow label="Moderada" value={stats.moderadaConfianca} total={stats.total} color={colors.warning} colors={colors} />
          <BarRow label="Baixa" value={stats.baixaConfianca} total={stats.total} color={colors.danger} colors={colors} />
        </APCard>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Urgência
        </Text>
        <View style={styles.grid}>
          <StatCard icon="alert-triangle" label="Emergências" value={stats.emergencias} color={colors.danger} />
          <StatCard icon="alert-circle" label="Avaliação rápida" value={stats.avaliacaoRapida} color={colors.warning} />
          <StatCard icon="shield" label="Sem urgência" value={stats.semUrgencia} color={colors.success} />
        </View>

        {stats.racasFreq.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Raças mais frequentes
            </Text>
            <APCard>
              {stats.racasFreq.map(([raca, count], i) => (
                <View key={i} style={styles.racaRow}>
                  <Text style={[styles.racaRank, { color: colors.primary }]}>#{i + 1}</Text>
                  <Text style={[styles.racaNome, { color: colors.foreground }]}>
                    {raca.charAt(0).toUpperCase() + raca.slice(1)}
                  </Text>
                  <Text style={[styles.racaCount, { color: colors.mutedForeground }]}>
                    {count} {count === 1 ? "caso" : "casos"}
                  </Text>
                </View>
              ))}
            </APCard>
          </>
        )}

        {stats.total === 0 && (
          <View style={styles.empty}>
            <Feather name="bar-chart-2" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Nenhuma anamnese disponível para gerar estatísticas.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function BarRow({
  label,
  value,
  total,
  color,
  colors,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  colors: any;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <View style={barStyles.row}>
      <Text style={[barStyles.label, { color: colors.foreground, width: 80 }]}>{label}</Text>
      <View style={[barStyles.track, { backgroundColor: colors.muted }]}>
        <View style={[barStyles.fill, { backgroundColor: color, width: `${pct}%` }]} />
      </View>
      <Text style={[barStyles.count, { color: colors.mutedForeground }]}>{value}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  label: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
  count: { fontFamily: "Poppins_600SemiBold", fontSize: 13, width: 24, textAlign: "right" },
});

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
  headerTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 17 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  sectionTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 17,
    marginTop: 4,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: { flex: 1, minWidth: "40%", alignItems: "center", gap: 6 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: "Poppins_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "Poppins_400Regular", fontSize: 11, textAlign: "center" },
  racaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  racaRank: { fontFamily: "Poppins_700Bold", fontSize: 14, width: 24 },
  racaNome: { fontFamily: "Poppins_500Medium", fontSize: 14, flex: 1 },
  racaCount: { fontFamily: "Poppins_400Regular", fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 40, gap: 16 },
  emptyText: { fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center" },
});
