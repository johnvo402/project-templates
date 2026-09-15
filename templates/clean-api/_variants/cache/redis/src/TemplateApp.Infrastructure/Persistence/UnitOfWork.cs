using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Caching.Distributed;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Infrastructure.Persistence.Repositories;

namespace TemplateApp.Infrastructure.Persistence;

public sealed class UnitOfWork(
    AppDbContext dbContext,
    IDistributedCache distributedCache) : IUnitOfWork
{
    private readonly Dictionary<Type, object> _repositories = [];
    private readonly Dictionary<Type, object> _readOnlyRepositories = [];
    private readonly Dictionary<Type, object> _cacheRepositories = [];
    private IDbContextTransaction? _transaction;
    private bool _disposed;

    public DbTransaction? CurrentTransaction => _transaction?.GetDbTransaction();

    public IAsyncRepository<TEntity> Repository<TEntity>()
        where TEntity : class
    {
        var type = typeof(TEntity);

        if (_repositories.TryGetValue(type, out var repository))
            return (IAsyncRepository<TEntity>)repository;

        var created = new EfRepository<TEntity>(dbContext);
        _repositories[type] = created;
        return created;
    }

    public IReadRepository<TEntity> ReadOnlyRepository<TEntity>()
        where TEntity : class
    {
        var type = typeof(TEntity);

        if (_readOnlyRepositories.TryGetValue(type, out var repository))
            return (IReadRepository<TEntity>)repository;

        var created = new EfReadRepository<TEntity>(dbContext);
        _readOnlyRepositories[type] = created;
        return created;
    }

    public ICacheRepository<TValue> CacheRepository<TValue>()
        where TValue : class
    {
        var type = typeof(TValue);

        if (_cacheRepositories.TryGetValue(type, out var repository))
            return (ICacheRepository<TValue>)repository;

        var created = new RedisCacheRepository<TValue>(distributedCache);
        _cacheRepositories[type] = created;
        return created;
    }

    public async Task SaveAsync(CancellationToken cancellationToken = default)
        => await dbContext.SaveChangesAsync(cancellationToken);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => dbContext.SaveChangesAsync(cancellationToken);

    public async Task<DbTransaction> BeginTransactionAsync(
        CancellationToken cancellationToken = default)
    {
        if (_transaction is not null)
            return _transaction.GetDbTransaction();

        _transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        return _transaction.GetDbTransaction();
    }

    public async Task CommitAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
            throw new InvalidOperationException("No active transaction to commit.");

        try
        {
            await _transaction.CommitAsync(cancellationToken);
        }
        finally
        {
            await DisposeTransactionAsync();
        }
    }

    public async Task RollbackAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
            return;

        try
        {
            await _transaction.RollbackAsync(cancellationToken);
        }
        finally
        {
            await DisposeTransactionAsync();
        }
    }

    public void Dispose()
    {
        if (_disposed)
            return;

        _transaction?.Dispose();
        dbContext.Dispose();
        _disposed = true;
        GC.SuppressFinalize(this);
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed)
            return;

        if (_transaction is not null)
            await _transaction.DisposeAsync();

        await dbContext.DisposeAsync();
        _disposed = true;
        GC.SuppressFinalize(this);
    }

    private async Task DisposeTransactionAsync()
    {
        if (_transaction is null)
            return;

        await _transaction.DisposeAsync();
        _transaction = null;
    }
}
