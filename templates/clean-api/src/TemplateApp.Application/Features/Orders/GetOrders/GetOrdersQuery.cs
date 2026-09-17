using Mediator;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Orders.Common.Projections;
using TemplateApp.Domain.Orders;

namespace TemplateApp.Application.Features.Orders.GetOrders;

public sealed record GetOrdersQuery(PageParameters Page, OrderStatus? Status = null)
    : IQuery<Result<PaginationResponse<OrderSummaryProjection>>>;
