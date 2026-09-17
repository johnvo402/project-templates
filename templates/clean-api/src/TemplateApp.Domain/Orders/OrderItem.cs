using TemplateApp.Domain.Products;

namespace TemplateApp.Domain.Orders;

public sealed class OrderItem
{
    private OrderItem() { }

    internal OrderItem(ProductId productId, string productName, int quantity, decimal unitPrice)
    {
        ProductId = productId;
        ProductName = productName;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }

    public ProductId ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal Total => Quantity * UnitPrice;
}
