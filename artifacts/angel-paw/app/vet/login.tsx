import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { AngelPawLogo } from "@/components/AngelPawLogo";
import { APButton } from "@/components/APButton";
import { APCard } from "@/components/APCard";
import { APInput } from "@/components/APInput";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function VetLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { loginMedico } = useApp();

  const [id, setId] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  async function handleLogin() {
    if (!id.trim() || !senha.trim()) {
      setError("Preencha ID e senha");
      return;
    }
    setError("");
    setLoading(true);
    const resultado = await loginMedico(id.trim(), senha);
    setLoading(false);

    if (resultado.status === "ok") {
      router.replace("/vet/menu");
      return;
    }

    const mensagens: Record<string, string> = {
      invalido: "ID ou senha inválidos",
      pendente: "Seu pedido ainda está em análise pelo administrador. Tente novamente mais tarde.",
      rejeitado: "Seu pedido não foi aprovado. Você pode enviar uma nova solicitação com os dados corretos ou falar com o administrador.",
    };
    setError(mensagens[resultado.status] ?? "Não foi possível entrar.");
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.wave, { backgroundColor: colors.secondary }]} />

      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 32, paddingBottom: botPad + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Feather name="arrow-left" size={18} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>
            Voltar
          </Text>
        </Pressable>

        <View style={styles.logoWrap}>
          <AngelPawLogo size="medium" showText dividerWithHeart />
        </View>

        <Text style={[styles.screenTitle, { color: colors.foreground }]}>
          Área do Médico Veterinário
        </Text>

        <APCard style={styles.card}>
          <APInput
            label="ID do Médico"
            placeholder="Ex: 1"
            value={id}
            onChangeText={(t) => {
              setId(t);
              setError("");
            }}
            keyboardType="numeric"
            containerStyle={styles.field}
          />

          <View style={styles.senhaRow}>
            <APInput
              label="Senha"
              placeholder="••••••••"
              value={senha}
              onChangeText={(t) => {
                setSenha(t);
                setError("");
              }}
              secureTextEntry={!showSenha}
              containerStyle={styles.senhaInput}
            />
            <Pressable
              onPress={() => setShowSenha((v) => !v)}
              style={[
                styles.eyeBtn,
                { backgroundColor: colors.muted, borderRadius: 12 },
              ]}
            >
              <Feather
                name={showSenha ? "eye-off" : "eye"}
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>

          {error ? (
            <Text style={[styles.error, { color: colors.danger }]}>
              {error}
            </Text>
          ) : null}
        </APCard>

        <APButton title="Entrar" onPress={handleLogin} loading={loading} />

        <Pressable
          onPress={() => router.push("/vet/register")}
          style={styles.registerRow}
        >
          <Text
            style={[styles.registerText, { color: colors.mutedForeground }]}
          >
            Ainda não tem conta?{" "}
          </Text>
          <Text style={[styles.registerLink, { color: colors.primary }]}>
            Solicitar cadastro
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/admin/login")}
          style={styles.adminLink}
        >
          <Text style={[styles.adminLinkText, { color: colors.mutedForeground }]}>
            Acesso administrativo
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  wave: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  scroll: { paddingHorizontal: 24, gap: 20 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { fontFamily: "Poppins_500Medium", fontSize: 14 },
  logoWrap: { alignItems: "center" },
  screenTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    textAlign: "center",
  },
  card: {},
  field: { marginBottom: 14 },
  senhaRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  senhaInput: { flex: 1 },
  eyeBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  error: { fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 4 },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  registerText: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  registerLink: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  adminLink: { alignItems: "center", marginTop: 4 },
  adminLinkText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    opacity: 0.7,
  },
});
