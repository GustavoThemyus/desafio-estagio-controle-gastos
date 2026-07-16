namespace ControleGastos.Api.Models;

/// <summary>
/// Representa uma pessoa cadastrada no sistema. Cada pessoa pode ter várias
/// transações (receitas e despesas) associadas a ela.
/// </summary>
public class Pessoa
{
    /// <summary>
    /// Identificador único, gerado pelo servidor (Guid.NewGuid()) no momento
    /// da criação. Não é aceito via requisição.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>Nome da pessoa.</summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>Idade da pessoa. Usada para determinar se é menor de idade.</summary>
    public int Idade { get; set; }

    /// <summary>
    /// Regra de negócio: menores de 18 anos só podem ter transações do tipo
    /// Despesa. Implementada como propriedade calculada (não persistida) para
    /// centralizar a regra num único ponto do código.
    /// </summary>
    public bool EhMenorDeIdade => Idade < 18;
}
