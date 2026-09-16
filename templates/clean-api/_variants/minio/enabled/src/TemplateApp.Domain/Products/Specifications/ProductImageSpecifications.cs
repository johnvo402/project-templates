using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Products.Specifications;

public sealed class ProductImagesByProductIdSpecification : Specification<ProductImage>
{
    public ProductImagesByProductIdSpecification(ProductId productId, bool asNoTracking = false)
    {
        Query.Where(image => image.ProductId == productId)
            .OrderByDescending(image => image.IsPrimary);
        if (asNoTracking) Query.AsNoTracking();
    }
}

public sealed class ProductImageByIdAndProductSpecification : Specification<ProductImage>
{
    public ProductImageByIdAndProductSpecification(Guid imageId, ProductId productId, bool asNoTracking = false)
    {
        Query.Where(image => image.Id == imageId && image.ProductId == productId);
        if (asNoTracking) Query.AsNoTracking();
    }
}
