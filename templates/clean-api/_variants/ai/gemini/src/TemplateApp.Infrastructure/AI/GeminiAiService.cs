using Google.GenAI;
using Microsoft.Extensions.Options;
using TemplateApp.Application.Abstractions.AI;

namespace TemplateApp.Infrastructure.AI;

public sealed class GeminiAiService(IOptions<GeminiOptions> options) : IAiService
{
    private readonly GeminiOptions _options = options.Value;

    public async Task<string> GenerateTextAsync(
        string prompt,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new InvalidOperationException(
                "Gemini API key is not configured. Set Gemini__ApiKey or GEMINI_API_KEY.");

        var client = new Client(apiKey: _options.ApiKey);
        var response = await client.Models
            .GenerateContentAsync(model: _options.Model, contents: prompt)
            .WaitAsync(cancellationToken);

        return response.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text
            ?? string.Empty;
    }
}
