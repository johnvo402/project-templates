using System.Linq.Expressions;
using TemplateApp.Application.Features.Orders.Common.Projections;
using TemplateApp.Domain.Orders;

namespace TemplateApp.Application.Features.Orders.GetOrder;

public static class GetOrderMapping
{
    public static Expression<Func<Order, OrderProjection>> Selector()
        => order => new OrderProjection(
            order.Id.Value,
            order.OrderNumber,
            order.CustomerName,
            order.CustomerPhone,
            order.Status.ToString(),
            order.Items.Sum(item => item.Quantity * item.UnitPrice),
            order.CreatedAt,
            order.UpdatedAt,
            order.Items
                .Select(item => new OrderItemProjection(
                    item.ProductId.Value,
                    item.ProductName,
                    item.Quantity,
                    item.UnitPrice,
                    item.Quantity * item.UnitPrice))
                .ToList());
}
