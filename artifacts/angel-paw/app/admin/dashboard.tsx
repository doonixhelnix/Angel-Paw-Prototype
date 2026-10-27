import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { APCard } from "@/components/APCard";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function AdminDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { currentAdmin, logoutAdmin, getMedicosPendentes, aprovarMedico, rejeitarMedico } =
    useApp();

  if (!currentAdmin) {
    router.replace("/admin/login");
    return null;
  }

  const pendentes = getMedicosPendentes();

  function handleSair() {
    logoutAdmin();
    router.replace("/");
  }

  function confirmarRejeicao(id: string, nome: string) {
    Alert.alert(
      "Rejeitar cadastro?",
      `O médico ${nome} não conseguirá fazer login. Essa ação pode ser revertida depois manualmente, se necessário.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Rejeitar", style: "destructive", onPress: () => rejeitarMedico(id) },
      ]
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.secondary },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
          <Feather name="shield" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Pedidos de Médicos
        </Text>
        <Pressable onPress={() => router.push("/admin/manage")} style={styles.sairBtn}>
          <Feather name="users" size={20} color={colors.primary} />
        </Pressable>
        <Pressable onPress={handleSair} style={styles.sairBtn}>
          <Feather name="log-out" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.saudacao, { color: colors.mutedForeground }]}>
          Logado como {currentAdmin.nome} (ID {currentAdmin.id})
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          {pendentes.length} pedido(s) aguardando análise
        </Text>

        {pendentes.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="check-circle" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Nenhum pedido pendente no momento.
            </Text>
          </View>
        ) : (
          pendentes.map((medico) => (
            <APCard key={medico.id} style={styles.medicoCard}>
              <View style={styles.medicoHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.medicoNome, { color: colors.foreground }]}>
                    {medico.nome}
                  </Text>
                  <Text style={[styles.medicoId, { color: colors.mutedForeground }]}>
                    ID {medico.id} · Cadastrado em {medico.dataCadastro}
                  </Text>
                </View>
              </View>

              <View style={[styles.crmvBox, { backgroundColor: colors.secondary }]}>
                <Feather name="award" size={14} color={colors.primary} />
                <Text style={[styles.crmvText, { color: colors.primary }]}>
                  CRMV {medico.crmv}
                </Text>
              </View>

              <View style={styles.infoLinha}>
                <Feather name="phone" size={13} color={colors.mutedForeground} />
                <Text style={[styles.infoTexto, { color: colors.foreground }]} selectable>
                  {medico.contato || "Contato não informado"}
                </Text>
              </View>
              <View style={styles.infoLinha}>
                <Feather name="briefcase" size={13} color={colors.mutedForeground} />
                <Text style={[styles.infoTexto, { color: colors.foreground }]}>
                  {medico.localTrabalho || "Local de trabalho não informado"}
                </Text>
              </View>

              <Text style={[styles.verificacaoHint, { color: colors.mutedForeground }]}>
                Antes de aprovar: confira o CRMV na consulta pública do
                conselho regional da UF informada e confirme a identidade
                entrando em contato pelo telefone/e-mail ou com o local de
                trabalho.
              </Text>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => confirmarRejeicao(medico.id, medico.nome)}
                  style={[styles.actionBtn, { backgroundColor: colors.muted, borderWidth: 1.5, borderColor: colors.border }]}
                >
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.actionText, { color: colors.mutedForeground }]}>
                    Rejeitar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => aprovarMedico(medico.id)}
                  style={[styles.actionBtn, { backgroundColor: colors.success }]}
                >
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={[styles.actionText, { color: "#fff" }]}>Aprovar</Text>
                </Pressable>
              </View>
            </APCard>
          ))
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
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 17, flex: 1 },
  sairBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 14 },
  saudacao: { fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: -6 },
  sectionLabel: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  medicoCard: { gap: 10 },
  medicoHeader: { flexDirection: "row", alignItems: "center" },
  medicoNome: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  medicoId: { fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
  crmvBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  crmvText: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  infoLinha: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoTexto: { fontFamily: "Poppins_400Regular", fontSize: 13, flex: 1 },
  verificacaoHint: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11.5,
    lineHeight: 16,
  },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionText: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 60, gap: 14 },
  emptyText: { fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center" },
});
