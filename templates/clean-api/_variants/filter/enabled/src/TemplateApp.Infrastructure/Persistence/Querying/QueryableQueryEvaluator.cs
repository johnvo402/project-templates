using System.Globalization;
using System.Linq.Expressions;
using System.Reflection;
using TemplateApp.Application.Common.Querying;

namespace TemplateApp.Infrastructure.Persistence.Querying;

internal static class QueryableQueryEvaluator
{
    public static IQueryable<T> ApplyFiltering<T>(IQueryable<T> query, QueryParameters parameters)
        where T : class
    {
        if (parameters.Filter is not null && parameters.Filter.Children.Count > 0)
        {
            var parameter = Expression.Parameter(typeof(T), "x");
            var body = BuildGroupExpression<T>(parameter, parameters.Filter);
            if (body is not null)
                query = query.Where(Expression.Lambda<Func<T, bool>>(body, parameter));
        }

        if (!string.IsNullOrWhiteSpace(parameters.Keyword))
            query = ApplyKeyword(query, parameters.Keyword!, parameters.Targets);

        return query;
    }

    public static IQueryable<T> ApplySorting<T>(IQueryable<T> query, string? sort)
        where T : class
    {
        if (string.IsNullOrWhiteSpace(sort))
            return query;

        IOrderedQueryable<T>? ordered = null;
        foreach (var item in sort.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var parts = item.Split(':', 2, StringSplitOptions.TrimEntries);
            var field = parts[0];
            var descending = parts.Length > 1 && parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase);
            ordered = ApplyOrder(query, ordered, field, descending);
        }
        return ordered ?? query;
    }

    private static IOrderedQueryable<T> ApplyOrder<T>(IQueryable<T> source, IOrderedQueryable<T>? ordered, string field, bool descending)
        where T : class
    {
        var parameter = Expression.Parameter(typeof(T), "x");
        if (!TryBuildPropertyAccess(parameter, field, out var property, out var propertyType))
            throw new InvalidOperationException($"Unknown sort field '{field}'.");

        var delegateType = typeof(Func<,>).MakeGenericType(typeof(T), propertyType);
        var lambda = Expression.Lambda(delegateType, property, parameter);
        var methodName = ordered is null
            ? descending ? nameof(Queryable.OrderByDescending) : nameof(Queryable.OrderBy)
            : descending ? nameof(Queryable.ThenByDescending) : nameof(Queryable.ThenBy);
        var target = ordered is null ? source : ordered;
        var method = typeof(Queryable).GetMethods().Single(m => m.Name == methodName && m.IsGenericMethodDefinition && m.GetParameters().Length == 2).MakeGenericMethod(typeof(T), propertyType);
        return (IOrderedQueryable<T>)method.Invoke(null, [target, lambda])!;
    }

    private static IQueryable<T> ApplyKeyword<T>(IQueryable<T> query, string keyword, IReadOnlyList<string>? targets)
        where T : class
    {
        IReadOnlyList<string> fields = targets is { Count: > 0 }
            ? targets
            : typeof(T).GetProperties(BindingFlags.Instance | BindingFlags.Public).Where(p => p.PropertyType == typeof(string)).Select(p => p.Name).ToArray();
        if (fields.Count == 0)
            return query;

        var parameter = Expression.Parameter(typeof(T), "x");
        Expression? body = null;
        foreach (var field in fields)
        {
            if (!TryBuildPropertyAccess(parameter, field, out var property, out var propertyType) || propertyType != typeof(string))
                continue;
            var condition = BuildStringCall(property, nameof(string.Contains), keyword, ignoreCase: true, negate: false);
            body = body is null ? condition : Expression.OrElse(body, condition);
        }
        return body is null ? query : query.Where(Expression.Lambda<Func<T, bool>>(body, parameter));
    }

    private static Expression? BuildGroupExpression<T>(ParameterExpression parameter, FilterGroup group)
    {
        Expression? body = null;
        foreach (var child in group.Children)
        {
            var expression = child switch
            {
                FilterGroup nested => BuildGroupExpression<T>(parameter, nested),
                FilterCondition condition => BuildCondition(parameter, condition),
                _ => null
            };
            if (expression is null) continue;
            body = body is null ? expression : group.Operator == FilterLogicalOperator.And ? Expression.AndAlso(body, expression) : Expression.OrElse(body, expression);
        }
        return body;
    }

    private static Expression BuildCondition(ParameterExpression parameter, FilterCondition condition)
    {
        if (!TryBuildPropertyAccess(parameter, condition.Field, out var property, out var propertyType))
            throw new InvalidOperationException($"Unknown filter field '{condition.Field}'.");

        return condition.Operator switch
        {
            FilterOperator.Eq => BuildEquality(property, propertyType, condition.Values.Single(), false, false),
            FilterOperator.Eqi => BuildEquality(property, propertyType, condition.Values.Single(), false, true),
            FilterOperator.Ne => BuildEquality(property, propertyType, condition.Values.Single(), true, false),
            FilterOperator.Nei => BuildEquality(property, propertyType, condition.Values.Single(), true, true),
            FilterOperator.Lt => BuildComparison(property, propertyType, condition.Values.Single(), ExpressionType.LessThan),
            FilterOperator.Lte => BuildComparison(property, propertyType, condition.Values.Single(), ExpressionType.LessThanOrEqual),
            FilterOperator.Gt => BuildComparison(property, propertyType, condition.Values.Single(), ExpressionType.GreaterThan),
            FilterOperator.Gte => BuildComparison(property, propertyType, condition.Values.Single(), ExpressionType.GreaterThanOrEqual),
            FilterOperator.In => BuildIn(property, propertyType, condition.Values, false),
            FilterOperator.NotIn => BuildIn(property, propertyType, condition.Values, true),
            FilterOperator.Between => BuildBetween(property, propertyType, condition.Values),
            FilterOperator.Contains => BuildStringCall(property, nameof(string.Contains), condition.Values.Single(), false, false),
            FilterOperator.ContainsI => BuildStringCall(property, nameof(string.Contains), condition.Values.Single(), true, false),
            FilterOperator.NotContains => BuildStringCall(property, nameof(string.Contains), condition.Values.Single(), false, true),
            FilterOperator.NotContainsI => BuildStringCall(property, nameof(string.Contains), condition.Values.Single(), true, true),
            FilterOperator.StartsWith => BuildStringCall(property, nameof(string.StartsWith), condition.Values.Single(), false, false),
            FilterOperator.EndsWith => BuildStringCall(property, nameof(string.EndsWith), condition.Values.Single(), false, false),
            _ => throw new NotSupportedException($"Operator '{condition.Operator}' is not supported.")
        };
    }

    private static Expression BuildEquality(Expression property, Type propertyType, string rawValue, bool negate, bool ignoreCase)
    {
        if (ignoreCase)
        {
            if ((Nullable.GetUnderlyingType(propertyType) ?? propertyType) != typeof(string))
                throw new InvalidOperationException("Case-insensitive equality can only be used with strings.");
            var equals = Expression.Equal(ToLowerSafe(property), Expression.Constant(rawValue.ToLowerInvariant()));
            return negate ? Expression.Not(equals) : equals;
        }
        var constant = BuildConstant(rawValue, propertyType);
        var expression = Expression.Equal(property, constant);
        return negate ? Expression.Not(expression) : expression;
    }

    private static Expression BuildComparison(Expression property, Type propertyType, string rawValue, ExpressionType comparisonType)
    {
        var constant = BuildConstant(rawValue, propertyType);
        return comparisonType switch
        {
            ExpressionType.LessThan => Expression.LessThan(property, constant),
            ExpressionType.LessThanOrEqual => Expression.LessThanOrEqual(property, constant),
            ExpressionType.GreaterThan => Expression.GreaterThan(property, constant),
            ExpressionType.GreaterThanOrEqual => Expression.GreaterThanOrEqual(property, constant),
            _ => throw new ArgumentOutOfRangeException(nameof(comparisonType))
        };
    }

    private static Expression BuildBetween(Expression property, Type propertyType, IReadOnlyList<string> values)
    {
        if (values.Count != 2) throw new InvalidOperationException("$between requires exactly two values.");
        return Expression.AndAlso(
            Expression.GreaterThanOrEqual(property, BuildConstant(values[0], propertyType)),
            Expression.LessThanOrEqual(property, BuildConstant(values[1], propertyType)));
    }

    private static Expression BuildIn(Expression property, Type propertyType, IReadOnlyList<string> values, bool negate)
    {
        if (values.Count == 0) throw new InvalidOperationException("$in/$notin requires at least one value.");
        var elementType = Nullable.GetUnderlyingType(propertyType) ?? propertyType;
        var array = Array.CreateInstance(elementType, values.Count);
        for (var i = 0; i < values.Count; i++)
            array.SetValue(ConvertNonNull(values[i], elementType), i);
        Expression candidate = property;
        if (Nullable.GetUnderlyingType(propertyType) is not null)
            candidate = Expression.Property(property, "Value");
        Expression contains = Expression.Call(typeof(Enumerable), nameof(Enumerable.Contains), [elementType], Expression.Constant(array), candidate);
        if (Nullable.GetUnderlyingType(propertyType) is not null)
            contains = Expression.AndAlso(Expression.Property(property, "HasValue"), contains);
        return negate ? Expression.Not(contains) : contains;
    }

    private static Expression BuildStringCall(Expression property, string methodName, string rawValue, bool ignoreCase, bool negate)
    {
        if ((Nullable.GetUnderlyingType(property.Type) ?? property.Type) != typeof(string))
            throw new InvalidOperationException($"'{methodName}' can only be used with strings.");
        Expression source = property;
        var value = rawValue;
        if (ignoreCase)
        {
            source = ToLowerSafe(source);
            value = value.ToLowerInvariant();
        }
        var notNull = Expression.NotEqual(property, Expression.Constant(null, typeof(string)));
        var call = Expression.Call(source, typeof(string).GetMethod(methodName, [typeof(string)])!, Expression.Constant(value));
        var expression = Expression.AndAlso(notNull, call);
        return negate ? Expression.Not(expression) : expression;
    }

    private static Expression BuildConstant(string rawValue, Type propertyType)
    {
        var nullable = Nullable.GetUnderlyingType(propertyType);
        if (nullable is not null && (string.IsNullOrWhiteSpace(rawValue) || rawValue.Equals("null", StringComparison.OrdinalIgnoreCase)))
            return Expression.Constant(null, propertyType);
        var actual = nullable ?? propertyType;
        var value = ConvertNonNull(rawValue, actual);
        return nullable is null
            ? Expression.Constant(value, propertyType)
            : Expression.Convert(Expression.Constant(value, actual), propertyType);
    }

    private static object ConvertNonNull(string rawValue, Type actualType) => actualType switch
    {
        _ when actualType == typeof(string) => rawValue,
        _ when actualType == typeof(Guid) => Guid.Parse(rawValue),
        _ when actualType == typeof(DateTime) => DateTime.Parse(rawValue, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind),
        _ when actualType == typeof(DateTimeOffset) => DateTimeOffset.Parse(rawValue, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind),
        _ when actualType == typeof(bool) => bool.Parse(rawValue),
        _ when actualType.IsEnum => Enum.Parse(actualType, rawValue, ignoreCase: true),
        _ => Convert.ChangeType(rawValue, actualType, CultureInfo.InvariantCulture)!
    };

    private static Expression ToLowerSafe(Expression property)
        => Expression.Call(Expression.Coalesce(property, Expression.Constant(string.Empty)), typeof(string).GetMethod(nameof(string.ToLower), Type.EmptyTypes)!);

    private static bool TryBuildPropertyAccess(Expression parameter, string path, out Expression property, out Type propertyType)
    {
        property = parameter;
        propertyType = parameter.Type;
        foreach (var segment in path.Split('.', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var info = propertyType.GetProperty(segment, BindingFlags.Instance | BindingFlags.Public | BindingFlags.IgnoreCase);
            if (info is null)
            {
                property = parameter;
                propertyType = parameter.Type;
                return false;
            }
            property = Expression.Property(property, info);
            propertyType = info.PropertyType;
        }
        return true;
    }
}
