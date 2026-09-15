using Microsoft.EntityFrameworkCore;
using TemplateApp.Application.Abstractions.Reporting;
using TemplateApp.Application.Features.Dashboard.Common.Projections;
using TemplateApp.Application.Features.Reports.Common.Projections;
using TemplateApp.Domain.Orders;
using TemplateApp.Infrastructure.Persistence;

namespace TemplateApp.Infrastructure.Reporting;

public sealed class BusinessReportingService(AppDbContext dbContext) : IBusinessReportingService
{
    public async Task<DashboardProjection> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var today = new DateTimeOffset(now.UtcDateTime.Date, TimeSpan.Zero);
        var monthStart = new DateTimeOffset(new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc));

        var completed = dbContext.Orders.AsNoTracking().Where(x => x.Status == OrderStatus.Completed);
        var revenueToday = await completed
            .Where(x => x.CreatedAt >= today)
            .Select(x => x.Items.Sum(item => item.Quantity * item.UnitPrice))
            .SumAsync(cancellationToken);
        var revenueThisMonth = await completed
            .Where(x => x.CreatedAt >= monthStart)
            .Select(x => x.Items.Sum(item => item.Quantity * item.UnitPrice))
            .SumAsync(cancellationToken);

        var totalOrders = await dbContext.Orders.CountAsync(cancellationToken);
        var pendingOrders = await dbContext.Orders.CountAsync(x => x.Status == OrderStatus.Pending, cancellationToken);
        var totalProducts = await dbContext.Products.CountAsync(cancellationToken);
        var lowStockThreshold = await dbContext.StoreSettings
            .AsNoTracking()
            .Select(x => (int?)x.LowStockThreshold)
            .FirstOrDefaultAsync(cancellationToken) ?? 5;
        var lowStockProducts = await dbContext.Products.CountAsync(x => x.IsActive && x.StockQuantity <= lowStockThreshold, cancellationToken);
        var totalEmployees = await dbContext.Users.CountAsync(cancellationToken);

        var revenue = await GetRevenueAsync(DateOnly.FromDateTime(now.UtcDateTime.Date.AddDays(-29)), DateOnly.FromDateTime(now.UtcDateTime.Date), cancellationToken);
        var byStatus = await GetOrdersByStatusAsync(cancellationToken);
        var topProducts = await GetTopProductsAsync(5, cancellationToken);
        var recentOrders = await dbContext.Orders
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Take(5)
            .Select(order => new RecentOrderProjection(
                order.Id.Value,
                order.OrderNumber,
                order.CustomerName,
                order.Status.ToString(),
                order.Items.Sum(item => item.Quantity * item.UnitPrice),
                order.CreatedAt))
            .ToListAsync(cancellationToken);

        return new DashboardProjection(
            revenueToday,
            revenueThisMonth,
            totalOrders,
            pendingOrders,
            totalProducts,
            lowStockProducts,
            totalEmployees,
            revenue,
            byStatus,
            topProducts,
            recentOrders);
    }

    public async Task<IReadOnlyList<RevenuePointProjection>> GetRevenueAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken = default)
    {
        var start = new DateTimeOffset(from.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc));
        var endExclusive = new DateTimeOffset(to.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc));
        var rows = await dbContext.Orders
            .AsNoTracking()
            .Where(x => x.Status == OrderStatus.Completed && x.CreatedAt >= start && x.CreatedAt < endExclusive)
            .Select(x => new
            {
                x.CreatedAt,
                Revenue = x.Items.Sum(item => item.Quantity * item.UnitPrice)
            })
            .ToListAsync(cancellationToken);

        var values = rows
            .GroupBy(x => DateOnly.FromDateTime(x.CreatedAt.UtcDateTime.Date))
            .ToDictionary(x => x.Key, x => x.Sum(row => row.Revenue));

        var result = new List<RevenuePointProjection>();
        for (var date = from; date <= to; date = date.AddDays(1))
            result.Add(new RevenuePointProjection(date, values.GetValueOrDefault(date)));

        return result;
    }

    public async Task<IReadOnlyList<OrderStatusProjection>> GetOrdersByStatusAsync(CancellationToken cancellationToken = default)
    {
        var rows = await dbContext.Orders
            .AsNoTracking()
            .GroupBy(x => x.Status)
            .Select(group => new { Status = group.Key, Count = group.Count() })
            .ToListAsync(cancellationToken);

        return rows.Select(x => new OrderStatusProjection(x.Status.ToString(), x.Count)).ToList();
    }

    public async Task<IReadOnlyList<TopProductProjection>> GetTopProductsAsync(
        int take,
        CancellationToken cancellationToken = default)
    {
        var rows = await dbContext.Orders
            .AsNoTracking()
            .Where(order => order.Status == OrderStatus.Completed)
            .SelectMany(order => order.Items)
            .GroupBy(item => new { item.ProductId, item.ProductName })
            .Select(group => new
            {
                group.Key.ProductId,
                group.Key.ProductName,
                Quantity = group.Sum(item => item.Quantity),
                Revenue = group.Sum(item => item.Quantity * item.UnitPrice)
            })
            .OrderByDescending(x => x.Quantity)
            .Take(take)
            .ToListAsync(cancellationToken);

        return rows.Select(x => new TopProductProjection(
            x.ProductId.Value,
            x.ProductName,
            x.Quantity,
            x.Revenue)).ToList();
    }
}
