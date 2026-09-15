using System.Reflection;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Primitives;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Api.Querying;

public static partial class LhsBracketQueryParser
{
    private static readonly IReadOnlyDictionary<string, FilterOperator> Operators = new Dictionary<string, FilterOperator>(StringComparer.OrdinalIgnoreCase)
    {
        ["$eq"] = FilterOperator.Eq, ["$eqi"] = FilterOperator.Eqi, ["$ne"] = FilterOperator.Ne, ["$nei"] = FilterOperator.Nei,
        ["$in"] = FilterOperator.In, ["$notin"] = FilterOperator.NotIn, ["$lt"] = FilterOperator.Lt, ["$lte"] = FilterOperator.Lte,
        ["$gt"] = FilterOperator.Gt, ["$gte"] = FilterOperator.Gte, ["$between"] = FilterOperator.Between,
        ["$contains"] = FilterOperator.Contains, ["$containsi"] = FilterOperator.ContainsI,
        ["$notcontains"] = FilterOperator.NotContains, ["$notcontainsi"] = FilterOperator.NotContainsI,
        ["$startswith"] = FilterOperator.StartsWith, ["$endswith"] = FilterOperator.EndsWith
    };

    public static Result<QueryParameters> Parse<TResponse>(IQueryCollection query) where TResponse : class
    {
        if (!TryReadPositiveInt(query, "page", 1, out var page))
            return Invalid("Query.Page", "Page must be greater than zero.");
        if (!TryReadPositiveInt(query, "pageSize", 20, out var pageSize) || pageSize > 100)
            return Invalid("Query.PageSize", "PageSize must be between 1 and 100.");

        var before = GetSingle(query, "before");
        var after = GetSingle(query, "after");
        if (!string.IsNullOrWhiteSpace(before) && !string.IsNullOrWhiteSpace(after))
            return Invalid("Query.Cursor", "Before and After cannot be used together.");
        if ((!string.IsNullOrWhiteSpace(before) && !CursorCodec.TryDecode(before, out _)) || (!string.IsNullOrWhiteSpace(after) && !CursorCodec.TryDecode(after, out _)))
            return Invalid("Query.Cursor", "Cursor is invalid.");

        var keyword = GetSingle(query, "keyword");
        var sort = GetSingle(query, "sort");
        var targets = ReadTargets(query);
        foreach (var target in targets)
            if (!TryGetPropertyType(typeof(TResponse), target, out var type) || type != typeof(string))
                return Invalid("Query.Target", $"Search target '{target}' does not exist or is not a string.");

        if (!ValidateSort<TResponse>(sort, out var sortError))
            return Invalid("Query.Sort", sortError!);

        var filterResult = ParseFilter<TResponse>(query);
        if (filterResult.IsFailure)
            return Result<QueryParameters>.Failure(filterResult.Error);

        return Result<QueryParameters>.Success(new QueryParameters(page, pageSize, before, after, keyword, targets, sort, filterResult.Value));
    }

    private static Result<FilterGroup?> ParseFilter<TResponse>(IQueryCollection query) where TResponse : class
    {
        var buckets = new Dictionary<string, ConditionBucket>(StringComparer.Ordinal);
        var root = new MutableGroup(FilterLogicalOperator.And);

        foreach (var pair in query)
        {
            if (!pair.Key.StartsWith("filter[", StringComparison.OrdinalIgnoreCase)) continue;
            var tokens = Tokenize(pair.Key);
            if (tokens.Count < 3 || !tokens[0].Equals("filter", StringComparison.OrdinalIgnoreCase))
                return InvalidFilter($"Invalid filter key '{pair.Key}'.");

            var operatorIndex = tokens.FindIndex(1, token => Operators.ContainsKey(token));
            if (operatorIndex < 0)
                return InvalidFilter($"Filter '{pair.Key}' is missing a supported operator.");

            var groupPath = new List<GroupSegment>();
            var fieldParts = new List<string>();
            for (var i = 1; i < operatorIndex;)
            {
                if (IsLogical(tokens[i]))
                {
                    if (i + 1 >= operatorIndex || !int.TryParse(tokens[i + 1], out var index) || index < 0)
                        return InvalidFilter($"Logical filter '{pair.Key}' must use a zero-based array index.");
                    groupPath.Add(new GroupSegment(tokens[i].Equals("$or", StringComparison.OrdinalIgnoreCase) ? FilterLogicalOperator.Or : FilterLogicalOperator.And, index));
                    i += 2;
                    continue;
                }
                fieldParts.Add(tokens[i]);
                i++;
            }

            if (fieldParts.Count == 0) return InvalidFilter($"Filter '{pair.Key}' is missing a field.");
            var field = string.Join(".", fieldParts);
            if (!TryGetPropertyType(typeof(TResponse), field, out var propertyType))
                return InvalidFilter($"Unknown filter field '{field}'.");

            var operatorToken = tokens[operatorIndex];
            var filterOperator = Operators[operatorToken];
            var arrayIndex = 0;
            if (operatorIndex + 1 < tokens.Count)
            {
                if (!int.TryParse(tokens[operatorIndex + 1], out arrayIndex) || arrayIndex < 0 || operatorIndex + 2 != tokens.Count)
                    return InvalidFilter($"Operator '{operatorToken}' requires numeric array indexes.");
            }

            var key = $"{SerializePath(groupPath)}|{field}|{operatorToken}";
            if (!buckets.TryGetValue(key, out var bucket))
            {
                bucket = new ConditionBucket(groupPath, field, propertyType!, filterOperator);
                buckets[key] = bucket;
            }
            foreach (var value in pair.Value)
                bucket.Values[arrayIndex++] = value ?? string.Empty;
        }

        foreach (var bucket in buckets.Values)
        {
            if (!bucket.Values.Keys.SequenceEqual(Enumerable.Range(0, bucket.Values.Count)))
                return InvalidFilter("Array operator indexes must start at 0 and be contiguous.");

            var values = bucket.Values.OrderBy(x => x.Key).Select(x => x.Value).ToArray();
            if ((bucket.Operator == FilterOperator.In || bucket.Operator == FilterOperator.NotIn) && values.Length == 0)
                return InvalidFilter("$in/$notin requires at least one value.");
            if (bucket.Operator == FilterOperator.Between && values.Length != 2)
                return InvalidFilter("$between requires exactly two indexed values.");
            if (bucket.Operator is not (FilterOperator.In or FilterOperator.NotIn or FilterOperator.Between) && values.Length != 1)
                return InvalidFilter($"Operator '{bucket.Operator}' requires exactly one value.");
            if (!ValidateValues(bucket.PropertyType, bucket.Operator, values, out var valueError))
                return InvalidFilter(valueError!);
            root.Add(bucket.GroupPath, new FilterCondition(bucket.Field, bucket.Operator, values));
        }

        if (!root.ValidateIndexes())
            return InvalidFilter("Logical array indexes must start at 0 and be contiguous.");

        return Result<FilterGroup?>.Success(buckets.Count == 0 ? null : root.Freeze());
    }

