using System.Text.Json.Serialization;

namespace ControleGastos.Api.Models;

// enum em vez de string livre pra travar os valores possíveis já na compilação
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TipoTransacao
{
    Receita,
    Despesa
}

public class Transacao
{
    // Id gerado no servidor
    public Guid Id { get; set; }

    public string Descricao { get; set; } = string.Empty;

    // validado no POST pra ser sempre maior que zero
    public decimal Valor { get; set; }

    public TipoTransacao Tipo { get; set; }

    // precisa referenciar uma pessoa que existe
    public Guid PessoaId { get; set; }
}
