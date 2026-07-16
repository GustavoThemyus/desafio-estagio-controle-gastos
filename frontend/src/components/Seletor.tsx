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

/**
 * Dropdown customizado, feito do zero em React, pra substituir o <select>
 * nativo do navegador.
 *
 * Por que não dava pra só estilizar o <select> com CSS?
 * O <select> nativo tem duas partes: a caixinha fechada (essa dá pra
 * estilizar bem com `appearance: none` + CSS) e a LISTA que abre quando
 * você clica nela. Essa lista é desenhada pelo sistema operacional, não
 * pelo navegador — o CSS simplesmente não tem acesso a ela. É por isso que,
 * mesmo estilizando a caixinha, a lista continuava com a "cara de HTML"
 * (ou pior, cara do sistema operacional). A única forma de controlar 100%
 * a aparência é não usar o elemento <select> de verdade, e sim montar a
 * nossa própria versão com HTML comum (um botão + uma lista) — que é
 * exatamente o que este componente faz.
 */
export function Seletor({ valor, opcoes, aoMudar, placeholder }: SeletorProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const opcaoSelecionada = opcoes.find((o) => o.valor === valor);

  // Fecha o dropdown se o usuário clicar em qualquer lugar fora dele.
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
