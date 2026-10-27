import AsyncStorage from "@react-native-async-storage/async-storage";

export type StatusMedico = "Pendente" | "Aprovado" | "Rejeitado";

export interface Medico {
  id: string;
  nome: string;
  senha: string;
  /** Número do CRMV informado no cadastro, normalizado (ex: "SP-12345"). */
  crmv: string;
  /** Telefone ou e-mail para o admin confirmar a identidade fora do app. */
  contato: string;
  /** Clínica/hospital onde trabalha, para o admin checar com a instituição. */
  localTrabalho: string;
  status: StatusMedico;
  dataCadastro: string;
  /**
   * Números de WhatsApp do médico (até MAX_WHATSAPPS), normalizados com
   * código do país (ex: "5511999999999"). Opcional e separado do campo
   * "contato" acima — o médico pode cadastrar, alterar ou remover a
   * qualquer momento (no cadastro ou na tela de notificar). Só são usados
   * para gerar o link de direcionamento pro WhatsApp (gerarLinkWhatsapp).
   */
  whatsapps?: string[];
  /** Campo da primeira versão (número único). Só para ler dados antigos — use listarWhatsappsMedico(). */
  whatsapp?: string;
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
  codigoPaciente: string;
  /** Hash do PIN definido pelo tutor ao enviar a ficha. Necessário para
   * consultar as notificações dessa ficha pelo código do paciente. */
  pin: string;
  idMedico: string;
  dados: PetDados;
  resultado: ResultadoArmazenado;
  respostas: Record<string, boolean | string>;
  status: "Pendente" | "Analisada";
  dataEnvio: string;
  dataAnalise: string | null;
  notasMedico: string;
}

export interface Notificacao {
  id: string;
  anamneseId: string;
  codigoPaciente: string;
  idMedico: string;
  nomeMedico: string;
  nomePet: string;
  mensagem: string;
  dataEnvio: string;
  lida: boolean;
  /**
   * "mensagem" (padrão, inclusive para notificações antigas sem este
   * campo) é uma notificação comum. "whatsapp_direcionamento" é um convite
   * pra continuar a conversa fora do app; nesse caso whatsappNumeros vem
   * preenchido com os números que o médico escolheu enviar NO MOMENTO DO
   * ENVIO (snapshot — se ele trocar a lista depois, notificações já
   * enviadas continuam apontando pros números que o tutor recebeu).
   */
  tipo?: "mensagem" | "whatsapp_direcionamento";
  whatsappNumeros?: string[];
}

export interface Admin {
  id: string;
  nome: string;
  senha: string;
  dataCriacao: string;
}

/**
 * Registro de auditoria: quem aprovou/rejeitou qual médico, e quando.
 * Existe pra dar responsabilização — se algo der errado, dá pra saber
 * exatamente qual conta de admin autorizou aquele médico específico.
 */
export interface LogAprovacao {
  id: string;
  medicoId: string;
  nomeMedico: string;
  crmv: string;
  acao: "Aprovado" | "Rejeitado";
  adminId: string;
  nomeAdmin: string;
  data: string;
}

const MEDICOS_KEY = "angel_paw_medicos";
const ANAMNESES_KEY = "angel_paw_anamneses";
const NOTIFICACOES_KEY = "angel_paw_notificacoes";
const ADMINS_KEY = "angel_paw_admins";
const LOG_APROVACOES_KEY = "angel_paw_log_aprovacoes";

/**
 * Gera um ID sequencial com zeros à esquerda, no padrão usado em prontuários
 * reais (ex: Medical Record Number). "largura" define quantos dígitos no total.
 */
export function gerarIdSequencial(numero: number, largura: number): string {
  return String(numero).padStart(largura, "0");
}

export function gerarIdMedico(quantidadeAtual: number): string {
  return gerarIdSequencial(quantidadeAtual + 1, 4);
}

/** IDs de admin são mais curtos (3 dígitos) — não se espera ter muitos. */
export function gerarIdAdmin(quantidadeAtual: number): string {
  return gerarIdSequencial(quantidadeAtual + 1, 3);
}

