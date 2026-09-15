using Mediator;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Auth.GetCurrentUser;

public sealed class GetCurrentUserQueryHandler(IAuthSessionService auth)
    : IQueryHandler<GetCurrentUserQuery, Result<AuthenticatedUser>>
{
    public async ValueTask<Result<AuthenticatedUser>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
        => await auth.GetUserAsync(request.UserId, cancellationToken);
}
