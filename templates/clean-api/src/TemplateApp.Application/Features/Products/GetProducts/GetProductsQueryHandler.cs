using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Common;
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
#if REDIS
        var version = await ProductCache.GetVersionAsync(unitOfWork, cancellationToken);
        var cacheKey = ProductCache.BuildQueryKey(version, request);
        var cache = unitOfWork.CacheRepository<PaginationResponse<ProductProjection>>();

        var result = await cache.GetOrCreateAsync(
            cacheKey,
            async ct => await LoadAsync(request, ct),
            ProductCache.QueryExpiration,
            cancellationToken);
#else
        var result = await LoadAsync(request, cancellationToken);
#endif

        return Result<PaginationResponse<ProductProjection>>.Success(result);
    }

    private Task<PaginationResponse<ProductProjection>> LoadAsync(
        GetProductsQuery request,
        CancellationToken cancellationToken)
        => unitOfWork.ReadOnlyRepository<Product>().PagedListAsync(
            new ListProductsSpecification(request.IsActive),
            GetProductsMapping.Selector(),
            request.Page,
            cancellationToken);
}
