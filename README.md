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
`data/` com um arquivo `dados.json` é ali que os dados ficam salvos entre uma
execução e outra (é o "banco de dados" desse projeto)

### 2. Front-end

```bash
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173`. Ele já está configurado para conversar com a
API em `http://localhost:5000` (veja `frontend/src/api.ts`)

> Importante: rodar o back-end e o front-end ao mesmo tempo, em dois terminais.

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
