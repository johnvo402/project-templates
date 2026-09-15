using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateApp.Application.Abstractions.AI;

namespace TemplateApp.Infrastructure.AI;

public static class AiRegistration
{
    public static IServiceCollection AddOptionalAi(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<GeminiOptions>()
            .Bind(configuration.GetSection(GeminiOptions.SectionName));

        services.AddSingleton<IAiService, GeminiAiService>();
        return services;
    }
}
