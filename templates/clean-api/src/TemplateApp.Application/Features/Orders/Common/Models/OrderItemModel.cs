namespace TemplateApp.Application.Features.Orders.Common.Models;

public sealed record OrderItemModel(Guid ProductId, int Quantity);
