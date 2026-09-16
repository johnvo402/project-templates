using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Common;
using TemplateApp.Domain.Products;
using TemplateApp.Domain.Products.Specifications;

namespace TemplateApp.Application.Features.Products.DeleteProduct;

public sealed class DeleteProductCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<DeleteProductCommand, Result>
{
    public async ValueTask<Result> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var repository = unitOfWork.Repository<Product>();
        var product = await repository.FirstOrDefaultAsync(
            new ProductByIdSpecification(new ProductId(request.Id)),
            cancellationToken);

        if (product is null)
            return Result.Failure(new Error("products.not-found", "Product was not found.", ErrorType.NotFound));

        repository.Remove(product);
        await unitOfWork.SaveAsync(cancellationToken);
#if REDIS
        await ProductCache.InvalidateAsync(unitOfWork, cancellationToken);
#endif
        return Result.Success();
    }
}
