namespace TemplateApp.Application.Features.Employees.Common.Services;

public interface IEmployeeAvatarUrlResolver
{
    ValueTask<string?> ResolveAsync(string? objectName, CancellationToken cancellationToken = default);
}
