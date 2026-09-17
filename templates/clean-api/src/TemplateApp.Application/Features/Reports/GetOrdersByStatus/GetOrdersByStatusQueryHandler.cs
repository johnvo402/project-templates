using Mediator;
using TemplateApp.Application.Abstractions.Reporting;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Reports.Common.Projections;

namespace TemplateApp.Application.Features.Reports.GetOrdersByStatus;

public sealed class GetOrdersByStatusQueryHandler(IBusinessReportingService reporting)
    : IQueryHandler<GetOrdersByStatusQuery, Result<IReadOnlyList<OrderStatusProjection>>>
{
    public async ValueTask<Result<IReadOnlyList<OrderStatusProjection>>> Handle(GetOrdersByStatusQuery request, CancellationToken cancellationToken)
        => Result<IReadOnlyList<OrderStatusProjection>>.Success(
            await reporting.GetOrdersByStatusAsync(cancellationToken));
}
