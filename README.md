# Controle de Gastos Residenciais

Projeto do desafio técnico: back-end em .NET/C# + front-end em React/TypeScript.

## Estrutura

```
desafio-estagio/
├── backend/ControleGastos.Api/   -> API em C# (.NET 8)
└── frontend/                     -> App em React + TypeScript (Vite)
```

## Como rodar

### 1. Back-end (precisa do .NET 8 SDK instalado)

```bash
cd backend/ControleGastos.Api
dotnet run
```

A API sobe em `http://localhost:5000`. Na primeira execução, ela cria uma pasta
`data/` com um arquivo `dados.json` — é ali que os dados ficam salvos entre uma
execução e outra (é o "banco de dados" deste projeto).

### 2. Front-end

```bash
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173`. Ele já está configurado para conversar com a
API em `http://localhost:5000` (veja `frontend/src/api.ts`).

> Importante: rode o back-end e o front-end **ao mesmo tempo**, em dois terminais.

## Por que persistência em arquivo JSON, e não um banco de dados de verdade?

O desafio pede que os dados persistam depois de fechar a aplicação, mas não
exige um SGBD (SQL Server, Postgres, etc). Usar um arquivo JSON em disco
(`backend/ControleGastos.Api/data/dados.json`) resolve exatamente esse
requisito, sem exigir instalar/configurar um banco externo — o projeto roda
em qualquer máquina só com o SDK do .NET instalado. Toda a lógica disso está
isolada em `Services/DataStore.cs`, então trocar isso por um banco real no
futuro (ex: Entity Framework + SQLite) não afetaria o resto do código.

## Onde está cada regra de negócio

| Regra do desafio | Onde foi implementada |
|---|---|
| Id gerado automaticamente | `DataStore.CriarPessoa` / `CriarTransacao` (`Guid.NewGuid()`) |
| Deletar pessoa apaga as transações dela (cascata) | `DataStore.RemoverPessoa` |
| Menor de 18 anos só pode ter Despesa | `Program.cs`, endpoint `POST /transacoes` |
| Transação precisa referenciar uma pessoa que existe | `Program.cs`, endpoint `POST /transacoes` |
| Totais por pessoa + total geral | `Program.cs`, endpoint `GET /totais` |

## Endpoints da API

| Método | Rota | O que faz |
|---|---|---|
| GET | `/pessoas` | Lista todas as pessoas |
| POST | `/pessoas` | Cria uma pessoa (`{ nome, idade }`) |
| DELETE | `/pessoas/{id}` | Remove a pessoa e suas transações |
| GET | `/transacoes` | Lista todas as transações |
| POST | `/transacoes` | Cria uma transação (`{ descricao, valor, tipo, pessoaId }`) |
| DELETE | `/transacoes/{id}` | Remove uma transação (funcionalidade extra, não exigida pelo desafio) |
| GET | `/totais` | Totais de receita/despesa/saldo por pessoa + total geral |

## Tema (claro/escuro) e paleta de cores

O front-end tem um botão que alterna entre modo claro e escuro (a escolha
fica salva no navegador). Toda a paleta é definida por variáveis CSS em
`frontend/src/index.css`, com um critério fixo de onde cada cor entra:

- **Azul/índigo (`--accent`)**: reservado só para ações principais e navegação
  (botão de "Adicionar...", aba selecionada).
- **Verde/vermelho (`--receita` / `--despesa`)**: reservado só para valores
  financeiros (receita, despesa, saldo) e para ações destrutivas (botões
  "Remover"), já que remover é conceitualmente parecido com uma "saída".
- **Cores neutras (`--fg`, `--borda`)**: todo o resto (textos comuns, bordas
  de input/tabela), pra não competir visualmente com os números.

## Observação sobre este ambiente

Este código foi escrito com bastante cuidado e comentado passo a passo, mas
**o front-end foi testado de verdade aqui (build passou sem erros)**; já o
back-end em C# **não pôde ser compilado/executado neste ambiente** porque o
.NET SDK não está disponível aqui. Ou seja: revise o back-end com atenção
antes de entregar, e rode `dotnet run` na sua máquina para confirmar que
sobe sem erros — se aparecer algum erro de compilação, me manda a mensagem
que eu te ajudo a resolver.
