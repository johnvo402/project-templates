using TemplateApp.Domain.Common;
using TemplateApp.Domain.Products;

namespace TemplateApp.UnitTests;

public sealed class ProductTests
{
    [Fact]
    public void Create_NormalizesSkuAndInitializesConcurrencyStamp()
    {
        var product = Product.Create("Keyboard", " kb-001 ", 49.90m, 10);

        Assert.Equal("KB-001", product.Sku);
        Assert.NotEqual(Guid.Empty, product.ConcurrencyStamp);
    }

    [Fact]
    public void Update_ChangesConcurrencyStamp()
    {
        var product = Product.Create("Keyboard", "KB-001", 49.90m, 10);
        var originalStamp = product.ConcurrencyStamp;

        product.Update("Mechanical Keyboard", "kb-001", 59.90m, 12, true);

        Assert.NotEqual(originalStamp, product.ConcurrencyStamp);
        Assert.Equal("KB-001", product.Sku);
    }

    [Fact]
    public void AdjustStock_ChangesConcurrencyStamp()
    {
        var product = Product.Create("Keyboard", "KB-001", 49.90m, 10);
        var originalStamp = product.ConcurrencyStamp;

        product.AdjustStock(-2);

        Assert.Equal(8, product.StockQuantity);
        Assert.NotEqual(originalStamp, product.ConcurrencyStamp);
    }

    [Fact]
    public void AdjustStock_RejectsNegativeStock()
    {
        var product = Product.Create("Keyboard", "KB-001", 49.90m, 1);

        Assert.Throws<DomainException>(() => product.AdjustStock(-2));
        Assert.Equal(1, product.StockQuantity);
    }
}
