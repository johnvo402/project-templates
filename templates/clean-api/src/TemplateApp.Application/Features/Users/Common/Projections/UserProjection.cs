using TemplateApp.Domain.Identity;

namespace TemplateApp.Application.Features.Users.Common.Projections;

public class UserProjection
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }

    public virtual void MappingFrom(AppUser user)
    {
        Id = user.Id.Value;
        Email = user.Email;
        DisplayName = user.DisplayName;
        Role = user.Role;
        IsActive = user.IsActive;
        CreatedAtUtc = user.CreatedAtUtc;
    }
}
