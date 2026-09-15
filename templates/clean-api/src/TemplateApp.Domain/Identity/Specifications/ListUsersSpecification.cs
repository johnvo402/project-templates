using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Identity.Specifications;

public sealed class ListUsersSpecification : Specification<AppUser>
{
    public ListUsersSpecification()
    {
        Query.OrderBy(user => user.Email).AsNoTracking();
    }
}
