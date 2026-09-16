using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Orders.Common.Projections;
using TemplateApp.Domain.Orders;
using TemplateApp.Domain.Orders.Specifications;

namespace TemplateApp.Application.Features.Orders.GetOrders;

public sealed class GetOrdersQueryHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<GetOrdersQuery, Result<PaginationResponse<OrderSummaryProjection>>>
{
    public async ValueTask<Result<PaginationResponse<OrderSummaryProjection>>> Handle(
        GetOrdersQuery request,
        CancellationToken cancellationToken)
    {
        var result = await unitOfWork.ReadOnlyRepository<Order>().PagedListAsync(
            new ListOrdersSpecification(),
            GetOrdersMapping.Selector(),
            request.Query,
            cancellationToken);

        return Result<PaginationResponse<OrderSummaryProjection>>.Success(result);
    }
}
