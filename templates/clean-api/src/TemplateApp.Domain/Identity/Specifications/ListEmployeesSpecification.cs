using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Identity.Specifications;

public sealed class ListEmployeesSpecification : Specification<AppUser>
{
    public ListEmployeesSpecification(string? role = null, bool? isActive = null)
    {
        if (!string.IsNullOrWhiteSpace(role)) Query.Where(user => user.Role == role);
        if (isActive is not null) Query.Where(user => user.IsActive == isActive.Value);
        Query.OrderBy(user => user.DisplayName).AsNoTracking();
    }
}
