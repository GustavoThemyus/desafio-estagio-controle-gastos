import { formatarMoeda } from "../types";

interface GraficoPizzaProps {
  totalReceitas: number;
  totalDespesas: number;
}

/**
 * Gráfico de pizza (na verdade um "donut", pizza com buraco no meio) que
 * mostra a proporção entre receitas e despesas de todo o sistema.
 *
 * Não usei nenhuma biblioteca de gráficos pra isso — com só 2 fatias,
 * um `conic-gradient` em CSS resolve tudo sozinho, sem precisar calcular
 * ângulos de SVG na mão nem carregar uma lib externa.
 */
export function GraficoPizza({ totalReceitas, totalDespesas }: GraficoPizzaProps) {
  const total = totalReceitas + totalDespesas;
  const saldo = totalReceitas - totalDespesas;

  if (total === 0) {
    return (
      <section className="grafico-secao">
        <h2>Panorama geral</h2>
        <p className="grafico-vazio">
          Cadastre transações para ver o gráfico de receitas x despesas.
        </p>
      </section>
    );
  }

  // Percentual de receita dentro do total (despesa é o "resto", 100 - isso).
  const percentualReceita = (totalReceitas / total) * 100;

  return (
    <section className="grafico-secao">
      <h2>Panorama geral</h2>
      <div className="grafico-pizza">
        <div
          className="grafico-pizza-circulo"
          style={{
            background: `conic-gradient(var(--receita) 0% ${percentualReceita}%, var(--despesa) ${percentualReceita}% 100%)`,
          }}
        >
          <div className="grafico-pizza-centro">
            <span className="grafico-pizza-centro-rotulo">Saldo</span>
            <span className={saldo >= 0 ? "saldo-positivo" : "saldo-negativo"}>
              {formatarMoeda(saldo)}
            </span>
          </div>
        </div>

        <ul className="grafico-legenda">
          <li>
            <span className="grafico-legenda-cor receita" />
            Receitas — {formatarMoeda(totalReceitas)} ({percentualReceita.toFixed(0)}%)
          </li>
          <li>
            <span className="grafico-legenda-cor despesa" />
            Despesas — {formatarMoeda(totalDespesas)} ({(100 - percentualReceita).toFixed(0)}%)
          </li>
        </ul>
      </div>
    </section>
  );
}
