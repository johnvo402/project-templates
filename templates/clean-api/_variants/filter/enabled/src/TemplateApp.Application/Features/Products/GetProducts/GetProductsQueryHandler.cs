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

        var page = await cache.GetOrCreateAsync(
            cacheKey,
            async ct => await LoadAsync(request, ct),
            ProductCache.QueryExpiration,
            cancellationToken);
#else
        var page = await LoadAsync(request, cancellationToken);
#endif

        return Result<PaginationResponse<ProductProjection>>.Success(page);
    }

    private Task<PaginationResponse<ProductProjection>> LoadAsync(
        GetProductsQuery request,
        CancellationToken cancellationToken)
        => unitOfWork.ReadOnlyRepository<Product>().PagedListAsync(
            new ListProductsSpecification(),
            GetProductsMapping.Selector(),
            request.Query,
            cancellationToken);
}
