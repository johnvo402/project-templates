using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Identity.Specifications;

public sealed class UserByIdSpecification : Specification<AppUser>
{
    public UserByIdSpecification(UserId id)
    {
        Query.Where(user => user.Id == id);
    }
}
