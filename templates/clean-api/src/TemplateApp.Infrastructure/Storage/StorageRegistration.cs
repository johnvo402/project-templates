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
        services.AddSingleton<IEmployeeAvatarUrlResolver, NullEmployeeAvatarUrlResolver>();
        return services;
    }
}
