using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Common.Projections;
using TemplateApp.Domain.Products;
using TemplateApp.Domain.Products.Specifications;

namespace TemplateApp.Application.Features.Products.GetProducts;

public sealed class GetProductsQueryHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<GetProductsQuery, Result<PaginationResponse<ProductProjection>>>
{
    public async ValueTask<Result<PaginationResponse<ProductProjection>>> Handle(
        GetProductsQuery request,
        CancellationToken cancellationToken)
    {
        var page = await unitOfWork.ReadOnlyRepository<Product>().PagedListAsync(
            new ListProductsSpecification(),
            GetProductsMapping.Selector(),
            request.Query,
            cancellationToken);

        return Result<PaginationResponse<ProductProjection>>.Success(page);
    }
}
