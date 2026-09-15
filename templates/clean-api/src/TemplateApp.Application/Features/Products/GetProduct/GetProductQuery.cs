using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Common.Projections;

namespace TemplateApp.Application.Features.Products.GetProduct;

public sealed record GetProductQuery(Guid Id) : IQuery<Result<ProductProjection>>;
