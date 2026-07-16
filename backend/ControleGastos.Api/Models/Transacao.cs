using System.Text.Json.Serialization;

namespace ControleGastos.Api.Models;

/// <summary>
/// Tipo de uma transação financeira.
/// Usamos um enum (em vez de aceitar qualquer texto) para que o próprio C#
/// garanta que só existem esses dois valores possíveis, evitando erros de digitação
/// como "despeza" ou "Receita " com espaço.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TipoTransacao
{
    Receita,
    Despesa
}

/// <summary>
/// Representa uma transação financeira (uma entrada de dinheiro ou um gasto)
/// associada a uma pessoa específica.
/// </summary>
public class Transacao
{
    /// <summary>Identificador único, gerado automaticamente pelo servidor.</summary>
    public Guid Id { get; set; }

    /// <summary>Descrição livre da transação (ex: "Salário", "Conta de luz").</summary>
    public string Descricao { get; set; } = string.Empty;

    /// <summary>Valor monetário da transação. Sempre deve ser maior que zero.</summary>
    public decimal Valor { get; set; }

    /// <summary>Se é uma Receita (entrada) ou Despesa (saída).</summary>
    public TipoTransacao Tipo { get; set; }

    /// <summary>Id da pessoa dona dessa transação. Precisa existir no cadastro de pessoas.</summary>
    public Guid PessoaId { get; set; }
}
