using ControleGastos.Api.Dtos;
using ControleGastos.Api.Models;
using ControleGastos.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Singleton pra todas as requisições compartilharem o mesmo estado e o mesmo arquivo JSON
builder.Services.AddSingleton<DataStore>();

// CORS liberado pro front-end, que roda em outra porta (Vite: 5173)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseCors();

app.MapGet("/pessoas", (DataStore db) =>
{
    return Results.Ok(db.ListarPessoas());
});

app.MapPost("/pessoas", (CriarPessoaRequest request, DataStore db) =>
{
    // Valida a entrada, a API não confia no que vem do cliente
    if (string.IsNullOrWhiteSpace(request.Nome))
    {
        return Results.BadRequest(new ErroResponse("O nome da pessoa é obrigatório."));
    }

    if (request.Idade < 0)
    {
        return Results.BadRequest(new ErroResponse("A idade não pode ser negativa."));
    }

    var pessoa = db.CriarPessoa(request.Nome.Trim(), request.Idade);
    return Results.Created($"/pessoas/{pessoa.Id}", pessoa);
});

app.MapDelete("/pessoas/{id:guid}", (Guid id, DataStore db) =>
{
    var removeu = db.RemoverPessoa(id);
    if (!removeu)
    {
        return Results.NotFound(new ErroResponse("Pessoa não encontrada."));
    }

    return Results.NoContent();
});

app.MapGet("/transacoes", (DataStore db) =>
{
    return Results.Ok(db.ListarTransacoes());
});

app.MapPost("/transacoes", (CriarTransacaoRequest request, DataStore db) =>
{
    if (string.IsNullOrWhiteSpace(request.Descricao))
    {
        return Results.BadRequest(new ErroResponse("A descrição da transação é obrigatória."));
    }

    if (request.Valor <= 0)
    {
        return Results.BadRequest(new ErroResponse("O valor da transação deve ser maior que zero."));
    }

    // Regra: a pessoa precisa existir no cadastro
    var pessoa = db.BuscarPessoa(request.PessoaId);
    if (pessoa is null)
    {
        return Results.BadRequest(new ErroResponse("A pessoa informada não existe. Cadastre a pessoa antes de lançar a transação."));
    }

    // Regra do desafio: menor de idade (< 18) só pode ter Despesa
    if (pessoa.EhMenorDeIdade && request.Tipo == TipoTransacao.Receita)
    {
        return Results.BadRequest(new ErroResponse(
            $"{pessoa.Nome} é menor de idade ({pessoa.Idade} anos). Menores de idade só podem ter transações do tipo Despesa."));
    }

    var transacao = db.CriarTransacao(request.Descricao.Trim(), request.Valor, request.Tipo, request.PessoaId);
    return Results.Created($"/transacoes/{transacao.Id}", transacao);
});

// Extra, o desafio não pedia deletar transação
app.MapDelete("/transacoes/{id:guid}", (Guid id, DataStore db) =>
{
    var removeu = db.RemoverTransacao(id);
    if (!removeu)
    {
        return Results.NotFound(new ErroResponse("Transação não encontrada."));
    }

    return Results.NoContent();
});

app.MapGet("/totais", (DataStore db) =>
{
    var pessoas = db.ListarPessoas();
    var transacoes = db.ListarTransacoes();

    var totaisPorPessoa = pessoas.Select(pessoa =>
    {
        var transacoesDaPessoa = transacoes.Where(t => t.PessoaId == pessoa.Id);

        var totalReceitas = transacoesDaPessoa
            .Where(t => t.Tipo == TipoTransacao.Receita)
            .Sum(t => t.Valor);

        var totalDespesas = transacoesDaPessoa
            .Where(t => t.Tipo == TipoTransacao.Despesa)
            .Sum(t => t.Valor);

        return new TotalPessoaResponse(
            pessoa.Id,
            pessoa.Nome,
            totalReceitas,
            totalDespesas,
            totalReceitas - totalDespesas
        );
    }).ToList();

    var totalReceitasGeral = totaisPorPessoa.Sum(p => p.TotalReceitas);
    var totalDespesasGeral = totaisPorPessoa.Sum(p => p.TotalDespesas);

    var resposta = new TotaisGeraisResponse(
        totaisPorPessoa,
        totalReceitasGeral,
        totalDespesasGeral,
        totalReceitasGeral - totalDespesasGeral
    );

    return Results.Ok(resposta);
});

app.Run();
