namespace TemplateApp.Application.Features.Orders.Common.Models;

public sealed record CreateOrderModel(
    string CustomerName,
    string? CustomerPhone,
    IReadOnlyList<OrderItemModel> Items);
