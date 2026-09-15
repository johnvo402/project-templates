using System.Linq.Expressions;

namespace TemplateApp.Domain.Common.Specifications;

public sealed class SpecificationBuilder<T>(Specification<T> specification)
    where T : class
{
    public SpecificationBuilder<T> Where(Expression<Func<T, bool>> criteria)
    {
        specification.AddCriteria(criteria);
        return this;
    }

    public SpecificationBuilder<T> Include(Expression<Func<T, object?>> includeExpression)
    {
        specification.AddInclude(includeExpression);
        return this;
    }

    public SpecificationBuilder<T> OrderBy<TKey>(Expression<Func<T, TKey>> orderByExpression)
    {
        specification.SetOrderBy(orderByExpression);
        return this;
    }

    public SpecificationBuilder<T> OrderByDescending<TKey>(Expression<Func<T, TKey>> orderByDescendingExpression)
    {
        specification.SetOrderByDescending(orderByDescendingExpression);
        return this;
    }

    public SpecificationBuilder<T> Paginate(int skip, int take)
    {
        specification.SetPaging(skip, take);
        return this;
    }

    public SpecificationBuilder<T> AsNoTracking()
    {
        specification.SetNoTracking();
        return this;
    }
}
