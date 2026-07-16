import { useEffect, useState } from "react";
import { api } from "../api";
import type { Pessoa } from "../types";

/**
 * Tela de cadastro de pessoas.
 * Responsabilidades:
 *  - Listar as pessoas já cadastradas
 *  - Criar uma nova pessoa (nome + idade)
 *  - Remover uma pessoa (o back-end já cuida de apagar as transações dela junto)
 */
export function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function carregarPessoas() {
    const lista = await api.listarPessoas();
    setPessoas(lista);
  }

  // Ao montar o componente pela primeira vez, busca a lista atual no back-end.
  useEffect(() => {
    carregarPessoas().catch((e) => setErro(e.message));
  }, []);

  async function handleCriar(event: React.FormEvent) {
    event.preventDefault(); // evita que o navegador recarregue a página ao enviar o form
    setErro(null);

    if (!nome.trim() || idade === "") {
      setErro("Preencha nome e idade.");
      return;
    }

    setCarregando(true);
    try {
      await api.criarPessoa(nome.trim(), Number(idade));
      setNome("");
      setIdade("");
      await carregarPessoas();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleRemover(id: string, nome: string) {
    const confirmou = window.confirm(
      `Remover ${nome}? Todas as transações dessa pessoa também serão apagadas. Essa ação não pode ser desfeita.`
    );
    if (!confirmou) return;

    setErro(null);
    try {
      await api.removerPessoa(id);
      await carregarPessoas();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  return (
    <section>
      <h2>Pessoas</h2>

      <form onSubmit={handleCriar} className="formulario">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="number"
          placeholder="Idade"
          value={idade}
          min={0}
          onChange={(e) => setIdade(e.target.value)}
        />
        <button type="submit" disabled={carregando}>
          Adicionar pessoa
        </button>
      </form>

      {erro && <p className="erro">{erro}</p>}

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Idade</th>
            <th>Menor de idade?</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pessoas.map((pessoa) => (
            <tr key={pessoa.id}>
              <td>{pessoa.nome}</td>
              <td>{pessoa.idade}</td>
              <td>{pessoa.ehMenorDeIdade ? "Sim" : "Não"}</td>
              <td>
                <button className="perigo" onClick={() => handleRemover(pessoa.id, pessoa.nome)}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
          {pessoas.length === 0 && (
            <tr>
              <td colSpan={4}>Nenhuma pessoa cadastrada ainda.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
