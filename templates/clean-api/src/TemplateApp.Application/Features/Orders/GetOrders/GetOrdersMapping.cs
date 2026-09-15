using System.Linq.Expressions;
using TemplateApp.Application.Features.Orders.Common.Projections;
using TemplateApp.Domain.Orders;

namespace TemplateApp.Application.Features.Orders.GetOrders;

public static class GetOrdersMapping
{
    public static Expression<Func<Order, OrderSummaryProjection>> Selector()
        => order => new OrderSummaryProjection(
            order.Id.Value,
            order.OrderNumber,
            order.CustomerName,
            order.Status.ToString(),
            order.Items.Sum(item => item.Quantity * item.UnitPrice),
            order.Items.Sum(item => item.Quantity),
            order.CreatedAt);
}
