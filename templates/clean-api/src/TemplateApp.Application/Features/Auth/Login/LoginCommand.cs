using Mediator;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Auth.Common;

namespace TemplateApp.Application.Features.Auth.Login;

public sealed record LoginCommand(LoginModel Model) : ICommand<Result<AuthSessionData>>;
