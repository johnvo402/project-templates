using System.Security.Claims;
using Mediator;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Profile.Avatar;
using TemplateApp.Application.Features.Profile.Common.Models;
using TemplateApp.Application.Features.Profile.Common.Projections;

namespace TemplateApp.Api.Endpoints;

public static class ProfileAvatarEndpointRegistration
{
    private const long MaxAvatarBytes = 5 * 1024 * 1024;

    public static IEndpointRouteBuilder MapOptionalProfileAvatarEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/profile/avatar").WithTags("Profile");

        group.MapGet("/", async (ClaimsPrincipal principal, ISender sender, CancellationToken cancellationToken) =>
        {
            if (!ProfileEndpoints.TryGetUserId(principal, out var userId))
                return Result<AvatarProjection>.Failure(new Error("auth.invalid_subject", "Authenticated subject is invalid.", ErrorType.Unauthorized)).ToHttpResult();
            var result = await sender.Send(new GetAvatarQuery(userId), cancellationToken);
            return result.ToHttpResult();
        }).WithName("GetProfileAvatar");

        group.MapPost("/", async (
            IFormFile file,
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            if (!ProfileEndpoints.TryGetUserId(principal, out var userId))
                return Result<AvatarProjection>.Failure(new Error("auth.invalid_subject", "Authenticated subject is invalid.", ErrorType.Unauthorized)).ToHttpResult();
            if (file.Length <= 0 || file.Length > MaxAvatarBytes)
                return Results.BadRequest(new { message = "Avatar must be between 1 byte and 5 MB." });

            await using var source = file.OpenReadStream();
            using var buffer = new MemoryStream((int)file.Length);
            await source.CopyToAsync(buffer, cancellationToken);

            var model = new AvatarUploadModel(file.FileName, file.ContentType, buffer.ToArray());
            var result = await sender.Send(new UploadAvatarCommand(userId, model), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("UploadProfileAvatar")
        .Accepts<IFormFile>("multipart/form-data")
        .DisableAntiforgery();

        return endpoints;
    }
}
