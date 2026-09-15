using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Authorization;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Identity;
using TemplateApp.Domain.Identity.Specifications;

namespace TemplateApp.Application.Features.Profile.GetProfile;

public sealed class GetProfileHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<GetProfileQuery, Result<GetProfileResponse>>
{
    public async ValueTask<Result<GetProfileResponse>> Handle(
        GetProfileQuery request,
        CancellationToken cancellationToken)
    {
        var user = await unitOfWork.ReadOnlyRepository<AppUser>().FirstOrDefaultAsync(
            new UserByIdSpecification(new UserId(request.UserId)),
            GetProfileMapping.Selector(),
            cancellationToken);

        if (user is null)
            return Result<GetProfileResponse>.Failure(new Error("profile.not_found", "Profile was not found.", ErrorType.NotFound));

        user.Permissions = RolePermissionCatalog.ForRole(user.Role);
        return Result<GetProfileResponse>.Success(user);
    }
}
