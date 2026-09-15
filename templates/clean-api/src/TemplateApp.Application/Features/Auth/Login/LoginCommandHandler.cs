using Mediator;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Auth.Login;

public sealed class LoginCommandHandler(IAuthSessionService auth)
    : ICommandHandler<LoginCommand, Result<AuthSessionData>>
{
    public async ValueTask<Result<AuthSessionData>> Handle(LoginCommand command, CancellationToken cancellationToken)
        => await auth.LoginAsync(command.Model.Email, command.Model.Password, cancellationToken);
}
