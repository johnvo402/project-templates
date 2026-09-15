using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TemplateApp.Infrastructure.Storage;

public static class StorageRegistration
{
    public static IServiceCollection AddOptionalObjectStorage(
        this IServiceCollection services,
        IConfiguration configuration)
        => services;
}
