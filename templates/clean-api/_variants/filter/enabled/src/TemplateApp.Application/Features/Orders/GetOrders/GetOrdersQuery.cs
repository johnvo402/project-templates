using Mediator;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Orders.Common.Projections;

namespace TemplateApp.Application.Features.Orders.GetOrders;

public sealed record GetOrdersQuery(QueryParameters Query)
    : IQuery<Result<PaginationResponse<OrderSummaryProjection>>>;
