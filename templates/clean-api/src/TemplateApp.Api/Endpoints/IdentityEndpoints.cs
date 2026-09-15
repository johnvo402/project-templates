namespace TemplateApp.Api.Endpoints;

public static class IdentityEndpoints
{
    // Kept as an empty compatibility extension. Current-user identity is exposed by /api/auth/me.
    public static IEndpointRouteBuilder MapIdentityEndpoints(this IEndpointRouteBuilder endpoints) => endpoints;
}
