using TemplateApp.Application.Abstractions.Storage;

namespace TemplateApp.Infrastructure.Storage;

public sealed class NullEmployeeAvatarUrlResolver : IEmployeeAvatarUrlResolver
{
    public ValueTask<string?> ResolveAsync(string? objectName, CancellationToken cancellationToken = default)
        => ValueTask.FromResult<string?>(null);
}
