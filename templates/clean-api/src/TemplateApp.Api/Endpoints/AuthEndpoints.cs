using System.Security.Claims;
using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Contracts;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Auth.Common.Models;
using TemplateApp.Application.Features.Auth.GetCurrentUser;
using TemplateApp.Application.Features.Auth.Login;
using TemplateApp.Application.Features.Auth.Logout;
using TemplateApp.Application.Features.Auth.Refresh;
using TemplateApp.Application.Features.Auth.Register;

namespace TemplateApp.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", async (
            RegisterModel model,
            ISender sender,
            JwtTokenService jwt,
            HttpContext http,
            IConfiguration configuration,
            IWebHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new RegisterCommand(model), cancellationToken);
            return ToAuthHttpResult(result, jwt, http, configuration, environment);
        })
        .WithName("Register")
        .AllowAnonymous();

        group.MapPost("/login", async (
            LoginModel model,
            ISender sender,
            JwtTokenService jwt,
            HttpContext http,
            IConfiguration configuration,
            IWebHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new LoginCommand(model), cancellationToken);
            return ToAuthHttpResult(result, jwt, http, configuration, environment);
        })
        .WithName("Login")
        .AllowAnonymous();

        group.MapPost("/refresh", async (
            ISender sender,
            JwtTokenService jwt,
            HttpContext http,
            IConfiguration configuration,
            IWebHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var cookieName = RefreshTokenCookie.Name(configuration);
            if (!http.Request.Cookies.TryGetValue(cookieName, out var refreshToken) || string.IsNullOrWhiteSpace(refreshToken))
                return Result<AuthSessionData>.Failure(new Error("auth.missing_refresh_token", "Refresh token cookie is missing.", ErrorType.Unauthorized)).ToHttpResult();

            var result = await sender.Send(new RefreshSessionCommand(refreshToken), cancellationToken);
            return ToAuthHttpResult(result, jwt, http, configuration, environment);
        })
        .WithName("RefreshSession")
        .AllowAnonymous();

        group.MapPost("/logout", async (
            ISender sender,
            HttpContext http,
            IConfiguration configuration,
            IWebHostEnvironment environment,
            CancellationToken cancellationToken) =>
        {
            var cookieName = RefreshTokenCookie.Name(configuration);
            if (http.Request.Cookies.TryGetValue(cookieName, out var refreshToken) && !string.IsNullOrWhiteSpace(refreshToken))
                await sender.Send(new LogoutCommand(refreshToken), cancellationToken);

            RefreshTokenCookie.Delete(http.Response, configuration, environment);
            return Results.Ok(new ApiResponse<object?>(null));
        })
        .WithName("Logout")
        .AllowAnonymous();

        group.MapGet("/me", async (
            ClaimsPrincipal principal,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var sub = principal.FindFirstValue("sub");
            if (!Guid.TryParse(sub, out var userId))
                return Result<AuthenticatedUser>.Failure(new Error("auth.invalid_subject", "Authenticated subject is invalid.", ErrorType.Unauthorized)).ToHttpResult();

            var result = await sender.Send(new GetCurrentUserQuery(userId), cancellationToken);
            return result.Match<IResult>(
                user => Results.Ok(new ApiResponse<AuthUserResponse>(ToUserResponse(user))),
                error => Result<AuthenticatedUser>.Failure(error).ToHttpResult());
        })
        .WithName("GetCurrentUser");

        return endpoints;
    }

    private static IResult ToAuthHttpResult(
        Result<AuthSessionData> result,
        JwtTokenService jwt,
        HttpContext http,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        if (result.IsFailure) return result.ToHttpResult();

        var session = result.Value!;
        var access = jwt.CreateToken(session.User);
        RefreshTokenCookie.Write(
            http.Response,
            configuration,
            environment,
            session.RefreshToken,
            session.RefreshTokenExpiresAtUtc);

        return Results.Ok(new ApiResponse<AuthTokenResponse>(new AuthTokenResponse(
            access.Token,
            access.ExpiresAtUtc,
            ToUserResponse(session.User))));
    }

    private static AuthUserResponse ToUserResponse(AuthenticatedUser user)
        => new(user.Id, user.Email, user.DisplayName, user.Role, user.Permissions);
}
