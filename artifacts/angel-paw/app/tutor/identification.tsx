import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

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

  // O scroll só é ligado quando o conteúdo realmente não cabe na área
  // visível (tela pequena, ou teclado aberto — a lib de teclado aumenta
  // o conteúdo enquanto ele está aberto). Quando cabe, a tela fica fixa.
  const [alturaVisivel, setAlturaVisivel] = useState(0);
  const [alturaConteudo, setAlturaConteudo] = useState(0);
  const precisaRolar = alturaConteudo > alturaVisivel + 1;

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
        <View style={[styles.pawBadge, { backgroundColor: colors.primary + "18" }]}>
          <MaterialCommunityIcons name="paw" size={16} color={colors.primary} />
        </View>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 16 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        scrollEnabled={precisaRolar}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        onLayout={(e) => setAlturaVisivel(e.nativeEvent.layout.height)}
        onContentSizeChange={(_, h) => setAlturaConteudo(h)}
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
                <MaterialCommunityIcons
                  name={opt.value === "cao" ? "dog" : "cat"}
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
            icon={<MaterialCommunityIcons name="paw" size={18} color={colors.primary} />}
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
            icon={
              <MaterialCommunityIcons
                name={especie === "cao" ? "dog-side" : "cat"}
                size={18}
                color={colors.primary}
              />
            }
          />

          <APInput
            label="Dias com sintomas (0-14)"
            placeholder="Ex: 3"
            value={diasSintomas}
            onChangeText={setDiasSintomas}
            keyboardType="numeric"
            error={errors.diasSintomas}
            containerStyle={styles.field}
            icon={<Feather name="calendar" size={17} color={colors.primary} />}
          />

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 2 }]}>
            Vacinação
          </Text>
          <View style={[styles.optionRow, { marginBottom: 0 }]}>
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
  pawBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 14,
  },
  card: {},
  sectionLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
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
    marginBottom: 10,
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
