namespace TemplateApp.Api.Contracts;

public sealed record AuthUserResponse(
    Guid Id,
    string Email,
    string DisplayName,
    string Role,
    IReadOnlyCollection<string> Permissions);

public sealed record AuthTokenResponse(
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAtUtc,
    AuthUserResponse User);
