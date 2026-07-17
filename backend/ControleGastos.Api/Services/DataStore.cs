using System.Text.Json;
using ControleGastos.Api.Models;

namespace ControleGastos.Api.Services;

// Espelha o formato do JSON em disco: só as duas listas
public class BancoDeDados
{
    public List<Pessoa> Pessoas { get; set; } = new();
    public List<Transacao> Transacoes { get; set; } = new();
}

// Persisto em arquivo JSON porque o desafio pede persistência mas não um banco
// específico, então não quis depender de um SGBD. Deixei isolado aqui pra trocar
// por um banco depois sem mexer nos endpoints. Singleton com lock por causa das
// requisições concorrentes
public class DataStore
{
    private readonly string _caminhoArquivo;
    private readonly object _lock = new();
    private BancoDeDados _dados;

    public DataStore(IWebHostEnvironment env)
    {
        var pastaData = Path.Combine(env.ContentRootPath, "data");
        Directory.CreateDirectory(pastaData);
        _caminhoArquivo = Path.Combine(pastaData, "dados.json");
        _dados = CarregarDoDisco();
    }

    private BancoDeDados CarregarDoDisco()
    {
        if (!File.Exists(_caminhoArquivo))
        {
            return new BancoDeDados();
        }

        var json = File.ReadAllText(_caminhoArquivo);
        if (string.IsNullOrWhiteSpace(json))
        {
            return new BancoDeDados();
        }

        return JsonSerializer.Deserialize<BancoDeDados>(json) ?? new BancoDeDados();
    }

    private void SalvarNoDisco()
    {
        var json = JsonSerializer.Serialize(_dados, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(_caminhoArquivo, json);
    }

    public List<Pessoa> ListarPessoas()
    {
        lock (_lock)
        {
            // devolve cópia pra ninguém mutar o estado interno de fora
            return _dados.Pessoas.ToList();
        }
    }

    public Pessoa CriarPessoa(string nome, int idade)
    {
        lock (_lock)
        {
            var pessoa = new Pessoa
            {
                Id = Guid.NewGuid(),
                Nome = nome,
                Idade = idade
            };
            _dados.Pessoas.Add(pessoa);
            SalvarNoDisco();
            return pessoa;
        }
    }

    public Pessoa? BuscarPessoa(Guid id)
    {
        lock (_lock)
        {
            return _dados.Pessoas.FirstOrDefault(p => p.Id == id);
        }
    }

    // Remove a pessoa e as transações dela em cascata, false se não existir (vira 404)
    public bool RemoverPessoa(Guid id)
    {
        lock (_lock)
        {
            var pessoa = _dados.Pessoas.FirstOrDefault(p => p.Id == id);
            if (pessoa is null)
            {
                return false;
            }

            _dados.Pessoas.Remove(pessoa);
            _dados.Transacoes.RemoveAll(t => t.PessoaId == id); // exclusão em cascata
            SalvarNoDisco();
            return true;
        }
    }

    public List<Transacao> ListarTransacoes()
    {
        lock (_lock)
        {
            return _dados.Transacoes.ToList();
        }
    }

    public Transacao CriarTransacao(string descricao, decimal valor, TipoTransacao tipo, Guid pessoaId)
    {
        lock (_lock)
        {
            var transacao = new Transacao
            {
                Id = Guid.NewGuid(),
                Descricao = descricao,
                Valor = valor,
                Tipo = tipo,
                PessoaId = pessoaId
            };
            _dados.Transacoes.Add(transacao);
            SalvarNoDisco();
            return transacao;
        }
    }

    // Remove uma transação, extra que o desafio não pedia, false se não existir (vira 404)
    public bool RemoverTransacao(Guid id)
    {
        lock (_lock)
        {
            var transacao = _dados.Transacoes.FirstOrDefault(t => t.Id == id);
            if (transacao is null)
            {
                return false;
            }

            _dados.Transacoes.Remove(transacao);
            SalvarNoDisco();
            return true;
        }
    }
}
