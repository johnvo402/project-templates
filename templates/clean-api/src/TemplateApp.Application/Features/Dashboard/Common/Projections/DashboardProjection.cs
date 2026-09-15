using TemplateApp.Application.Features.Reports.Common.Projections;

namespace TemplateApp.Application.Features.Dashboard.Common.Projections;

public sealed record DashboardProjection(
    decimal RevenueToday,
    decimal RevenueThisMonth,
    int TotalOrders,
    int PendingOrders,
    int TotalProducts,
    int LowStockProducts,
    int TotalEmployees,
    IReadOnlyList<RevenuePointProjection> Revenue,
    IReadOnlyList<OrderStatusProjection> OrdersByStatus,
    IReadOnlyList<TopProductProjection> TopProducts,
    IReadOnlyList<RecentOrderProjection> RecentOrders);
