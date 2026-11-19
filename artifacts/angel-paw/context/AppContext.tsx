import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  Admin,
  Anamnese,
  EstadoSegurancaBusca,
  LogAprovacao,
  Medico,
  DisponibilidadeMedico,
  Notificacao,
  PetDados,
  carregarAdmins,
  carregarAnamneses,
  carregarLogAprovacoes,
  carregarMedicos,
  carregarNotificacoes,
  carregarSegurancaBusca,
  checarBloqueio,
  crmvJaCadastrado,
  crmvValido,
  encontrarAdminPorId,
  encontrarMedicoPorId,
  formatarDataHora,
  gerarCodigoPaciente,
  gerarIdAdmin,
  gerarIdMedico,
  hashSenha,
  normalizarCrmv,
  MAX_WHATSAPPS,
  listarWhatsappsMedico,
  normalizarWhatsapp,
  pinValido,
  whatsappValido,
  registrarTentativaFalha,
  registrarTentativaSucesso,
  salvarAdmins,
  salvarAnamneses,
  salvarLogAprovacoes,
  salvarMedicos,
  salvarNotificacoes,
  salvarSegurancaBusca,
} from "@/lib/storage";
import { ResultadoDiagnostico } from "@/lib/diseases";

interface SessionTutor {
  petDados: PetDados | null;
  respostas: Record<string, boolean | string>;
  resultado: ResultadoDiagnostico | null;
}

interface AppContextValue {
  medicos: Record<string, Medico>;
  anamneses: Anamnese[];
  notificacoes: Notificacao[];
  currentVetId: string | null;
  currentAdmin: Admin | null;
  admins: Record<string, Admin>;
  logAprovacoes: LogAprovacao[];
  sessionTutor: SessionTutor;
  carregando: boolean;
  cadastrarMedico: (
    nome: string,
    senha: string,
    crmv: string,
    contato: string,
    localTrabalho: string,
    whatsapp?: string
  ) => Promise<ResultadoCadastroMedico>;
  loginMedico: (id: string, senha: string) => Promise<ResultadoLoginMedico>;
  logoutMedico: () => void;
  definirDisponibilidadeMedico: (disponibilidade: DisponibilidadeMedico) => Promise<void>;
  criarPrimeiroAdmin: (nome: string, senha: string) => Promise<ResultadoCriarAdmin>;
  criarAdmin: (nome: string, senha: string) => Promise<ResultadoCriarAdmin>;
  loginAdmin: (id: string, senha: string) => boolean;
  logoutAdmin: () => void;
  getMedicosPendentes: () => Medico[];
  aprovarMedico: (id: string) => Promise<void>;
  rejeitarMedico: (id: string) => Promise<void>;
  setPetDados: (dados: PetDados) => void;
  setRespostas: (respostas: Record<string, boolean | string>) => void;
  setResultado: (resultado: ResultadoDiagnostico) => void;
  enviarAnamnese: (
    idMedico: string,
    pin: string,
    responsavel?: { nome: string; whatsapp: string }
  ) => Promise<string | null>;
  adicionarNota: (index: number, nota: string) => Promise<void>;
  resetSessionTutor: () => void;
  getAnamnesesPorMedico: (idMedico: string) => Anamnese[];
  definirWhatsappsMedico: (idMedico: string, numeros: string[]) => Promise<boolean>;
  enviarNotificacao: (
    anamneseId: string,
    mensagem: string,
    whatsappNumeros?: string[]
  ) => Promise<boolean>;
  getNotificacoesPorAnamnese: (anamneseId: string) => Notificacao[];
  getNotificacoesPorCodigo: (
    codigoPaciente: string,
    pin: string
  ) => Promise<ResultadoBuscaNotificacoes>;
  marcarNotificacaoComoLida: (id: string) => Promise<void>;
}

export type ResultadoCadastroMedico =
  | { status: "ok"; id: string }
  | { status: "crmv_invalido" }
  | { status: "crmv_duplicado" }
  | { status: "whatsapp_invalido" };

