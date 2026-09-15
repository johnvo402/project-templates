using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Abstractions.Storage;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Profile.Common.Projections;
using TemplateApp.Domain.Identity;
using TemplateApp.Domain.Identity.Specifications;

namespace TemplateApp.Application.Features.Profile.Avatar;

public sealed class GetAvatarQueryHandler(IUnitOfWork unitOfWork, IObjectStorage storage)
    : IQueryHandler<GetAvatarQuery, Result<AvatarProjection>>
{
    public async ValueTask<Result<AvatarProjection>> Handle(GetAvatarQuery query, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.ReadOnlyRepository<AppUser>().FirstOrDefaultAsync(
            new UserByIdSpecification(new UserId(query.UserId)), cancellationToken);
        if (user is null)
            return Result<AvatarProjection>.Failure(new Error("profile.not_found", "Profile was not found.", ErrorType.NotFound));
        if (string.IsNullOrWhiteSpace(user.AvatarObjectName))
            return Result<AvatarProjection>.Failure(new Error("profile.avatar_not_found", "Avatar has not been uploaded.", ErrorType.NotFound));

        var url = await storage.GetPresignedDownloadUrlAsync(user.AvatarObjectName, cancellationToken: cancellationToken);
        return Result<AvatarProjection>.Success(new AvatarProjection(url));
    }
}
