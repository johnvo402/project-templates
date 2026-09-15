using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateApp.Application.Abstractions.AI;

namespace TemplateApp.Infrastructure.AI;

public static class AiRegistration
{
    public static IServiceCollection AddOptionalAi(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<GeminiOptions>()
            .Bind(configuration.GetSection(GeminiOptions.SectionName))
            .PostConfigure(options =>
            {
                var sectionApiKey = configuration[$"{GeminiOptions.SectionName}:ApiKey"];
                var environmentApiKey = configuration["GEMINI_API_KEY"];
                options.ApiKey = FirstNotBlank(sectionApiKey, environmentApiKey, options.ApiKey, string.Empty);

                var sectionModel = configuration[$"{GeminiOptions.SectionName}:Model"];
                var environmentModel = configuration["GEMINI_MODEL"];
                options.Model = FirstNotBlank(sectionModel, environmentModel, options.Model, "gemini-3.8-flash");
            });

        services.AddSingleton<IAiService, GeminiAiService>();
        return services;
    }

    private static string FirstNotBlank(params string?[] values)
        => values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value)) ?? string.Empty;
}
