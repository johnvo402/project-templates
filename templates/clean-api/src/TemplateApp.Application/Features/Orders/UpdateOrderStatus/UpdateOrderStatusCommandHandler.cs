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
        var order = await unitOfWork.Repository<Order>().FirstOrDefaultAsync(
            new OrderByIdSpecification(new OrderId(request.Id)),
            cancellationToken);

        if (order is null)
            return Result.Failure(new Error("orders.not-found", "Order was not found.", ErrorType.NotFound));

        try
        {
            order.ChangeStatus(request.Status);
            await unitOfWork.SaveAsync(cancellationToken);
            return Result.Success();
        }
        catch (DomainException exception)
        {
            return Result.Failure(new Error(exception.Code, exception.Message, ErrorType.Validation));
        }
    }
}
