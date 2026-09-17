using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Identity;
using TemplateApp.Domain.Identity.Specifications;

namespace TemplateApp.Application.Features.Employees.SetEmployeeStatus;

public sealed class SetEmployeeStatusCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<SetEmployeeStatusCommand, Result>
{
    public async ValueTask<Result> Handle(SetEmployeeStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Repository<AppUser>().FirstOrDefaultAsync(
            new UserByIdSpecification(new UserId(request.Id)),
            cancellationToken);

        if (user is null)
            return Result.Failure(new Error("employees.not-found", "Employee was not found.", ErrorType.NotFound));

        if (request.Model.IsActive) user.Enable(); else user.Disable();
        await unitOfWork.SaveAsync(cancellationToken);
        return Result.Success();
    }
}
