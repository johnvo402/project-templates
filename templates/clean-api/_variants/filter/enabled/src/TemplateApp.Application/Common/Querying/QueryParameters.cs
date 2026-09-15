namespace TemplateApp.Application.Common.Querying;

public sealed record QueryParameters(
    int Page = 1,
    int PageSize = 20,
    string? Before = null,
    string? After = null,
    string? Keyword = null,
    IReadOnlyList<string>? Targets = null,
    string? Sort = null,
    FilterGroup? Filter = null)
{
    public int NormalizedPage => Math.Max(Page, 1);
    public int NormalizedPageSize => Math.Clamp(PageSize, 1, 100);
    public bool UsesCursor => !string.IsNullOrWhiteSpace(Before) || !string.IsNullOrWhiteSpace(After);
}
