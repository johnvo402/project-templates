using Microsoft.Extensions.Options;
using OpenAI.Chat;
using TemplateApp.Application.Abstractions.AI;

namespace TemplateApp.Infrastructure.AI;

public sealed class OpenAiService(IOptions<OpenAiOptions> options) : IAiService
{
    private readonly OpenAiOptions _options = options.Value;

    public async Task<string> GenerateTextAsync(
        string prompt,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new InvalidOperationException(
                "OpenAI API key is not configured. Set OpenAI__ApiKey or OPENAI_API_KEY.");

        var client = new ChatClient(model: _options.Model, apiKey: _options.ApiKey);
        ChatCompletion completion = await client.CompleteChatAsync(prompt)
            .WaitAsync(cancellationToken);
        return completion.Content.FirstOrDefault()?.Text ?? string.Empty;
    }
}
