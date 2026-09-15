using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TemplateApp.Infrastructure.AI;

public static class AiRegistration
{
    public static IServiceCollection AddOptionalAi(
        this IServiceCollection services,
        IConfiguration configuration)
        => services;
}
