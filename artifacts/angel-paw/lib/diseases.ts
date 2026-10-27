export type EspeciePet = "cao" | "gato";

export interface SintomaInfo {
  peso: number;
  nivel: "ALTA" | "MÉDIA" | "BAIXA";
  descricao: string;
}

export interface FatorRisco {
  peso: number;
  descricao: string;
}

export interface DoencaInfo {
  nome: string;
  descricao: string;
  sintomas: Record<string, SintomaInfo>;
  fatores_risco: Record<string, FatorRisco>;
  urgencia: { critico: string[]; nivel: string };
}

export interface ResultadoDiagnostico {
  doenca: string;
  probabilidade: number;
  confianca: "Alta" | "Moderada" | "Baixa";
  interpretacao: string;
  urgencia: string;
  sinaisPositivos: string[];
  sinaisNegativos: string[];
  sinaisChave: number;
}

export const DOENCAS: Record<EspeciePet, Record<string, DoencaInfo>> = {
  cao: {
    parvovirose: {
      nome: "Parvovirose Canina",
      descricao: "Doença viral altamente contagiosa que afeta o sistema gastrointestinal",
      sintomas: {
        sangue_fezes: { peso: 40, nivel: "ALTA", descricao: "Diarreia com sangue" },
        vomitos: { peso: 25, nivel: "ALTA", descricao: "Vômitos frequentes" },
        apatia: { peso: 15, nivel: "MÉDIA", descricao: "Apatia e prostração" },
        desidratado: { peso: 15, nivel: "MÉDIA", descricao: "Sinais de desidratação" },
        febre: { peso: 10, nivel: "MÉDIA", descricao: "Febre" },
        falta_apetite: { peso: 15, nivel: "MÉDIA", descricao: "Falta de apetite" },
        dor: { peso: 5, nivel: "BAIXA", descricao: "Dor abdominal" },
      },
      fatores_risco: {
        idade_filhote: { peso: 20, descricao: "Menos de 6 meses" },
        vacinacao_incompleta: { peso: -10, descricao: "Vacinação incompleta" },
        vacinacao_completa: { peso: -35, descricao: "Vacinação completa" },
      },
      urgencia: {
        critico: ["sangue_fezes", "vomitos", "desidratado"],
        nivel: "Alta - Requer atendimento urgente",
      },
    },
    cinomose: {
      nome: "Cinomose Canina",
      descricao: "Doença viral altamente contagiosa que afeta sistemas respiratório, gastrointestinal e neurológico",
      sintomas: {
        secrecao_ocular: { peso: 40, nivel: "ALTA", descricao: "Secreção ocular purulenta (remela espessa)" },
        secrecao_nasal: { peso: 40, nivel: "ALTA", descricao: "Secreção nasal purulenta" },
        convulsoes: { peso: 50, nivel: "ALTA", descricao: "Convulsões ou tremores musculares" },
        tosse: { peso: 20, nivel: "MÉDIA", descricao: "Tosse e espirros" },
        vomitos: { peso: 15, nivel: "MÉDIA", descricao: "Vômitos" },
        diarreia: { peso: 15, nivel: "MÉDIA", descricao: "Diarreia" },
        febre: { peso: 15, nivel: "MÉDIA", descricao: "Febre bifásica" },
        apatia: { peso: 10, nivel: "MÉDIA", descricao: "Apatia e fraqueza" },
      },
      fatores_risco: {
        vacinacao_incompleta: { peso: -10, descricao: "Vacinação incompleta" },
        vacinacao_completa: { peso: -35, descricao: "Vacinação completa" },
      },
      urgencia: {
        critico: ["convulsoes", "secrecao_ocular", "secrecao_nasal"],
        nivel: "Crítica - Emergência neurológica possível",
      },
    },
    erliquiose: {
      nome: "Erliquiose Canina",
      descricao: "Hemoparasitose transmitida por carrapatos, afeta as plaquetas e pode levar à falência de órgãos",
      sintomas: {
        sangramento_espontaneo: { peso: 50, nivel: "ALTA", descricao: "Sangramento nasal espontâneo ou hematomas" },
        apatia_extrema: { peso: 25, nivel: "ALTA", descricao: "Letargia extrema e fraqueza generalizada" },
        febre: { peso: 20, nivel: "MÉDIA", descricao: "Febre repentina" },
        linfonodos_aumentados: { peso: 20, nivel: "MÉDIA", descricao: "Linfonodos aumentados e doloridos" },
        mancada: { peso: 15, nivel: "MÉDIA", descricao: "Claudicação (ato de mancar) em membros" },
        falta_apetite: { peso: 15, nivel: "MÉDIA", descricao: "Perda de apetite progressiva" },
        tosse: { peso: 10, nivel: "BAIXA", descricao: "Tosse ocasional" },
      },
      fatores_risco: {
        exposicao_carrapato: { peso: 30, descricao: "Histórico de exposição a carrapatos" },
      },
      urgencia: {
        critico: ["sangramento_espontaneo", "apatia_extrema"],
        nivel: "Alta - Requer testes sanguíneos urgentemente",
      },
    },
  },
  gato: {
    obtrucao_urinaria: {
      nome: "Obstrução Urinária Felina",
      descricao: "Emergência veterinária potencialmente fatal onde o gato não consegue urinar, levando à morte em 36-48h",
      sintomas: {
        nao_consegue_urinar: { peso: 60, nivel: "ALTA", descricao: "Tenta urinar sem produzir urina (anúria)" },
        bexiga_distendida: { peso: 55, nivel: "ALTA", descricao: "Bexiga distendida e dolorida à palpação" },
        vomito: { peso: 35, nivel: "ALTA", descricao: "Vômito e hálito urêmico" },
        vocalizacao_dor: { peso: 30, nivel: "MÉDIA", descricao: "Vocalização ao tentar urinar (choro de dor)" },
        hematuria: { peso: 25, nivel: "MÉDIA", descricao: "Sangue na urina" },
        polaquiuria: { peso: 20, nivel: "MÉDIA", descricao: "Tentativas frequentes de urinar com pouca urina" },
        apatia: { peso: 15, nivel: "MÉDIA", descricao: "Apatia e prostração" },
      },
      fatores_risco: {
        macho: { peso: 20, descricao: "Gato macho (mais suscetível)" },
      },
      urgencia: {
        critico: ["nao_consegue_urinar", "vomito"],
        nivel: "EMERGÊNCIA VITAL - Morte possível em 36-48h se não for tratado",
      },
    },
    infeccao_urinaria: {
      nome: "Infecção Urinária Felina",
      descricao: "Inflamação/infecção do trato urinário, menos grave que a obstrução, porém requer tratamento",
      sintomas: {
        polaquiuria: { peso: 25, nivel: "ALTA", descricao: "Micções frequentes e dolorosas" },
        hematuria: { peso: 20, nivel: "ALTA", descricao: "Sangue na urina" },
        vocalizacao_leve: { peso: 15, nivel: "MÉDIA", descricao: "Leve vocalização ao urinar" },
        lambedura_genital: { peso: 15, nivel: "MÉDIA", descricao: "Lambedura excessiva na genital" },
        urinar_local_incomum: { peso: 20, nivel: "MÉDIA", descricao: "Urinar fora da caixa de areia" },
        apatia_leve: { peso: 10, nivel: "BAIXA", descricao: "Apatia leve" },
      },
      fatores_risco: {
        femea: { peso: 10, descricao: "Gato fêmea (mais suscetível)" },
      },
      urgencia: {
        critico: ["polaquiuria", "hematuria"],
        nivel: "Média - Requer avaliação clínica",
      },
    },
    gastroenterite: {
      nome: "Gastroenterite Felina",
      descricao: "Inflamação do trato gastrointestinal, pode ter várias causas",
      sintomas: {
        vomito: { peso: 30, nivel: "ALTA", descricao: "Vômito frequente" },
        perda_apetite: { peso: 20, nivel: "MÉDIA", descricao: "Perda de apetite" },
        apatia: { peso: 15, nivel: "MÉDIA", descricao: "Apatia" },
        desidratacao: { peso: 20, nivel: "MÉDIA", descricao: "Sinais de desidratação" },
        dor_abdominal: { peso: 15, nivel: "MÉDIA", descricao: "Dor abdominal" },
      },
      fatores_risco: {},
      urgencia: {
        critico: ["vomito", "diarreia"],
        nivel: "Média - Requer avaliação clínica e suporte",
      },
    },
  },
};

