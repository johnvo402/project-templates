using Mediator;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Auth.Refresh;

public sealed record RefreshSessionCommand(string RefreshToken) : ICommand<Result<AuthSessionData>>;
