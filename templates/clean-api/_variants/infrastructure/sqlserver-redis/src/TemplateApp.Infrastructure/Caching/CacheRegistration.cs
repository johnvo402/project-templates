using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TemplateApp.Infrastructure.Caching;

internal static class CacheRegistration
{
    public static IServiceCollection AddOptionalCache(this IServiceCollection services, IConfiguration configuration)
    {
        var redis = configuration.GetSection("Redis");
        var connection = redis["Configuration"] ?? "localhost:6379";
        var instanceName = redis["InstanceName"] ?? "TemplateApp:";
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = connection;
            options.InstanceName = instanceName;
        });
        return services;
    }
}
