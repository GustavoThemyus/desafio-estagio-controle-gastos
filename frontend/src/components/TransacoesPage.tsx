import { useEffect, useState } from "react";
import { api } from "../api";
import { Seletor } from "./Seletor";
import type { Pessoa, Transacao, TipoTransacao } from "../types";
import { formatarMoeda } from "../types";

/**
 * Tela de cadastro de transações
 * Regras importantes que o back-end aplica (e aqui só refletimos na interface):
 *  - a pessoa escolhida precisa existir (por isso o select só mostra pessoas já cadastradas)
 *  - se a pessoa for menor de idade, só pode lançar "Despesa"
 */
export function TransacoesPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>("Despesa");
  const [pessoaId, setPessoaId] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function carregarTudo() {
    const [listaPessoas, listaTransacoes] = await Promise.all([
      api.listarPessoas(),
      api.listarTransacoes(),
    ]);
    setPessoas(listaPessoas);
    setTransacoes(listaTransacoes);
  }

  useEffect(() => {
    carregarTudo().catch((e) => setErro(e.message));
  }, []);

  const pessoaSelecionada = pessoas.find((p) => p.id === pessoaId);

  // Feedback imediato na UI: se a pessoa selecionada for menor de idade e o
  // tipo estava em "Receita", força "Despesa" antes mesmo do envio ao back-end
  useEffect(() => {
    if (pessoaSelecionada?.ehMenorDeIdade && tipo === "Receita") {
      setTipo("Despesa");
    }
  }, [pessoaSelecionada, tipo]);

  async function handleCriar(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);

    if (!descricao.trim() || !valor || !pessoaId) {
      setErro("Preencha descrição, valor e selecione uma pessoa.");
      return;
    }

    setCarregando(true);
    try {
      await api.criarTransacao(descricao.trim(), Number(valor), tipo, pessoaId);
      setDescricao("");
      setValor("");
      await carregarTudo();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  function nomeDaPessoa(id: string) {
    return pessoas.find((p) => p.id === id)?.nome ?? "(pessoa removida)";
  }

  async function handleRemover(id: string) {
    const confirmou = window.confirm("Remover esta transação? Essa ação não pode ser desfeita.");
    if (!confirmou) return;

    setErro(null);
    try {
      await api.removerTransacao(id);
      await carregarTudo();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <section>
      <h2>Transações</h2>

      <form onSubmit={handleCriar} className="formulario">
        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <input
          type="number"
          placeholder="Valor"
          value={valor}
          min={0}
          step="0.01"
          onChange={(e) => setValor(e.target.value)}
        />
        <Seletor
          valor={tipo}
          aoMudar={(v) => setTipo(v as TipoTransacao)}
          opcoes={[
            { valor: "Despesa", rotulo: "Despesa" },
            // Oculta "Receita" quando a pessoa selecionada é menor de idade
            ...(!pessoaSelecionada?.ehMenorDeIdade
              ? [{ valor: "Receita", rotulo: "Receita" }]
              : []),
          ]}
        />
        <Seletor
          valor={pessoaId}
          aoMudar={setPessoaId}
          placeholder="Pessoa"
          opcoes={pessoas.map((p) => ({
            valor: p.id,
            rotulo: `${p.nome}${p.ehMenorDeIdade ? " (menor de idade)" : ""}`,
          }))}
        />
        <button type="submit" disabled={carregando}>
          Adicionar transação
        </button>
      </form>

      {pessoas.length === 0 && (
        <p>Cadastre uma pessoa primeiro na aba "Pessoas".</p>
      )}

      {erro && <p className="erro">{erro}</p>}

      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Tipo</th>
            <th>Pessoa</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transacoes.map((t) => (
            <tr key={t.id}>
              <td>{t.descricao}</td>
              <td className={t.tipo === "Receita" ? "valor-receita" : "valor-despesa"}>
                {formatarMoeda(t.valor)}
              </td>
              <td>
                <span className={`selo ${t.tipo === "Receita" ? "receita" : "despesa"}`}>
                  {t.tipo}
                </span>
              </td>
              <td>{nomeDaPessoa(t.pessoaId)}</td>
              <td>
                <button className="perigo" onClick={() => handleRemover(t.id)}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
          {transacoes.length === 0 && (
            <tr>
              <td colSpan={5}>Nenhuma transação cadastrada ainda.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
