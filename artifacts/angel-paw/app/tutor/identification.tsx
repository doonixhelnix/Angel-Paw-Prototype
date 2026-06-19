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
import { KeyboardAwareScrollViewCompat } from "react-native-keyboard-controller";

import { APButton } from "@/components/APButton";
import { APCard } from "@/components/APCard";
import { APInput } from "@/components/APInput";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { EspeciePet } from "@/lib/diseases";

type Vacinacao = "C" | "I" | "D";

export default function IdentificationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { setPetDados } = useApp();

  const [especie, setEspecie] = useState<EspeciePet>("cao");
  const [nome, setNome] = useState("");
  const [idadeAnos, setIdadeAnos] = useState("");
  const [idadeMeses, setIdadeMeses] = useState("");
  const [raca, setRaca] = useState("");
  const [diasSintomas, setDiasSintomas] = useState("");
  const [vacinacao, setVacinacao] = useState<Vacinacao>("C");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!nome.trim() || !/[a-zA-ZÀ-ÿ]/.test(nome)) e.nome = "Nome inválido";
    const anos = parseInt(idadeAnos);
    const meses = parseInt(idadeMeses);
    if (isNaN(anos) || anos < 0 || anos > 30) e.idadeAnos = "Idade inválida (0-30)";
    if (isNaN(meses) || meses < 0 || meses > 11) e.idadeMeses = "Meses inválidos (0-11)";
    if (!raca.trim() || /^\d+$/.test(raca)) e.raca = "Raça inválida";
    const dias = parseInt(diasSintomas);
    if (isNaN(dias) || dias < 0 || dias > 14) e.diasSintomas = "Informe entre 0 e 14 dias";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleContinuar() {
    if (!validate()) return;
    setPetDados({
      especie,
      nome: nome.trim().charAt(0).toUpperCase() + nome.trim().slice(1),
      idadeAnos: parseInt(idadeAnos),
      idadeMeses: parseInt(idadeMeses),
      raca: raca.trim().toLowerCase(),
      diasSintomas: parseInt(diasSintomas),
      vacinacao,
    });
    router.push("/tutor/questionnaire");
  }

  const especieOptions: { value: EspeciePet; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { value: "cao", label: "Cão", icon: "heart" },
    { value: "gato", label: "Gato", icon: "star" },
  ];

  const vacOptions: { value: Vacinacao; label: string }[] = [
    { value: "C", label: "Completa" },
    { value: "I", label: "Incompleta" },
    { value: "D", label: "Desconhecida" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.secondary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Identificação do Pet</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <APCard style={styles.card}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Espécie</Text>
          <View style={styles.optionRow}>
            {especieOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setEspecie(opt.value)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: especie === opt.value ? colors.primary : colors.muted,
                    borderRadius: 12,
                    flex: 1,
                  },
                ]}
              >
                <Feather
                  name={opt.icon}
                  size={16}
                  color={especie === opt.value ? colors.primaryForeground : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: especie === opt.value ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <APInput
            label="Nome do paciente"
            placeholder="Ex: Bolinha"
            value={nome}
            onChangeText={setNome}
            error={errors.nome}
            containerStyle={styles.field}
          />

          <View style={[styles.row, styles.field]}>
            <APInput
              label="Idade (anos)"
              placeholder="0"
              value={idadeAnos}
              onChangeText={setIdadeAnos}
              keyboardType="numeric"
              error={errors.idadeAnos}
              containerStyle={styles.halfField}
            />
            <APInput
              label="Idade (meses)"
              placeholder="0"
              value={idadeMeses}
              onChangeText={setIdadeMeses}
              keyboardType="numeric"
              error={errors.idadeMeses}
              containerStyle={styles.halfField}
            />
          </View>

          <APInput
            label="Raça"
            placeholder="Ex: Labrador"
            value={raca}
            onChangeText={setRaca}
            error={errors.raca}
            containerStyle={styles.field}
          />

          <APInput
            label="Dias com sintomas (0-14)"
            placeholder="Ex: 3"
            value={diasSintomas}
            onChangeText={setDiasSintomas}
            keyboardType="numeric"
            error={errors.diasSintomas}
            containerStyle={styles.field}
          />

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
            Vacinação
          </Text>
          <View style={styles.optionRow}>
            {vacOptions.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setVacinacao(opt.value)}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: vacinacao === opt.value ? colors.primary : colors.muted,
                    borderRadius: 12,
                    flex: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: vacinacao === opt.value ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </APCard>

        <APButton title="Continuar" onPress={handleContinuar} style={styles.btn} />
      </KeyboardAwareScrollViewCompat>
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
  headerTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  card: {},
  sectionLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  optionChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  optionText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
  field: {
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  btn: {},
});
