namespace ControleGastos.Api.Models;

public class Pessoa
{
    // Id gerado no servidor, não vem na requisição
    public Guid Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public int Idade { get; set; }

    // Propriedade calculada (não persiste) pra deixar a regra dos 18 num lugar só
    public bool EhMenorDeIdade => Idade < 18;
}
