using TemplateApp.Domain.Orders;

namespace TemplateApp.Application.Features.Orders.Common.Models;

public sealed record UpdateOrderStatusModel(OrderStatus Status);
