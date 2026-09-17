using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Products.Specifications;

public sealed class ListProductsSpecification : Specification<Product>
{
    public ListProductsSpecification(bool? isActive = null)
    {
        if (isActive is not null)
            Query.Where(product => product.IsActive == isActive.Value);

        Query.OrderByDescending(product => product.CreatedAt).AsNoTracking();
    }
}
