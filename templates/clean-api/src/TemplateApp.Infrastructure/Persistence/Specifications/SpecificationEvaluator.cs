using Microsoft.EntityFrameworkCore;
using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Infrastructure.Persistence.Specifications;

internal static class SpecificationEvaluator
{
    public static IQueryable<TEntity> GetQuery<TEntity>(
        IQueryable<TEntity> query,
        ISpecification<TEntity>? specification,
        bool forceNoTracking = false)
        where TEntity : class
    {
        if (specification is null)
            return forceNoTracking ? query.AsNoTracking() : query;

        foreach (var criteria in specification.Criteria)
            query = query.Where(criteria);

        foreach (var include in specification.Includes)
            query = query.Include(include);

        if (specification.OrderBy is not null)
            query = query.OrderBy(specification.OrderBy);
        else if (specification.OrderByDescending is not null)
            query = query.OrderByDescending(specification.OrderByDescending);

        if (specification.IsPagingEnabled)
        {
            query = query.Skip(specification.Skip!.Value);
            query = query.Take(specification.Take!.Value);
        }

        if (forceNoTracking || specification.IsNoTracking)
            query = query.AsNoTracking();

        return query;
    }

    public static IQueryable<TResult> GetQuery<TEntity, TResult>(
        IQueryable<TEntity> query,
        ISpecification<TEntity, TResult> specification,
        bool forceNoTracking = false)
        where TEntity : class
    {
        return GetQuery(query, (ISpecification<TEntity>)specification, forceNoTracking)
            .Select(specification.Selector);
    }
}
