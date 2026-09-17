using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using TemplateApp.Application.Authorization;

namespace TemplateApp.Api.Authentication;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddAppAuthenticationAndAuthorization(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var section = configuration.GetSection(JwtOptions.SectionName);
        services.Configure<JwtOptions>(section);
        var options = section.Get<JwtOptions>()
            ?? throw new InvalidOperationException("Jwt configuration is missing.");

        if (Encoding.UTF8.GetByteCount(options.Key) < 32)
            throw new InvalidOperationException("Jwt:Key must be at least 32 bytes. Override it with user-secrets or environment variables outside development.");

        services.AddSingleton<JwtTokenService>();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(jwt =>
            {
                jwt.MapInboundClaims = false;
                jwt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = options.Issuer,
                    ValidAudience = options.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key)),
                    NameClaimType = "name",
                    RoleClaimType = "role",
                    ClockSkew = TimeSpan.FromSeconds(30)
                };
            });

        var fallbackPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();

        var authorization = services.AddAuthorizationBuilder()
            .SetFallbackPolicy(fallbackPolicy);

        foreach (var permission in AppPermissions.All)
        {
            authorization.AddPolicy(
                permission,
                policy => policy.RequireClaim(CustomClaimTypes.Permission, permission));
        }

        return services;
    }
}
