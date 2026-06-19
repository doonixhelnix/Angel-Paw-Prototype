import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { APButton } from "@/components/APButton";
import { APCard } from "@/components/APCard";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[badgeStyles.wrap, { backgroundColor: color + "22" }]}>
      <Text style={[badgeStyles.text, { color }]}>{label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  text: { fontFamily: "Poppins_600SemiBold", fontSize: 12 },
});

export default function SummaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { sessionTutor, resetSessionTutor } = useApp();
  const { resultado, petDados } = sessionTutor;

  if (!resultado || !petDados) {
    router.replace("/tutor/identification");
    return null;
  }

  const confiancaColor =
    resultado.confianca === "Alta"
      ? colors.success
      : resultado.confianca === "Moderada"
      ? colors.warning
      : colors.danger;

  const urgenciaIsEmergency = resultado.urgencia.toLowerCase().includes("emergência") ||
    resultado.urgencia.toLowerCase().includes("urgente");
  const urgenciaColor = urgenciaIsEmergency ? colors.danger : resultado.probabilidade >= 40 ? colors.warning : colors.success;

  const probColor =
    resultado.probabilidade >= 60
      ? colors.danger
      : resultado.probabilidade >= 30
      ? colors.warning
      : colors.success;

  function handleEnviar() {
    router.push("/tutor/send");
  }

  function handleRevisar() {
    router.push("/tutor/review");
  }

  function handleCancelar() {
    resetSessionTutor();
    router.replace("/");
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.secondary }]}>
        <View style={{ width: 36 }} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Resumo do Diagnóstico</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <APCard style={styles.probCard}>
          <Text style={[styles.probLabel, { color: colors.mutedForeground }]}>Doença suspeita</Text>
          <Text style={[styles.doencaNome, { color: colors.foreground }]}>{resultado.doenca}</Text>

          <View style={styles.probRow}>
            <View style={styles.probCircle}>
              <Text style={[styles.probNumber, { color: probColor }]}>
                {resultado.probabilidade}%
              </Text>
              <Text style={[styles.probSub, { color: colors.mutedForeground }]}>probabilidade</Text>
            </View>

            <View style={styles.badgeCol}>
              <Text style={[styles.badgeLabel, { color: colors.mutedForeground }]}>Confiança</Text>
              <Badge label={resultado.confianca} color={confiancaColor} />
              <Text style={[styles.badgeLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
                Sinais-chave
              </Text>
              <Badge label={`${resultado.sinaisChave} detectados`} color={colors.primary} />
            </View>
          </View>
        </APCard>

        <APCard>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Interpretação</Text>
          <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
            {resultado.interpretacao}
          </Text>
        </APCard>

        <APCard>
          <View style={styles.urgRow}>
            <Feather name="alert-triangle" size={18} color={urgenciaColor} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Urgência</Text>
          </View>
          <Text style={[styles.bodyText, { color: urgenciaColor, fontFamily: "Poppins_600SemiBold" }]}>
            {resultado.urgencia}
          </Text>
        </APCard>

        {resultado.sinaisPositivos.length > 0 && (
          <APCard>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sinais Positivos</Text>
            {resultado.sinaisPositivos.map((s, i) => (
              <View key={i} style={styles.signalRow}>
                <Feather name="check-circle" size={14} color={colors.success} />
                <Text style={[styles.signalText, { color: colors.foreground }]}>{s}</Text>
              </View>
            ))}
          </APCard>
        )}

        {resultado.sinaisNegativos.length > 0 && (
          <APCard>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sinais Ausentes</Text>
            {resultado.sinaisNegativos.map((s, i) => (
              <View key={i} style={styles.signalRow}>
                <Feather name="minus-circle" size={14} color={colors.mutedForeground} />
                <Text style={[styles.signalText, { color: colors.mutedForeground }]}>{s}</Text>
              </View>
            ))}
          </APCard>
        )}

        <View style={styles.btnGroup}>
          <APButton title="Enviar anamnese" onPress={handleEnviar} />
          <APButton title="Revisar dados" onPress={handleRevisar} variant="secondary" />
          <APButton title="Cancelar" onPress={handleCancelar} variant="ghost" />
        </View>
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
  },
  headerTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 17,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  probCard: {},
  probLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    marginBottom: 4,
  },
  doencaNome: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    marginBottom: 16,
  },
  probRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  probCircle: {
    alignItems: "center",
  },
  probNumber: {
    fontFamily: "Poppins_700Bold",
    fontSize: 40,
  },
  probSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
  },
  badgeCol: {
    flex: 1,
  },
  badgeLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  urgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  signalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  signalText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  btnGroup: {
    gap: 12,
    marginTop: 4,
  },
});