    private static bool ValidateValues(Type propertyType, FilterOperator op, IReadOnlyList<string> values, out string? error)
    {
        error = null;
        var actualType = Nullable.GetUnderlyingType(propertyType) ?? propertyType;
        var stringOnly = op is FilterOperator.Eqi or FilterOperator.Nei or FilterOperator.Contains or FilterOperator.ContainsI or FilterOperator.NotContains or FilterOperator.NotContainsI or FilterOperator.StartsWith or FilterOperator.EndsWith;
        if (stringOnly && actualType != typeof(string))
        {
            error = $"Operator '{op}' can only be used with string fields.";
            return false;
        }

        var relational = op is FilterOperator.Lt or FilterOperator.Lte or FilterOperator.Gt or FilterOperator.Gte or FilterOperator.Between;
        if (relational && !IsRelationalType(actualType))
        {
            error = $"Operator '{op}' is not supported for field type '{actualType.Name}'.";
            return false;
        }

        foreach (var value in values)
        {
            var isNull = string.IsNullOrWhiteSpace(value) || value.Equals("null", StringComparison.OrdinalIgnoreCase);
            if (isNull && op is FilterOperator.In or FilterOperator.NotIn or FilterOperator.Between or FilterOperator.Lt or FilterOperator.Lte or FilterOperator.Gt or FilterOperator.Gte)
            {
                error = $"Operator '{op}' does not accept null values.";
                return false;
            }
            if (Nullable.GetUnderlyingType(propertyType) is not null && isNull) continue;
            if (!CanConvert(value, actualType))
            {
                error = $"Value '{value}' does not match field type '{actualType.Name}'.";
                return false;
            }
        }
        return true;
    }

    private static bool IsRelationalType(Type type)
    {
        if (type == typeof(DateTime) || type == typeof(DateTimeOffset))
            return true;

        return Type.GetTypeCode(type) is
            TypeCode.Byte or TypeCode.SByte or TypeCode.Int16 or TypeCode.UInt16
            or TypeCode.Int32 or TypeCode.UInt32 or TypeCode.Int64 or TypeCode.UInt64
            or TypeCode.Single or TypeCode.Double or TypeCode.Decimal;
    }

    private static bool CanConvert(string value, Type type)
    {
        if (type == typeof(string)) return true;
        if (type == typeof(Guid)) return Guid.TryParse(value, out _);
        if (type == typeof(bool)) return bool.TryParse(value, out _);
        if (type == typeof(DateTime)) return DateTime.TryParse(value, out _);
        if (type == typeof(DateTimeOffset)) return DateTimeOffset.TryParse(value, out _);
        if (type.IsEnum) return Enum.TryParse(type, value, ignoreCase: true, out _);
        try { _ = Convert.ChangeType(value, type, System.Globalization.CultureInfo.InvariantCulture); return true; }
        catch { return false; }
    }

