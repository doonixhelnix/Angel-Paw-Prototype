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
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { APButton } from "@/components/APButton";
import { APCard } from "@/components/APCard";
import { APInput } from "@/components/APInput";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function AdminManageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { currentAdmin, admins, criarAdmin, logAprovacoes } = useApp();

  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState<string | null>(null);

  if (!currentAdmin) {
    router.replace("/admin/login");
    return null;
  }

  const listaAdmins = Object.values(admins).sort((a, b) =>
    a.dataCriacao.localeCompare(b.dataCriacao)
  );
  const logOrdenado = [...logAprovacoes].sort((a, b) => b.data.localeCompare(a.data));

  async function handleAdicionar() {
    if (!nome.trim()) {
      setError("Informe o nome do novo administrador");
      return;
    }
    if (senha.length < 6) {
      setError("Use uma senha de pelo menos 6 caracteres");
      return;
    }
    if (senha !== confirmSenha) {
      setError("As senhas não conferem");
      return;
    }
    setError("");
    setLoading(true);
    const resultado = await criarAdmin(nome.trim(), senha);
    setLoading(false);

    if (resultado.status === "ok") {
      setSucesso(`Administrador criado com ID ${resultado.id}`);
      setNome("");
      setSenha("");
      setConfirmSenha("");
      setTimeout(() => setSucesso(null), 4000);
    } else {
      setError("Não foi possível criar o administrador.");
    }
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
          Administradores
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Administradores cadastrados ({listaAdmins.length})
        </Text>
        {listaAdmins.map((admin) => (
          <APCard key={admin.id} padding={14} style={styles.adminCard}>
            <View style={[styles.adminIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="shield" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.adminNome, { color: colors.foreground }]}>
                {admin.nome}
                {admin.id === currentAdmin.id ? " (você)" : ""}
              </Text>
              <Text style={[styles.adminInfo, { color: colors.mutedForeground }]}>
                ID {admin.id} · desde {admin.dataCriacao}
              </Text>
            </View>
          </APCard>
        ))}

        <APCard>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>
            Adicionar novo administrador
          </Text>
          <Text style={[styles.formHint, { color: colors.mutedForeground }]}>
            Use isso pra dar acesso a outra pessoa responsável (ex: outro
            coordenador). Cada um deve ter sua própria conta — evite
            compartilhar login entre pessoas.
          </Text>
          <APInput
            label="Nome"
            placeholder="Ex: Maria Coordenadora"
            value={nome}
            onChangeText={(t) => { setNome(t); setError(""); }}
            containerStyle={styles.field}
          />
          <APInput
            label="Senha (mínimo 6 caracteres)"
            placeholder="••••••••"
            value={senha}
            onChangeText={(t) => { setSenha(t); setError(""); }}
            secureTextEntry
            containerStyle={styles.field}
          />
          <APInput
            label="Confirme a senha"
            placeholder="••••••••"
            value={confirmSenha}
            onChangeText={(t) => { setConfirmSenha(t); setError(""); }}
            secureTextEntry
            error={error}
            containerStyle={styles.field}
          />
          {!!sucesso && (
            <View style={[styles.successBanner, { backgroundColor: colors.success + "22" }]}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={[styles.successText, { color: colors.success }]}>{sucesso}</Text>
            </View>
          )}
          <APButton title="Adicionar administrador" onPress={handleAdicionar} loading={loading} />
        </APCard>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
          Log de auditoria ({logOrdenado.length})
        </Text>
        {logOrdenado.length === 0 ? (
          <Text style={[styles.emptyLog, { color: colors.mutedForeground }]}>
            Nenhuma aprovação ou rejeição registrada ainda.
          </Text>
        ) : (
          logOrdenado.map((entrada) => (
            <APCard key={entrada.id} padding={12} style={styles.logCard}>
              <View style={styles.logHeader}>
                <Feather
                  name={entrada.acao === "Aprovado" ? "check-circle" : "x-circle"}
                  size={14}
                  color={entrada.acao === "Aprovado" ? colors.success : colors.danger}
                />
                <Text
                  style={[
                    styles.logAcao,
                    { color: entrada.acao === "Aprovado" ? colors.success : colors.danger },
                  ]}
                >
                  {entrada.acao}
                </Text>
                <Text style={[styles.logData, { color: colors.mutedForeground }]}>
                  {entrada.data}
                </Text>
              </View>
              <Text style={[styles.logDetalhe, { color: colors.foreground }]}>
                {entrada.nomeMedico} · CRMV {entrada.crmv}
              </Text>
              <Text style={[styles.logAdmin, { color: colors.mutedForeground }]}>
                por {entrada.nomeAdmin} (admin {entrada.adminId})
              </Text>
            </APCard>
          ))
        )}
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
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  sectionLabel: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  adminCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  adminIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  adminNome: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  adminInfo: { fontFamily: "Poppins_400Regular", fontSize: 11.5, marginTop: 1 },
  formTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 14, marginBottom: 4 },
  formHint: { fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, marginBottom: 12 },
  field: { marginBottom: 12 },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  successText: { fontFamily: "Poppins_500Medium", fontSize: 12, flex: 1 },
  emptyLog: { fontFamily: "Poppins_400Regular", fontSize: 13, textAlign: "center", paddingVertical: 12 },
  logCard: { gap: 4 },
  logHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  logAcao: { fontFamily: "Poppins_600SemiBold", fontSize: 12, flex: 1 },
  logData: { fontFamily: "Poppins_400Regular", fontSize: 11 },
  logDetalhe: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  logAdmin: { fontFamily: "Poppins_400Regular", fontSize: 11.5 },
});
