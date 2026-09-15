using System.Data.Common;

namespace TemplateApp.Application.Abstractions.Persistence;

public interface IUnitOfWork : IDisposable, IAsyncDisposable
{
    DbTransaction? CurrentTransaction { get; }

    IAsyncRepository<TEntity> Repository<TEntity>()
        where TEntity : class;

    IReadRepository<TEntity> ReadOnlyRepository<TEntity>()
        where TEntity : class;

    ICacheRepository<TValue> CacheRepository<TValue>()
        where TValue : class;

    Task SaveAsync(CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    Task<DbTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitAsync(CancellationToken cancellationToken = default);
    Task RollbackAsync(CancellationToken cancellationToken = default);
}
