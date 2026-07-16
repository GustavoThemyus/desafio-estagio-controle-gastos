import { useEffect, useRef, useState } from "react";

export interface OpcaoSeletor {
  valor: string;
  rotulo: string;
}

interface SeletorProps {
  valor: string;
  opcoes: OpcaoSeletor[];
  aoMudar: (valor: string) => void;
  placeholder?: string;
}

/* Dropdown customizado, substituindo o <select> nativo */
export function Seletor({ valor, opcoes, aoMudar, placeholder }: SeletorProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const opcaoSelecionada = opcoes.find((o) => o.valor === valor);

  // Fecha o dropdown se o usuário clicar em qualquer lugar fora dele
  useEffect(() => {
    function aoClicarFora(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  function selecionar(novoValor: string) {
    aoMudar(novoValor);
    setAberto(false);
  }

  return (
    <div className="seletor" ref={containerRef}>
      <button
        type="button"
        className={`seletor-botao ${aberto ? "aberto" : ""}`}
        onClick={() => setAberto((estava) => !estava)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
      >
        <span className={opcaoSelecionada ? "" : "seletor-placeholder"}>
          {opcaoSelecionada?.rotulo ?? placeholder ?? "Selecione"}
        </span>
      </button>

      {aberto && (
        <ul className="seletor-lista" role="listbox">
          {opcoes.map((opcao) => (
            <li
              key={opcao.valor}
              role="option"
              aria-selected={opcao.valor === valor}
              className={`seletor-opcao ${opcao.valor === valor ? "selecionada" : ""}`}
              onClick={() => selecionar(opcao.valor)}
            >
              {opcao.rotulo}
            </li>
          ))}
          {opcoes.length === 0 && (
            <li className="seletor-opcao seletor-opcao-vazia">
              Nenhuma opção disponível
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
