using ControleGastos.Api.Models;

namespace ControleGastos.Api.Dtos;

// DTOs separados das entidades pra não expor campos que o cliente não deve
// controlar (tipo o Id, gerado no servidor) e evitar overposting

public record CriarPessoaRequest(string Nome, int Idade);

public record CriarTransacaoRequest(string Descricao, decimal Valor, TipoTransacao Tipo, Guid PessoaId);

public record TotalPessoaResponse(Guid PessoaId, string Nome, decimal TotalReceitas, decimal TotalDespesas, decimal Saldo);

public record TotaisGeraisResponse(List<TotalPessoaResponse> Pessoas, decimal TotalReceitasGeral, decimal TotalDespesasGeral, decimal SaldoGeral);

public record ErroResponse(string Mensagem);
