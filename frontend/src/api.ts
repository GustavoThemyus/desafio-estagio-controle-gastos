import type {
  Pessoa,
  Transacao,
  TotaisGerais,
  TipoTransacao,
  ErroResponse,
} from "./types";

// Porta definida em backend/ControleGastos.Api/Properties/launchSettings.json
const BASE_URL = "http://localhost:5000";

/**
 * Wrapper central de fetch: normaliza tratamento de erro (lê a mensagem
 * enviada pelo back-end em ErroResponse) e serialização de resposta,
 * permitindo que cada chamada da API use try/catch
 */
async function requisitar<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });

  if (!resposta.ok) {
    let mensagem = `Erro na requisição (status ${resposta.status})`;
    try {
      const corpo: ErroResponse = await resposta.json();
      mensagem = corpo.mensagem ?? mensagem;
    } catch {
      // se o corpo do erro não for um JSON válido, mantém a mensagem genérica
    }
    throw new Error(mensagem);
  }

  // Requisições como DELETE retornam 204 No Content, sem corpo pra converter em JSON
  if (resposta.status === 204) {
    return undefined as T;
  }

  return resposta.json() as Promise<T>;
}

export const api = {
  listarPessoas: () => requisitar<Pessoa[]>("/pessoas"),

  criarPessoa: (nome: string, idade: number) =>
    requisitar<Pessoa>("/pessoas", {
      method: "POST",
      body: JSON.stringify({ nome, idade }),
    }),

  removerPessoa: (id: string) =>
    requisitar<void>(`/pessoas/${id}`, { method: "DELETE" }),

  listarTransacoes: () => requisitar<Transacao[]>("/transacoes"),

  criarTransacao: (
    descricao: string,
    valor: number,
    tipo: TipoTransacao,
    pessoaId: string
  ) =>
    requisitar<Transacao>("/transacoes", {
      method: "POST",
      body: JSON.stringify({ descricao, valor, tipo, pessoaId }),
    }),

  removerTransacao: (id: string) =>
    requisitar<void>(`/transacoes/${id}`, { method: "DELETE" }),

  buscarTotais: () => requisitar<TotaisGerais>("/totais"),
};
