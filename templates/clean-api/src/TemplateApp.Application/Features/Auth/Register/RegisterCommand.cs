using Mediator;
using TemplateApp.Application.Abstractions.Security;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Auth.Common.Models;

namespace TemplateApp.Application.Features.Auth.Register;

public sealed record RegisterCommand(RegisterModel Model) : ICommand<Result<AuthSessionData>>;
