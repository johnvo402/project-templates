using Mediator;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Orders.UpdateOrderStatus;

public sealed record UpdateOrderStatusCommand(Guid Id, string Status) : ICommand<Result>;
