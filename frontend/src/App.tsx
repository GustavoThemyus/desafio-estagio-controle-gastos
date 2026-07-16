import { useEffect, useState } from "react";
import { PessoasPage } from "./components/PessoasPage";
import { TransacoesPage } from "./components/TransacoesPage";
import { TotaisPage } from "./components/TotaisPage";

type Aba = "pessoas" | "transacoes" | "totais";
type Tema = "light" | "dark";

const CHAVE_TEMA_SALVO = "controle-gastos:tema";

/**
 * Descobre o tema inicial, na seguinte ordem de prioridade:
 * 1. O que o usuário escolheu antes (salvo no localStorage do navegador)
 * 2. A preferência do sistema operacional (claro/escuro)
 * 3. Claro, como padrão de segurança
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
 * Componente raiz da aplicação.
 * Não usei nenhuma biblioteca de rotas (como react-router) de propósito:
 * como o app só tem 3 telas simples, um estado local controlando qual aba
 * está ativa já resolve, sem adicionar complexidade desnecessária.
 */
function App() {
  const [aba, setAba] = useState<Aba>("pessoas");
  const [tema, setTema] = useState<Tema>(temaInicial);

  // Sempre que o tema mudar, aplica o atributo data-theme no <html>
  // (é isso que o index.css usa para trocar as variáveis de cor)
  // e salva a escolha para lembrar na próxima visita.
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
