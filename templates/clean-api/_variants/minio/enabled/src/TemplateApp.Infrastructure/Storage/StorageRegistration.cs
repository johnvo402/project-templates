using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateApp.Application.Abstractions.Storage;

namespace TemplateApp.Infrastructure.Storage;

public static class StorageRegistration
{
    public static IServiceCollection AddOptionalObjectStorage(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<MinioOptions>(configuration.GetSection(MinioOptions.SectionName));
        services.AddSingleton<IObjectStorage, MinioObjectStorage>();
        return services;
    }
}
