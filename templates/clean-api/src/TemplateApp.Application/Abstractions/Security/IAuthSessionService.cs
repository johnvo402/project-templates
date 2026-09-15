using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Abstractions.Security;

public sealed record AuthenticatedUser(
    Guid Id,
    string Email,
    string DisplayName,
    string Role,
    IReadOnlyCollection<string> Permissions);

public sealed record AuthSessionData(
    AuthenticatedUser User,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAtUtc);

public interface IAuthSessionService
{
    Task<Result<AuthSessionData>> RegisterAsync(string email, string password, string displayName, CancellationToken cancellationToken = default);
    Task<Result<AuthSessionData>> LoginAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<Result<AuthSessionData>> RefreshAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task<Result> LogoutAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task<Result<AuthenticatedUser>> GetUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Result> ChangeRoleAsync(Guid userId, string role, CancellationToken cancellationToken = default);
}
