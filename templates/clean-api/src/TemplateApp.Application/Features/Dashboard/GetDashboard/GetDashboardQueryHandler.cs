using Mediator;
using TemplateApp.Application.Abstractions.Reporting;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Dashboard.Common.Projections;

namespace TemplateApp.Application.Features.Dashboard.GetDashboard;

public sealed class GetDashboardQueryHandler(IBusinessReportingService reporting)
    : IQueryHandler<GetDashboardQuery, Result<DashboardProjection>>
{
    public async ValueTask<Result<DashboardProjection>> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
        => Result<DashboardProjection>.Success(await reporting.GetDashboardAsync(cancellationToken));
}
