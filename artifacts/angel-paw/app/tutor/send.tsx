import { Feather } from "@expo/vector-icons";
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
import { KeyboardAwareScrollViewCompat } from "react-native-keyboard-controller";

import { APButton } from "@/components/APButton";
import { APCard } from "@/components/APCard";
import { APInput } from "@/components/APInput";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function SendScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { enviarAnamnese, medicos, resetSessionTutor, sessionTutor } = useApp();

  const [idMedico, setIdMedico] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const { petDados } = sessionTutor;

  async function handleEnviar() {
    if (!idMedico.trim()) {
      setError("Informe o ID do médico veterinário");
      return;
    }
    if (!medicos[idMedico.trim()]) {
      setError("Médico não encontrado. Verifique o ID.");
      return;
    }
    setError("");
    setLoading(true);
    const ok = await enviarAnamnese(idMedico.trim());
    setLoading(false);
    if (ok) setEnviado(true);
  }

  function handleFinalizar() {
    resetSessionTutor();
    router.replace("/");
  }

  if (enviado) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.successScreen, { paddingTop: topPad }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + "22" }]}>
            <Feather name="check-circle" size={64} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Anamnese enviada!
          </Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            A anamnese de {petDados?.nome} foi enviada com sucesso ao médico.{"\n"}
            Aguarde o contato do veterinário.
          </Text>
          <APButton title="Voltar ao início" onPress={handleFinalizar} style={styles.homeBtn} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.secondary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Enviar Anamnese</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <APCard>
          <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
            <Feather name="send" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Informe o ID do Médico
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
            Solicite ao médico veterinário o seu ID de identificação para enviar a anamnese.
          </Text>
        </APCard>

        <APInput
          label="ID do Médico Veterinário"
          placeholder="Ex: 1"
          value={idMedico}
          onChangeText={(t) => { setIdMedico(t); setError(""); }}
          keyboardType="numeric"
          error={error}
        />

        <APButton title="Enviar anamnese" onPress={handleEnviar} loading={loading} />
        <APButton title="Cancelar" onPress={() => router.back()} variant="ghost" />
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
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  cardTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, textAlign: "center", marginBottom: 8 },
  cardSub: { fontFamily: "Poppins_400Regular", fontSize: 13, textAlign: "center", lineHeight: 20 },
  successScreen: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  successIcon: { width: 120, height: 120, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  successTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 26, textAlign: "center" },
  successSub: { fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22 },
  homeBtn: { marginTop: 8 },
});