export function calcularProbabilidadeDoenca(
  especie: EspeciePet,
  sintomasSelecionados: Record<string, boolean>,
  fatoresRisco: Record<string, boolean>
): ResultadoDiagnostico {
  const doencas = DOENCAS[especie];
  let melhorDoenca = "";
  let melhorProbabilidade = -1;
  let melhorResultado: ResultadoDiagnostico | null = null;

  for (const [, doencaInfo] of Object.entries(doencas)) {
    let score = 0;
    let maxScore = 0;
    const sinaisPositivos: string[] = [];
    const sinaisNegativos: string[] = [];

    for (const [sintomaNome, sintomaInfo] of Object.entries(doencaInfo.sintomas)) {
      maxScore += sintomaInfo.peso;
      if (sintomasSelecionados[sintomaNome]) {
        score += sintomaInfo.peso;
        sinaisPositivos.push(sintomaInfo.descricao);
      } else if (sintomaInfo.nivel === "ALTA") {
        sinaisNegativos.push(sintomaInfo.descricao);
      }
    }

    for (const [fatorNome, fatorInfo] of Object.entries(doencaInfo.fatores_risco)) {
      if (fatoresRisco[fatorNome]) {
        score += fatorInfo.peso;
      }
    }

    let probabilidade = maxScore > 0 ? (score / maxScore) * 100 : 0;
    probabilidade = Math.max(0, Math.min(100, probabilidade));

    if (probabilidade > melhorProbabilidade) {
      melhorProbabilidade = probabilidade;
      melhorDoenca = doencaInfo.nome;

      const sinaisChave = doencaInfo.urgencia.critico.filter(
        (s) => sintomasSelecionados[s]
      ).length;

      const confianca = obterConfiancaDiagnostico(probabilidade);

      melhorResultado = {
        doenca: doencaInfo.nome,
        probabilidade: Math.round(probabilidade),
        confianca,
        interpretacao: getInterpretacao(doencaInfo.nome, probabilidade),
        urgencia: sinaisChave > 0 ? doencaInfo.urgencia.nivel : "Avaliação veterinária recomendada",
        sinaisPositivos,
        sinaisNegativos,
        sinaisChave,
      };
    }
  }

  return (
    melhorResultado ?? {
      doenca: "Indeterminado",
      probabilidade: 0,
      confianca: "Baixa",
      interpretacao: "Não foi possível determinar um diagnóstico. Consulte um veterinário.",
      urgencia: "Avaliação veterinária recomendada",
      sinaisPositivos: [],
      sinaisNegativos: [],
      sinaisChave: 0,
    }
  );
}

