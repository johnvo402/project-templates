using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateApp.Application.Abstractions.AI;

namespace TemplateApp.Infrastructure.AI;

public static class AiRegistration
{
    public static IServiceCollection AddOptionalAi(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<OpenAiOptions>()
            .Bind(configuration.GetSection(OpenAiOptions.SectionName))
            .PostConfigure(options =>
            {
                var sectionApiKey = configuration[$"{OpenAiOptions.SectionName}:ApiKey"];
                var environmentApiKey = configuration["OPENAI_API_KEY"];
                options.ApiKey = FirstNotBlank(sectionApiKey, environmentApiKey, options.ApiKey, string.Empty);

                var sectionModel = configuration[$"{OpenAiOptions.SectionName}:Model"];
                var environmentModel = configuration["OPENAI_MODEL"];
                options.Model = FirstNotBlank(sectionModel, environmentModel, options.Model, "gpt-5.6-terra");
            });

        services.AddSingleton<IAiService, OpenAiService>();
        return services;
    }

    private static string FirstNotBlank(params string?[] values)
        => values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value)) ?? string.Empty;
}
