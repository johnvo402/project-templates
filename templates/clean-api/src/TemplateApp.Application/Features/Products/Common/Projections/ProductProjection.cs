namespace TemplateApp.Application.Features.Products.Common.Projections;

public sealed record ProductProjection(
    Guid Id,
    string Name,
    string Sku,
    decimal Price,
    int StockQuantity,
    bool IsActive,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
