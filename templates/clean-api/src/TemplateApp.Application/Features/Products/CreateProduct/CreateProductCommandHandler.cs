using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Common;
using TemplateApp.Domain.Products;
using TemplateApp.Domain.Products.Specifications;

namespace TemplateApp.Application.Features.Products.CreateProduct;

public sealed class CreateProductCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<CreateProductCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var repository = unitOfWork.Repository<Product>();
        var existing = await repository.FirstOrDefaultAsync(
            new ProductBySkuSpecification(request.Model.Sku, asNoTracking: true),
            cancellationToken);

        if (existing is not null)
            return Result<Guid>.Failure(new Error("products.sku-conflict", "A product with this SKU already exists.", ErrorType.Conflict));

        try
        {
            var product = Product.Create(
                request.Model.Name,
                request.Model.Sku,
                request.Model.Price,
                request.Model.StockQuantity);

            if (!request.Model.IsActive)
                product.Update(product.Name, product.Sku, product.Price, product.StockQuantity, false);

            await repository.AddAsync(product, cancellationToken);
            await unitOfWork.SaveAsync(cancellationToken);
            return Result<Guid>.Success(product.Id.Value);
        }
        catch (DomainException exception)
        {
            return Result<Guid>.Failure(new Error(exception.Code, exception.Message, ErrorType.Validation));
        }
    }
}
