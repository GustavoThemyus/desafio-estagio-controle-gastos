using System.Text.Json;
using ControleGastos.Api.Models;

namespace ControleGastos.Api.Services;

/// <summary>
/// Estrutura do arquivo JSON salvo em disco: só as duas listas que o sistema precisa guardar.
/// </summary>
public class BancoDeDados
{
    public List<Pessoa> Pessoas { get; set; } = new();
    public List<Transacao> Transacoes { get; set; } = new();
}

/// <summary>
/// Camada de persistência da aplicação. Como o desafio exige persistência mas
/// não um SGBD específico, os dados são mantidos em um arquivo JSON em disco
/// (data/dados.json) — sem dependências externas de infraestrutura. A lógica
/// fica isolada nesta classe, então trocar por um banco relacional no futuro
/// não exigiria mudanças nos endpoints.
///
/// Registrada como Singleton (instância única durante a vida da aplicação),
/// com lock para evitar condições de corrida entre requisições concorrentes.
/// </summary>
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

    /// <summary>Salva o estado atual em memória de volta no arquivo JSON.</summary>
    private void SalvarNoDisco()
    {
        var json = JsonSerializer.Serialize(_dados, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(_caminhoArquivo, json);
    }

    // ------------------------------------------------------------------
    // PESSOAS
    // ------------------------------------------------------------------

    public List<Pessoa> ListarPessoas()
    {
        lock (_lock)
        {
            // Retorna cópia da lista para evitar mutação externa do estado interno.
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

    /// <summary>
    /// Remove a pessoa e, em cascata, todas as transações associadas a ela.
    /// Retorna false se a pessoa não existir (endpoint responde 404).
    /// </summary>
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

    // ------------------------------------------------------------------
    // TRANSAÇÕES
    // ------------------------------------------------------------------

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

    /// <summary>
    /// Remove uma transação pelo Id. Funcionalidade adicional além do mínimo
    /// exigido no desafio (que pedia apenas criação e listagem). Retorna false
    /// se a transação não existir (endpoint responde 404).
    /// </summary>
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
