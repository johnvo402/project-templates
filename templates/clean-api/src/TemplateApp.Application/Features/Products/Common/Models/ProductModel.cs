namespace TemplateApp.Application.Features.Products.Common.Models;

public sealed record ProductModel(
    string Name,
    string Sku,
    decimal Price,
    int StockQuantity,
    bool IsActive = true);
