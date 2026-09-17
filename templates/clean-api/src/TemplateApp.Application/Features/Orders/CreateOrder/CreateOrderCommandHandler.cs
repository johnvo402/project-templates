using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Common;
using TemplateApp.Domain.Orders;
using TemplateApp.Domain.Products;
using TemplateApp.Domain.Products.Specifications;

namespace TemplateApp.Application.Features.Orders.CreateOrder;

public sealed class CreateOrderCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<CreateOrderCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var order = Order.Create(request.Model.CustomerName, request.Model.CustomerPhone);
            var productRepository = unitOfWork.Repository<Product>();

            foreach (var item in request.Model.Items)
            {
                var product = await productRepository.FirstOrDefaultAsync(
                    new ProductByIdSpecification(new ProductId(item.ProductId)),
                    cancellationToken);

                if (product is null)
                {
                    await unitOfWork.RollbackAsync(cancellationToken);
                    return Result<Guid>.Failure(new Error("orders.product-not-found", $"Product '{item.ProductId}' was not found.", ErrorType.NotFound));
                }

                if (!product.IsActive)
                {
                    await unitOfWork.RollbackAsync(cancellationToken);
                    return Result<Guid>.Failure(new Error("orders.product-inactive", $"Product '{product.Name}' is inactive.", ErrorType.Conflict));
                }

                product.AdjustStock(-item.Quantity);
                order.AddItem(product.Id, product.Name, item.Quantity, product.Price);
            }

            order.ConfirmCreated();
            await unitOfWork.Repository<Order>().AddAsync(order, cancellationToken);
            await unitOfWork.SaveAsync(cancellationToken);
            await unitOfWork.CommitAsync(cancellationToken);
            return Result<Guid>.Success(order.Id.Value);
        }
        catch (DomainException exception)
        {
            await unitOfWork.RollbackAsync(cancellationToken);
            return Result<Guid>.Failure(new Error(exception.Code, exception.Message, ErrorType.Validation));
        }
        catch
        {
            await unitOfWork.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
