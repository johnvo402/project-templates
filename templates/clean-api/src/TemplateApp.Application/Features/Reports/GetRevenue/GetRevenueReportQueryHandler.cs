using Mediator;
using TemplateApp.Application.Abstractions.Reporting;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Reports.Common.Projections;

namespace TemplateApp.Application.Features.Reports.GetRevenue;

public sealed class GetRevenueReportQueryHandler(IBusinessReportingService reporting)
    : IQueryHandler<GetRevenueReportQuery, Result<IReadOnlyList<RevenuePointProjection>>>
{
    public async ValueTask<Result<IReadOnlyList<RevenuePointProjection>>> Handle(GetRevenueReportQuery request, CancellationToken cancellationToken)
        => Result<IReadOnlyList<RevenuePointProjection>>.Success(
            await reporting.GetRevenueAsync(request.From, request.To, cancellationToken));
}
