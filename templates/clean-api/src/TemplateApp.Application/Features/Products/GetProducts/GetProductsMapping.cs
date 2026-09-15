using System.Linq.Expressions;
using TemplateApp.Application.Features.Products.Common.Projections;
using TemplateApp.Domain.Products;

namespace TemplateApp.Application.Features.Products.GetProducts;

public static class GetProductsMapping
{
    public static Expression<Func<Product, ProductProjection>> Selector()
        => product => new ProductProjection(
            product.Id.Value,
            product.Name,
            product.Sku,
            product.Price,
            product.StockQuantity,
            product.IsActive,
            product.CreatedAt,
            product.UpdatedAt);
}
