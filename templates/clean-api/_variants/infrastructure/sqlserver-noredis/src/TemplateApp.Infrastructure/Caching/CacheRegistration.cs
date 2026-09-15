using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TemplateApp.Infrastructure.Caching;

internal static class CacheRegistration
{
    public static IServiceCollection AddOptionalCache(this IServiceCollection services, IConfiguration configuration)
        => services;
}
