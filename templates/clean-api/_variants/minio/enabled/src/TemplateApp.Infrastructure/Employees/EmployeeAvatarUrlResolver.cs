using TemplateApp.Application.Abstractions.Storage;
using TemplateApp.Application.Features.Employees.Common.Services;

namespace TemplateApp.Infrastructure.Employees;

public sealed class EmployeeAvatarUrlResolver(IObjectStorage storage) : IEmployeeAvatarUrlResolver
{
    public async ValueTask<string?> ResolveAsync(string? objectName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(objectName)) return null;
        return await storage.GetPresignedDownloadUrlAsync(objectName, cancellationToken: cancellationToken);
    }
}
