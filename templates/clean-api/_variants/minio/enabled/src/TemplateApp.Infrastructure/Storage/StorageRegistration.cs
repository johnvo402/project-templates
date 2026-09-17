using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateApp.Application.Abstractions.Storage;
using TemplateApp.Application.Features.Employees.Common.Services;
using TemplateApp.Infrastructure.Employees;

namespace TemplateApp.Infrastructure.Storage;

public static class StorageRegistration
{
    public static IServiceCollection AddOptionalObjectStorage(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<MinioOptions>(configuration.GetSection(MinioOptions.SectionName));
        services.AddSingleton<IObjectStorage, MinioObjectStorage>();
        services.AddSingleton<IEmployeeAvatarUrlResolver, EmployeeAvatarUrlResolver>();
        return services;
    }
}