function obterConfiancaDiagnostico(probabilidade: number): "Alta" | "Moderada" | "Baixa" {
  if (probabilidade >= 60) return "Alta";
  if (probabilidade >= 30) return "Moderada";
  return "Baixa";
}

function getInterpretacao(nomeDoenca: string, probabilidade: number): string {
  if (probabilidade >= 70) {
    return `Alta probabilidade de ${nomeDoenca}. Recomenda-se avaliação veterinária urgente.`;
  }
  if (probabilidade >= 40) {
    return `Probabilidade moderada de ${nomeDoenca}. Avaliação veterinária recomendada.`;
  }
  return `Baixa probabilidade. Monitorar o animal e consultar um veterinário se necessário.`;
}

export interface PerguntaQuestionario {
  chave: string;
  pergunta: string;
  tipo: "simNao" | "sexo";
}

export function getPerguntasCao(): PerguntaQuestionario[] {
  return [
    { chave: "vomitos", pergunta: "O animal está vomitando?", tipo: "simNao" },
    { chave: "diarreia", pergunta: "O animal apresenta diarreia?", tipo: "simNao" },
    { chave: "sangue_fezes", pergunta: "O animal apresenta sangue nas fezes?", tipo: "simNao" },
    { chave: "apatia", pergunta: "Demonstra falta de energia (apatia)?", tipo: "simNao" },
    { chave: "febre", pergunta: "O animal está com febre?", tipo: "simNao" },
    { chave: "falta_apetite", pergunta: "O animal está com falta de apetite?", tipo: "simNao" },
    { chave: "desidratado", pergunta: "O animal está desidratado?", tipo: "simNao" },
    { chave: "dor", pergunta: "O animal aparenta estar com dor no abdômen?", tipo: "simNao" },
    { chave: "secrecao_ocular", pergunta: "O animal está com pus nos olhos?", tipo: "simNao" },
    { chave: "secrecao_nasal", pergunta: "O animal está com pus nas narinas?", tipo: "simNao" },
    { chave: "convulsoes", pergunta: "O animal está convulsionando?", tipo: "simNao" },
    { chave: "tosse", pergunta: "O animal está tossindo?", tipo: "simNao" },
    { chave: "sangramento_espontaneo", pergunta: "Apresenta sangramento espontâneo (nasal ou hematomas)?", tipo: "simNao" },
    { chave: "apatia_extrema", pergunta: "Apresenta sono/cansaço extremo?", tipo: "simNao" },
    { chave: "linfonodos_aumentados", pergunta: "Apresenta alguma íngua (caroço inchado) no pescoço, axilas ou virilha?", tipo: "simNao" },
    { chave: "mancada", pergunta: "Apresenta mancada ao andar?", tipo: "simNao" },
    { chave: "exposicao_carrapato", pergunta: "Há histórico de exposição a carrapatos?", tipo: "simNao" },
  ];
}

