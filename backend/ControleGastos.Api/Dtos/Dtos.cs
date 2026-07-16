using ControleGastos.Api.Models;

namespace ControleGastos.Api.Dtos;

// ============================================================================
// DTOs separados das entidades de domínio (Pessoa/Transacao) para não expor
// campos que o cliente não deve controlar diretamente — ex: Id, que é sempre
// gerado pelo servidor. Evita overposting e mantém o contrato da API estável
// independente de mudanças internas nas entidades.
// ============================================================================

/// <summary>Dados de entrada para criação de uma pessoa.</summary>
public record CriarPessoaRequest(string Nome, int Idade);

/// <summary>Dados de entrada para criação de uma transação.</summary>
public record CriarTransacaoRequest(string Descricao, decimal Valor, TipoTransacao Tipo, Guid PessoaId);

/// <summary>Totais financeiros de uma pessoa, usados na consulta de totais.</summary>
public record TotalPessoaResponse(Guid PessoaId, string Nome, decimal TotalReceitas, decimal TotalDespesas, decimal Saldo);

/// <summary>
/// Resposta da consulta de totais: totais por pessoa + somatório geral.
/// </summary>
public record TotaisGeraisResponse(List<TotalPessoaResponse> Pessoas, decimal TotalReceitasGeral, decimal TotalDespesasGeral, decimal SaldoGeral);

/// <summary>Formato padrão de resposta de erro da API.</summary>
public record ErroResponse(string Mensagem);
