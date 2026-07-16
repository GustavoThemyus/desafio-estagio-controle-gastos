using ControleGastos.Api.Dtos;
using ControleGastos.Api.Models;
using ControleGastos.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// DataStore como Singleton: uma instância única, compartilhada por todas as
// requisições, que mantém os dados em memória e os sincroniza com o arquivo JSON.
builder.Services.AddSingleton<DataStore>();

// CORS: libera o front-end (que roda em outra porta, ex: http://localhost:5173)
// para poder chamar esta API. Sem isso, o navegador bloqueia a requisição.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseCors();

// ============================================================================
// ENDPOINTS DE PESSOAS
// ============================================================================

// GET /pessoas -> lista todas as pessoas cadastradas
app.MapGet("/pessoas", (DataStore db) =>
{
    return Results.Ok(db.ListarPessoas());
});

// POST /pessoas -> cria uma nova pessoa
app.MapPost("/pessoas", (CriarPessoaRequest request, DataStore db) =>
{
    // Validações simples de entrada. Uma API robusta nunca confia no que chega do front-end.
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

// DELETE /pessoas/{id} -> remove a pessoa e, em cascata, todas as suas transações
app.MapDelete("/pessoas/{id:guid}", (Guid id, DataStore db) =>
{
    var removeu = db.RemoverPessoa(id);
    if (!removeu)
    {
        return Results.NotFound(new ErroResponse("Pessoa não encontrada."));
    }

    return Results.NoContent();
});

// ============================================================================
// ENDPOINTS DE TRANSAÇÕES
// ============================================================================

// GET /transacoes -> lista todas as transações cadastradas
app.MapGet("/transacoes", (DataStore db) =>
{
    return Results.Ok(db.ListarTransacoes());
});

// POST /transacoes -> cria uma nova transação
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

    // Regra: a pessoa informada precisa existir no cadastro de pessoas.
    var pessoa = db.BuscarPessoa(request.PessoaId);
    if (pessoa is null)
    {
        return Results.BadRequest(new ErroResponse("A pessoa informada não existe. Cadastre a pessoa antes de lançar a transação."));
    }

    // Regra central do desafio: pessoa menor de idade (< 18 anos) só pode ter DESPESAS.
    if (pessoa.EhMenorDeIdade && request.Tipo == TipoTransacao.Receita)
    {
        return Results.BadRequest(new ErroResponse(
            $"{pessoa.Nome} é menor de idade ({pessoa.Idade} anos). Menores de idade só podem ter transações do tipo Despesa."));
    }

    var transacao = db.CriarTransacao(request.Descricao.Trim(), request.Valor, request.Tipo, request.PessoaId);
    return Results.Created($"/transacoes/{transacao.Id}", transacao);
});

// DELETE /transacoes/{id} -> remove uma transação específica
// (funcionalidade extra, além do mínimo pedido no desafio)
app.MapDelete("/transacoes/{id:guid}", (Guid id, DataStore db) =>
{
    var removeu = db.RemoverTransacao(id);
    if (!removeu)
    {
        return Results.NotFound(new ErroResponse("Transação não encontrada."));
    }

    return Results.NoContent();
});

// ============================================================================
// ENDPOINT DE TOTAIS
// ============================================================================

// GET /totais -> para cada pessoa, soma receitas, despesas e calcula o saldo.
// No final, soma tudo de novo para dar o total geral do sistema.
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
