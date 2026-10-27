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
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

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
  const [crmv, setCrmv] = useState("");
  const [contato, setContato] = useState("");
  const [localTrabalho, setLocalTrabalho] = useState("");
  const [loading, setLoading] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleCadastrar() {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = "Informe seu nome";
    if (senha.length < 3) e.senha = "Senha deve ter ao menos 3 caracteres";
    if (!crmv.trim()) e.crmv = "Informe seu CRMV";
    if (!contato.trim()) e.contato = "Informe um telefone ou e-mail";
    if (!localTrabalho.trim()) e.localTrabalho = "Informe onde você atua";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    const resultado = await cadastrarMedico(
      nome.trim(),
      senha,
      crmv.trim(),
      contato.trim(),
      localTrabalho.trim()
    );
    setLoading(false);

    if (resultado.status === "ok") {
      setNewId(resultado.id);
      return;
    }

    // Cada problema aparece no campo certo, em vez de uma mensagem solta.
    const porCampo: Record<string, [string, string]> = {
      crmv_invalido: ["crmv", "CRMV inválido. Use o formato UF-NÚMERO, ex: SP-12345."],
      crmv_duplicado: [
        "crmv",
        "Já existe um pedido ou conta ativa com esse CRMV. Se foi um engano, fale com o administrador.",
      ],
      contato_invalido: [
        "contato",
        "Informe um e-mail válido ou um telefone com DDD, ex: (11) 91234-5678.",
      ],
      dados_incompletos: ["geral", "Preencha todos os campos para enviar o pedido."],
    };
    const [campo, mensagem] = porCampo[resultado.status] ?? [
      "geral",
      "Não foi possível enviar o pedido.",
    ];
    setErrors((prev) => ({ ...prev, [campo]: mensagem }));
  }

  if (newId) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.successWrap, { paddingTop: topPad + 32, paddingBottom: botPad + 24 }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="clock" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Solicitação enviada!
          </Text>
          <Text style={[styles.successHint, { color: colors.mutedForeground }]}>
            Um administrador vai analisar seus dados e pode entrar em contato
            pelo telefone ou e-mail informado para confirmar a sua identidade.
            Sua conta só será liberada depois dessa análise — tente fazer
            login novamente em breve.
          </Text>

          <APCard style={[styles.idCard, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.idLabel, { color: colors.mutedForeground }]}>Seu ID é:</Text>
            <Text style={[styles.idNumber, { color: colors.primary }]}>{newId}</Text>
            <Text style={[styles.idHint, { color: colors.mutedForeground }]}>
              Guarde este ID — você vai precisar dele para fazer login assim
              que o pedido for aprovado.
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Solicitar Cadastro</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAwareScrollView
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
            label="CRMV"
            placeholder="Ex: SP-12345"
            value={crmv}
            onChangeText={(t) => { setCrmv(t); setErrors((e) => ({ ...e, crmv: "", geral: "" })); }}
            autoCapitalize="characters"
            error={errors.crmv}
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
          <APInput
            label="Telefone ou e-mail de contato"
            placeholder="(11) 91234-5678 ou voce@clinica.com"
            value={contato}
            onChangeText={(t) => { setContato(t); setErrors((e) => ({ ...e, contato: "", geral: "" })); }}
            autoCapitalize="none"
            error={errors.contato}
            containerStyle={styles.field}
          />
          <APInput
            label="Local de trabalho"
            placeholder="Clínica ou hospital onde atua"
            value={localTrabalho}
            onChangeText={(t) => { setLocalTrabalho(t); setErrors((e) => ({ ...e, localTrabalho: "", geral: "" })); }}
            error={errors.localTrabalho}
            containerStyle={styles.field}
          />
          <Text style={[styles.contatoHint, { color: colors.mutedForeground }]}>
            O administrador usa o contato e o local de trabalho para confirmar
            quem você é antes de aprovar o pedido.
          </Text>
          {!!errors.geral && (
            <Text style={[styles.erroGeral, { color: colors.danger }]}>{errors.geral}</Text>
          )}
        </APCard>

        <APButton title="Enviar solicitação" onPress={handleCadastrar} loading={loading} />
        <APButton title="Já tenho cadastro" onPress={() => router.replace("/vet/login")} variant="ghost" />
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
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  field: { marginBottom: 14 },
  contatoHint: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  erroGeral: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  successHint: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginTop: -8,
  },
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
