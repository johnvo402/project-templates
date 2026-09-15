namespace TemplateApp.Application.Common.Querying;

public sealed record PageParameters(int Page = 1, int PageSize = 20)
{
    public int NormalizedPage => Math.Max(Page, 1);
    public int NormalizedPageSize => Math.Clamp(PageSize, 1, 100);
}
