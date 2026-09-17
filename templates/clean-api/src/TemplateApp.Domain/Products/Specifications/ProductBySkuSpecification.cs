using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Products.Specifications;

public sealed class ProductBySkuSpecification : Specification<Product>
{
    public ProductBySkuSpecification(string sku, bool asNoTracking = false)
    {
        var normalized = sku.Trim().ToUpperInvariant();
        Query.Where(product => product.Sku == normalized);
        if (asNoTracking) Query.AsNoTracking();
    }
}