/**
 * Gera um código de paciente aleatório de 6 dígitos (não sequencial).
 *
 * Antes o código era 000001, 000002, 000003... o que deixava fácil pra
 * qualquer pessoa "chutar" códigos de outros pacientes, já que dava pra
 * inferir quantas fichas existiam. Sorteando o número dentro de todo o
 * intervalo de 6 dígitos (000000 a 999999) e conferindo contra os códigos
 * já usados, cada código vira uma agulha num palheiro de 1 milhão de
 * possibilidades — combinado com o bloqueio de tentativas, tentar adivinhar
 * um código válido na mão deixa de ser viável.
 */
export function gerarCodigoPaciente(codigosExistentes: string[]): string {
  const existentes = new Set(codigosExistentes);
  let codigo: string;
  do {
    codigo = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  } while (existentes.has(codigo));
  return codigo;
}

/**
 * Busca um médico pelo ID digitado, aceitando tanto o formato novo com
 * zeros à esquerda ("0001") quanto contas antigas criadas antes dessa
 * padronização ("1"), sem precisar migrar dados já existentes.
 */
export function encontrarMedicoPorId(
  medicos: Record<string, Medico>,
  idDigitado: string
): Medico | null {
  const bruto = idDigitado.trim();
  if (medicos[bruto]) return medicos[bruto];

  const semZeros = bruto.replace(/^0+/, "") || "0";
  if (medicos[semZeros]) return medicos[semZeros];

  const comZeros = gerarIdSequencial(Number(semZeros), 4);
  if (medicos[comZeros]) return medicos[comZeros];

  return null;
}

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

// --- Segurança do cadastro de médico ---------------------------------------
//
// Cadastro de médico é o ponto mais sensível do app: qualquer pessoa que
// conseguisse criar uma conta poderia se passar por veterinário e receber
// anamneses reais. Como este é um protótipo sem backend nem integração com
// a base oficial do CRMV, usamos camadas complementares:
//
// 1) CRMV obrigatório (validado só no formato): cria um identificador
//    profissional real associado à conta, e impede dois cadastros ativos
//    com o mesmo número.
// 2) Contato e local de trabalho obrigatórios: nome e CRMV sozinhos são
//    informação pública — qualquer um preenche os dois. Contato (telefone
//    ou e-mail) e local de trabalho dão ao admin um canal pra confirmar a
//    identidade FORA do app (ligando, mandando e-mail, checando com a
//    própria clínica), que é o que de fato torna a aprovação manual uma
//    verificação e não um clique automático.
// 3) Aprovação manual por uma conta de administrador nomeada (não uma senha
//    única compartilhada): a conta só fica ativa depois de alguém checar
//    manualmente a veracidade dos dados acima. O código não tem como
//    automatizar essa verificação — isso é uma limitação conhecida e
//    documentada, não uma falha escondida.
// 4) Log de auditoria: toda aprovação/rejeição fica registrada com qual
//    admin a fez e quando, para dar responsabilização.
//
// Removemos de propósito o código de convite fixo que existia antes: ele
// era uma única string igual pra todo mundo, vivia hardcoded no app (dava
// pra extrair do bundle) e não acrescentava nada que a aprovação manual já
// não cobrisse — só não dava pra revogar por pessoa. Preferimos investir
// nos itens 2 e 3 acima, que dão ao admin algo de verdade pra verificar.
//
// Numa implantação real (ex: uma instituição adotando o sistema), o ideal
// é substituir essas contas de admin locais por login federado com a
// identidade institucional (SSO) — quem entra e sai do papel de admin
// passaria a ser controlado pelo TI da própria instituição, não pelo app.
// Aqui, contas de admin nomeadas (em vez de uma senha única) já são um
// passo intermediário defensável dentro do escopo de protótipo: dá pra
// saber quem fez o quê, e revogar o acesso de UM admin sem afetar os outros.

/**
 * Normaliza um CRMV digitado em qualquer formato razoável
 * ("SP12345", "sp 12345", "CRMV-SP-12345") para "SP-12345".
 */
