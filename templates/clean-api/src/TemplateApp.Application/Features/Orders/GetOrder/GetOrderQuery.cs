using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Orders.Common.Projections;

namespace TemplateApp.Application.Features.Orders.GetOrder;

public sealed record GetOrderQuery(Guid Id) : IQuery<Result<OrderProjection>>;
