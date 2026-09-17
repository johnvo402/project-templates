using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Products;

public sealed class ProductImage : Entity<Guid>
{
    private ProductImage() { }

    private ProductImage(Guid id, ProductId productId, string objectName, bool isPrimary)
        : base(id)
    {
        ProductId = productId;
        ObjectName = objectName;
        IsPrimary = isPrimary;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public ProductId ProductId { get; private set; }
    public string ObjectName { get; private set; } = string.Empty;
    public bool IsPrimary { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public static ProductImage Create(ProductId productId, string objectName, bool isPrimary)
    {
        if (productId.Value == Guid.Empty)
            throw new DomainException("Product image requires a product.");
        if (string.IsNullOrWhiteSpace(objectName))
            throw new DomainException("Product image object name is required.");

        return new ProductImage(Guid.NewGuid(), productId, objectName.Trim(), isPrimary);
    }

    public void SetPrimary(bool isPrimary) => IsPrimary = isPrimary;
}
