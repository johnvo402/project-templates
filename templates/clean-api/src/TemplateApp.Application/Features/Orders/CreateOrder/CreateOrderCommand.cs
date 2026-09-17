using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Orders.Common.Models;

namespace TemplateApp.Application.Features.Orders.CreateOrder;

public sealed record CreateOrderCommand(CreateOrderModel Model) : ICommand<Result<Guid>>;
