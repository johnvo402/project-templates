namespace TemplateApp.Application.Abstractions.Storage;

public interface IEmployeeAvatarUrlResolver
{
    ValueTask<string?> ResolveAsync(string? objectName, CancellationToken cancellationToken = default);
}