export function normalizarCrmv(crmv: string): string {
  const limpo = crmv.trim().toUpperCase().replace(/^CRMV[-\s]?/, "");
  const match = limpo.match(/^([A-Z]{2})[-\s]?(\d{3,6})$/);
  if (!match) return limpo;
  return `${match[1]}-${match[2]}`;
}

/**
 * Siglas oficiais das 27 unidades federativas brasileiras.
 * A validação confirma o formato e a UF, mas não comprova que o registro
 * existe nem que pertence à pessoa — isso exige conferência oficial.
 */
const UFS_CRMV_VALIDAS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

/** Formato esperado: UF brasileira válida + número de 3 a 6 dígitos. */
export function crmvValido(crmv: string): boolean {
  const normalizado = normalizarCrmv(crmv);
  const match = normalizado.match(/^([A-Z]{2})-(\d{3,6})$/);
  return !!match && UFS_CRMV_VALIDAS.has(match[1]);
}

/**
 * Impede duas contas ATIVAS (Pendente ou Aprovado) com o mesmo CRMV.
 *
 * Cadastros Rejeitados ficam de fora de propósito: se o admin rejeitou um
 * pedido (ex: a pessoa digitou o CRMV errado, ou não conseguiu confirmar a
 * identidade daquela vez), ela precisa poder tentar de novo depois. Sem
 * essa exclusão, uma rejeição vira um bloqueio permanente — ninguém mais
 * consegue se cadastrar com aquele CRMV, nem o dono legítimo dele.
 */
export function crmvJaCadastrado(
  medicos: Record<string, Medico>,
  crmvNormalizado: string
): boolean {
  return Object.values(medicos).some(
    (m) => m.crmv === crmvNormalizado && m.status !== "Rejeitado"
  );
}

// --- WhatsApp do médico -----------------------------------------------
//
// Direcionamento opcional pro WhatsApp do médico, pra casos em que o
// assunto é longo demais pra uma notificação dentro do app. Usamos o
// esquema público wa.me (https://wa.me/<numero>?text=<mensagem>), que o
// próprio WhatsApp disponibiliza: funciona tanto abrindo o app instalado
// quanto, na ausência dele, como fallback web — não precisa de nenhuma
// integração ou chave de API.

/**
 * Normaliza um número digitado em qualquer formato razoável
 * ("(11) 99999-9999", "11999999999", "+55 11 99999-9999") para dígitos
 * puros com código do país. Assume Brasil (55) quando o número não traz
 * código de país (ou seja, tem 10 ou 11 dígitos — DDD + telefone).
 */
export function normalizarWhatsapp(numero: string): string {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length <= 11) return `55${digitos}`;
  return digitos;
}

/** Espera 12 ou 13 dígitos após normalizar: 55 + DDD (2) + número (8 ou 9). */
export function whatsappValido(numero: string): boolean {
  return /^\d{12,13}$/.test(normalizarWhatsapp(numero));
}

/** Gera o link que abre o WhatsApp já numa conversa com esse número. */
export function gerarLinkWhatsapp(numero: string, mensagem?: string): string {
  const base = `https://wa.me/${normalizarWhatsapp(numero)}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

/** Formata só pra exibição (ex: "+55 (11) 99999-9999"), não pra comparação/salvamento. */
export function formatarWhatsappExibicao(numeroNormalizado: string): string {
  const d = numeroNormalizado;
  if (d.length === 13) {
    return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  }
  if (d.length === 12) {
    return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 8)}-${d.slice(8)}`;
  }
  return d;
}

/** Quantos números de WhatsApp cada médico pode manter cadastrados. */
export const MAX_WHATSAPPS = 3;

/** Lista os números do médico, lendo também o campo antigo de número único. */
export function listarWhatsappsMedico(medico: Medico | null | undefined): string[] {
  if (!medico) return [];
  if (medico.whatsapps && medico.whatsapps.length > 0) return medico.whatsapps;
  return medico.whatsapp ? [medico.whatsapp] : [];
}
// ---------------------------------------------------------------------------

