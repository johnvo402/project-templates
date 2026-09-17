namespace TemplateApp.Application.Features.Dashboard.Common.Projections;

public sealed record RecentOrderProjection(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string Status,
    decimal TotalAmount,
    DateTimeOffset CreatedAt);
