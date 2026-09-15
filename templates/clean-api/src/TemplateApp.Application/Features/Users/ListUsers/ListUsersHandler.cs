using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Identity;
using TemplateApp.Domain.Identity.Specifications;

namespace TemplateApp.Application.Features.Users.ListUsers;

public sealed class ListUsersHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<ListUsersQuery, Result<IReadOnlyList<ListUsersResponse>>>
{
    public async ValueTask<Result<IReadOnlyList<ListUsersResponse>>> Handle(
        ListUsersQuery request,
        CancellationToken cancellationToken)
    {
        var users = await unitOfWork.ReadOnlyRepository<AppUser>().ListAsync(
            ListUsersMapping.Selector(),
            new ListUsersSpecification(),
            cancellationToken);

        return Result<IReadOnlyList<ListUsersResponse>>.Success(users);
    }
}