export function getPerguntasGato(): PerguntaQuestionario[] {
  return [
    { chave: "vomito", pergunta: "O animal está vomitando?", tipo: "simNao" },
    { chave: "diarreia", pergunta: "Apresenta diarreia?", tipo: "simNao" },
    { chave: "apatia", pergunta: "Demonstra apatia (falta de energia)?", tipo: "simNao" },
    { chave: "perda_apetite", pergunta: "Demonstra falta de apetite (Não come)?", tipo: "simNao" },
    { chave: "desidratacao", pergunta: "Há sinais de desidratação?", tipo: "simNao" },
    { chave: "dor_abdominal", pergunta: "Demonstra dor abdominal?", tipo: "simNao" },
    { chave: "nao_consegue_urinar", pergunta: "O gato tenta urinar SEM produzir urina?", tipo: "simNao" },
    { chave: "bexiga_distendida", pergunta: "Bexiga está dura/distendida ao toque?", tipo: "simNao" },
    { chave: "polaquiuria", pergunta: "Urina com muita frequência em pequena quantidade?", tipo: "simNao" },
    { chave: "hematuria", pergunta: "Apresenta sangue na urina?", tipo: "simNao" },
    { chave: "vocalizacao_dor", pergunta: "Mia (chora) ao tentar urinar?", tipo: "simNao" },
    { chave: "lambedura_genital", pergunta: "Lambe muito a região genital?", tipo: "simNao" },
    { chave: "urinar_local_incomum", pergunta: "Urina em locais incomuns (fora da caixa)?", tipo: "simNao" },
    { chave: "sexo", pergunta: "Qual é o sexo do gato?", tipo: "sexo" },
  ];
}

export function getPerguntasPorEspecie(especie: EspeciePet): PerguntaQuestionario[] {
  return especie === "cao" ? getPerguntasCao() : getPerguntasGato();
}

export function extrairFatoresRisco(
  especie: EspeciePet,
  respostas: Record<string, boolean | string>,
  vacinacao: "C" | "I" | "D"
): Record<string, boolean> {
  const fatores: Record<string, boolean> = {};

  if (especie === "cao") {
    fatores["vacinacao_completa"] = vacinacao === "C";
    fatores["vacinacao_incompleta"] = vacinacao === "I";
    fatores["exposicao_carrapato"] = !!respostas["exposicao_carrapato"];
  } else {
    const sexo = respostas["sexo"];
    fatores["macho"] = sexo === "macho";
    fatores["femea"] = sexo === "femea";
  }

  return fatores;
}

export interface RespostaExibicao {
  pergunta: string;
  resposta: string;
  positivo: boolean;
}

/**
 * Converte o dicionário bruto de respostas do questionário (ex: { vomitos: true, febre: false })
 * numa lista pronta para exibição, na ordem em que as perguntas foram feitas ao tutor.
 */
export function formatarRespostasQuestionario(
  especie: EspeciePet,
  respostas: Record<string, boolean | string>
): RespostaExibicao[] {
  const perguntas = getPerguntasPorEspecie(especie);

  return perguntas.map((p) => {
    const valor = respostas[p.chave];

    if (p.tipo === "sexo") {
      const texto = valor === "macho" ? "Macho" : valor === "femea" ? "Fêmea" : "Não informado";
      return { pergunta: p.pergunta, resposta: texto, positivo: true };
    }

    const positivo = !!valor;
    return { pergunta: p.pergunta, resposta: positivo ? "Sim" : "Não", positivo };
  });
}

export function extrairSintomas(
  especie: EspeciePet,
  respostas: Record<string, boolean | string>
): Record<string, boolean> {
  const sintomas: Record<string, boolean> = {};
  const perguntas = getPerguntasPorEspecie(especie);

  for (const p of perguntas) {
    if (p.tipo === "simNao" && p.chave !== "exposicao_carrapato") {
      sintomas[p.chave] = !!respostas[p.chave];
    }
  }

  return sintomas;
}
