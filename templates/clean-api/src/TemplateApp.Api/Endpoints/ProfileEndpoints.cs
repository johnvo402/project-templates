using System.Security.Claims;
using Mediator;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Profile.Common.Models;
using TemplateApp.Application.Features.Profile.GetProfile;
using TemplateApp.Application.Features.Profile.UpdateProfile;

namespace TemplateApp.Api.Endpoints;

public static class ProfileEndpoints
{
    public static IEndpointRouteBuilder MapProfileEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/profile").WithTags("Profile");

        group.MapGet("/", async (ClaimsPrincipal principal, ISender sender, CancellationToken cancellationToken) =>
        {
            if (!TryGetUserId(principal, out var userId))
                return Result<GetProfileResponse>.Failure(new Error("auth.invalid_subject", "Authenticated subject is invalid.", ErrorType.Unauthorized)).ToHttpResult();
            var result = await sender.Send(new GetProfileQuery(userId), cancellationToken);
            return result.ToHttpResult();
        }).WithName("GetProfile");

        group.MapPut("/", async (
            UserProfileModel model,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            if (!TryGetUserId(principal, out var userId))
                return Result.Failure(new Error("auth.invalid_subject", "Authenticated subject is invalid.", ErrorType.Unauthorized)).ToHttpResult();
            var result = await sender.Send(new UpdateProfileCommand(userId, model), cancellationToken);
            return result.ToNoContentHttpResult();
        }).WithName("UpdateProfile");

        return endpoints;
    }

    internal static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
        => Guid.TryParse(principal.FindFirstValue("sub"), out userId);
}
