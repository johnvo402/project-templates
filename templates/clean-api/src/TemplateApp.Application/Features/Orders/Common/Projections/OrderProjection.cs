namespace TemplateApp.Application.Features.Orders.Common.Projections;

public sealed record OrderProjection(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string? CustomerPhone,
    string Status,
    decimal TotalAmount,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<OrderItemProjection> Items);
