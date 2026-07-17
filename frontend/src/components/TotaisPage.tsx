import { useEffect, useState } from "react";
import { api } from "../api";
import { GraficoPizza } from "./GraficoPizza";
import { GraficoBarras } from "./GraficoBarras";
import type { TotaisGerais } from "../types";
import { formatarMoeda } from "../types";

/**
 * Tela de consulta de totais: mostra receitas, despesas e saldo de cada pessoa,
 * e no final o total geral somando todo mundo
 * Todo o cálculo é feito no back-end (endpoint GET /totais); aqui só exibe
 */
export function TotaisPage() {
  const [totais, setTotais] = useState<TotaisGerais | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api
      .buscarTotais()
      .then(setTotais)
      .catch((e) => setErro(e.message));
  }, []);

  if (erro) return <p className="erro">{erro}</p>;
  if (!totais) return <p>Carregando...</p>;

  return (
    <section>
      <h2>Consulta de totais</h2>

      <table>
        <thead>
          <tr>
            <th>Pessoa</th>
            <th>Total receitas</th>
            <th>Total despesas</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {totais.pessoas.map((p) => (
            <tr key={p.pessoaId}>
              <td>{p.nome}</td>
              <td className="valor-receita">
                {formatarMoeda(p.totalReceitas)}
              </td>
              <td className="valor-despesa">
                {formatarMoeda(p.totalDespesas)}
              </td>
              <td
                className={p.saldo >= 0 ? "saldo-positivo" : "saldo-negativo"}
              >
                {formatarMoeda(p.saldo)}
              </td>
            </tr>
          ))}
          {totais.pessoas.length === 0 && (
            <tr>
              <td colSpan={4}>Nenhuma pessoa cadastrada ainda.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <strong>Total geral</strong>
            </td>
            <td className="valor-receita">
              <strong>{formatarMoeda(totais.totalReceitasGeral)}</strong>
            </td>
            <td className="valor-despesa">
              <strong>{formatarMoeda(totais.totalDespesasGeral)}</strong>
            </td>
            <td
              className={
                totais.saldoGeral >= 0 ? "saldo-positivo" : "saldo-negativo"
              }
            >
              <strong>{formatarMoeda(totais.saldoGeral)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="graficos-container">
        <GraficoPizza
          totalReceitas={totais.totalReceitasGeral}
          totalDespesas={totais.totalDespesasGeral}
        />
        <GraficoBarras pessoas={totais.pessoas} />
      </div>
    </section>
  );
}
