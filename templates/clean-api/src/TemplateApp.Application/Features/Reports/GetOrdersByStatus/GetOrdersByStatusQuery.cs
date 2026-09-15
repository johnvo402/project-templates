using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Reports.Common.Projections;

namespace TemplateApp.Application.Features.Reports.GetOrdersByStatus;

public sealed record GetOrdersByStatusQuery : IQuery<Result<IReadOnlyList<OrderStatusProjection>>>;
