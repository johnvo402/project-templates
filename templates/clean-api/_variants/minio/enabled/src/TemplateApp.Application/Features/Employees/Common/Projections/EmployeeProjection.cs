using System.Text.Json.Serialization;

namespace TemplateApp.Application.Features.Employees.Common.Projections;

public sealed record EmployeeProjection(
    Guid Id,
    string Email,
    string DisplayName,
    string Role,
    bool IsActive,
    DateTimeOffset CreatedAt)
{
    public string? AvatarUrl { get; init; }

    [JsonIgnore]
    public string? AvatarObjectName { get; init; }
}
