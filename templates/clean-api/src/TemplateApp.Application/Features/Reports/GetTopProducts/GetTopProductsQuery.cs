using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Reports.Common.Projections;

namespace TemplateApp.Application.Features.Reports.GetTopProducts;

public sealed record GetTopProductsQuery(int Take = 5)
    : IQuery<Result<IReadOnlyList<TopProductProjection>>>;
