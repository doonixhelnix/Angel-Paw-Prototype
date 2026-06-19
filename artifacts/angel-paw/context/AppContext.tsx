import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  Anamnese,
  Medico,
  PetDados,
  carregarAnamneses,
  carregarMedicos,
  formatarDataHora,
  hashSenha,
  salvarAnamneses,
  salvarMedicos,
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
  currentVetId: string | null;
  sessionTutor: SessionTutor;
  carregando: boolean;
  cadastrarMedico: (nome: string, senha: string) => Promise<string>;
  loginMedico: (id: string, senha: string) => Promise<boolean>;
  logoutMedico: () => void;
  setPetDados: (dados: PetDados) => void;
  setRespostas: (respostas: Record<string, boolean | string>) => void;
  setResultado: (resultado: ResultadoDiagnostico) => void;
  enviarAnamnese: (idMedico: string) => Promise<boolean>;
  adicionarNota: (index: number, nota: string) => Promise<void>;
  resetSessionTutor: () => void;
  getAnamnesesPorMedico: (idMedico: string) => Anamnese[];
}

const defaultSession: SessionTutor = {
  petDados: null,
  respostas: {},
  resultado: null,
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [medicos, setMedicos] = useState<Record<string, Medico>>({});
  const [anamneses, setAnamneses] = useState<Anamnese[]>([]);
  const [currentVetId, setCurrentVetId] = useState<string | null>(null);
  const [sessionTutor, setSessionTutor] = useState<SessionTutor>(defaultSession);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function init() {
      const [m, a] = await Promise.all([carregarMedicos(), carregarAnamneses()]);
      setMedicos(m);
      setAnamneses(a);
      setCarregando(false);
    }
    init();
  }, []);

  const cadastrarMedico = useCallback(
    async (nome: string, senha: string): Promise<string> => {
      const id = String(Object.keys(medicos).length + 1);
      const novos = {
        ...medicos,
        [id]: { id, nome, senha: hashSenha(senha) },
      };
      setMedicos(novos);
      await salvarMedicos(novos);
      return id;
    },
    [medicos]
  );

  const loginMedico = useCallback(
    async (id: string, senha: string): Promise<boolean> => {
      const medico = medicos[id];
      if (medico && medico.senha === hashSenha(senha)) {
        setCurrentVetId(id);
        return true;
      }
      return false;
    },
    [medicos]
  );

  const logoutMedico = useCallback(() => {
    setCurrentVetId(null);
  }, []);

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
    async (idMedico: string): Promise<boolean> => {
      const { petDados, resultado } = sessionTutor;
      if (!petDados || !resultado) return false;

      const ficha: Anamnese = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        idMedico,
        dados: petDados,
        resultado,
        status: "Pendente",
        dataEnvio: formatarDataHora(),
        dataAnalise: null,
        notasMedico: "",
      };

      const novas = [...anamneses, ficha];
      setAnamneses(novas);
      await salvarAnamneses(novas);
      return true;
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

  return (
    <AppContext.Provider
      value={{
        medicos,
        anamneses,
        currentVetId,
        sessionTutor,
        carregando,
        cadastrarMedico,
        loginMedico,
        logoutMedico,
        setPetDados,
        setRespostas,
        setResultado,
        enviarAnamnese,
        adicionarNota,
        resetSessionTutor,
        getAnamnesesPorMedico,
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
