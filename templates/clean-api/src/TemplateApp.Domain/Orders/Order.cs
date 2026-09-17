using TemplateApp.Domain.Common;
using TemplateApp.Domain.Orders.Events;
using TemplateApp.Domain.Products;

namespace TemplateApp.Domain.Orders;

public sealed class Order : AggregateRoot<OrderId>
{
    private readonly List<OrderItem> _items = [];

    private Order() : base(default) { }

    private Order(OrderId id, string orderNumber, string customerName, string? customerPhone)
        : base(id)
    {
        OrderNumber = orderNumber;
        CustomerName = customerName;
        CustomerPhone = customerPhone;
        Status = OrderStatus.Pending;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public string OrderNumber { get; private set; } = string.Empty;
    public string CustomerName { get; private set; } = string.Empty;
    public string? CustomerPhone { get; private set; }
    public OrderStatus Status { get; private set; }
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    public decimal TotalAmount => _items.Sum(x => x.Total);
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public static Order Create(string customerName, string? customerPhone)
    {
        if (string.IsNullOrWhiteSpace(customerName))
            throw new DomainException("Customer name is required.");

        var id = OrderId.New();
        var order = new Order(
            id,
            $"ORD-{DateTimeOffset.UtcNow:yyyyMMdd}-{id.Value.ToString("N")[..8].ToUpperInvariant()}",
            customerName.Trim(),
            string.IsNullOrWhiteSpace(customerPhone) ? null : customerPhone.Trim());

        return order;
    }

    public void AddItem(ProductId productId, string productName, int quantity, decimal unitPrice)
    {
        if (quantity <= 0) throw new DomainException("Order item quantity must be greater than zero.");
        if (unitPrice < 0) throw new DomainException("Order item price cannot be negative.");
        if (string.IsNullOrWhiteSpace(productName)) throw new DomainException("Product name is required.");

        _items.Add(new OrderItem(productId, productName.Trim(), quantity, unitPrice));
    }

    public void ConfirmCreated()
    {
        if (_items.Count == 0) throw new DomainException("Order must contain at least one item.");
        RaiseDomainEvent(new OrderCreatedDomainEvent(Id));
    }

    public void ChangeStatus(OrderStatus status)
    {
        if (Status is OrderStatus.Completed or OrderStatus.Cancelled)
            throw new DomainException("orders.invalid-status-transition", "Completed or cancelled orders cannot change status.");

        if (status == OrderStatus.Cancelled)
        {
            Cancel();
            return;
        }

        var nextStatus = Status switch
        {
            OrderStatus.Pending => OrderStatus.Processing,
            OrderStatus.Processing => OrderStatus.Completed,
            _ => throw new DomainException("orders.invalid-status-transition", "Order cannot move to another status.")
        };

        if (status != nextStatus)
            throw new DomainException(
                "orders.invalid-status-transition",
                $"Order status can only move from {Status} to {nextStatus}.");

        Status = status;
        UpdatedAt = DateTimeOffset.UtcNow;

        if (status == OrderStatus.Completed)
            RaiseDomainEvent(new OrderCompletedDomainEvent(Id));
    }

    public void Cancel()
    {
        if (Status == OrderStatus.Completed)
            throw new DomainException("Completed orders cannot be cancelled.");
        if (Status == OrderStatus.Cancelled) return;

        Status = OrderStatus.Cancelled;
        UpdatedAt = DateTimeOffset.UtcNow;
        RaiseDomainEvent(new OrderCancelledDomainEvent(Id));
    }
}
