import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { APCard } from "@/components/APCard";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import {
  Anamnese,
  formatarDataHora,
  formatarWhatsappExibicao,
  gerarLinkWhatsapp,
} from "@/lib/storage";
import { formatarRespostasQuestionario } from "@/lib/diseases";

function gerarHtmlAnamnese(
  ficha: Anamnese,
  respostasFormatadas: { pergunta: string; resposta: string; positivo: boolean }[]
): string {
  const vacinacaoLabel = { C: "Completa", I: "Incompleta", D: "Desconhecida" }[
    ficha.dados.vacinacao
  ];

  const linhasSintomas = respostasFormatadas
    .map(
      (r) => `
        <tr>
          <td>${r.pergunta}</td>
          <td style="text-align:center; color:${r.positivo ? "#2E7D5B" : "#999"}; font-weight:600;">
            ${r.resposta}
          </td>
        </tr>`
    )
    .join("");

  const listaSinais = (itens: string[]) =>
    itens.length > 0
      ? `<ul>${itens.map((s) => `<li>${s}</li>`).join("")}</ul>`
      : `<p style="color:#999; font-style:italic;">Nenhum registrado</p>`;

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        body { font-family: Helvetica, Arial, sans-serif; color: #2A2438; padding: 32px; }
        h1 { font-size: 22px; color: #6C4AB6; margin-bottom: 4px; }
        h2 { font-size: 14px; color: #6C4AB6; margin: 24px 0 8px; border-bottom: 1px solid #E4DFF0; padding-bottom: 4px; }
        .codigo { color: #6C4AB6; font-size: 13px; font-weight: 600; }
        .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
        .grid { display: flex; flex-wrap: wrap; gap: 16px; }
        .grid div { min-width: 160px; }
        .label { font-size: 11px; color: #888; }
        .value { font-size: 13px; font-weight: 600; }
        .prob { font-size: 32px; font-weight: 700; color: #6C4AB6; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        td { padding: 5px 4px; border-bottom: 1px solid #F0EDF7; }
        ul { margin: 4px 0; padding-left: 18px; font-size: 12px; }
        .notas { background: #F5F2FC; padding: 12px; border-radius: 8px; font-size: 13px; margin-top: 6px; }
        .footer { margin-top: 32px; font-size: 10px; color: #AAA; text-align: center; }
      </style>
    </head>
    <body>
      <h1>Relatório de Anamnese — ${ficha.dados.nome}</h1>
      <div class="codigo">Código do paciente: #${ficha.codigoPaciente}</div>
      <div class="meta">Gerado em ${formatarDataHora()} · Angel Paw</div>

      <h2>Dados do Paciente</h2>
      <div class="grid">
        <div><div class="label">Espécie</div><div class="value">${ficha.dados.especie === "cao" ? "Cão" : "Gato"}</div></div>
        <div><div class="label">Raça</div><div class="value">${ficha.dados.raca}</div></div>
        <div><div class="label">Idade</div><div class="value">${ficha.dados.idadeAnos}a ${ficha.dados.idadeMeses}m</div></div>
        <div><div class="label">Vacinação</div><div class="value">${vacinacaoLabel}</div></div>
        <div><div class="label">Dias com sintomas</div><div class="value">${ficha.dados.diasSintomas}</div></div>
      </div>

      <h2>Diagnóstico Presumido</h2>
      <div class="grid">
        <div><div class="prob">${ficha.resultado.probabilidade}%</div><div class="label">probabilidade</div></div>
        <div><div class="label">Doença suspeita</div><div class="value">${ficha.resultado.doenca}</div></div>
        <div><div class="label">Confiança</div><div class="value">${ficha.resultado.confianca}</div></div>
      </div>
      <p style="font-size:13px; margin-top:12px;">${ficha.resultado.interpretacao}</p>
      <p style="font-size:13px; font-weight:600; color:#B5541B;">Urgência: ${ficha.resultado.urgencia}</p>

      <h2>Sinais Positivos</h2>
      ${listaSinais(ficha.resultado.sinaisPositivos)}

      <h2>Sinais Ausentes</h2>
      ${listaSinais(ficha.resultado.sinaisNegativos)}

      <h2>Questionário Completo do Tutor</h2>
      <table>${linhasSintomas}</table>

      <h2>Notas do Médico</h2>
      <div class="notas">${ficha.notasMedico?.trim() || "Nenhuma nota registrada até o momento."}</div>

      <h2>Datas</h2>
      <p style="font-size:12px;">Enviada em: ${ficha.dataEnvio}${
        ficha.dataAnalise ? `<br/>Analisada em: ${ficha.dataAnalise}` : ""
      }</p>

      <div class="footer">Documento gerado automaticamente pelo aplicativo Angel Paw. Este relatório é uma ferramenta de apoio à triagem e não substitui avaliação veterinária presencial.</div>
    </body>
  </html>`;
}

function AnamneseCard({
  ficha,
  index,
  exportMode,
  highlighted,
  onLayoutCard,
}: {
  ficha: Anamnese;
  index: number;
  exportMode: boolean;
  highlighted?: boolean;
  onLayoutCard?: (y: number) => void;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(!!highlighted);
  const [showRespostas, setShowRespostas] = useState(false);
  const [exportando, setExportando] = useState(false);

  const respostasFormatadas = formatarRespostasQuestionario(
    ficha.dados.especie,
    ficha.respostas ?? {}
  );

  const probColor =
    ficha.resultado.probabilidade >= 60
      ? colors.danger
      : ficha.resultado.probabilidade >= 30
      ? colors.warning
      : colors.success;

  const statusColor = ficha.status === "Analisada" ? colors.success : colors.warning;

  async function handleExport() {
    setExportando(true);
    try {
      const html = gerarHtmlAnamnese(ficha, respostasFormatadas);

      if (Platform.OS === "web") {
        // Imprime um documento HTML isolado, em vez de imprimir a tela do app.
        // A janela é aberta diretamente no clique para evitar bloqueio de pop-up.
        const janelaImpressao = window.open("", "_blank");

        if (!janelaImpressao) {
          Alert.alert(
            "Permita a janela de impressão",
            "O navegador bloqueou a abertura do relatório. Permita pop-ups para este aplicativo e tente novamente."
          );
          return;
        }

        janelaImpressao.document.open();
        janelaImpressao.document.write(html);
        janelaImpressao.document.close();
        janelaImpressao.focus();

        // Aguarda o navegador renderizar o relatório antes de abrir a impressão.
        window.setTimeout(() => {
          if (!janelaImpressao.closed) {
            janelaImpressao.focus();
            janelaImpressao.print();
          }
        }, 500);
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        const podeCompartilhar = await Sharing.isAvailableAsync();
        if (podeCompartilhar) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/pdf",
            dialogTitle: `Anamnese de ${ficha.dados.nome}`,
          });
        } else {
          Alert.alert("PDF gerado", `Arquivo salvo em: ${uri}`);
        }
      }
    } catch (err) {
      Alert.alert(
        "Erro ao gerar PDF",
        "Não foi possível gerar o arquivo. Tente novamente."
      );
    } finally {
      setExportando(false);
    }
  }

  return (
    <View onLayout={(e) => onLayoutCard?.(e.nativeEvent.layout.y)}>
      <APCard
        style={[
          styles.anamneseCard,
          highlighted && { borderWidth: 2, borderColor: colors.primary },
        ]}
      >
      <Pressable onPress={() => setExpanded((v) => !v)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.petNomeRow}>
              <Text style={[styles.petNome, { color: colors.foreground }]}>{ficha.dados.nome}</Text>
              <Text style={[styles.petCodigo, { color: colors.primary }]}>#{ficha.codigoPaciente}</Text>
            </View>
            <Text style={[styles.petInfo, { color: colors.mutedForeground }]}>
              {ficha.dados.especie === "cao" ? "Cão" : "Gato"} · {ficha.dados.raca} ·{" "}
              {ficha.dados.idadeAnos}a {ficha.dados.idadeMeses}m
            </Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{ficha.status}</Text>
            </View>
            <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
          </View>
        </View>

        <View style={styles.probRow}>
          <Text style={[styles.probText, { color: probColor }]}>
            {ficha.resultado.probabilidade}%
          </Text>
          <Text style={[styles.probLabel, { color: colors.mutedForeground }]}>
            {ficha.resultado.doenca}
          </Text>
          <Text style={[styles.confiancaChip, { color: colors.primary }]}>
            Confiança: {ficha.resultado.confianca}
          </Text>
        </View>
      </Pressable>

      {expanded && (
        <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
          <View style={[styles.responsavelBox, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.responsavelTitle, { color: colors.foreground }]}>
              Contato do responsável
            </Text>
            {ficha.responsavel ? (
              <>
                <InfoRow label="Nome" value={ficha.responsavel.nome} colors={colors} />
                <InfoRow
                  label="WhatsApp"
                  value={formatarWhatsappExibicao(ficha.responsavel.whatsapp)}
                  colors={colors}
                />
                <Pressable
                  onPress={() => {
                    const mensagem = `Olá, ${ficha.responsavel!.nome}. Sou o médico veterinário responsável pela avaliação de ${ficha.dados.nome} pelo Angel Paw.`;
                    Linking.openURL(gerarLinkWhatsapp(ficha.responsavel!.whatsapp, mensagem)).catch(() => {
                      Alert.alert("Não foi possível abrir o WhatsApp", "Verifique se há um navegador ou aplicativo disponível para abrir o link.");
                    });
                  }}
                  style={[styles.whatsappBtn, { backgroundColor: colors.success }]}
                >
                  <Feather name="message-circle" size={15} color="#fff" />
                  <Text style={styles.whatsappBtnText}>Entrar em contato pelo WhatsApp</Text>
                </Pressable>
              </>
            ) : (
              <Text style={[styles.signalText, { color: colors.mutedForeground }]}>
                Esta ficha foi enviada antes da inclusão dos dados de contato.
              </Text>
            )}
          </View>

          <InfoRow label="Vacinação" value={{ C: "Completa", I: "Incompleta", D: "Desconhecida" }[ficha.dados.vacinacao]} colors={colors} />
          <InfoRow label="Dias com sintomas" value={String(ficha.dados.diasSintomas)} colors={colors} />
          <InfoRow label="Urgência" value={ficha.resultado.urgencia} colors={colors} />
          <InfoRow label="Interpretação" value={ficha.resultado.interpretacao} colors={colors} />
          <InfoRow label="Data de envio" value={ficha.dataEnvio} colors={colors} />
          {ficha.dataAnalise && <InfoRow label="Data de análise" value={ficha.dataAnalise} colors={colors} />}

          {respostasFormatadas.length > 0 && (
            <View style={styles.sinaisSection}>
              <Pressable
                onPress={() => setShowRespostas((v) => !v)}
                style={styles.respostasToggle}
              >
                <Text style={[styles.sinaisTitle, { color: colors.foreground }]}>
                  Questionário Completo do Tutor
                </Text>
                <Feather
                  name={showRespostas ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={colors.mutedForeground}
                />
              </Pressable>

              {showRespostas && (
                <View style={styles.respostasList}>
                  {respostasFormatadas.map((r, i) => (
                    <View key={i} style={styles.signalRow}>
                      <Feather
                        name={r.positivo ? "check-circle" : "circle"}
                        size={12}
                        color={r.positivo ? colors.success : colors.mutedForeground}
                      />
                      <Text style={[styles.signalText, { color: colors.foreground, flex: 1 }]}>
                        {r.pergunta}
                      </Text>
                      <Text
                        style={[
                          styles.respostaValor,
                          { color: r.positivo ? colors.success : colors.mutedForeground },
                        ]}
                      >
                        {r.resposta}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {ficha.resultado.sinaisPositivos.length > 0 && (
            <View style={styles.sinaisSection}>
              <Text style={[styles.sinaisTitle, { color: colors.foreground }]}>Sinais Positivos</Text>
              {ficha.resultado.sinaisPositivos.map((s, i) => (
                <View key={i} style={styles.signalRow}>
                  <Feather name="check-circle" size={12} color={colors.success} />
                  <Text style={[styles.signalText, { color: colors.foreground }]}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {ficha.resultado.sinaisNegativos.length > 0 && (
            <View style={styles.sinaisSection}>
              <Text style={[styles.sinaisTitle, { color: colors.foreground }]}>Sinais Negativos</Text>
              {ficha.resultado.sinaisNegativos.map((s, i) => (
                <View key={i} style={styles.signalRow}>
                  <Feather name="minus-circle" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.signalText, { color: colors.mutedForeground }]}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {ficha.notasMedico ? (
            <View style={[styles.notasBox, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.notasLabel, { color: colors.mutedForeground }]}>Notas do Médico</Text>
              <Text style={[styles.notasText, { color: colors.foreground }]}>{ficha.notasMedico}</Text>
            </View>
          ) : null}

          {exportMode && (
            <Pressable
              onPress={handleExport}
              disabled={exportando}
              style={[
                styles.exportBtn,
                { backgroundColor: colors.primary, opacity: exportando ? 0.7 : 1 },
              ]}
            >
              {exportando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="download" size={14} color="#fff" />
              )}
              <Text style={styles.exportBtnText}>
                {exportando ? "Gerando PDF..." : "Exportar PDF"}
              </Text>
            </Pressable>
          )}
        </View>
      )}
      </APCard>
    </View>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground, flex: 1 }]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

export default function AnamnesesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { currentVetId, getAnamnesesPorMedico } = useApp();
  const params = useLocalSearchParams<{ mode?: string; highlightId?: string }>();
  const exportMode = params.mode === "export";
  const highlightId = params.highlightId;

  const scrollRef = useRef<ScrollView>(null);
  const cardOffsets = useRef<Record<string, number>>({});
  const [didScroll, setDidScroll] = useState(false);

  const fichas = currentVetId ? getAnamnesesPorMedico(currentVetId) : [];
  const title = exportMode ? "Exportar PDF" : "Anamneses Recebidas";

  useEffect(() => {
    setDidScroll(false);
  }, [highlightId]);

  if (!currentVetId) {
    router.replace("/vet/login");
    return null;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.secondary }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.countBadge, { color: colors.primary }]}>{fichas.length}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {fichas.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Nenhuma anamnese recebida ainda.
            </Text>
          </View>
        ) : (
          fichas.map((ficha, i) => (
            <AnamneseCard
              key={ficha.id}
              ficha={ficha}
              index={i}
              exportMode={exportMode}
              highlighted={ficha.id === highlightId}
              onLayoutCard={(y) => {
                cardOffsets.current[ficha.id] = y;
                if (ficha.id === highlightId && !didScroll) {
                  scrollRef.current?.scrollTo({ y: Math.max(y - 12, 0), animated: true });
                  setDidScroll(true);
                }
              }}
            />
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
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 18 },
  countBadge: { fontFamily: "Poppins_700Bold", fontSize: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  anamneseCard: {},
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  cardHeaderLeft: { flex: 1 },
  cardHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  petNomeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  petNome: { fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  petCodigo: { fontFamily: "Poppins_500Medium", fontSize: 11 },
  petInfo: { fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontFamily: "Poppins_600SemiBold", fontSize: 11 },
  probRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" },
  probText: { fontFamily: "Poppins_700Bold", fontSize: 20 },
  probLabel: { fontFamily: "Poppins_400Regular", fontSize: 12, flex: 1 },
  confiancaChip: { fontFamily: "Poppins_500Medium", fontSize: 11 },
  expandedContent: { borderTopWidth: 1, marginTop: 12, paddingTop: 12, gap: 8 },
  responsavelBox: { padding: 12, borderRadius: 12, gap: 8, marginBottom: 4 },
  responsavelTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  whatsappBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginTop: 4 },
  whatsappBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 12, color: "#fff" },
  infoRow: { flexDirection: "row", gap: 8 },
  infoLabel: { fontFamily: "Poppins_500Medium", fontSize: 12, width: 110 },
  infoValue: { fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18 },
  sinaisSection: { marginTop: 4, gap: 4 },
  sinaisTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 12, marginBottom: 4 },
  signalRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  signalText: { fontFamily: "Poppins_400Regular", fontSize: 12, flex: 1, lineHeight: 17 },
  respostasToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  respostasList: { gap: 6, marginTop: 2 },
  respostaValor: { fontFamily: "Poppins_600SemiBold", fontSize: 11 },
  notasBox: { padding: 12, borderRadius: 12, gap: 4, marginTop: 4 },
  notasLabel: { fontFamily: "Poppins_500Medium", fontSize: 11 },
  notasText: { fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19 },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  exportBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 13, color: "#fff" },
  empty: { alignItems: "center", paddingTop: 80, gap: 16 },
  emptyText: { fontFamily: "Poppins_400Regular", fontSize: 15, textAlign: "center" },
});
