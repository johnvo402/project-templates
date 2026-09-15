using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Domain.Common.Specifications;
using TemplateApp.Infrastructure.Persistence.Specifications;

namespace TemplateApp.Infrastructure.Persistence.Repositories;

internal sealed class EfReadRepository(AppDbContext dbContext) : IReadRepository<TEntity>
    where TEntity : class
{
    private DbSet<TEntity> Set => dbContext.Set<TEntity>();

    public async Task<TEntity?> FirstOrDefaultAsync(ISpecification<TEntity> specification, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).FirstOrDefaultAsync(cancellationToken);

    public async Task<TResult?> FirstOrDefaultAsync<TResult>(ISpecification<TEntity, TResult> specification, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).FirstOrDefaultAsync(cancellationToken);

    public async Task<TResult?> FirstOrDefaultAsync<TResult>(
        ISpecification<TEntity> specification,
        Expression<Func<TEntity, TResult>> mappingExpression,
        CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true)
            .Select(mappingExpression)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<TEntity>> ListAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<TResult>> ListAsync<TResult>(ISpecification<TEntity, TResult> specification, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<TResult>> ListAsync<TResult>(
        Expression<Func<TEntity, TResult>> mappingExpression,
        ISpecification<TEntity>? specification = null,
        CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true)
            .Select(mappingExpression)
            .ToListAsync(cancellationToken);

    public async Task<PaginationResponse<TResult>> PagedListAsync<TResult>(
        ISpecification<TEntity>? specification,
        Expression<Func<TEntity, TResult>> mappingExpression,
        PageParameters page,
        CancellationToken cancellationToken = default)
        where TResult : class
    {
        var source = SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true);
        var totalCount = await source.CountAsync(cancellationToken);
        var currentPage = page.NormalizedPage;
        var pageSize = page.NormalizedPageSize;
        var data = await source
            .Select(mappingExpression)
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        return PaginationResponse<TResult>.ForPage(data, totalCount, currentPage, pageSize);
    }

    public Task<int> CountAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
        => SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).CountAsync(cancellationToken);

    public Task<bool> AnyAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
        => SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).AnyAsync(cancellationToken);

}
