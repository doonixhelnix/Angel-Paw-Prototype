import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { APCard } from "@/components/APCard";
import { APInput } from "@/components/APInput";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import {
  Notificacao,
  formatarTempoRestante,
  formatarWhatsappExibicao,
  gerarLinkWhatsapp,
  pinValido,
} from "@/lib/storage";

function NotificacaoItem({ n }: { n: Notificacao }) {
  const colors = useColors();
  const { marcarNotificacaoComoLida } = useApp();
  const [erroWhats, setErroWhats] = useState(false);

  const numerosWhats =
    n.tipo === "whatsapp_direcionamento" ? n.whatsappNumeros ?? [] : [];

  async function abrirWhatsapp(numero: string) {
    if (!n.lida) marcarNotificacaoComoLida(n.id);
    const texto = `Olá, Dr(a). ${n.nomeMedico}! Sou o tutor de ${n.nomePet} (código ${n.codigoPaciente}).`;
    try {
      await Linking.openURL(gerarLinkWhatsapp(numero, texto));
      setErroWhats(false);
    } catch {
      setErroWhats(true);
    }
  }

  return (
    <Pressable
      onPress={() => {
        if (!n.lida) marcarNotificacaoComoLida(n.id);
      }}
    >
      <APCard
        style={[
          styles.notifCard,
          !n.lida && { borderWidth: 1.5, borderColor: colors.primary },
        ]}
        padding={14}
      >
        <View style={styles.notifHeader}>
          <View style={[styles.notifIcon, { backgroundColor: colors.secondary }]}>
            <Feather
              name={numerosWhats.length > 0 ? "phone" : "message-circle"}
              size={16}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.notifMedico, { color: colors.foreground }]}>
              Dr(a). {n.nomeMedico}
            </Text>
            <Text style={[styles.notifData, { color: colors.mutedForeground }]}>
              {n.dataEnvio}
            </Text>
          </View>
          {!n.lida && (
            <View style={[styles.novoDot, { backgroundColor: colors.primary }]} />
          )}
        </View>
        <Text style={[styles.notifMsg, { color: colors.foreground }]}>
          {n.mensagem}
        </Text>

        {numerosWhats.map((numero) => (
          <Pressable
            key={numero}
            onPress={() => abrirWhatsapp(numero)}
            style={({ pressed }) => [
              styles.whatsBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="whatsapp" size={22} color="#fff" />
            <View>
              <Text style={styles.whatsBtnTitle}>Abrir WhatsApp</Text>
              <Text style={styles.whatsBtnNumero}>
                {formatarWhatsappExibicao(numero)}
              </Text>
            </View>
          </Pressable>
        ))}
        {erroWhats && (
          <Text style={styles.whatsErro}>
            Não foi possível abrir o WhatsApp. Confira se ele está instalado.
          </Text>
        )}
      </APCard>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { getNotificacoesPorCodigo } = useApp();

  const [codigoBusca, setCodigoBusca] = useState("");
  const [pinBusca, setPinBusca] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<Notificacao[] | null>(null);
  const [erroBusca, setErroBusca] = useState("");
  const [buscou, setBuscou] = useState(false);
  const [loading, setLoading] = useState(false);

  // Quando a busca é bloqueada por excesso de tentativas, guardamos o
  // instante em que o bloqueio acaba e atualizamos a contagem a cada
  // segundo, pra dar um feedback claro de quanto falta.
  const [desbloqueiaEm, setDesbloqueiaEm] = useState<number | null>(null);
  const [, forcarAtualizacao] = useState(0);

  useEffect(() => {
    if (!desbloqueiaEm) return;
    const id = setInterval(() => {
      if (Date.now() >= desbloqueiaEm) {
        setDesbloqueiaEm(null);
        setErroBusca("");
      } else {
        forcarAtualizacao((n) => n + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [desbloqueiaEm]);

  const restanteMs = desbloqueiaEm ? Math.max(0, desbloqueiaEm - Date.now()) : 0;
  const bloqueado = restanteMs > 0;

  async function handleBuscar() {
    if (bloqueado || loading) return;

    if (!codigoBusca.trim()) {
      setErroBusca("Informe o código do paciente");
      return;
    }
    if (!pinValido(pinBusca)) {
      setErroBusca("Informe o PIN de 6 números criado no envio");
      return;
    }

    setErroBusca("");
    setLoading(true);
    const resultado = await getNotificacoesPorCodigo(codigoBusca.trim(), pinBusca);
    setLoading(false);
    setBuscou(true);

    if (resultado.status === "bloqueado") {
      setDesbloqueiaEm(Date.now() + resultado.restanteMs);
      setErroBusca(
        resultado.motivo === "codigo"
          ? "Muitas tentativas erradas para esse código."
          : "Muitas tentativas seguidas."
      );
      setResultadosBusca(null);
      return;
    }

    if (resultado.status === "invalido") {
      // De propósito não dizemos se o código existe ou não.
      setErroBusca("Código ou PIN incorretos.");
      setResultadosBusca(null);
      return;
    }

    setResultadosBusca(resultado.notificacoes);
  }

  const mensagemErro = erroBusca
    ? bloqueado
      ? `${erroBusca} Tente novamente em ${formatarTempoRestante(restanteMs)}.`
      : erroBusca
    : "";

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
          Notificações
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <APCard>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 10 }]}>
            Ver notificações do médico
          </Text>
          <Text style={[styles.searchHint, { color: colors.mutedForeground }]}>
            Digite o código do paciente e o PIN que você criou ao enviar a
            ficha. Guarde os dois — não temos como mostrar essa informação
            de novo por aqui.
          </Text>
          <APInput
            placeholder="Código do paciente (ex: 000001)"
            value={codigoBusca}
            onChangeText={(t) => {
              setCodigoBusca(t);
              setErroBusca("");
            }}
            keyboardType="numeric"
          />
          <View style={styles.searchRow}>
            <APInput
              placeholder="PIN"
              value={pinBusca}
              onChangeText={(t) => {
                setPinBusca(t);
                setErroBusca("");
              }}
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              containerStyle={styles.searchInput}
            />
            <Pressable
              onPress={handleBuscar}
              disabled={loading || bloqueado}
              style={[
                styles.searchBtn,
                { backgroundColor: colors.primary },
                (loading || bloqueado) && styles.searchBtnDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="search" size={18} color="#fff" />
              )}
            </Pressable>
          </View>
          {!!mensagemErro && <Text style={styles.searchErro}>{mensagemErro}</Text>}
        </APCard>

        {buscou && !erroBusca && (
          <>
            {resultadosBusca && resultadosBusca.length > 0 ? (
              resultadosBusca.map((n) => <NotificacaoItem key={n.id} n={n} />)
            ) : (
              <View style={styles.emptyInline}>
                <Feather name="search" size={28} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Nenhuma notificação encontrada para esse código.
                </Text>
              </View>
            )}
          </>
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
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  sectionLabel: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  notifCard: {},
  notifHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  notifIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notifMedico: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  notifData: { fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 1 },
  novoDot: { width: 8, height: 8, borderRadius: 4 },
  whatsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#25D366",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  whatsBtnTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 13, color: "#fff" },
  whatsBtnNumero: { fontFamily: "Poppins_400Regular", fontSize: 11.5, color: "#fff", opacity: 0.9 },
  whatsErro: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11.5,
    color: "#c0392b",
    marginTop: 8,
  },
  notifMsg: { fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19 },
  searchHint: { fontFamily: "Poppins_400Regular", fontSize: 12, marginBottom: 12, lineHeight: 17 },
  searchRow: { flexDirection: "row", gap: 10, alignItems: "flex-end", marginTop: 10 },
  searchInput: { flex: 1 },
  searchErro: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#c0392b",
    marginTop: 8,
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtnDisabled: {
    opacity: 0.5,
  },
  emptyInline: { alignItems: "center", paddingVertical: 24, gap: 12, paddingHorizontal: 12 },
  emptyText: { fontFamily: "Poppins_400Regular", fontSize: 13, textAlign: "center", lineHeight: 19 },
});
