using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Authorization;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Common.Projections.Identity;
using TemplateApp.Domain.Identity;
using TemplateApp.Domain.Identity.Specifications;

namespace TemplateApp.Application.Features.Profile.GetProfile;

public sealed class GetProfileQueryHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<GetProfileQuery, Result<UserProfileProjection>>
{
    public async ValueTask<Result<UserProfileProjection>> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.ReadOnlyRepository<AppUser>().FirstOrDefaultAsync(
            new UserByIdSpecification(new UserId(request.UserId)),
            UserProfileProjection.MappingExpression,
            cancellationToken);

        if (user is null)
            return Result<UserProfileProjection>.Failure(new Error("profile.not_found", "Profile was not found.", ErrorType.NotFound));

        return Result<UserProfileProjection>.Success(user with { Permissions = RolePermissionCatalog.ForRole(user.Role) });
    }
}
