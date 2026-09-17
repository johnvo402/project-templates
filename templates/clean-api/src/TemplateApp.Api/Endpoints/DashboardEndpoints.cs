using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Features.Dashboard.GetDashboard;

namespace TemplateApp.Api.Endpoints;

public static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapDashboardEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/dashboard", async (ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetDashboardQuery(), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("GetDashboard")
        .WithTags("Dashboard")
        .RequireAuthorization(AppPolicies.DashboardView);

        return endpoints;
    }
}
