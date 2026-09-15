using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Identity;
using TemplateApp.Domain.Identity.Specifications;

namespace TemplateApp.Application.Features.Profile.UpdateProfile;

public sealed class UpdateProfileCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<UpdateProfileCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateProfileCommand command, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Repository<AppUser>().FirstOrDefaultAsync(
            new UserByIdSpecification(new UserId(command.UserId)),
            cancellationToken);
        if (user is null)
            return Result.Failure(new Error("profile.not_found", "Profile was not found.", ErrorType.NotFound));

        user.UpdateProfile(command.Model.DisplayName, command.Model.Bio);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
