using TemplateApp.Domain.Identity;

namespace TemplateApp.Application.Features.Profile.Common.Projections;

public class ProfileProjection
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string Role { get; set; } = string.Empty;

    public virtual void MappingFrom(AppUser user)
    {
        Id = user.Id.Value;
        Email = user.Email;
        DisplayName = user.DisplayName;
        Bio = user.Bio;
        Role = user.Role;
    }
}
