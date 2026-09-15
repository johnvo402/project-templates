using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Infrastructure.AI;
using TemplateApp.Infrastructure.Caching;
using TemplateApp.Infrastructure.DomainEvents;
using TemplateApp.Infrastructure.Persistence;
using TemplateApp.Infrastructure.Security;
using TemplateApp.Infrastructure.Storage;

namespace TemplateApp.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<DispatchDomainEventsInterceptor>();
        services.AddDatabase(configuration);
        services.AddOptionalCache(configuration);
        services.AddOptionalObjectStorage(configuration);
        services.AddOptionalAi(configuration);
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.Configure<AuthSessionOptions>(configuration.GetSection(AuthSessionOptions.SectionName));
        services.AddSingleton<Pbkdf2PasswordHasher>();
        services.AddSingleton<SecureRefreshTokenFactory>();
        services.AddScoped<IAuthSessionService, AuthSessionService>();

        return services;
    }
}