export async function carregarAdmins(): Promise<Record<string, Admin>> {
  try {
    const data = await AsyncStorage.getItem(ADMINS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export async function salvarAdmins(admins: Record<string, Admin>): Promise<void> {
  await AsyncStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

/**
 * Busca um admin pelo ID digitado, com a mesma tolerância a zeros à
 * esquerda usada para o ID do médico.
 */
export function encontrarAdminPorId(
  admins: Record<string, Admin>,
  idDigitado: string
): Admin | null {
  const bruto = idDigitado.trim();
  if (admins[bruto]) return admins[bruto];

  const semZeros = bruto.replace(/^0+/, "") || "0";
  if (admins[semZeros]) return admins[semZeros];

  const comZeros = gerarIdSequencial(Number(semZeros), 3);
  if (admins[comZeros]) return admins[comZeros];

  return null;
}

export async function carregarLogAprovacoes(): Promise<LogAprovacao[]> {
  try {
    const data = await AsyncStorage.getItem(LOG_APROVACOES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function salvarLogAprovacoes(log: LogAprovacao[]): Promise<void> {
  await AsyncStorage.setItem(LOG_APROVACOES_KEY, JSON.stringify(log));
}
// ---------------------------------------------------------------------------

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

export async function carregarNotificacoes(): Promise<Notificacao[]> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICACOES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function salvarNotificacoes(notificacoes: Notificacao[]): Promise<void> {
  await AsyncStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(notificacoes));
}

// --- Proteção contra tentativa de adivinhar código + PIN -----------------
//
// Como os códigos de paciente são sequenciais (000001, 000002...), alguém
// mal-intencionado poderia tentar "varrer" códigos e PINs à procura de
// alguma combinação válida. Isso não é uma trava perfeita (é guardada só
// neste aparelho: reinstalar o app ou limpar os dados zera o contador),
// mas encarece bastante um ataque manual ou de um script simples feito
// contra este mesmo app.

export interface TentativaBusca {
  tentativas: number;
  ultimaTentativa: number; // epoch ms
  bloqueadoAte: number; // epoch ms; 0 = sem bloqueio
}

export interface EstadoSegurancaBusca {
  /** Contador por código digitado — pune quem insiste em um código específico. */
  porCodigo: Record<string, TentativaBusca>;
  /** Contador geral — pune quem varre vários códigos diferentes rapidamente. */
  global: TentativaBusca;
}

const SEGURANCA_BUSCA_KEY = "angel_paw_seguranca_busca";

/** Depois desse tempo sem nenhuma tentativa, o histórico daquele contador é esquecido. */
const JANELA_RESET_MS = 10 * 60 * 1000; // 10 minutos

function tentativaVazia(): TentativaBusca {
  return { tentativas: 0, ultimaTentativa: 0, bloqueadoAte: 0 };
}

function estadoVazio(): EstadoSegurancaBusca {
  return { porCodigo: {}, global: tentativaVazia() };
}

export async function carregarSegurancaBusca(): Promise<EstadoSegurancaBusca> {
  try {
    const data = await AsyncStorage.getItem(SEGURANCA_BUSCA_KEY);
    return data ? JSON.parse(data) : estadoVazio();
  } catch {
    return estadoVazio();
  }
}

export async function salvarSegurancaBusca(estado: EstadoSegurancaBusca): Promise<void> {
  await AsyncStorage.setItem(SEGURANCA_BUSCA_KEY, JSON.stringify(estado));
}

/** Bloqueio progressivo por código: cresce a cada erro seguido, some quando acerta. */
function duracaoBloqueioPorCodigo(tentativas: number): number {
  if (tentativas >= 10) return 30 * 60 * 1000; // 30 min
  if (tentativas >= 7) return 5 * 60 * 1000; // 5 min
  if (tentativas >= 5) return 60 * 1000; // 1 min
  if (tentativas >= 3) return 15 * 1000; // 15 s
  return 0;
}

/** Bloqueio progressivo geral: mais tolerante, mas pega quem varre vários códigos. */
function duracaoBloqueioGlobal(tentativas: number): number {
  if (tentativas >= 25) return 30 * 60 * 1000;
  if (tentativas >= 15) return 5 * 60 * 1000;
  if (tentativas >= 8) return 60 * 1000;
  return 0;
}

function aplicarJanela(t: TentativaBusca): TentativaBusca {
  const agora = Date.now();
  if (agora >= t.bloqueadoAte && agora - t.ultimaTentativa > JANELA_RESET_MS) {
    return tentativaVazia();
  }
  return t;
}

export interface StatusBloqueio {
  bloqueado: boolean;
  restanteMs: number;
  motivo: "codigo" | "global" | null;
}

/** Chame antes de tentar validar código+PIN, para saber se já está bloqueado. */
export function checarBloqueio(
  estado: EstadoSegurancaBusca,
  chaveCodigo: string
): StatusBloqueio {
  const agora = Date.now();
  const doCodigo = aplicarJanela(estado.porCodigo[chaveCodigo] ?? tentativaVazia());
  const doGlobal = aplicarJanela(estado.global);

  if (doCodigo.bloqueadoAte > agora) {
    return { bloqueado: true, restanteMs: doCodigo.bloqueadoAte - agora, motivo: "codigo" };
  }
  if (doGlobal.bloqueadoAte > agora) {
    return { bloqueado: true, restanteMs: doGlobal.bloqueadoAte - agora, motivo: "global" };
  }
  return { bloqueado: false, restanteMs: 0, motivo: null };
}

/** Chame após uma tentativa que falhou (código não existe OU PIN incorreto). */
export function registrarTentativaFalha(
  estado: EstadoSegurancaBusca,
  chaveCodigo: string
): EstadoSegurancaBusca {
  const agora = Date.now();
  const doCodigo = aplicarJanela(estado.porCodigo[chaveCodigo] ?? tentativaVazia());
  const doGlobal = aplicarJanela(estado.global);

  const novoCodigo: TentativaBusca = {
    tentativas: doCodigo.tentativas + 1,
    ultimaTentativa: agora,
    bloqueadoAte: 0,
  };
  novoCodigo.bloqueadoAte = agora + duracaoBloqueioPorCodigo(novoCodigo.tentativas);

  const novoGlobal: TentativaBusca = {
    tentativas: doGlobal.tentativas + 1,
    ultimaTentativa: agora,
    bloqueadoAte: 0,
  };
  novoGlobal.bloqueadoAte = agora + duracaoBloqueioGlobal(novoGlobal.tentativas);

  return {
    porCodigo: { ...estado.porCodigo, [chaveCodigo]: novoCodigo },
    global: novoGlobal,
  };
}

/** Chame após uma busca bem-sucedida, para não punir mais erros de digitação antigos daquele código. */
export function registrarTentativaSucesso(
  estado: EstadoSegurancaBusca,
  chaveCodigo: string
): EstadoSegurancaBusca {
  const { [chaveCodigo]: _removido, ...resto } = estado.porCodigo;
  return { ...estado, porCodigo: resto };
}

export function formatarTempoRestante(ms: number): string {
  const segundos = Math.max(1, Math.ceil(ms / 1000));
  if (segundos < 60) return `${segundos} segundo${segundos === 1 ? "" : "s"}`;
  const minutos = Math.ceil(segundos / 60);
  return `${minutos} minuto${minutos === 1 ? "" : "s"}`;
}
// ---------------------------------------------------------------------------

/**
 * Valida o formato do PIN de acesso do tutor: exatamente 6 dígitos.
 * Como esse PIN agora é a única trava para ver as notificações de uma
 * ficha, usamos 6 dígitos (1 milhão de combinações) em vez de 4.
 */
export function pinValido(pin: string): boolean {
  return /^\d{6}$/.test(pin.trim());
}

const PINS_OBVIOS = new Set([
  "000000", "111111", "222222", "333333", "444444", "555555",
  "666666", "777777", "888888", "999999",
  "123456", "654321", "012345", "543210",
  "121212", "112233", "010101",
]);

/**
 * Recusa PINs previsíveis (repetidos ou sequenciais). Não impede todo
 * tipo de PIN fraco, mas elimina os primeiros chutes óbvios de quem
 * estiver tentando adivinhar.
 */
export function pinObvio(pin: string): boolean {
  return PINS_OBVIOS.has(pin.trim());
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
