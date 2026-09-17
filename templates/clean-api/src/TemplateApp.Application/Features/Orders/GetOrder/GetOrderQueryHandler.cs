using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Orders.Common.Projections;
using TemplateApp.Domain.Orders;
using TemplateApp.Domain.Orders.Specifications;

namespace TemplateApp.Application.Features.Orders.GetOrder;

public sealed class GetOrderQueryHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<GetOrderQuery, Result<OrderProjection>>
{
    public async ValueTask<Result<OrderProjection>> Handle(GetOrderQuery request, CancellationToken cancellationToken)
    {
        var order = await unitOfWork.ReadOnlyRepository<Order>().FirstOrDefaultAsync(
            new OrderByIdSpecification(new OrderId(request.Id), asNoTracking: true),
            GetOrderMapping.Selector(),
            cancellationToken);

        return order is null
            ? Result<OrderProjection>.Failure(new Error("orders.not-found", "Order was not found.", ErrorType.NotFound))
            : Result<OrderProjection>.Success(order);
    }
}
