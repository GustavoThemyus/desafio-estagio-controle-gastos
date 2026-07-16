namespace ControleGastos.Api.Models;

/// <summary>
/// Representa uma pessoa cadastrada no sistema.
/// Cada pessoa pode ter várias transações (receitas e despesas) associadas a ela.
/// </summary>
public class Pessoa
{
    /// <summary>
    /// Identificador único da pessoa.
    /// É gerado automaticamente pelo servidor no momento da criação (Guid.NewGuid()),
    /// então quem consome a API nunca precisa (nem consegue) inventar esse valor.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>Nome da pessoa.</summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>Idade da pessoa. Usada para decidir se ela é menor de idade (menor de 18 anos).</summary>
    public int Idade { get; set; }

    /// <summary>
    /// Regra de negócio central: pessoas com menos de 18 anos são consideradas menores de idade
    /// e, por isso, só podem ter transações do tipo "Despesa" (não podem cadastrar receita).
    /// Deixei isso como uma propriedade calculada (não gravada no JSON) para que a regra
    /// fique num único lugar do código e não se repita em vários pontos.
    /// </summary>
    public bool EhMenorDeIdade => Idade < 18;
}
