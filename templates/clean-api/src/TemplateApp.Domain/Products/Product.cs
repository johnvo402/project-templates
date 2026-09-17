using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Products;

public sealed partial class Product : AggregateRoot<ProductId>
{
    private Product() : base(default) { }

    private Product(ProductId id, string name, string sku, decimal price, int stockQuantity)
        : base(id)
    {
        Name = name;
        Sku = sku;
        Price = price;
        StockQuantity = stockQuantity;
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = CreatedAt;
        ConcurrencyStamp = Guid.NewGuid();
    }

    public string Name { get; private set; } = string.Empty;
    public string Sku { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public int StockQuantity { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public Guid ConcurrencyStamp { get; private set; }

    public static Product Create(string name, string sku, decimal price, int stockQuantity)
    {
        Validate(name, sku, price, stockQuantity);
        return new Product(ProductId.New(), name.Trim(), sku.Trim().ToUpperInvariant(), price, stockQuantity);
    }

    public void Update(string name, string sku, decimal price, int stockQuantity, bool isActive)
    {
        Validate(name, sku, price, stockQuantity);
        Name = name.Trim();
        Sku = sku.Trim().ToUpperInvariant();
        Price = price;
        StockQuantity = stockQuantity;
        IsActive = isActive;
        Touch();
    }

    public void AdjustStock(int quantityDelta)
    {
        if (StockQuantity + quantityDelta < 0)
            throw new DomainException("Product stock cannot be negative.");

        StockQuantity += quantityDelta;
        Touch();
    }

    private void Touch()
    {
        UpdatedAt = DateTimeOffset.UtcNow;
        ConcurrencyStamp = Guid.NewGuid();
    }

    private static void Validate(string name, string sku, decimal price, int stockQuantity)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Product name is required.");
        if (string.IsNullOrWhiteSpace(sku)) throw new DomainException("Product SKU is required.");
        if (price < 0) throw new DomainException("Product price cannot be negative.");
        if (stockQuantity < 0) throw new DomainException("Product stock cannot be negative.");
    }
}
