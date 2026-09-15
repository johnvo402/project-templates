using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Identity;

public sealed class AppUser : AggregateRoot<UserId>
{
    private AppUser() { }

    private AppUser(
        UserId id,
        string email,
        string normalizedEmail,
        string passwordHash,
        string role,
        string displayName)
        : base(id)
    {
        Email = email;
        NormalizedEmail = normalizedEmail;
        PasswordHash = passwordHash;
        Role = role;
        DisplayName = displayName;
        IsActive = true;
        CreatedAtUtc = DateTimeOffset.UtcNow;
    }

    public string Email { get; private set; } = string.Empty;
    public string NormalizedEmail { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string Role { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public string? Bio { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }

    public static AppUser Create(
        string email,
        string normalizedEmail,
        string passwordHash,
        string role,
        string displayName)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new DomainException("Email is required.");
        if (string.IsNullOrWhiteSpace(normalizedEmail)) throw new DomainException("Normalized email is required.");
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new DomainException("Password hash is required.");
        if (string.IsNullOrWhiteSpace(role)) throw new DomainException("Role is required.");
        if (string.IsNullOrWhiteSpace(displayName)) throw new DomainException("Display name is required.");
        return new AppUser(UserId.New(), email.Trim(), normalizedEmail, passwordHash, role, displayName.Trim());
    }

    public void UpdateProfile(string displayName, string? bio)
    {
        if (string.IsNullOrWhiteSpace(displayName)) throw new DomainException("Display name is required.");
        DisplayName = displayName.Trim();
        Bio = string.IsNullOrWhiteSpace(bio) ? null : bio.Trim();
    }

    public void ChangeRole(string role)
    {
        if (string.IsNullOrWhiteSpace(role)) throw new DomainException("Role is required.");
        Role = role;
    }

    public void Disable() => IsActive = false;
    public void Enable() => IsActive = true;
}
