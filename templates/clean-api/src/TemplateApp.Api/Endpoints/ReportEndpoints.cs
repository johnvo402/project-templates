using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Features.Reports.GetOrdersByStatus;
using TemplateApp.Application.Features.Reports.GetRevenue;
using TemplateApp.Application.Features.Reports.GetTopProducts;

namespace TemplateApp.Api.Endpoints;

public static class ReportEndpoints
{
    public static IEndpointRouteBuilder MapReportEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/reports").WithTags("Reports")
            .RequireAuthorization(AppPolicies.ReportsView);

        group.MapGet("/revenue", async (DateOnly? from, DateOnly? to, ISender sender, CancellationToken cancellationToken) =>
        {
            var end = to ?? DateOnly.FromDateTime(DateTime.UtcNow.Date);
            var start = from ?? end.AddDays(-29);
            var result = await sender.Send(new GetRevenueReportQuery(start, end), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("GetRevenueReport");

        group.MapGet("/orders-by-status", async (ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetOrdersByStatusQuery(), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("GetOrdersByStatusReport");

        group.MapGet("/top-products", async (int? take, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetTopProductsQuery(take ?? 5), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("GetTopProductsReport");

        return endpoints;
    }
}
