import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Medico {
  id: string;
  nome: string;
  senha: string;
}

export interface PetDados {
  especie: "cao" | "gato";
  nome: string;
  idadeAnos: number;
  idadeMeses: number;
  raca: string;
  diasSintomas: number;
  vacinacao: "C" | "I" | "D";
}

export interface ResultadoArmazenado {
  doenca: string;
  probabilidade: number;
  confianca: string;
  interpretacao: string;
  urgencia: string;
  sinaisPositivos: string[];
  sinaisNegativos: string[];
  sinaisChave: number;
}

export interface Anamnese {
  id: string;
  idMedico: string;
  dados: PetDados;
  resultado: ResultadoArmazenado;
  status: "Pendente" | "Analisada";
  dataEnvio: string;
  dataAnalise: string | null;
  notasMedico: string;
}

const MEDICOS_KEY = "angel_paw_medicos";
const ANAMNESES_KEY = "angel_paw_anamneses";

export async function carregarMedicos(): Promise<Record<string, Medico>> {
  try {
    const data = await AsyncStorage.getItem(MEDICOS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export async function salvarMedicos(medicos: Record<string, Medico>): Promise<void> {
  await AsyncStorage.setItem(MEDICOS_KEY, JSON.stringify(medicos));
}

export async function carregarAnamneses(): Promise<Anamnese[]> {
  try {
    const data = await AsyncStorage.getItem(ANAMNESES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function salvarAnamneses(anamneses: Anamnese[]): Promise<void> {
  await AsyncStorage.setItem(ANAMNESES_KEY, JSON.stringify(anamneses));
}

export function hashSenha(senha: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < senha.length; i++) {
    const ch = senha.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hash = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  return hash.padStart(14, "0");
}

export function formatarDataHora(): string {
  const now = new Date();
  const dia = String(now.getDate()).padStart(2, "0");
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const ano = now.getFullYear();
  const hora = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${ano} ${hora}:${min}`;
}
