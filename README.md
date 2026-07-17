# Controle de Gastos Residenciais

Projeto do desafio técnico: back-end em .NET/C# + front-end em React/TypeScript.

## Estrutura

```
backend/ControleGastos.Api/   = API em C# (.NET 8)
frontend/                     = App em React + TypeScript (Vite)
```

## Como rodar

### 1. Back-end (precisa do .NET 8 SDK instalado)

```bash
cd backend/ControleGastos.Api
dotnet run
```

A API sobe em `http://localhost:5000`. Na primeira execução, ela cria uma pasta
`data/` com um arquivo `dados.json`, é ali que os dados ficam salvos entre uma
execução e outra (é o "banco de dados" desse projeto)

### 2. Front-end

```bash
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173`. Ele já está configurado para conversar com a
API em `http://localhost:5000` (veja `frontend/src/api.ts`).

> Importante: rode o back-end e o front-end **ao mesmo tempo**, em dois terminais.

## Por que arquivo JSON em vez de um banco de dados

O desafio pede persistência, mas não exige um banco relacional. Um arquivo
JSON resolve isso sem precisar instalar/configurar nada além do SDK do .NET. A lógica fica isolada em
`Services/DataStore.cs`, então trocar por um banco de verdade depois não afetaria o resto do código.

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

## Tema (claro/escuro)

O front-end tem um botão que alterna entre modo claro e escuro (fica salvo
no navegador). As cores ficam em variáveis CSS (`frontend/src/index.css`):
azul pra ações principais, verde/vermelho pra receita/despesa e saldo, e
cores neutras pro resto — pra não competir visualmente com os números.
