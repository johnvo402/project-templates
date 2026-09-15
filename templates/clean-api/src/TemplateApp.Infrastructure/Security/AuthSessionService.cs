using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Authorization;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Identity;
using TemplateApp.Infrastructure.Persistence;

namespace TemplateApp.Infrastructure.Security;

public sealed class AuthSessionService(
    AppDbContext dbContext,
    Pbkdf2PasswordHasher passwordHasher,
    SecureRefreshTokenFactory refreshTokens,
    IOptions<AuthSessionOptions> options)
    : IAuthSessionService
{
    private readonly AuthSessionOptions _options = options.Value;

    public async Task<Result<AuthSessionData>> RegisterAsync(
        string email,
        string password,
        string displayName,
        CancellationToken cancellationToken = default)
    {
        var validation = ValidateCredentials(email, password);
        if (validation is not null) return Result<AuthSessionData>.Failure(validation);

        var normalized = NormalizeEmail(email);
        if (await dbContext.Users.AnyAsync(x => x.NormalizedEmail == normalized, cancellationToken))
            return Result<AuthSessionData>.Failure(new Error("auth.email_taken", "Email is already registered.", ErrorType.Conflict));

        var hasAnyUser = await dbContext.Users.AnyAsync(cancellationToken);
        var bootstrapRole = hasAnyUser ? AppRoles.User : AppRoles.Admin;
        var user = AppUser.Create(email.Trim(), normalized, passwordHasher.Hash(password), bootstrapRole, displayName);
        dbContext.Users.Add(user);
        var session = IssueSession(user, DateTimeOffset.UtcNow);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result<AuthSessionData>.Success(session);
    }

    public async Task<Result<AuthSessionData>> LoginAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeEmail(email);
        var user = await dbContext.Users.SingleOrDefaultAsync(x => x.NormalizedEmail == normalized, cancellationToken);

        if (user is null || !user.IsActive || !passwordHasher.Verify(password, user.PasswordHash))
            return Result<AuthSessionData>.Failure(new Error("auth.invalid_credentials", "Email or password is invalid.", ErrorType.Unauthorized));

        var session = IssueSession(user, DateTimeOffset.UtcNow);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Result<AuthSessionData>.Success(session);
    }

    public async Task<Result<AuthSessionData>> RefreshAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
            return UnauthorizedRefresh();

        var now = DateTimeOffset.UtcNow;
        var tokenHash = refreshTokens.Hash(refreshToken);
        var existing = await dbContext.RefreshSessions.SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);
        if (existing is null)
            return UnauthorizedRefresh();

        if (existing.RevokedAtUtc is not null)
        {
            if (!string.IsNullOrWhiteSpace(existing.ReplacedByTokenHash))
            {
                var activeSessions = await dbContext.RefreshSessions
                    .Where(x => x.UserId == existing.UserId && x.RevokedAtUtc == null && x.ExpiresAtUtc > now)
                    .ToListAsync(cancellationToken);
                foreach (var session in activeSessions) session.Revoke(now);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            return UnauthorizedRefresh();
        }

        if (!existing.IsActive(now))
            return UnauthorizedRefresh();

        var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == existing.UserId, cancellationToken);
        if (user is null || !user.IsActive)
            return UnauthorizedRefresh();

        var rawReplacement = refreshTokens.Create();
        var replacementHash = refreshTokens.Hash(rawReplacement);
        existing.Rotate(replacementHash, now);
        var replacement = RefreshSession.Create(
            user.Id,
            replacementHash,
            now,
            now.AddDays(_options.RefreshTokenDays));
        dbContext.RefreshSessions.Add(replacement);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result<AuthSessionData>.Success(new AuthSessionData(
            ToAuthenticatedUser(user),
            rawReplacement,
            replacement.ExpiresAtUtc));
    }

    public async Task<Result> LogoutAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken)) return Result.Success();

        var tokenHash = refreshTokens.Hash(refreshToken);
        var existing = await dbContext.RefreshSessions.SingleOrDefaultAsync(x => x.TokenHash == tokenHash, cancellationToken);
        if (existing is not null)
        {
            existing.Revoke(DateTimeOffset.UtcNow);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        return Result.Success();
    }

    public async Task<Result<AuthenticatedUser>> GetUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var typedId = new UserId(userId);
        var user = await dbContext.Users.AsNoTracking().SingleOrDefaultAsync(x => x.Id == typedId, cancellationToken);
        if (user is null || !user.IsActive)
            return Result<AuthenticatedUser>.Failure(new Error("user.not_found", "User was not found.", ErrorType.NotFound));
        return Result<AuthenticatedUser>.Success(ToAuthenticatedUser(user));
    }


    public async Task<Result> ChangeRoleAsync(Guid userId, string role, CancellationToken cancellationToken = default)
    {
        if (!AppRoles.IsValid(role))
            return Result.Failure(new Error("user.invalid_role", "Role is invalid.", ErrorType.Validation));

        var typedId = new UserId(userId);
        var user = await dbContext.Users.SingleOrDefaultAsync(x => x.Id == typedId, cancellationToken);
        if (user is null)
            return Result.Failure(new Error("user.not_found", "User was not found.", ErrorType.NotFound));

        user.ChangeRole(role);

        var now = DateTimeOffset.UtcNow;
        var activeSessions = await dbContext.RefreshSessions
            .Where(x => x.UserId == typedId && x.RevokedAtUtc == null && x.ExpiresAtUtc > now)
            .ToListAsync(cancellationToken);
        foreach (var session in activeSessions) session.Revoke(now);

        await dbContext.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    private AuthSessionData IssueSession(AppUser user, DateTimeOffset now)
    {
        var raw = refreshTokens.Create();
        var hash = refreshTokens.Hash(raw);
        var session = RefreshSession.Create(user.Id, hash, now, now.AddDays(_options.RefreshTokenDays));
        dbContext.RefreshSessions.Add(session);
        return new AuthSessionData(ToAuthenticatedUser(user), raw, session.ExpiresAtUtc);
    }

    private static AuthenticatedUser ToAuthenticatedUser(AppUser user)
        => new(user.Id.Value, user.Email, user.DisplayName, user.Role, RolePermissionCatalog.ForRole(user.Role));

    private static Error? ValidateCredentials(string email, string password)
    {
        if (!MailAddress.TryCreate(email, out _))
            return new Error("auth.invalid_email", "Email is invalid.", ErrorType.Validation);
        if (string.IsNullOrWhiteSpace(password) || password.Length < 12)
            return new Error("auth.weak_password", "Password must contain at least 12 characters.", ErrorType.Validation);
        return null;
    }

    private static string NormalizeEmail(string email) => email.Trim().ToUpperInvariant();

    private static Result<AuthSessionData> UnauthorizedRefresh()
        => Result<AuthSessionData>.Failure(new Error("auth.invalid_refresh_token", "Refresh token is invalid or expired.", ErrorType.Unauthorized));
}
