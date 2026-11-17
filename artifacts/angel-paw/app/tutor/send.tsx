import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Svg, { Path } from "react-native-svg";

import { APButton } from "@/components/APButton";
import { APCard } from "@/components/APCard";
import { APInput } from "@/components/APInput";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { encontrarMedicoPorId, pinObvio, pinValido } from "@/lib/storage";

export default function SendScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { enviarAnamnese, medicos, resetSessionTutor, sessionTutor } = useApp();

  const [idMedico, setIdMedico] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [codigoGerado, setCodigoGerado] = useState("");

  const { petDados } = sessionTutor;

  async function handleEnviar() {
    if (!idMedico.trim()) {
      setError("Informe o ID do médico veterinário");
      return;
    }
    const medico = encontrarMedicoPorId(medicos, idMedico.trim());
    if (!medico) {
      setError("Médico não encontrado. Verifique o ID.");
      return;
    }
    if (!pinValido(pin)) {
      setPinError("Crie um PIN de 6 números");
      return;
    }
    if (pinObvio(pin)) {
      setPinError("Esse PIN é muito óbvio. Evite sequências ou números repetidos.");
      return;
    }
    if (pin !== pinConfirm) {
      setPinError("Os PINs não conferem");
      return;
    }
    setError("");
    setPinError("");
    setLoading(true);
    const codigo = await enviarAnamnese(medico.id, pin);
    setLoading(false);
    if (codigo) {
      setCodigoGerado(codigo);
      setEnviado(true);
    } else {
      setError("Não foi possível enviar. Tente novamente.");
    }
  }

  function handleFinalizar() {
    // Fecha o fluxo inteiro do tutor de uma vez, em vez de empilhar a home por
    // cima das telas antigas (que, sem dados, ficariam em branco ao voltar).
    if (router.canDismiss()) router.dismissAll();
    router.replace("/");
    resetSessionTutor();
  }

  if (enviado) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.successScreen, { paddingTop: topPad }]}>
          {/* Asinhas decorativas de fundo, bem sutis */}
          <View style={styles.wingsWrap} pointerEvents="none">
            <Svg width="100%" height="100%" viewBox="0 0 320 320">
              <Path
                d="M160,160 C120,90 30,65 0,110 C35,145 45,180 100,188 C130,192 150,178 160,160 Z"
                fill={colors.primary}
                opacity={0.07}
              />
              <Path
                d="M160,160 C200,90 290,65 320,110 C285,145 275,180 220,188 C190,192 170,178 160,160 Z"
                fill={colors.primary}
                opacity={0.07}
              />
            </Svg>
          </View>
          <Feather
            name="heart"
            size={14}
            color={colors.primary}
            style={[styles.floatingHeart, { top: 30, left: 40, opacity: 0.25 }]}
          />
          <Feather
            name="heart"
            size={10}
            color={colors.primary}
            style={[styles.floatingHeart, { top: 90, right: 36, opacity: 0.3 }]}
          />

          <View style={styles.successIconGlowOuter}>
            <View
              style={[styles.successIconGlow, { backgroundColor: "#ffffff" }]}
            />
            <View
              style={[
                styles.successIcon,
                { backgroundColor: colors.primary },
              ]}
            >
              <Feather name="check" size={56} color="#ffffff" />
            </View>
          </View>

          <Text style={[styles.successTitle, { color: colors.primary }]}>
            Anamnese enviada!
          </Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            A anamnese de {petDados?.nome} foi enviada com sucesso ao médico.
            {"\n"}
            Aguarde o contato do veterinário.
          </Text>
          <View style={[styles.codigoBox, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.codigoLabel, { color: colors.mutedForeground }]}>
              Código do paciente
            </Text>
            <Text style={[styles.codigoValor, { color: colors.primary }]}>
              {codigoGerado}
            </Text>
            <Text style={[styles.codigoAviso, { color: colors.mutedForeground }]}>
              Guarde o código e o PIN que você criou. Vai precisar dos dois
              para consultar as notificações do médico mais tarde.
            </Text>
          </View>
          <APButton
            title="Voltar ao início"
            onPress={handleFinalizar}
            style={styles.homeBtn}
          />
        </View>
      </View>
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
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Enviar Anamnese
        </Text>
        <View style={[styles.pawBadge, { backgroundColor: colors.primary + "18" }]}>
          <MaterialCommunityIcons name="paw" size={16} color={colors.primary} />
        </View>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <APCard>
          <View
            style={[styles.iconWrap, { backgroundColor: colors.secondary }]}
          >
            <Feather name="send" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Informe o ID do Médico
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
            Solicite ao médico veterinário o seu ID de identificação para enviar
            a anamnese.
          </Text>
        </APCard>

        <APInput
          label="ID do Médico Veterinário"
          placeholder="Ex: 1"
          value={idMedico}
          onChangeText={(t) => {
            setIdMedico(t);
            setError("");
          }}
          keyboardType="numeric"
          error={error}
        />

        <APInput
          label="Crie um PIN de acesso (6 números)"
          placeholder="Ex: 483920"
          value={pin}
          onChangeText={(t) => {
            setPin(t);
            setPinError("");
          }}
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
        />

        <APInput
          label="Confirme o PIN"
          placeholder="Repita o PIN"
          value={pinConfirm}
          onChangeText={(t) => {
            setPinConfirm(t);
            setPinError("");
          }}
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
          error={pinError}
        />

        <Text style={[styles.pinHint, { color: colors.mutedForeground }]}>
          Você vai usar esse PIN, junto com o código do paciente, para ver as
          notificações que o médico enviar sobre esta ficha.
        </Text>

        <APButton
          title="Enviar anamnese"
          onPress={handleEnviar}
          loading={loading}
        />
        <APButton
          title="Cancelar"
          onPress={() => router.back()}
          variant="ghost"
        />
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
  cardTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  cardSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  pinHint: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    lineHeight: 17,
    marginTop: -4,
  },
  codigoBox: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  codigoLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
  },
  codigoValor: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    letterSpacing: 2,
  },
  codigoAviso: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 4,
  },
  successScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
    position: "relative",
    overflow: "hidden",
  },
  wingsWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 320,
    height: 320,
    marginLeft: -160,
    marginTop: -220,
  },
  floatingHeart: {
    position: "absolute",
  },
  successIconGlowOuter: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  successIconGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.4,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 36,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  successTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 26,
    textAlign: "center",
  },
  successSub: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  homeBtn: { marginTop: 8 },
});
