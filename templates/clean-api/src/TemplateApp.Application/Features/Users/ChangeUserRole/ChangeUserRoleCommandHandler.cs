using Mediator;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Users.ChangeUserRole;

public sealed class ChangeUserRoleCommandHandler(IAuthSessionService auth)
    : ICommandHandler<ChangeUserRoleCommand, Result>
{
    public async ValueTask<Result> Handle(ChangeUserRoleCommand request, CancellationToken cancellationToken)
        => await auth.ChangeRoleAsync(request.UserId, request.Model.Role, cancellationToken);
}
