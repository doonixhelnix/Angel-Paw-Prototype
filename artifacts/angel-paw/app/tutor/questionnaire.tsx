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

import { APCard } from "@/components/APCard";
import { ProgressBar } from "@/components/ProgressBar";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import {
  calcularProbabilidadeDoenca,
  extrairFatoresRisco,
  extrairSintomas,
  getPerguntasPorEspecie,
  PerguntaQuestionario,
} from "@/lib/diseases";

export default function QuestionnaireScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { sessionTutor, setRespostas, setResultado } = useApp();

  const petDados = sessionTutor.petDados;
  const especie = petDados?.especie ?? "cao";
  const perguntas: PerguntaQuestionario[] = getPerguntasPorEspecie(especie);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostasLocal] = useState<Record<string, boolean | string>>({});
  const [sexoSelected, setSexoSelected] = useState<"macho" | "femea" | null>(null);

  const perguntaAtual = perguntas[currentIndex];
  const total = perguntas.length;

  function responder(valor: boolean | string) {
    const novas = { ...respostas, [perguntaAtual.chave]: valor };
    setRespostasLocal(novas);

    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finalizarQuestionario(novas);
    }
  }

  function voltar() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      router.back();
    }
  }

  function finalizarQuestionario(respostasFinais: Record<string, boolean | string>) {
    setRespostas(respostasFinais);
    const sintomas = extrairSintomas(especie, respostasFinais);
    const fatores = extrairFatoresRisco(
      especie,
      respostasFinais,
      petDados?.vacinacao ?? "D"
    );

    const idadeAnos = petDados?.idadeAnos ?? 0;
    const idadeMeses = petDados?.idadeMeses ?? 0;
    const idadeTotal = idadeAnos + idadeMeses / 12;
    if (especie === "cao" && idadeTotal < 0.5) {
      fatores["idade_filhote"] = true;
    }

    const resultado = calcularProbabilidadeDoenca(especie, sintomas, fatores);
    setResultado(resultado);
    router.push("/tutor/summary");
  }

  if (!petDados) {
    router.replace("/tutor/identification");
    return null;
  }

  const isSexo = perguntaAtual.tipo === "sexo";

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={voltar} style={[styles.backBtn, { backgroundColor: colors.secondary }]}>
          <Feather name="arrow-left" size={18} color={colors.primary} />
        </Pressable>
        <ProgressBar current={currentIndex + 1} total={total} />
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.secondary },
          ]}
        >
          <Feather name="activity" size={32} color={colors.primary} />
        </View>

        <Text style={[styles.questionLabel, { color: colors.mutedForeground }]}>
          Pergunta {currentIndex + 1} de {total}
        </Text>

        <APCard style={styles.questionCard}>
          <Text style={[styles.questionText, { color: colors.foreground }]}>
            {perguntaAtual.pergunta}
          </Text>
        </APCard>

        {!isSexo ? (
          <View style={styles.btnGroup}>
            <Pressable
              onPress={() => responder(true)}
              style={({ pressed }) => [
                styles.answerBtn,
                {
                  backgroundColor: colors.success,
                  opacity: pressed ? 0.85 : 1,
                  borderRadius: 16,
                },
              ]}
            >
              <Feather name="check" size={22} color="#fff" />
              <Text style={styles.answerBtnText}>Sim</Text>
            </Pressable>

            <Pressable
              onPress={() => responder(false)}
              style={({ pressed }) => [
                styles.answerBtn,
                {
                  backgroundColor: colors.danger,
                  opacity: pressed ? 0.85 : 1,
                  borderRadius: 16,
                },
              ]}
            >
              <Feather name="x" size={22} color="#fff" />
              <Text style={styles.answerBtnText}>Não</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.btnGroup}>
            <Pressable
              onPress={() => {
                setSexoSelected("macho");
                responder("macho");
              }}
              style={({ pressed }) => [
                styles.answerBtn,
                {
                  backgroundColor: sexoSelected === "macho" ? colors.primary : colors.secondary,
                  opacity: pressed ? 0.85 : 1,
                  borderRadius: 16,
                },
              ]}
            >
              <Feather name="shield" size={20} color={sexoSelected === "macho" ? "#fff" : colors.primary} />
              <Text style={[styles.answerBtnText, { color: sexoSelected === "macho" ? "#fff" : colors.primary }]}>
                Macho
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setSexoSelected("femea");
                responder("femea");
              }}
              style={({ pressed }) => [
                styles.answerBtn,
                {
                  backgroundColor: sexoSelected === "femea" ? colors.primary : colors.secondary,
                  opacity: pressed ? 0.85 : 1,
                  borderRadius: 16,
                },
              ]}
            >
              <Feather name="heart" size={20} color={sexoSelected === "femea" ? "#fff" : colors.primary} />
              <Text style={[styles.answerBtnText, { color: sexoSelected === "femea" ? "#fff" : colors.primary }]}>
                Fêmea
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: botPad + 12 }]}>
        <Text style={[styles.petName, { color: colors.mutedForeground }]}>
          {petDados.nome} · {especie === "cao" ? "Cão" : "Gato"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  questionLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
  },
  questionCard: {
    width: "100%",
    alignItems: "center",
  },
  questionText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
  },
  btnGroup: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    marginTop: 8,
  },
  answerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  answerBtnText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    color: "#fff",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 12,
  },
  petName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
});
