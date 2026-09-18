using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Domain.Common.Specifications;
using TemplateApp.Infrastructure.Persistence.Querying;
using TemplateApp.Infrastructure.Persistence.Specifications;

namespace TemplateApp.Infrastructure.Persistence.Repositories;

internal sealed class EfReadRepository<TEntity>(AppDbContext dbContext) : IReadRepository<TEntity>
    where TEntity : class
{
    private DbSet<TEntity> Set => dbContext.Set<TEntity>();

    public async Task<TEntity?> FirstOrDefaultAsync(ISpecification<TEntity> specification, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).FirstOrDefaultAsync(cancellationToken);

    public async Task<TResult?> FirstOrDefaultAsync<TResult>(ISpecification<TEntity, TResult> specification, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).FirstOrDefaultAsync(cancellationToken);

    public async Task<TResult?> FirstOrDefaultAsync<TResult>(ISpecification<TEntity> specification, Expression<Func<TEntity, TResult>> mappingExpression, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).Select(mappingExpression).FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<TEntity>> ListAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<TResult>> ListAsync<TResult>(ISpecification<TEntity, TResult> specification, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<TResult>> ListAsync<TResult>(Expression<Func<TEntity, TResult>> mappingExpression, ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).Select(mappingExpression).ToListAsync(cancellationToken);

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
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
            .Select(mappingExpression)
            .ToListAsync(cancellationToken);
        return PaginationResponse<TResult>.ForPage(data, totalCount, currentPage, pageSize);
    }

    public async Task<PaginationResponse<TResult>> PagedListAsync<TResult>(
        ISpecification<TEntity>? specification,
        Expression<Func<TEntity, TResult>> mappingExpression,
        QueryParameters query,
        CancellationToken cancellationToken = default)
        where TResult : class
    {
        // Filter-style read path: build SQL-translatable filter/sort expressions
        // against the entity query from the Projection mapping, then project last.
        var source = SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true);
        source = QueryableQueryEvaluator.ApplyFiltering(source, query, mappingExpression);
        var totalCount = await source.CountAsync(cancellationToken);
        source = QueryableQueryEvaluator.ApplySorting(source, query.Sort, mappingExpression);
        var pageSize = query.NormalizedPageSize;

        if (query.UsesCursor)
        {
            var cursor = query.After ?? query.Before;
            if (!CursorCodec.TryDecode(cursor, out var offset))
                throw new InvalidOperationException("The supplied cursor is invalid.");

            var data = await source
                .Skip(offset)
                .Take(pageSize)
                .Select(mappingExpression)
                .ToListAsync(cancellationToken);
            return PaginationResponse<TResult>.ForCursor(data, totalCount, offset, pageSize);
        }

        var page = query.NormalizedPage;
        var dataForPage = await source
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(mappingExpression)
            .ToListAsync(cancellationToken);
        return PaginationResponse<TResult>.ForPage(dataForPage, totalCount, page, pageSize);
    }

    public Task<int> CountAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
        => SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).CountAsync(cancellationToken);

    public Task<bool> AnyAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
        => SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification, forceNoTracking: true).AnyAsync(cancellationToken);
}
