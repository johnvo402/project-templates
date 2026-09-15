using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Identity;

public sealed class RefreshSession : Entity<Guid>
{
    private RefreshSession() { }

    private RefreshSession(
        Guid id,
        UserId userId,
        string tokenHash,
        DateTimeOffset createdAtUtc,
        DateTimeOffset expiresAtUtc)
        : base(id)
    {
        UserId = userId;
        TokenHash = tokenHash;
        CreatedAtUtc = createdAtUtc;
        ExpiresAtUtc = expiresAtUtc;
    }

    public UserId UserId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset ExpiresAtUtc { get; private set; }
    public DateTimeOffset? RevokedAtUtc { get; private set; }
    public string? ReplacedByTokenHash { get; private set; }

    public bool IsActive(DateTimeOffset now) => RevokedAtUtc is null && ExpiresAtUtc > now;

    public static RefreshSession Create(
        UserId userId,
        string tokenHash,
        DateTimeOffset createdAtUtc,
        DateTimeOffset expiresAtUtc)
        => new(Guid.NewGuid(), userId, tokenHash, createdAtUtc, expiresAtUtc);

    public void Rotate(string replacementTokenHash, DateTimeOffset now)
    {
        if (RevokedAtUtc is not null) return;
        RevokedAtUtc = now;
        ReplacedByTokenHash = replacementTokenHash;
    }

    public void Revoke(DateTimeOffset now)
    {
        if (RevokedAtUtc is null) RevokedAtUtc = now;
    }
}
