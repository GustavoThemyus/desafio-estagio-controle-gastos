import type { TotalPessoa } from "../types";
import { formatarMoeda } from "../types";

interface GraficoBarrasProps {
  pessoas: TotalPessoa[];
}

export function GraficoBarras({ pessoas }: GraficoBarrasProps) {
  const maiorValor = Math.max(
    0,
    ...pessoas.map((p) => Math.max(p.totalReceitas, p.totalDespesas)),
  );

  const ranking = [...pessoas].sort(
    (a, b) =>
      b.totalReceitas + b.totalDespesas - (a.totalReceitas + a.totalDespesas),
  );

  if (maiorValor === 0) {
    return (
      <section className="grafico-secao grafico-barras-secao">
        <h2>Ranking por pessoa</h2>
        <p className="grafico-vazio">
          Cadastre transações para ver o ranking de cada pessoa.
        </p>
      </section>
    );
  }

  return (
    <section className="grafico-secao grafico-barras-secao">
      <h2>Ranking por pessoa</h2>
      <div className="grafico-barras">
        <div className="grafico-barras-plot">
          {ranking.map((p) => (
            <div key={p.pessoaId} className="grafico-barras-grupo">
              <div className="grafico-barras-valores">
                <span className="valor-receita">
                  {formatarMoeda(p.totalReceitas)}
                </span>
                <span className="valor-despesa">
                  {formatarMoeda(p.totalDespesas)}
                </span>
              </div>
              <div className="grafico-barras-colunas">
                <div
                  className="grafico-barras-coluna receita"
                  style={{ height: `${(p.totalReceitas / maiorValor) * 100}%` }}
                />
                <div
                  className="grafico-barras-coluna despesa"
                  style={{ height: `${(p.totalDespesas / maiorValor) * 100}%` }}
                />
              </div>
              <span className="grafico-barras-nome">{p.nome}</span>
            </div>
          ))}
        </div>

        <ul className="grafico-barras-legenda">
          <li>
            <span className="grafico-legenda-cor receita" />
            Receitas
          </li>
          <li>
            <span className="grafico-legenda-cor despesa" />
            Despesas
          </li>
        </ul>
      </div>
    </section>
  );
}
