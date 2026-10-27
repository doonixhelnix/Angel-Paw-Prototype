import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { APCard } from "@/components/APCard";
import { APButton } from "@/components/APButton";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function NotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { currentVetId, getAnamnesesPorMedico, adicionarNota, anamneses } =
    useApp();

  const fichas = currentVetId ? getAnamnesesPorMedico(currentVetId) : [];
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [nota, setNota] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!currentVetId) {
    router.replace("/vet/login");
    return null;
  }

  const globalIndex =
    selectedIndex !== null
      ? anamneses.findIndex((a) => a.id === fichas[selectedIndex]?.id)
      : -1;

  async function salvarNota() {
    if (globalIndex < 0 || !nota.trim()) return;
    setSaving(true);
    await adicionarNota(globalIndex, nota.trim());
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
          Adicionar Notas
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        {fichas.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Nenhuma anamnese disponível.
            </Text>
          </View>
        ) : (
          <>
            <Text
              style={[styles.sectionLabel, { color: colors.mutedForeground }]}
            >
              Selecione uma anamnese
            </Text>
            {fichas.map((ficha, i) => (
              <Pressable
                key={ficha.id}
                onPress={() => {
                  setSelectedIndex(i);
                  setNota(ficha.notasMedico ?? "");
                  setSaved(false);
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
              >
                <APCard
                  style={[
                    styles.fichaCard,
                    selectedIndex === i && {
                      borderWidth: 2,
                      borderColor: colors.primary,
                    },
                  ]}
                  padding={14}
                >
                  <View style={styles.fichaRow}>
                    <View style={styles.fichaInfo}>
                      <Text
                        style={[styles.fichaNome, { color: colors.foreground }]}
                      >
                        {ficha.dados.nome}
                      </Text>
                      <Text
                        style={[
                          styles.fichaDetail,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {ficha.status} · {ficha.dataEnvio}
                      </Text>
                    </View>
                    {selectedIndex === i && (
                      <Feather
                        name="check-circle"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </View>
                </APCard>
              </Pressable>
            ))}

            {selectedIndex !== null && (
              <APCard>
                <Text
                  style={[styles.notaLabel, { color: colors.mutedForeground }]}
                >
                  Notas clínicas para {fichas[selectedIndex]?.dados.nome}
                </Text>
                <TextInput
                  style={[
                    styles.notaInput,
                    {
                      backgroundColor: colors.muted,
                      borderColor: colors.border,
                      color: colors.foreground,
                      borderRadius: 12,
                    },
                  ]}
                  placeholder="Digite suas notas clínicas aqui..."
                  placeholderTextColor={colors.mutedForeground}
                  value={nota}
                  onChangeText={setNota}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                {saved && (
                  <View
                    style={[
                      styles.successBanner,
                      { backgroundColor: colors.success + "22" },
                    ]}
                  >
                    <Feather
                      name="check-circle"
                      size={14}
                      color={colors.success}
                    />
                    <Text
                      style={[styles.successText, { color: colors.success }]}
                    >
                      Nota salva! Status atualizado para Analisada.
                    </Text>
                  </View>
                )}
                <APButton
                  title="Salvar nota"
                  onPress={salvarNota}
                  loading={saving}
                  style={styles.saveBtn}
                />
              </APCard>
            )}
          </>
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
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 14 },
  sectionLabel: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  fichaCard: {},
  fichaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fichaInfo: { flex: 1 },
  fichaNome: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  fichaDetail: { fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
  notaLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    marginBottom: 10,
  },
  notaInput: {
    padding: 14,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    borderWidth: 1.5,
    minHeight: 140,
    marginBottom: 12,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  successText: { fontFamily: "Poppins_500Medium", fontSize: 12, flex: 1 },
  saveBtn: {},
  empty: { alignItems: "center", paddingTop: 80, gap: 16 },
  emptyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    textAlign: "center",
  },
});
