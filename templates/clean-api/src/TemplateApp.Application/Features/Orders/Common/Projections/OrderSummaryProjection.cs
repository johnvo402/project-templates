namespace TemplateApp.Application.Features.Orders.Common.Projections;

public sealed record OrderSummaryProjection(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string Status,
    decimal TotalAmount,
    int ItemCount,
    DateTimeOffset CreatedAt);
