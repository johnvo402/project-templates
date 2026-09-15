using Mediator;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Auth.Refresh;

public sealed class RefreshSessionCommandHandler(IAuthSessionService auth)
    : ICommandHandler<RefreshSessionCommand, Result<AuthSessionData>>
{
    public async ValueTask<Result<AuthSessionData>> Handle(RefreshSessionCommand request, CancellationToken cancellationToken)
        => await auth.RefreshAsync(request.RefreshToken, cancellationToken);
}