export type ResultadoLoginMedico =
  | { status: "ok" }
  | { status: "invalido" }
  | { status: "pendente" }
  | { status: "rejeitado" };

export type ResultadoCriarAdmin =
  | { status: "ok"; id: string }
  | { status: "ja_existe_admin" } // só relevante para criarPrimeiroAdmin
  | { status: "nao_autorizado" }; // só relevante para criarAdmin

export type ResultadoBuscaNotificacoes =
  | { status: "ok"; notificacoes: Notificacao[] }
  // Código ou PIN incorretos — de propósito não dizemos qual dos dois,
  // pra não ajudar quem está tentando adivinhar um código válido.
  | { status: "invalido" }
  | { status: "bloqueado"; restanteMs: number; motivo: "codigo" | "global" };

const defaultSession: SessionTutor = {
  petDados: null,
  respostas: {},
  resultado: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [medicos, setMedicos] = useState<Record<string, Medico>>({});
  const [anamneses, setAnamneses] = useState<Anamnese[]>([]);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [segurancaBusca, setSegurancaBusca] = useState<EstadoSegurancaBusca>({
    porCodigo: {},
    global: { tentativas: 0, ultimaTentativa: 0, bloqueadoAte: 0 },
  });
  const [currentVetId, setCurrentVetId] = useState<string | null>(null);
  const [admins, setAdmins] = useState<Record<string, Admin>>({});
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [logAprovacoes, setLogAprovacoes] = useState<LogAprovacao[]>([]);
  const [sessionTutor, setSessionTutor] = useState<SessionTutor>(defaultSession);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function init() {
      const [m, a, n, s, ad, log] = await Promise.all([
        carregarMedicos(),
        carregarAnamneses(),
        carregarNotificacoes(),
        carregarSegurancaBusca(),
        carregarAdmins(),
        carregarLogAprovacoes(),
      ]);
      setMedicos(m);
      setAnamneses(a);
      setNotificacoes(n);
      setSegurancaBusca(s);
      setAdmins(ad);
      setLogAprovacoes(log);
      setCarregando(false);
    }
    init();
  }, []);

  const cadastrarMedico = useCallback(
    async (
      nome: string,
      senha: string,
      crmv: string,
      contato: string,
      localTrabalho: string,
      whatsapp?: string
    ): Promise<ResultadoCadastroMedico> => {
      if (!crmvValido(crmv)) {
        return { status: "crmv_invalido" };
      }
      const crmvNormalizado = normalizarCrmv(crmv);
      if (crmvJaCadastrado(medicos, crmvNormalizado)) {
        return { status: "crmv_duplicado" };
      }
      if (whatsapp?.trim() && !whatsappValido(whatsapp)) {
        return { status: "whatsapp_invalido" };
      }

      const id = gerarIdMedico(Object.keys(medicos).length);
      const novoMedico: Medico = {
        id,
        nome,
        senha: hashSenha(senha),
        crmv: crmvNormalizado,
        contato: contato.trim(),
        localTrabalho: localTrabalho.trim(),
        status: "Pendente",
        dataCadastro: formatarDataHora(),
        ...(whatsapp?.trim() ? { whatsapps: [normalizarWhatsapp(whatsapp)] } : {}),
      };
      const novos = { ...medicos, [id]: novoMedico };
      setMedicos(novos);
      await salvarMedicos(novos);
      return { status: "ok", id };
    },
    [medicos]
  );

  const loginMedico = useCallback(
    async (id: string, senha: string): Promise<ResultadoLoginMedico> => {
      const medico = encontrarMedicoPorId(medicos, id);
      if (!medico || medico.senha !== hashSenha(senha)) {
        return { status: "invalido" };
      }
      if (medico.status === "Pendente") {
        return { status: "pendente" };
      }
      if (medico.status === "Rejeitado") {
        return { status: "rejeitado" };
      }
      setCurrentVetId(medico.id);
      return { status: "ok" };
    },
    [medicos]
  );

  const logoutMedico = useCallback(() => {
    setCurrentVetId(null);
  }, []);

  const definirDisponibilidadeMedico = useCallback(
    async (disponibilidade: DisponibilidadeMedico) => {
      if (!currentVetId) return;
      const medico = medicos[currentVetId];
      if (!medico || medico.status !== "Aprovado") return;
      const novos = { ...medicos, [currentVetId]: { ...medico, disponibilidade } };
      setMedicos(novos);
      await salvarMedicos(novos);
    },
    [currentVetId, medicos]
  );

  const criarPrimeiroAdmin = useCallback(
    async (nome: string, senha: string): Promise<ResultadoCriarAdmin> => {
      // Só funciona enquanto não existir NENHUM admin — é o "setup inicial"
      // que, numa instalação real, a própria instituição faria uma única
      // vez, de forma controlada, antes de liberar o app.
      if (Object.keys(admins).length > 0) {
        return { status: "ja_existe_admin" };
      }
      const id = gerarIdAdmin(0);
      const novoAdmin: Admin = {
        id,
        nome: nome.trim(),
        senha: hashSenha(senha),
        dataCriacao: formatarDataHora(),
      };
      const novos = { [id]: novoAdmin };
      setAdmins(novos);
      await salvarAdmins(novos);
      setCurrentAdmin(novoAdmin);
      return { status: "ok", id };
    },
    [admins]
  );

  const criarAdmin = useCallback(
    async (nome: string, senha: string): Promise<ResultadoCriarAdmin> => {
      // Só um admin já autenticado pode criar outro — evita que qualquer
      // pessoa vire admin sozinha depois do setup inicial.
      if (!currentAdmin) {
        return { status: "nao_autorizado" };
      }
      const id = gerarIdAdmin(Object.keys(admins).length);
      const novoAdmin: Admin = {
        id,
        nome: nome.trim(),
        senha: hashSenha(senha),
        dataCriacao: formatarDataHora(),
      };
      const novos = { ...admins, [id]: novoAdmin };
      setAdmins(novos);
      await salvarAdmins(novos);
      return { status: "ok", id };
    },
    [admins, currentAdmin]
  );

  const loginAdmin = useCallback(
    (id: string, senha: string): boolean => {
      const admin = encontrarAdminPorId(admins, id);
      if (admin && admin.senha === hashSenha(senha)) {
        setCurrentAdmin(admin);
        return true;
      }
      return false;
    },
    [admins]
  );

  const logoutAdmin = useCallback(() => {
    setCurrentAdmin(null);
  }, []);

  const getMedicosPendentes = useCallback((): Medico[] => {
    return Object.values(medicos)
      .filter((m) => m.status === "Pendente")
      .sort((a, b) => a.dataCadastro.localeCompare(b.dataCadastro));
  }, [medicos]);

  const aprovarMedico = useCallback(
    async (id: string) => {
      const medico = medicos[id];
      if (!medico || !currentAdmin) return;

      const novos = { ...medicos, [id]: { ...medico, status: "Aprovado" as const } };
      setMedicos(novos);
      await salvarMedicos(novos);

      const entrada: LogAprovacao = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        medicoId: medico.id,
        nomeMedico: medico.nome,
        crmv: medico.crmv,
        acao: "Aprovado",
        adminId: currentAdmin.id,
        nomeAdmin: currentAdmin.nome,
        data: formatarDataHora(),
      };
      const novoLog = [...logAprovacoes, entrada];
      setLogAprovacoes(novoLog);
      await salvarLogAprovacoes(novoLog);
    },
    [medicos, currentAdmin, logAprovacoes]
  );

  const rejeitarMedico = useCallback(
    async (id: string) => {
      const medico = medicos[id];
      if (!medico || !currentAdmin) return;

      const novos = { ...medicos, [id]: { ...medico, status: "Rejeitado" as const } };
      setMedicos(novos);
      await salvarMedicos(novos);

      const entrada: LogAprovacao = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        medicoId: medico.id,
        nomeMedico: medico.nome,
        crmv: medico.crmv,
        acao: "Rejeitado",
        adminId: currentAdmin.id,
        nomeAdmin: currentAdmin.nome,
        data: formatarDataHora(),
      };
      const novoLog = [...logAprovacoes, entrada];
      setLogAprovacoes(novoLog);
      await salvarLogAprovacoes(novoLog);
    },
    [medicos, currentAdmin, logAprovacoes]
  );

  const setPetDados = useCallback((dados: PetDados) => {
    setSessionTutor((prev) => ({ ...prev, petDados: dados }));
  }, []);

  const setRespostas = useCallback((respostas: Record<string, boolean | string>) => {
    setSessionTutor((prev) => ({ ...prev, respostas }));
  }, []);

  const setResultado = useCallback((resultado: ResultadoDiagnostico) => {
    setSessionTutor((prev) => ({ ...prev, resultado }));
  }, []);

  const enviarAnamnese = useCallback(
    async (
      idMedico: string,
      pin: string,
      responsavel?: { nome: string; whatsapp: string }
    ): Promise<string | null> => {
      const { petDados, resultado } = sessionTutor;
      if (!petDados || !resultado) return null;
      if (!pinValido(pin)) return null;
      if (responsavel) {
        if (!responsavel.nome.trim() || !whatsappValido(responsavel.whatsapp)) return null;
      }

      const ficha: Anamnese = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        codigoPaciente: gerarCodigoPaciente(anamneses.map((a) => a.codigoPaciente)),
        pin: hashSenha(pin.trim()),
        idMedico,
        dados: petDados,
        resultado,
        respostas: sessionTutor.respostas,
        status: "Pendente",
        dataEnvio: formatarDataHora(),
        dataAnalise: null,
        notasMedico: "",
        ...(responsavel
          ? {
              responsavel: {
                nome: responsavel.nome.trim(),
                whatsapp: normalizarWhatsapp(responsavel.whatsapp),
              },
            }
          : {}),
      };

      const novas = [...anamneses, ficha];
      setAnamneses(novas);
      await salvarAnamneses(novas);

      return ficha.codigoPaciente;
    },
    [sessionTutor, anamneses]
  );

  const adicionarNota = useCallback(
    async (index: number, nota: string) => {
      const novas = anamneses.map((a, i) => {
        if (i === index) {
          return {
            ...a,
            notasMedico: nota,
            status: "Analisada" as const,
            dataAnalise: formatarDataHora(),
          };
        }
        return a;
      });
      setAnamneses(novas);
      await salvarAnamneses(novas);
    },
    [anamneses]
  );

  const resetSessionTutor = useCallback(() => {
    setSessionTutor(defaultSession);
  }, []);

  const getAnamnesesPorMedico = useCallback(
    (idMedico: string): Anamnese[] => {
      return anamneses.filter((a) => a.idMedico === idMedico);
    },
    [anamneses]
  );

  const definirWhatsappsMedico = useCallback(
    async (idMedico: string, numeros: string[]): Promise<boolean> => {
      const medico = medicos[idMedico];
      if (!medico) return false;
      if (numeros.length > MAX_WHATSAPPS) return false;
      if (!numeros.every((n) => whatsappValido(n))) return false;

      const normalizados = Array.from(new Set(numeros.map(normalizarWhatsapp)));
      // Descarta o campo antigo de número único: a lista nova é a fonte da verdade.
      const { whatsapp: _antigo, ...resto } = medico;
      const novos = {
        ...medicos,
        [idMedico]: { ...resto, whatsapps: normalizados },
      };
      setMedicos(novos);
      await salvarMedicos(novos);
      return true;
    },
    [medicos]
  );

  const enviarNotificacao = useCallback(
    async (
      anamneseId: string,
      mensagem: string,
      whatsappNumeros?: string[]
    ): Promise<boolean> => {
      const ficha = anamneses.find((a) => a.id === anamneseId);
      if (!ficha || !mensagem.trim()) return false;

      const medico = medicos[ficha.idMedico];

      // Com números informados, vira um direcionamento pro WhatsApp. Só sai
      // se todos os números forem mesmo do médico dono da ficha.
      const direcionaWhatsapp = !!whatsappNumeros && whatsappNumeros.length > 0;
      if (direcionaWhatsapp) {
        const doMedico = listarWhatsappsMedico(medico);
        if (!whatsappNumeros!.every((n) => doMedico.includes(n))) return false;
      }

      const notificacao: Notificacao = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        anamneseId: ficha.id,
        codigoPaciente: ficha.codigoPaciente,
        idMedico: ficha.idMedico,
        nomeMedico: medico?.nome ?? "Médico",
        nomePet: ficha.dados.nome,
        mensagem: mensagem.trim(),
        dataEnvio: formatarDataHora(),
        lida: false,
        tipo: direcionaWhatsapp ? "whatsapp_direcionamento" : "mensagem",
        ...(direcionaWhatsapp ? { whatsappNumeros } : {}),
      };

      const novas = [...notificacoes, notificacao];
      setNotificacoes(novas);
      await salvarNotificacoes(novas);
      return true;
    },
    [anamneses, medicos, notificacoes]
  );

  const getNotificacoesPorAnamnese = useCallback(
    (anamneseId: string): Notificacao[] => {
      return notificacoes
        .filter((n) => n.anamneseId === anamneseId)
        .sort((a, b) => b.dataEnvio.localeCompare(a.dataEnvio));
    },
    [notificacoes]
  );

  const getNotificacoesPorCodigo = useCallback(
    async (codigoPaciente: string, pin: string): Promise<ResultadoBuscaNotificacoes> => {
      const codigoBruto = codigoPaciente.trim();
      const codigoNormalizado = codigoBruto.replace(/^0+/, "").padStart(6, "0");
      // Usamos sempre a forma normalizada como chave da trava, senão "1" e
      // "000001" seriam contados como coisas diferentes.
      const chave = codigoNormalizado;

      const bloqueio = checarBloqueio(segurancaBusca, chave);
      if (bloqueio.bloqueado) {
        return { status: "bloqueado", restanteMs: bloqueio.restanteMs, motivo: bloqueio.motivo! };
      }

      const ficha = anamneses.find(
        (a) => a.codigoPaciente === codigoNormalizado || a.codigoPaciente === codigoBruto
      );
      const pinConfere = !!ficha && !!ficha.pin && ficha.pin === hashSenha(pin.trim());

      if (!ficha || !pinConfere) {
        const novoEstado = registrarTentativaFalha(segurancaBusca, chave);
        setSegurancaBusca(novoEstado);
        await salvarSegurancaBusca(novoEstado);
        // Mesma resposta nos dois casos: não revelamos se o código existe.
        return { status: "invalido" };
      }

      const novoEstado = registrarTentativaSucesso(segurancaBusca, chave);
      setSegurancaBusca(novoEstado);
      await salvarSegurancaBusca(novoEstado);

      const lista = notificacoes
        .filter((n) => n.codigoPaciente === ficha.codigoPaciente)
        .sort((a, b) => b.dataEnvio.localeCompare(a.dataEnvio));
      return { status: "ok", notificacoes: lista };
    },
    [anamneses, notificacoes, segurancaBusca]
  );

  const marcarNotificacaoComoLida = useCallback(
    async (id: string) => {
      const novas = notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n));
      setNotificacoes(novas);
      await salvarNotificacoes(novas);
    },
    [notificacoes]
  );

  return (
    <AppContext.Provider
      value={{
        medicos,
        anamneses,
        notificacoes,
        currentVetId,
        currentAdmin,
        admins,
        logAprovacoes,
        sessionTutor,
        carregando,
        cadastrarMedico,
        loginMedico,
        logoutMedico,
        definirDisponibilidadeMedico,
        criarPrimeiroAdmin,
        criarAdmin,
        loginAdmin,
        logoutAdmin,
        getMedicosPendentes,
        aprovarMedico,
        rejeitarMedico,
        setPetDados,
        setRespostas,
        setResultado,
        enviarAnamnese,
        adicionarNota,
        resetSessionTutor,
        getAnamnesesPorMedico,
        definirWhatsappsMedico,
        enviarNotificacao,
        getNotificacoesPorAnamnese,
        getNotificacoesPorCodigo,
        marcarNotificacaoComoLida,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
