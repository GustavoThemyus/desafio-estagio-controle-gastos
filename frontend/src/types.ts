// Tipos espelham os DTOs/Models do back-end (C#), mantendo o contrato da API consistente entre os dois lados
export type TipoTransacao = "Receita" | "Despesa";

export interface Pessoa {
  id: string;
  nome: string;
  idade: number;
  ehMenorDeIdade: boolean;
}

export interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  pessoaId: string;
}

export interface TotalPessoa {
  pessoaId: string;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export interface TotaisGerais {
  pessoas: TotalPessoa[];
  totalReceitasGeral: number;
  totalDespesasGeral: number;
  saldoGeral: number;
}

export interface ErroResponse {
  mensagem: string;
}

/**
 * Formata valores como moeda brasileira (ex: 1234.5 pra "R$ 1.234,50")
 * usando Intl.NumberFormat, evitando implementação manual de separadores
 */
const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarMoeda(valor: number): string {
  return formatadorMoeda.format(valor);
}
