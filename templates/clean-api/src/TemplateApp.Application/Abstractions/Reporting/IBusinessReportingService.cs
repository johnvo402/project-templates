using TemplateApp.Application.Features.Dashboard.Common.Projections;
using TemplateApp.Application.Features.Reports.Common.Projections;

namespace TemplateApp.Application.Abstractions.Reporting;

public interface IBusinessReportingService
{
    Task<DashboardProjection> GetDashboardAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RevenuePointProjection>> GetRevenueAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrderStatusProjection>> GetOrdersByStatusAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TopProductProjection>> GetTopProductsAsync(int take, CancellationToken cancellationToken = default);
}
