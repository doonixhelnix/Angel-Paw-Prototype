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

export default function AdminLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { admins, loginAdmin, criarPrimeiroAdmin } = useApp();

  const semAdminAinda = Object.keys(admins).length === 0;

  // --- login normal ---
  const [id, setId] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [showSenha, setShowSenha] = useState(false);

  // --- criação do primeiro admin ---
  const [nomeSetup, setNomeSetup] = useState("");
  const [senhaSetup, setSenhaSetup] = useState("");
  const [confirmSetup, setConfirmSetup] = useState("");
  const [errorSetup, setErrorSetup] = useState("");
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [idCriado, setIdCriado] = useState<string | null>(null);

  function handleLogin() {
    if (!id.trim() || !senha.trim()) {
      setError("Preencha ID e senha");
      return;
    }
    const ok = loginAdmin(id.trim(), senha);
    if (ok) {
      router.replace("/admin/dashboard");
    } else {
      setError("ID ou senha incorretos");
    }
  }

  async function handleCriarPrimeiroAdmin() {
    if (!nomeSetup.trim()) {
      setErrorSetup("Informe seu nome");
      return;
    }
    if (senhaSetup.length < 6) {
      setErrorSetup("Use uma senha de pelo menos 6 caracteres");
      return;
    }
    if (senhaSetup !== confirmSetup) {
      setErrorSetup("As senhas não conferem");
      return;
    }
    setErrorSetup("");
    setLoadingSetup(true);
    const resultado = await criarPrimeiroAdmin(nomeSetup.trim(), senhaSetup);
    setLoadingSetup(false);

    if (resultado.status === "ok") {
      setIdCriado(resultado.id);
    } else {
      setErrorSetup("Já existe um administrador cadastrado. Recarregue a página.");
    }
  }

  if (idCriado) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.successWrap, { paddingTop: topPad + 32, paddingBottom: botPad + 24 }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
            <Feather name="shield" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Administrador criado!
          </Text>
          <APCard style={[styles.idCard, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.idLabel, { color: colors.mutedForeground }]}>Seu ID é:</Text>
            <Text style={[styles.idNumber, { color: colors.primary }]}>{idCriado}</Text>
            <Text style={[styles.idHint, { color: colors.mutedForeground }]}>
              Guarde esse ID — você vai precisar dele pra entrar da próxima vez.
              A partir de agora, você pode cadastrar outros administradores
              dentro do painel, se precisar.
            </Text>
          </APCard>
          <APButton title="Ir para o painel" onPress={() => router.replace("/admin/dashboard")} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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
          <Text style={[styles.backText, { color: colors.primary }]}>Voltar</Text>
        </Pressable>

        <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
          <Feather name="shield" size={32} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Área Administrativa
        </Text>

        {semAdminAinda ? (
          <>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Nenhum administrador cadastrado ainda. Crie o primeiro — numa
              implantação real, isso é feito uma única vez, pela própria
              instituição, antes do app ser liberado para uso.
            </Text>

            <APCard>
              <APInput
                label="Seu nome"
                placeholder="Ex: Coordenação Clínica"
                value={nomeSetup}
                onChangeText={(t) => { setNomeSetup(t); setErrorSetup(""); }}
                containerStyle={styles.field}
              />
              <APInput
                label="Senha (mínimo 6 caracteres)"
                placeholder="••••••••"
                value={senhaSetup}
                onChangeText={(t) => { setSenhaSetup(t); setErrorSetup(""); }}
                secureTextEntry
                containerStyle={styles.field}
              />
              <APInput
                label="Confirme a senha"
                placeholder="••••••••"
                value={confirmSetup}
                onChangeText={(t) => { setConfirmSetup(t); setErrorSetup(""); }}
                secureTextEntry
                error={errorSetup}
                containerStyle={styles.field}
              />
            </APCard>

            <APButton
              title="Criar primeiro administrador"
              onPress={handleCriarPrimeiroAdmin}
              loading={loadingSetup}
            />
          </>
        ) : (
          <>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Acesso restrito para aprovar ou rejeitar cadastros de médicos.
            </Text>

            <APCard>
              <APInput
                label="ID do administrador"
                placeholder="Ex: 001"
                value={id}
                onChangeText={(t) => { setId(t); setError(""); }}
                keyboardType="numeric"
                containerStyle={styles.field}
              />
              <View style={styles.senhaRow}>
                <APInput
                  label="Senha"
                  placeholder="••••••••"
                  value={senha}
                  onChangeText={(t) => { setSenha(t); setError(""); }}
                  secureTextEntry={!showSenha}
                  containerStyle={styles.senhaInput}
                  error={error}
                />
                <Pressable
                  onPress={() => setShowSenha((v) => !v)}
                  style={[styles.eyeBtn, { backgroundColor: colors.muted, borderRadius: 12 }]}
                >
                  <Feather
                    name={showSenha ? "eye-off" : "eye"}
                    size={18}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              </View>
            </APCard>

            <APButton title="Entrar" onPress={handleLogin} />
          </>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 18 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { fontFamily: "Poppins_500Medium", fontSize: 14 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 12,
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginTop: -8,
  },
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
  successWrap: { flex: 1, alignItems: "center", paddingHorizontal: 24, gap: 20 },
  idCard: { width: "100%", alignItems: "center", gap: 8 },
  idLabel: { fontFamily: "Poppins_400Regular", fontSize: 14 },
  idNumber: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 40, letterSpacing: 4 },
  idHint: { fontFamily: "Poppins_400Regular", fontSize: 12, textAlign: "center", lineHeight: 18 },
});
