using Mediator;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Employees.CreateEmployee;

public sealed class CreateEmployeeCommandHandler(IAuthSessionService auth)
    : ICommandHandler<CreateEmployeeCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
        => await auth.CreateEmployeeAsync(
            request.Model.Email,
            request.Model.Password,
            request.Model.DisplayName,
            request.Model.Role,
            cancellationToken);
}
