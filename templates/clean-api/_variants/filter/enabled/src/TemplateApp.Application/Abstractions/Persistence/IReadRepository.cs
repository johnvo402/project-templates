using System.Linq.Expressions;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Application.Abstractions.Persistence;

public interface IReadRepository<TEntity>
    where TEntity : class
{
    Task<TEntity?> FirstOrDefaultAsync(ISpecification<TEntity> specification, CancellationToken cancellationToken = default);
    Task<TResult?> FirstOrDefaultAsync<TResult>(ISpecification<TEntity, TResult> specification, CancellationToken cancellationToken = default);
    Task<TResult?> FirstOrDefaultAsync<TResult>(
        ISpecification<TEntity> specification,
        Expression<Func<TEntity, TResult>> mappingExpression,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TEntity>> ListAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TResult>> ListAsync<TResult>(ISpecification<TEntity, TResult> specification, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TResult>> ListAsync<TResult>(
        Expression<Func<TEntity, TResult>> mappingExpression,
        ISpecification<TEntity>? specification = null,
        CancellationToken cancellationToken = default);

    Task<PaginationResponse<TResult>> PagedListAsync<TResult>(
        ISpecification<TEntity>? specification,
        Expression<Func<TEntity, TResult>> mappingExpression,
        PageParameters page,
        CancellationToken cancellationToken = default)
        where TResult : class;

    Task<PaginationResponse<TResult>> PagedListAsync<TResult>(
        ISpecification<TEntity>? specification,
        Expression<Func<TEntity, TResult>> mappingExpression,
        QueryParameters query,
        CancellationToken cancellationToken = default)
        where TResult : class;

    Task<int> CountAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default);
    Task<bool> AnyAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default);
}
