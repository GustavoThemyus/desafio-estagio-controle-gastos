// Estes tipos espelham exatamente os DTOs/Models do back-end em C#.
// Manter os dois lados "sincronizados" evita bugs de "o campo não existe"
// ou "o campo tem outro nome" na hora de ler a resposta da API.

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
 * Formata um número como moeda brasileira (ex: 1234.5 -> "R$ 1.234,50").
 * Usar Intl.NumberFormat em vez de `R$ ${valor.toFixed(2)}` evita bugs sutis
 * (separador de milhar, vírgula decimal) e é o jeito nativo do navegador
 * de lidar com formatação regional, sem precisar de nenhuma biblioteca.
 */
const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarMoeda(valor: number): string {
  return formatadorMoeda.format(valor);
}
