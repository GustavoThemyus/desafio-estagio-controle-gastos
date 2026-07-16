using ControleGastos.Api.Models;

namespace ControleGastos.Api.Dtos;

// ============================================================================
// DTOs = "Data Transfer Objects". São classes simples que definem exatamente
// o formato dos dados que entram e saem da API.
//
// Por que não usar direto as classes Pessoa/Transacao no corpo da requisição?
// Porque assim quem chama a API não consegue, por exemplo, mandar um "Id" na
// hora de criar uma pessoa — o Id é sempre gerado pelo servidor. Isso evita
// bugs e brechas de segurança (chamado de "overposting").
// ============================================================================

/// <summary>Dados necessários para CRIAR uma pessoa. Repare que não tem "Id" aqui.</summary>
public record CriarPessoaRequest(string Nome, int Idade);

/// <summary>Dados necessários para CRIAR uma transação.</summary>
public record CriarTransacaoRequest(string Descricao, decimal Valor, TipoTransacao Tipo, Guid PessoaId);

/// <summary>Totais financeiros de UMA pessoa, usados na tela de consulta de totais.</summary>
public record TotalPessoaResponse(Guid PessoaId, string Nome, decimal TotalReceitas, decimal TotalDespesas, decimal Saldo);

/// <summary>
/// Resposta completa da consulta de totais: a lista de totais por pessoa
/// + o somatório geral de todo mundo junto.
/// </summary>
public record TotaisGeraisResponse(List<TotalPessoaResponse> Pessoas, decimal TotalReceitasGeral, decimal TotalDespesasGeral, decimal SaldoGeral);

/// <summary>
/// Formato padrão de resposta de erro, pra o front-end sempre saber onde achar a mensagem.
/// </summary>
public record ErroResponse(string Mensagem);
