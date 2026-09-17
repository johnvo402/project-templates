using Mediator;
using TemplateApp.Application.Abstractions.Reporting;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Reports.Common.Projections;

namespace TemplateApp.Application.Features.Reports.GetTopProducts;

public sealed class GetTopProductsQueryHandler(IBusinessReportingService reporting)
    : IQueryHandler<GetTopProductsQuery, Result<IReadOnlyList<TopProductProjection>>>
{
    public async ValueTask<Result<IReadOnlyList<TopProductProjection>>> Handle(GetTopProductsQuery request, CancellationToken cancellationToken)
        => Result<IReadOnlyList<TopProductProjection>>.Success(
            await reporting.GetTopProductsAsync(request.Take, cancellationToken));
}
