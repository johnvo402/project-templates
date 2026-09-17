using Mediator;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Employees.ChangeEmployeeRole;

public sealed class ChangeEmployeeRoleCommandHandler(IAuthSessionService auth)
    : ICommandHandler<ChangeEmployeeRoleCommand, Result>
{
    public async ValueTask<Result> Handle(ChangeEmployeeRoleCommand request, CancellationToken cancellationToken)
        => await auth.ChangeRoleAsync(request.Id, request.Model.Role, cancellationToken);
}
