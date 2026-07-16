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
/// DataStore é o "banco de dados" da aplicação.
///
/// Como o desafio pede persistência (os dados não podem sumir quando a aplicação
/// é fechada), mas não exige um banco de dados de verdade (tipo SQL Server/Postgres),
/// optei por uma solução simples e transparente: guardar tudo em um arquivo JSON
/// no disco (data/dados.json). Isso cumpre o requisito de persistência sem
/// precisar de infraestrutura extra (instalar banco, connection string, etc.),
/// o que deixa o projeto fácil de rodar em qualquer máquina.
///
/// Esta classe é registrada como Singleton (uma única instância viva enquanto
/// a API estiver rodando) e usa um "lock" para evitar que duas requisições
/// mexam nos dados ao mesmo tempo e corrompam o arquivo.
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
            // Retorna uma cópia da lista para quem chamar não conseguir alterar
            // a lista interna diretamente sem passar pelos métodos do DataStore.
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
    /// Remove a pessoa e, seguindo a regra do desafio, também remove em cascata
    /// todas as transações que pertencem a ela.
    /// Retorna false se a pessoa não existir (para o endpoint decidir devolver 404).
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
    /// Remove uma transação específica pelo Id.
    /// Observação: o desafio original só pedia criação e listagem de transações
    /// ("não é necessário implementar edição/deleção"), mas remover uma transação
    /// não fere nenhuma regra de negócio existente, então foi adicionado como
    /// funcionalidade extra. Retorna false se a transação não existir, para o
    /// endpoint devolver 404.
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
