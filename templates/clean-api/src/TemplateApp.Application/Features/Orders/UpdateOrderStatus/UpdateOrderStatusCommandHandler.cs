using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Common;
using TemplateApp.Domain.Orders;
using TemplateApp.Domain.Orders.Specifications;

namespace TemplateApp.Application.Features.Orders.UpdateOrderStatus;

public sealed class UpdateOrderStatusCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<UpdateOrderStatusCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<OrderStatus>(request.Status, ignoreCase: true, out var status) ||
            status is not (OrderStatus.Processing or OrderStatus.Completed))
        {
            return Result.Failure(new Error(
                "orders.invalid-status",
                "Status must be Processing or Completed. Use the cancel order endpoint to cancel an order.",
                ErrorType.Validation));
        }

        var order = await unitOfWork.Repository<Order>().FirstOrDefaultAsync(
            new OrderByIdSpecification(new OrderId(request.Id)),
            cancellationToken);

        if (order is null)
            return Result.Failure(new Error("orders.not-found", "Order was not found.", ErrorType.NotFound));

        try
        {
            order.ChangeStatus(status);
            await unitOfWork.SaveAsync(cancellationToken);
            return Result.Success();
        }
        catch (DomainException exception)
        {
            return Result.Failure(new Error(exception.Code, exception.Message, ErrorType.Validation));
        }
    }
}
