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

export default function VetRegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { cadastrarMedico } = useApp();

  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleCadastrar() {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Informe seu nome";
    if (senha.length < 3) e.senha = "Senha deve ter ao menos 3 caracteres";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    const id = await cadastrarMedico(nome.trim(), senha);
    setLoading(false);
    setNewId(id);
  }

  if (newId) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.successWrap, { paddingTop: topPad + 32, paddingBottom: botPad + 24 }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="user-check" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Cadastro realizado!
          </Text>

          <APCard style={[styles.idCard, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.idLabel, { color: colors.mutedForeground }]}>Seu ID é:</Text>
            <Text style={[styles.idNumber, { color: colors.primary }]}>{newId}</Text>
            <Text style={[styles.idHint, { color: colors.mutedForeground }]}>
              Guarde este ID — você precisará dele para fazer login e receber anamneses.
            </Text>
          </APCard>

          <APButton title="Ir para login" onPress={() => router.replace("/vet/login")} />
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Cadastrar Médico</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <APCard>
          <APInput
            label="Nome do médico"
            placeholder="Dr(a). Seu Nome"
            value={nome}
            onChangeText={(t) => { setNome(t); setErrors((e) => ({ ...e, nome: "" })); }}
            error={errors.nome}
            containerStyle={styles.field}
          />
          <APInput
            label="Senha"
            placeholder="••••••••"
            value={senha}
            onChangeText={(t) => { setSenha(t); setErrors((e) => ({ ...e, senha: "" })); }}
            secureTextEntry
            error={errors.senha}
            containerStyle={styles.field}
          />
        </APCard>

        <APButton title="Cadastrar" onPress={handleCadastrar} loading={loading} />
        <APButton title="Já tenho cadastro" onPress={() => router.replace("/vet/login")} variant="ghost" />
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
  field: { marginBottom: 14 },
  successWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 24,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 24, textAlign: "center" },
  idCard: { width: "100%", alignItems: "center", gap: 8 },
  idLabel: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  idNumber: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 48,
    letterSpacing: 4,
  },
  idHint: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
