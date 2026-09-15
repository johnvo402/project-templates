using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Common;
using TemplateApp.Domain.Orders;
using TemplateApp.Domain.Orders.Specifications;
using TemplateApp.Domain.Products;
using TemplateApp.Domain.Products.Specifications;

namespace TemplateApp.Application.Features.Orders.CancelOrder;

public sealed class CancelOrderCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<CancelOrderCommand, Result>
{
    public async ValueTask<Result> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var order = await unitOfWork.Repository<Order>().FirstOrDefaultAsync(
                new OrderByIdSpecification(new OrderId(request.Id)),
                cancellationToken);

            if (order is null)
            {
                await unitOfWork.RollbackAsync(cancellationToken);
                return Result.Failure(new Error("orders.not-found", "Order was not found.", ErrorType.NotFound));
            }

            if (order.Status == OrderStatus.Cancelled)
            {
                await unitOfWork.RollbackAsync(cancellationToken);
                return Result.Success();
            }

            if (order.Status == OrderStatus.Completed)
            {
                await unitOfWork.RollbackAsync(cancellationToken);
                return Result.Failure(new Error("orders.completed", "Completed orders cannot be cancelled.", ErrorType.Conflict));
            }

            var productRepository = unitOfWork.Repository<Product>();
            foreach (var item in order.Items)
            {
                var product = await productRepository.FirstOrDefaultAsync(
                    new ProductByIdSpecification(item.ProductId),
                    cancellationToken);
                product?.AdjustStock(item.Quantity);
            }

            order.Cancel();
            await unitOfWork.SaveAsync(cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);
            return Result.Success();
        }
        catch (DomainException exception)
        {
            await unitOfWork.RollbackAsync(cancellationToken);
            return Result.Failure(new Error(exception.Code, exception.Message, ErrorType.Validation));
        }
        catch
        {
            await unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
