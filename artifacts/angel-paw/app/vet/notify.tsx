import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
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
import { APInput } from "@/components/APInput";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import {
  MAX_WHATSAPPS,
  formatarWhatsappExibicao,
  listarWhatsappsMedico,
  normalizarWhatsapp,
  whatsappValido,
} from "@/lib/storage";

export default function NotifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const {
    currentVetId,
    medicos,
    getAnamnesesPorMedico,
    enviarNotificacao,
    getNotificacoesPorAnamnese,
    definirWhatsappsMedico,
  } = useApp();

  const medico = currentVetId ? medicos[currentVetId] : null;
  const numerosMedico = listarWhatsappsMedico(medico);

  const fichas = currentVetId ? getAnamnesesPorMedico(currentVetId) : [];
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // WhatsApp: gerenciar números, escolher quais enviar e confirmar o envio
  const [gerenciando, setGerenciando] = useState(false);
  const [novoNumero, setNovoNumero] = useState("");
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [erroNumero, setErroNumero] = useState("");
  const [avisoNumero, setAvisoNumero] = useState("");
  const [desmarcados, setDesmarcados] = useState<string[]>([]);
  const [confirmando, setConfirmando] = useState(false);
  const [enviandoWhats, setEnviandoWhats] = useState(false);
  const [whatsEnviado, setWhatsEnviado] = useState(false);

  if (!currentVetId) {
    router.replace("/vet/login");
    return null;
  }

  const fichaSelecionada = selectedIndex !== null ? fichas[selectedIndex] : null;
  const historico = fichaSelecionada
    ? getNotificacoesPorAnamnese(fichaSelecionada.id)
    : [];

  async function handleEnviar() {
    if (!fichaSelecionada || !mensagem.trim()) return;
    setEnviando(true);
    const ok = await enviarNotificacao(fichaSelecionada.id, mensagem.trim());
    setEnviando(false);
    if (ok) {
      setMensagem("");
      setEnviado(true);
      setTimeout(() => setEnviado(false), 3000);
    }
  }

  // Números marcados para enviar (por padrão, todos; novos entram marcados).
  const selecionados = numerosMedico.filter((n) => !desmarcados.includes(n));
  // Sem nenhum número cadastrado, o painel de adicionar já aparece aberto.
  const mostrarPainel = gerenciando || numerosMedico.length === 0;

  function alternarSelecao(numero: string) {
    setDesmarcados((prev) =>
      prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero]
    );
    setAvisoNumero("");
  }

  function cancelarEdicao() {
    setEditandoIndex(null);
    setNovoNumero("");
    setErroNumero("");
  }

  function editarNumero(index: number) {
    setEditandoIndex(index);
    setNovoNumero(formatarWhatsappExibicao(numerosMedico[index]));
    setErroNumero("");
  }

  async function removerNumero(index: number) {
    if (!currentVetId) return;
    const novaLista = numerosMedico.filter((_, i) => i !== index);
    await definirWhatsappsMedico(currentVetId, novaLista);
    cancelarEdicao();
  }

  async function salvarNumero() {
    if (!currentVetId) return;
    if (!whatsappValido(novoNumero)) {
      setErroNumero("Número inválido. Inclua o DDD, ex: (11) 99999-9999.");
      return;
    }
    const normalizado = normalizarWhatsapp(novoNumero);
    if (numerosMedico.some((n, i) => n === normalizado && i !== editandoIndex)) {
      setErroNumero("Esse número já está na sua lista.");
      return;
    }
    if (editandoIndex === null && numerosMedico.length >= MAX_WHATSAPPS) {
      setErroNumero(`Você pode cadastrar até ${MAX_WHATSAPPS} números.`);
      return;
    }
    const novaLista =
      editandoIndex === null
        ? [...numerosMedico, normalizado]
        : numerosMedico.map((n, i) => (i === editandoIndex ? normalizado : n));
    const ok = await definirWhatsappsMedico(currentVetId, novaLista);
    if (!ok) {
      setErroNumero("Não foi possível salvar o número.");
      return;
    }
    cancelarEdicao();
    setAvisoNumero("");
  }

  function pedirEnvioWhatsapp() {
    if (!fichaSelecionada) return;
    if (numerosMedico.length === 0) {
      setAvisoNumero("Cadastre um número de WhatsApp antes de enviar seu contato ao tutor.");
      return;
    }
    if (selecionados.length === 0) {
      setAvisoNumero("Marque ao menos um número para enviar.");
      return;
    }
    setAvisoNumero("");
    setConfirmando(true);
  }

  async function confirmarEnvioWhatsapp() {
    if (!fichaSelecionada || !medico) return;
    setEnviandoWhats(true);
    const texto =
      `Dr(a). ${medico.nome} deixou o contato de WhatsApp para continuar a conversa ` +
      `sobre ${fichaSelecionada.dados.nome}. Toque no botão abaixo para falar direto com o veterinário.`;
    const ok = await enviarNotificacao(fichaSelecionada.id, texto, selecionados);
    setEnviandoWhats(false);
    setConfirmando(false);
    if (ok) {
      setWhatsEnviado(true);
      setTimeout(() => setWhatsEnviado(false), 3000);
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
          Enviar Notificação
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
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              Selecione um paciente
            </Text>
            {fichas.map((ficha, i) => (
              <Pressable
                key={ficha.id}
                onPress={() => {
                  setSelectedIndex(i);
                  setMensagem("");
                  setEnviado(false);
                  setWhatsEnviado(false);
                  setAvisoNumero("");
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
                      <View style={styles.fichaNomeRow}>
                        <Text style={[styles.fichaNome, { color: colors.foreground }]}>
                          {ficha.dados.nome}
                        </Text>
                        <Text style={[styles.fichaCodigo, { color: colors.primary }]}>
                          #{ficha.codigoPaciente}
                        </Text>
                      </View>
                      <Text
                        style={[styles.fichaDetail, { color: colors.mutedForeground }]}
                      >
                        {ficha.status} · {ficha.dataEnvio}
                      </Text>
                    </View>
                    {selectedIndex === i && (
                      <Feather name="check-circle" size={18} color={colors.primary} />
                    )}
                  </View>
                </APCard>
              </Pressable>
            ))}

            {fichaSelecionada && (
              <APCard>
                <Text style={[styles.notaLabel, { color: colors.mutedForeground }]}>
                  Mensagem para o tutor de {fichaSelecionada.dados.nome}
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
                  placeholder="Ex: Os exames confirmaram a suspeita, retorne para..."
                  placeholderTextColor={colors.mutedForeground}
                  value={mensagem}
                  onChangeText={setMensagem}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />

                {enviado && (
                  <View
                    style={[
                      styles.successBanner,
                      { backgroundColor: colors.success + "22" },
                    ]}
                  >
                    <Feather name="check-circle" size={14} color={colors.success} />
                    <Text style={[styles.successText, { color: colors.success }]}>
                      Notificação enviada ao tutor!
                    </Text>
                  </View>
                )}

                <APButton
                  title="Enviar notificação"
                  onPress={handleEnviar}
                  loading={enviando}
                  disabled={!mensagem.trim()}
                  style={styles.sendBtn}
                />

                <View style={[styles.whatsSection, { borderTopColor: colors.border }]}>
                  <View style={styles.whatsTitleRow}>
                    <Feather name="phone" size={15} color={colors.primary} />
                    <Text style={[styles.whatsTitle, { color: colors.foreground }]}>
                      Assunto longo? Continue pelo WhatsApp
                    </Text>
                  </View>

                  {numerosMedico.length === 0 ? (
                    <Text style={[styles.whatsHint, { color: colors.mutedForeground }]}>
                      Você ainda não tem nenhum número cadastrado. Adicione um abaixo
                      para poder enviar seu contato ao tutor.
                    </Text>
                  ) : (
                    <Text style={[styles.whatsHint, { color: colors.mutedForeground }]}>
                      O tutor recebe um botão que abre o WhatsApp direto no número
                      escolhido. Marque quais números enviar:
                    </Text>
                  )}

                  {numerosMedico.map((numero, i) => {
                    const marcado = !desmarcados.includes(numero);
                    return (
                      <View
                        key={numero}
                        style={[
                          styles.numeroRow,
                          {
                            backgroundColor: colors.secondary,
                            borderColor: editandoIndex === i ? colors.primary : "transparent",
                          },
                        ]}
                      >
                        <Pressable
                          onPress={() => alternarSelecao(numero)}
                          style={styles.numeroInfo}
                        >
                          <Feather
                            name={marcado ? "check-square" : "square"}
                            size={18}
                            color={marcado ? colors.primary : colors.mutedForeground}
                          />
                          <Text style={[styles.numeroText, { color: colors.foreground }]}>
                            {formatarWhatsappExibicao(numero)}
                          </Text>
                        </Pressable>
                        {mostrarPainel && (
                          <View style={styles.numeroAcoes}>
                            <Pressable onPress={() => editarNumero(i)} hitSlop={8}>
                              <Feather name="edit-2" size={16} color={colors.primary} />
                            </Pressable>
                            <Pressable onPress={() => removerNumero(i)} hitSlop={8}>
                              <Feather name="trash-2" size={16} color={colors.mutedForeground} />
                            </Pressable>
                          </View>
                        )}
                      </View>
                    );
                  })}

                  {mostrarPainel && (
                    <View style={styles.numeroPainel}>
                      <APInput
                        label={
                          editandoIndex === null
                            ? "Adicionar número de WhatsApp"
                            : "Alterar número"
                        }
                        placeholder="Ex: (11) 99999-9999"
                        value={novoNumero}
                        onChangeText={(t) => {
                          setNovoNumero(t);
                          setErroNumero("");
                        }}
                        keyboardType="phone-pad"
                        error={erroNumero}
                      />
                      <View style={styles.numeroBotoes}>
                        <APButton
                          title={editandoIndex === null ? "Adicionar" : "Salvar alteração"}
                          onPress={salvarNumero}
                          style={styles.numeroBotao}
                        />
                        {editandoIndex !== null && (
                          <APButton
                            title="Cancelar"
                            onPress={cancelarEdicao}
                            variant="ghost"
                            style={styles.numeroBotao}
                          />
                        )}
                      </View>
                    </View>
                  )}

                  {numerosMedico.length > 0 && (
                    <Pressable
                      onPress={() => {
                        setGerenciando((v) => !v);
                        cancelarEdicao();
                      }}
                      style={styles.gerenciarLink}
                    >
                      <Feather
                        name={gerenciando ? "check" : "settings"}
                        size={14}
                        color={colors.primary}
                      />
                      <Text style={[styles.gerenciarText, { color: colors.primary }]}>
                        {gerenciando ? "Concluir" : "Alterar ou adicionar números"}
                      </Text>
                    </Pressable>
                  )}

                  {!!avisoNumero && (
                    <Text style={[styles.avisoNumero, { color: colors.warning }]}>
                      {avisoNumero}
                    </Text>
                  )}

                  {whatsEnviado && (
                    <View
                      style={[
                        styles.successBanner,
                        { backgroundColor: colors.success + "22" },
                      ]}
                    >
                      <Feather name="check-circle" size={14} color={colors.success} />
                      <Text style={[styles.successText, { color: colors.success }]}>
                        Contato de WhatsApp enviado ao tutor!
                      </Text>
                    </View>
                  )}

                  <APButton
                    title="Enviar seu contato WhatsApp"
                    onPress={pedirEnvioWhatsapp}
                    variant="ghost"
                  />
                </View>

                {historico.length > 0 && (
                  <View style={styles.historicoSection}>
                    <Text
                      style={[styles.historicoTitle, { color: colors.foreground }]}
                    >
                      Notificações já enviadas
                    </Text>
                    {historico.map((n) => (
                      <View
                        key={n.id}
                        style={[
                          styles.historicoItem,
                          { backgroundColor: colors.secondary },
                        ]}
                      >
                        <Text
                          style={[styles.historicoMsg, { color: colors.foreground }]}
                        >
                          {n.tipo === "whatsapp_direcionamento"
                            ? "Contato de WhatsApp enviado"
                            : n.mensagem}
                        </Text>
                        <Text
                          style={[
                            styles.historicoData,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {n.dataEnvio} · {n.lida ? "Lida pelo tutor" : "Ainda não lida"}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </APCard>
            )}
          </>
        )}
      </KeyboardAwareScrollView>

      <Modal
        visible={confirmando}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmando(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="phone" size={26} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Direcionar o tutor ao seu WhatsApp?
            </Text>
            <Text style={[styles.modalText, { color: colors.mutedForeground }]}>
              O tutor de {fichaSelecionada?.dados.nome} vai receber, nas
              notificações, um botão que abre o WhatsApp direto{" "}
              {selecionados.length > 1 ? "nestes números" : "neste número"}:
            </Text>
            {selecionados.map((n) => (
              <Text key={n} style={[styles.modalNumero, { color: colors.primary }]}>
                {formatarWhatsappExibicao(n)}
              </Text>
            ))}
            <View style={styles.modalAcoes}>
              <APButton
                title="Cancelar"
                onPress={() => setConfirmando(false)}
                variant="ghost"
                style={styles.numeroBotao}
              />
              <APButton
                title="OK"
                onPress={confirmarEnvioWhatsapp}
                loading={enviandoWhats}
                style={styles.numeroBotao}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 14 },
  sectionLabel: { fontFamily: "Poppins_500Medium", fontSize: 13 },
  fichaCard: {},
  fichaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fichaInfo: { flex: 1 },
  fichaNomeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  fichaNome: { fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  fichaCodigo: { fontFamily: "Poppins_500Medium", fontSize: 11 },
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
    minHeight: 120,
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
  sendBtn: {},
  whatsSection: { marginTop: 18, paddingTop: 16, borderTopWidth: 1, gap: 10 },
  whatsTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  whatsTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 13, flex: 1 },
  whatsHint: { fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17 },
  numeroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  numeroInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  numeroText: { fontFamily: "Poppins_500Medium", fontSize: 14 },
  numeroAcoes: { flexDirection: "row", alignItems: "center", gap: 16 },
  numeroPainel: { gap: 10 },
  numeroBotoes: { flexDirection: "row", gap: 10 },
  numeroBotao: { flex: 1 },
  gerenciarLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  gerenciarText: { fontFamily: "Poppins_500Medium", fontSize: 12.5 },
  avisoNumero: { fontFamily: "Poppins_500Medium", fontSize: 12 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    gap: 10,
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
    textAlign: "center",
  },
  modalText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  modalNumero: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  modalAcoes: { flexDirection: "row", gap: 10, marginTop: 8, width: "100%" },
  historicoSection: { marginTop: 18, gap: 8 },
  historicoTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  historicoItem: { padding: 12, borderRadius: 12, gap: 4 },
  historicoMsg: { fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19 },
  historicoData: { fontFamily: "Poppins_400Regular", fontSize: 11 },
  empty: { alignItems: "center", paddingTop: 80, gap: 16 },
  emptyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    textAlign: "center",
  },
});
