namespace TemplateApp.Application.Abstractions.AI;

public interface IAiService
{
    Task<string> GenerateTextAsync(
        string prompt,
        CancellationToken cancellationToken = default);
}
