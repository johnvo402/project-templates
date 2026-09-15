namespace TemplateApp.Application.Common.Querying;

public enum FilterLogicalOperator
{
    And,
    Or
}

public enum FilterOperator
{
    Eq,
    Eqi,
    Ne,
    Nei,
    In,
    NotIn,
    Lt,
    Lte,
    Gt,
    Gte,
    Between,
    Contains,
    ContainsI,
    NotContains,
    NotContainsI,
    StartsWith,
    EndsWith
}

public abstract record FilterNode;

public sealed record FilterGroup(
    FilterLogicalOperator Operator,
    IReadOnlyList<FilterNode> Children) : FilterNode;

public sealed record FilterCondition(
    string Field,
    FilterOperator Operator,
    IReadOnlyList<string> Values) : FilterNode;
