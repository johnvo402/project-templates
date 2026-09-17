using Mediator;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Common.Projections;

namespace TemplateApp.Application.Features.Products.GetProducts;

public sealed record GetProductsQuery(PageParameters Page, bool? IsActive = null)
    : IQuery<Result<PaginationResponse<ProductProjection>>>;
