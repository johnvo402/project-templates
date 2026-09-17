using TemplateApp.Domain.Common;
using TemplateApp.Domain.Orders;

namespace TemplateApp.UnitTests;

public sealed class OrderTests
{
    [Fact]
    public void ChangeStatus_MovesPendingToProcessing()
    {
        var order = Order.Create("Customer", null);

        order.ChangeStatus(OrderStatus.Processing);

        Assert.Equal(OrderStatus.Processing, order.Status);
    }

    [Fact]
    public void ChangeStatus_RejectsSkippingFromPendingToCompleted()
    {
        var order = Order.Create("Customer", null);

        var exception = Assert.Throws<DomainException>(() => order.ChangeStatus(OrderStatus.Completed));

        Assert.Equal("orders.invalid-status-transition", exception.Code);
        Assert.Equal(OrderStatus.Pending, order.Status);
    }

    [Fact]
    public void ChangeStatus_MovesProcessingToCompleted()
    {
        var order = Order.Create("Customer", null);
        order.ChangeStatus(OrderStatus.Processing);

        order.ChangeStatus(OrderStatus.Completed);

        Assert.Equal(OrderStatus.Completed, order.Status);
    }

    [Fact]
    public void ChangeStatus_RejectsChangesAfterCompletion()
    {
        var order = Order.Create("Customer", null);
        order.ChangeStatus(OrderStatus.Processing);
        order.ChangeStatus(OrderStatus.Completed);

        Assert.Throws<DomainException>(() => order.ChangeStatus(OrderStatus.Processing));
        Assert.Equal(OrderStatus.Completed, order.Status);
    }
}
