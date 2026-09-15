using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Common.Projections.Identity;
using TemplateApp.Domain.Identity;
using TemplateApp.Domain.Identity.Specifications;

namespace TemplateApp.Application.Features.Users.ListUsers;

public sealed class ListUsersQueryHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<ListUsersQuery, Result<IReadOnlyList<UserSummaryProjection>>>
{
    public async ValueTask<Result<IReadOnlyList<UserSummaryProjection>>> Handle(ListUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await unitOfWork.ReadOnlyRepository<AppUser>().ListAsync(
            UserSummaryProjection.MappingExpression,
            new ListUsersSpecification(),
            cancellationToken);
        return Result<IReadOnlyList<UserSummaryProjection>>.Success(users);
    }
}
