using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Features.Settings.Common.Models;
using TemplateApp.Application.Features.Settings.GetSettings;
using TemplateApp.Application.Features.Settings.UpdateSettings;

namespace TemplateApp.Api.Endpoints;

public static class SettingsEndpoints
{
    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/settings").WithTags("Settings");

        group.MapGet("/display", async (ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetSettingsQuery(), cancellationToken);
            if (result.IsFailure)
                return result.ToHttpResult();

            var settings = result.Value!;
            return Results.Ok(new ApiResponse<StoreDisplaySettingsResponse>(
                new StoreDisplaySettingsResponse(settings.Currency, settings.Timezone)));
        })
        .WithName("GetDisplaySettings")
        .RequireAuthorization();

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetSettingsQuery(), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("GetSettings")
        .RequireAuthorization(AppPolicies.SettingsView);

        group.MapPut("/", async (StoreSettingsModel model, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new UpdateSettingsCommand(model), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("UpdateSettings")
        .RequireAuthorization(AppPolicies.SettingsUpdate);

        return endpoints;
    }

    private sealed record StoreDisplaySettingsResponse(string Currency, string Timezone);
}
