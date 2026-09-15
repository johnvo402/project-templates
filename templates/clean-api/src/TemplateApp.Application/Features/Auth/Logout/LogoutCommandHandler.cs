using Mediator;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Auth.Logout;

public sealed class LogoutCommandHandler(IAuthSessionService auth)
    : ICommandHandler<LogoutCommand, Result>
{
    public async ValueTask<Result> Handle(LogoutCommand request, CancellationToken cancellationToken)
        => await auth.LogoutAsync(request.RefreshToken, cancellationToken);
}
