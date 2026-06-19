import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { APInput } from "@/components/APInput";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Anamnese } from "@/lib/storage";

function ResultCard({ ficha }: { ficha: Anamnese }) {
  const colors = useColors();
  const statusColor = ficha.status === "Analisada" ? colors.success : colors.warning;
  const probColor =
    ficha.resultado.probabilidade >= 60
      ? colors.danger
      : ficha.resultado.probabilidade >= 30
      ? colors.warning
      : colors.success;

  return (
    <APCard padding={14}>
      <View style={styles.resultHeader}>
        <View style={styles.resultInfo}>
          <Text style={[styles.resultNome, { color: colors.foreground }]}>{ficha.dados.nome}</Text>
          <Text style={[styles.resultDetail, { color: colors.mutedForeground }]}>
            {ficha.dados.especie === "cao" ? "Cão" : "Gato"} · {ficha.dados.raca}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{ficha.status}</Text>
        </View>
      </View>
      <View style={styles.resultFooter}>
        <Text style={[styles.probText, { color: probColor }]}>
          {ficha.resultado.probabilidade}%
        </Text>
        <Text style={[styles.probLabel, { color: colors.mutedForeground }]}>
          {ficha.resultado.doenca}
        </Text>
        <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
          {ficha.dataEnvio}
        </Text>
      </View>
    </APCard>
  );
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { currentVetId, getAnamnesesPorMedico } = useApp();

  const fichas = currentVetId ? getAnamnesesPorMedico(currentVetId) : [];

  const [nomeBusca, setNomeBusca] = useState("");
  const [statusBusca, setStatusBusca] = useState<"" | "Pendente" | "Analisada">("");
  const [resultados, setResultados] = useState<Anamnese[]>([]);
  const [searched, setSearched] = useState(false);

  if (!currentVetId) {
    router.replace("/vet/login");
    return null;
  }

  function buscarPorNome() {
    const q = nomeBusca.trim().toLowerCase();
    const res = fichas.filter((f) => f.dados.nome.toLowerCase().includes(q));
    setResultados(res);
    setSearched(true);
  }

  function buscarPorStatus(status: "Pendente" | "Analisada") {
    setStatusBusca(status);
    const res = fichas.filter((f) => f.status === status);
    setResultados(res);
    setSearched(true);
  }

  function listarTodas() {
    setNomeBusca("");
    setStatusBusca("");
    setResultados(fichas);
    setSearched(true);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.secondary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Buscar Anamnese</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <APCard>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Buscar por nome
          </Text>
          <View style={styles.searchRow}>
            <APInput
              placeholder="Nome do paciente..."
              value={nomeBusca}
              onChangeText={setNomeBusca}
              containerStyle={styles.searchInput}
            />
            <Pressable
              onPress={buscarPorNome}
              style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="search" size={18} color="#fff" />
            </Pressable>
          </View>
        </APCard>

        <APCard>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Buscar por status
          </Text>
          <View style={styles.statusRow}>
            <Pressable
              onPress={() => buscarPorStatus("Pendente")}
              style={[
                styles.statusChip,
                {
                  backgroundColor:
                    statusBusca === "Pendente" ? colors.warning : colors.muted,
                  borderRadius: 12,
                  flex: 1,
                },
              ]}
            >
              <Feather
                name="clock"
                size={14}
                color={statusBusca === "Pendente" ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.statusChipText,
                  { color: statusBusca === "Pendente" ? "#fff" : colors.mutedForeground },
                ]}
              >
                Pendente
              </Text>
            </Pressable>
            <Pressable
              onPress={() => buscarPorStatus("Analisada")}
              style={[
                styles.statusChip,
                {
                  backgroundColor:
                    statusBusca === "Analisada" ? colors.success : colors.muted,
                  borderRadius: 12,
                  flex: 1,
                },
              ]}
            >
              <Feather
                name="check-circle"
                size={14}
                color={statusBusca === "Analisada" ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.statusChipText,
                  { color: statusBusca === "Analisada" ? "#fff" : colors.mutedForeground },
                ]}
              >
                Analisada
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={listarTodas}
            style={[styles.listAllBtn, { borderColor: colors.primary }]}
          >
            <Feather name="list" size={14} color={colors.primary} />
            <Text style={[styles.listAllText, { color: colors.primary }]}>
              Listar todas ({fichas.length})
            </Text>
          </Pressable>
        </APCard>

        {searched && (
          <>
            <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
              {resultados.length} resultado(s) encontrado(s)
            </Text>
            {resultados.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="search" size={36} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Nenhum resultado encontrado.
                </Text>
              </View>
            ) : (
              resultados.map((ficha) => <ResultCard key={ficha.id} ficha={ficha} />)
            )}
          </>
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
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  sectionLabel: { fontFamily: "Poppins_500Medium", fontSize: 13, marginBottom: 10 },
  searchRow: { flexDirection: "row", gap: 10, alignItems: "flex-end" },
  searchInput: { flex: 1 },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  statusChipText: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  listAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  listAllText: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  resultCount: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  resultInfo: { flex: 1 },
  resultNome: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  resultDetail: { fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontFamily: "Poppins_600SemiBold", fontSize: 11 },
  resultFooter: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  probText: { fontFamily: "Poppins_700Bold", fontSize: 18 },
  probLabel: { fontFamily: "Poppins_400Regular", fontSize: 12, flex: 1 },
  dateText: { fontFamily: "Poppins_400Regular", fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 32, gap: 12 },
  emptyText: { fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center" },
});
