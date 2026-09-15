using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Domain.Common.Specifications;
using TemplateApp.Infrastructure.Persistence.Querying;
using TemplateApp.Infrastructure.Persistence.Specifications;

namespace TemplateApp.Infrastructure.Persistence.Repositories;

internal sealed class EfRepository<TEntity>(AppDbContext dbContext) : IAsyncRepository<TEntity>
    where TEntity : class
{
    private DbSet<TEntity> Set => dbContext.Set<TEntity>();

    public async Task<TEntity?> FirstOrDefaultAsync(ISpecification<TEntity> specification, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification).FirstOrDefaultAsync(cancellationToken);

    public async Task<TResult?> FirstOrDefaultAsync<TResult>(ISpecification<TEntity, TResult> specification, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification).FirstOrDefaultAsync(cancellationToken);

    public async Task<TResult?> FirstOrDefaultAsync<TResult>(ISpecification<TEntity> specification, Expression<Func<TEntity, TResult>> mappingExpression, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification).Select(mappingExpression).FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<TEntity>> ListAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<TResult>> ListAsync<TResult>(ISpecification<TEntity, TResult> specification, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<TResult>> ListAsync<TResult>(Expression<Func<TEntity, TResult>> mappingExpression, ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
        => await SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification).Select(mappingExpression).ToListAsync(cancellationToken);

    public async Task<PaginationResponse<TResult>> PagedListAsync<TResult>(
        ISpecification<TEntity>? specification,
        Expression<Func<TEntity, TResult>> mappingExpression,
        PageParameters page,
        CancellationToken cancellationToken = default)
        where TResult : class
    {
        var source = SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification);
        var totalCount = await source.CountAsync(cancellationToken);
        var currentPage = page.NormalizedPage;
        var pageSize = page.NormalizedPageSize;
        var data = await source.Select(mappingExpression)
            .Skip((currentPage - 1) * pageSize)
            .Take(pageSize)
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
        // VietWash-style read path: entity specification first, SQL projection second,
        // then LHS bracket filters/search/sort over the projection shape.
        var projected = SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification)
            .Select(mappingExpression);
        projected = QueryableQueryEvaluator.ApplyFiltering(projected, query);
        var totalCount = await projected.CountAsync(cancellationToken);
        projected = QueryableQueryEvaluator.ApplySorting(projected, query.Sort);
        var pageSize = query.NormalizedPageSize;

        if (query.UsesCursor)
        {
            var cursor = query.After ?? query.Before;
            if (!CursorCodec.TryDecode(cursor, out var offset))
                throw new InvalidOperationException("The supplied cursor is invalid.");
            var data = await projected.Skip(offset).Take(pageSize).ToListAsync(cancellationToken);
            return PaginationResponse<TResult>.ForCursor(data, totalCount, offset, pageSize);
        }

        var page = query.NormalizedPage;
        var dataForPage = await projected.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return PaginationResponse<TResult>.ForPage(dataForPage, totalCount, page, pageSize);
    }

    public Task<int> CountAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
        => SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification).CountAsync(cancellationToken);
    public Task<bool> AnyAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
        => SpecificationEvaluator.GetQuery(Set.AsQueryable(), specification).AnyAsync(cancellationToken);

    public Task AddAsync(TEntity entity, CancellationToken cancellationToken = default)
        => Set.AddAsync(entity, cancellationToken).AsTask();
    public Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default)
        => Set.AddRangeAsync(entities, cancellationToken);
    public void Update(TEntity entity) => Set.Update(entity);
    public void Remove(TEntity entity) => Set.Remove(entity);
    public void RemoveRange(IEnumerable<TEntity> entities) => Set.RemoveRange(entities);

}
