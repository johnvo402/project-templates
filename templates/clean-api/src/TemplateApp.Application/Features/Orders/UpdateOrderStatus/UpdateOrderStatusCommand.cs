using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Orders;

namespace TemplateApp.Application.Features.Orders.UpdateOrderStatus;

public sealed record UpdateOrderStatusCommand(Guid Id, OrderStatus Status) : ICommand<Result>;
