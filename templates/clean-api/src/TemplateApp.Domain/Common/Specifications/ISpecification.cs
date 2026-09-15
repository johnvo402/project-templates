using System.Linq.Expressions;

namespace TemplateApp.Domain.Common.Specifications;

public interface ISpecification<T>
    where T : class
{
    IReadOnlyList<Expression<Func<T, bool>>> Criteria { get; }
    IReadOnlyList<Expression<Func<T, object?>>> Includes { get; }
    LambdaExpression? OrderBy { get; }
    LambdaExpression? OrderByDescending { get; }
    int? Skip { get; }
    int? Take { get; }
    bool IsPagingEnabled { get; }
    bool IsNoTracking { get; }
}

public interface ISpecification<T, TResult> : ISpecification<T>
    where T : class
{
    Expression<Func<T, TResult>> Selector { get; }
}
