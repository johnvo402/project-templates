using Mediator;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Orders.CancelOrder;

public sealed record CancelOrderCommand(Guid Id) : ICommand<Result>;
