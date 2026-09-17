using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Common;
using TemplateApp.Domain.Common;
using TemplateApp.Domain.Products;
using TemplateApp.Domain.Products.Specifications;

namespace TemplateApp.Application.Features.Products.UpdateProduct;

public sealed class UpdateProductCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<UpdateProductCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var repository = unitOfWork.Repository<Product>();
        var product = await repository.FirstOrDefaultAsync(
            new ProductByIdSpecification(new ProductId(request.Id)),
            cancellationToken);

        if (product is null)
            return Result.Failure(new Error("products.not-found", "Product was not found.", ErrorType.NotFound));

        var skuOwner = await repository.FirstOrDefaultAsync(
            new ProductBySkuSpecification(request.Model.Sku, asNoTracking: true),
            cancellationToken);

        if (skuOwner is not null && skuOwner.Id != product.Id)
            return Result.Failure(new Error("products.sku-conflict", "A product with this SKU already exists.", ErrorType.Conflict));

        try
        {
            product.Update(
                request.Model.Name,
                request.Model.Sku,
                request.Model.Price,
                request.Model.StockQuantity,
                request.Model.IsActive);

            await unitOfWork.SaveAsync(cancellationToken);
#if REDIS
            await ProductCache.InvalidateAsync(unitOfWork, cancellationToken);
#endif
            return Result.Success();
        }
        catch (DomainException exception)
        {
            return Result.Failure(new Error(exception.Code, exception.Message, ErrorType.Validation));
        }
    }
}
