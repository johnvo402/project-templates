namespace TemplateApp.Application.Features.Orders.Common.Projections;

public sealed record OrderItemProjection(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal Total);
