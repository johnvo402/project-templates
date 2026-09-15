using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Common.Projections;
using TemplateApp.Domain.Products;
using TemplateApp.Domain.Products.Specifications;

namespace TemplateApp.Application.Features.Products.GetProduct;

public sealed class GetProductQueryHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<GetProductQuery, Result<ProductProjection>>
{
    public async ValueTask<Result<ProductProjection>> Handle(
        GetProductQuery request,
        CancellationToken cancellationToken)
    {
        var product = await unitOfWork.ReadOnlyRepository<Product>().FirstOrDefaultAsync(
            new ProductByIdSpecification(new ProductId(request.Id), asNoTracking: true),
            GetProductMapping.Selector(),
            cancellationToken);

        return product is null
            ? Result<ProductProjection>.Failure(new Error("products.not-found", "Product was not found.", ErrorType.NotFound))
            : Result<ProductProjection>.Success(product);
    }
}
