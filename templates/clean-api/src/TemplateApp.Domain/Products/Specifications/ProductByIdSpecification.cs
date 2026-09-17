using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Products.Specifications;

public sealed class ProductByIdSpecification : Specification<Product>
{
    public ProductByIdSpecification(ProductId id, bool asNoTracking = false)
    {
        Query.Where(product => product.Id == id);
        if (asNoTracking) Query.AsNoTracking();
    }
}
