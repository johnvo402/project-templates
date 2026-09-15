using System.Linq.Expressions;

namespace TemplateApp.Domain.Common.Specifications;

public abstract class Specification<T> : ISpecification<T>
    where T : class
{
    private readonly List<Expression<Func<T, bool>>> _criteria = [];
    private readonly List<Expression<Func<T, object?>>> _includes = [];

    protected Specification()
    {
        Query = new SpecificationBuilder<T>(this);
    }

    public SpecificationBuilder<T> Query { get; }
    public IReadOnlyList<Expression<Func<T, bool>>> Criteria => _criteria;
    public IReadOnlyList<Expression<Func<T, object?>>> Includes => _includes;
    public Expression<Func<T, object?>>? OrderBy { get; private set; }
    public Expression<Func<T, object?>>? OrderByDescending { get; private set; }
    public int? Skip { get; private set; }
    public int? Take { get; private set; }
    public bool IsPagingEnabled { get; private set; }
    public bool IsNoTracking { get; private set; }

    internal void AddCriteria(Expression<Func<T, bool>> criteria)
        => _criteria.Add(criteria);

    internal void AddInclude(Expression<Func<T, object?>> includeExpression)
        => _includes.Add(includeExpression);

    internal void SetOrderBy(Expression<Func<T, object?>> orderByExpression)
    {
        OrderBy = orderByExpression;
        OrderByDescending = null;
    }

    internal void SetOrderByDescending(Expression<Func<T, object?>> orderByDescendingExpression)
    {
        OrderByDescending = orderByDescendingExpression;
        OrderBy = null;
    }

    internal void SetPaging(int skip, int take)
    {
        if (skip < 0)
            throw new ArgumentOutOfRangeException(nameof(skip));

        if (take <= 0)
            throw new ArgumentOutOfRangeException(nameof(take));

        Skip = skip;
        Take = take;
        IsPagingEnabled = true;
    }

    internal void SetNoTracking()
        => IsNoTracking = true;
}

public abstract class Specification<T, TResult> : Specification<T>, ISpecification<T, TResult>
    where T : class
{
    protected Specification(Expression<Func<T, TResult>> selector)
    {
        Selector = selector;
    }

    public Expression<Func<T, TResult>> Selector { get; }
}
