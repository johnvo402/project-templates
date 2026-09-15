namespace TemplateApp.Api.Authentication;

public static class RefreshTokenCookie
{
    public const string DefaultName = "refresh_token";

    public static string Name(IConfiguration configuration)
        => configuration["Auth:RefreshCookieName"] ?? DefaultName;

    public static void Write(
        HttpResponse response,
        IConfiguration configuration,
        IWebHostEnvironment environment,
        string token,
        DateTimeOffset expiresAtUtc)
    {
        response.Cookies.Append(Name(configuration), token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth",
            Expires = expiresAtUtc,
            IsEssential = true
        });
    }

    public static void Delete(
        HttpResponse response,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        response.Cookies.Delete(Name(configuration), new CookieOptions
        {
            HttpOnly = true,
            Secure = !environment.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth",
            IsEssential = true
        });
    }
}
