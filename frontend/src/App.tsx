import { useEffect, useState } from "react";
import { PessoasPage } from "./components/PessoasPage";
import { TransacoesPage } from "./components/TransacoesPage";
import { TotaisPage } from "./components/TotaisPage";

type Aba = "pessoas" | "transacoes" | "totais";
type Tema = "light" | "dark";

const CHAVE_TEMA_SALVO = "controle-gastos:tema";

/**
 * Tema inicial, em ordem de prioridade: preferência salva > preferência do
 * sistema operacional > claro (padrão)
 */
function temaInicial(): Tema {
  const salvo = localStorage.getItem(CHAVE_TEMA_SALVO);
  if (salvo === "light" || salvo === "dark") {
    return salvo;
  }

  const prefereEscuro = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  return prefereEscuro ? "dark" : "light";
}

/**
 * Componente raiz. Navegação por abas com estado local em vez de uma
 * biblioteca de rotas, suficiente para as 3 telas do sistema
 */
function App() {
  const [aba, setAba] = useState<Aba>("pessoas");
  const [tema, setTema] = useState<Tema>(temaInicial);

  // Aplica o tema via atributo data-theme (usado pelas variáveis CSS)
  // e persiste a escolha para a próxima visita.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem(CHAVE_TEMA_SALVO, tema);
  }, [tema]);

  function alternarTema() {
    setTema((atual) => (atual === "light" ? "dark" : "light"));
  }

  return (
    <div className="app">
      <div className="cabecalho">
        <h1>Controle de Gastos Residenciais</h1>
        <button className="botao-tema" onClick={alternarTema}>
          {tema === "light" ? "Modo escuro" : "Modo claro"}
        </button>
      </div>

      <nav className="abas">
        <button
          className={aba === "pessoas" ? "ativo" : ""}
          onClick={() => setAba("pessoas")}
        >
          Pessoas
        </button>
        <button
          className={aba === "transacoes" ? "ativo" : ""}
          onClick={() => setAba("transacoes")}
        >
          Transações
        </button>
        <button
          className={aba === "totais" ? "ativo" : ""}
          onClick={() => setAba("totais")}
        >
          Totais
        </button>
      </nav>

      <main>
        {aba === "pessoas" && <PessoasPage />}
        {aba === "transacoes" && <TransacoesPage />}
        {aba === "totais" && <TotaisPage />}
      </main>
    </div>
  );
}

export default App;
