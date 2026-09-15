using Mediator;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Auth.Register;

public sealed class RegisterCommandHandler(IAuthSessionService auth)
    : ICommandHandler<RegisterCommand, Result<AuthSessionData>>
{
    public async ValueTask<Result<AuthSessionData>> Handle(RegisterCommand command, CancellationToken cancellationToken)
        => await auth.RegisterAsync(
            command.Model.Email,
            command.Model.Password,
            command.Model.DisplayName,
            cancellationToken);
}
