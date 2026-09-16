using TemplateApp.Application.Abstractions.Storage;

namespace TemplateApp.Infrastructure.Storage;

public sealed class MinioEmployeeAvatarUrlResolver(IObjectStorage storage) : IEmployeeAvatarUrlResolver
{
    public async ValueTask<string?> ResolveAsync(string? objectName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(objectName)) return null;
        return await storage.GetPresignedDownloadUrlAsync(objectName, cancellationToken: cancellationToken);
    }
}
