namespace TemplateApp.Infrastructure.Security;

public sealed class AuthSessionOptions
{
    public const string SectionName = "Auth";
    public int RefreshTokenDays { get; init; } = 14;
}
