interface GraficoTotaisProps {
  totalReceitas: number;
  totalDespesas: number;
}

/**
 * Gráfico de pizza (na prática, uma rosquinha) mostrando a proporção entre
 * receitas e despesas de todo o sistema.
 *
 * Como funciona o truque do SVG: em vez de desenhar "fatias" de verdade
 * (o que exigiria calcular arcos com trigonometria), usamos dois círculos
 * com contorno grosso (strokeWidth) e "cortamos" esse contorno em pedaços
 * usando `stroke-dasharray` (define o tamanho do traço e do espaço vazio)
 * e `stroke-dashoffset` (onde o traço começa a ser desenhado ao redor do
 * círculo). É uma técnica clássica de gráfico de pizza em SVG, bem mais
 * simples que desenhar arcos manualmente — e não precisa de nenhuma
 * biblioteca de gráficos.
 */
export function GraficoTotais({ totalReceitas, totalDespesas }: GraficoTotaisProps) {
  const total = totalReceitas + totalDespesas;
  const temDados = total > 0;

  const raio = 70;
  const espessura = 28;
  const circunferencia = 2 * Math.PI * raio;

  const fracaoReceita = temDados ? totalReceitas / total : 0;
  const fracaoDespesa = temDados ? totalDespesas / total : 0;

  const comprimentoReceita = circunferencia * fracaoReceita;
  const comprimentoDespesa = circunferencia * fracaoDespesa;

  return (
    <section className="grafico-secao">
      <h3>Distribuição geral: receitas x despesas</h3>

      {!temDados ? (
        <p className="grafico-vazio">
          Cadastre transações para ver o gráfico aparecer aqui.
        </p>
      ) : (
        <div className="grafico-conteudo">
          <svg viewBox="0 0 180 180" width="180" height="180" className="grafico-pizza">
            {/* Fatia de despesas (vermelha): desenhada primeiro, ocupando o
                trecho do círculo logo depois de onde a fatia de receitas termina. */}
            {totalDespesas > 0 && (
              <circle
                cx="90"
                cy="90"
                r={raio}
                fill="none"
                stroke="var(--despesa)"
                strokeWidth={espessura}
                strokeDasharray={`${comprimentoDespesa} ${circunferencia - comprimentoDespesa}`}
                strokeDashoffset={-comprimentoReceita}
                transform="rotate(-90 90 90)"
              />
            )}
            {/* Fatia de receitas (verde): começa no topo do círculo (por isso
                o rotate(-90), senão o SVG começaria a desenhar às 3 horas). */}
            {totalReceitas > 0 && (
              <circle
                cx="90"
                cy="90"
                r={raio}
                fill="none"
                stroke="var(--receita)"
                strokeWidth={espessura}
                strokeDasharray={`${comprimentoReceita} ${circunferencia - comprimentoReceita}`}
                transform="rotate(-90 90 90)"
              />
            )}
          </svg>

          <ul className="grafico-legenda">
            <li>
              <span className="legenda-cor legenda-receita" />
              Receitas — R$ {totalReceitas.toFixed(2)} ({Math.round(fracaoReceita * 100)}%)
            </li>
            <li>
              <span className="legenda-cor legenda-despesa" />
              Despesas — R$ {totalDespesas.toFixed(2)} ({Math.round(fracaoDespesa * 100)}%)
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}