    private static bool ValidateSort<TResponse>(string? sort, out string? error) where TResponse : class
    {
        error = null;
        if (string.IsNullOrWhiteSpace(sort)) return true;
        foreach (var item in sort.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var parts = item.Split(':', 2, StringSplitOptions.TrimEntries);
            if (!TryGetPropertyType(typeof(TResponse), parts[0], out _)) { error = $"Unknown sort field '{parts[0]}'."; return false; }
            if (parts.Length > 1 && !parts[1].Equals("asc", StringComparison.OrdinalIgnoreCase) && !parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase))
            { error = $"Sort direction for '{parts[0]}' must be asc or desc."; return false; }
        }
        return true;
    }

    private static IReadOnlyList<string> ReadTargets(IQueryCollection query)
    {
        if (!query.TryGetValue("targets", out var raw)) return [];
        return raw.SelectMany(value => (value ?? string.Empty).Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
    }

    private static string? GetSingle(IQueryCollection query, string key)
        => query.TryGetValue(key, out StringValues value) ? value.FirstOrDefault() : null;

    private static bool TryReadPositiveInt(IQueryCollection query, string key, int defaultValue, out int value)
    {
        value = defaultValue;
        if (!query.TryGetValue(key, out var raw) || StringValues.IsNullOrEmpty(raw)) return true;
        return int.TryParse(raw.FirstOrDefault(), out value) && value > 0;
    }

    private static bool TryGetPropertyType(Type root, string path, out Type? propertyType)
    {
        propertyType = root;
        foreach (var segment in path.Split('.', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var property = propertyType.GetProperty(segment, BindingFlags.Instance | BindingFlags.Public | BindingFlags.IgnoreCase);
            if (property is null) { propertyType = null; return false; }
            propertyType = property.PropertyType;
        }
        return true;
    }

    private static List<string> Tokenize(string key)
    {
        var result = new List<string>();
        var firstBracket = key.IndexOf('[');
        result.Add(firstBracket < 0 ? key : key[..firstBracket]);
        foreach (Match match in BracketRegex().Matches(key)) result.Add(match.Groups[1].Value);
        return result;
    }

    private static bool IsLogical(string token) => token.Equals("$and", StringComparison.OrdinalIgnoreCase) || token.Equals("$or", StringComparison.OrdinalIgnoreCase);
    private static string SerializePath(IEnumerable<GroupSegment> path) => string.Join("/", path.Select(x => $"{x.Operator}:{x.Index}"));
    private static Result<QueryParameters> Invalid(string code, string message) => Result<QueryParameters>.Failure(new Error(code, message, ErrorType.Validation));
    private static Result<FilterGroup?> InvalidFilter(string message) => Result<FilterGroup?>.Failure(new Error("Query.Filter", message, ErrorType.Validation));

    [GeneratedRegex(@"\[([^\]]*)\]")]
    private static partial Regex BracketRegex();

    private sealed record GroupSegment(FilterLogicalOperator Operator, int Index);
    private sealed class ConditionBucket(IReadOnlyList<GroupSegment> groupPath, string field, Type propertyType, FilterOperator @operator)
    {
        public IReadOnlyList<GroupSegment> GroupPath { get; } = groupPath;
        public string Field { get; } = field;
        public Type PropertyType { get; } = propertyType;
        public FilterOperator Operator { get; } = @operator;
        public SortedDictionary<int, string> Values { get; } = [];
    }

    private sealed class MutableGroup(FilterLogicalOperator @operator)
    {
        private readonly List<FilterNode> _conditions = [];
        private readonly Dictionary<FilterLogicalOperator, LogicalContainer> _containers = [];
        public FilterLogicalOperator Operator { get; } = @operator;
        public void Add(IReadOnlyList<GroupSegment> path, FilterCondition condition)
        {
            var current = this;
            foreach (var segment in path)
            {
                if (!current._containers.TryGetValue(segment.Operator, out var container))
                {
                    container = new LogicalContainer(segment.Operator);
                    current._containers[segment.Operator] = container;
                }
                current = container.GetItem(segment.Index);
            }
            current._conditions.Add(condition);
        }
        public bool ValidateIndexes()
            => _containers.Values.All(container => container.ValidateIndexes());

        public FilterGroup Freeze()
        {
            var children = new List<FilterNode>(_conditions);
            foreach (var container in _containers.Values) children.Add(container.Freeze());
            return new FilterGroup(Operator, children);
        }
    }

    private sealed class LogicalContainer(FilterLogicalOperator @operator)
    {
        private readonly SortedDictionary<int, MutableGroup> _items = [];
        public MutableGroup GetItem(int index)
        {
            if (!_items.TryGetValue(index, out var group)) { group = new MutableGroup(FilterLogicalOperator.And); _items[index] = group; }
            return group;
        }
        public bool ValidateIndexes()
            => _items.Keys.SequenceEqual(Enumerable.Range(0, _items.Count))
                && _items.Values.All(item => item.ValidateIndexes());

        public FilterGroup Freeze() => new(@operator, _items.Values.Select(item => (FilterNode)item.Freeze()).ToArray());
    }
}
