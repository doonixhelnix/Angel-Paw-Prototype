import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { APButton } from "@/components/APButton";
import { APCard } from "@/components/APCard";
import { APInput } from "@/components/APInput";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import {
  calcularProbabilidadeDoenca,
  extrairFatoresRisco,
  extrairSintomas,
} from "@/lib/diseases";

export default function ReviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { sessionTutor, setPetDados, setResultado } = useApp();
  const { petDados, respostas } = sessionTutor;

  const [nome, setNome] = useState(petDados?.nome ?? "");
  const [idadeAnos, setIdadeAnos] = useState(String(petDados?.idadeAnos ?? 0));
  const [idadeMeses, setIdadeMeses] = useState(
    String(petDados?.idadeMeses ?? 0),
  );
  const [raca, setRaca] = useState(petDados?.raca ?? "");
  const [diasSintomas, setDiasSintomas] = useState(
    String(petDados?.diasSintomas ?? 0),
  );
  const [success, setSuccess] = useState(false);

  if (!petDados) {
    router.replace("/tutor/identification");
    return null;
  }

  const vacLabel = { C: "Completa", I: "Incompleta", D: "Desconhecida" }[
    petDados.vacinacao
  ];

  function salvar() {
    const novosDados = {
      ...petDados,
      nome: nome.trim(),
      idadeAnos: parseInt(idadeAnos) || 0,
      idadeMeses: parseInt(idadeMeses) || 0,
      raca: raca.trim(),
      diasSintomas: parseInt(diasSintomas) || 0,
    };
    setPetDados(novosDados);

    const sintomas = extrairSintomas(novosDados.especie, respostas);
    const fatores = extrairFatoresRisco(
      novosDados.especie,
      respostas,
      novosDados.vacinacao,
    );
    const idadeTotal = novosDados.idadeAnos + novosDados.idadeMeses / 12;
    if (novosDados.especie === "cao" && idadeTotal < 0.5) {
      fatores["idade_filhote"] = true;
    }
    const novoResultado = calcularProbabilidadeDoenca(
      novosDados.especie,
      sintomas,
      fatores,
    );
    setResultado(novoResultado);
    setSuccess(true);
  }

  function continuarResumo() {
    router.push("/tutor/summary");
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.secondary },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Revisar Dados
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <APCard>
          <APInput
            label="Nome"
            value={nome}
            onChangeText={setNome}
            containerStyle={styles.field}
          />
          <View style={[styles.row, styles.field]}>
            <APInput
              label="Idade (anos)"
              value={idadeAnos}
              onChangeText={setIdadeAnos}
              keyboardType="numeric"
              containerStyle={styles.half}
            />
            <APInput
              label="Idade (meses)"
              value={idadeMeses}
              onChangeText={setIdadeMeses}
              keyboardType="numeric"
              containerStyle={styles.half}
            />
          </View>
          <APInput
            label="Raça"
            value={raca}
            onChangeText={setRaca}
            containerStyle={styles.field}
          />
          <APInput
            label="Dias com sintomas"
            value={diasSintomas}
            onChangeText={setDiasSintomas}
            keyboardType="numeric"
            containerStyle={styles.field}
          />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
              Espécie
            </Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {petDados.especie === "cao" ? "Cão" : "Gato"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
              Vacinação
            </Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {vacLabel}
            </Text>
          </View>
        </APCard>

        {success && (
          <View
            style={[
              styles.successBanner,
              { backgroundColor: colors.success + "22" },
            ]}
          >
            <Feather name="check-circle" size={16} color={colors.success} />
            <Text style={[styles.successText, { color: colors.success }]}>
              Dados atualizados com sucesso!
            </Text>
          </View>
        )}

        <APButton title="Salvar alterações" onPress={salvar} />
        <APButton
          title="Continuar para resumo"
          onPress={continuarResumo}
          variant="secondary"
        />
      </KeyboardAwareScrollView>
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
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  field: { marginBottom: 14 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0E8FF",
  },
  infoLabel: { fontFamily: "Poppins_400Regular", fontSize: 13 },
  infoValue: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  successText: { fontFamily: "Poppins_500Medium", fontSize: 13 },
});
