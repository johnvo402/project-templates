using Mediator;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Auth.Logout;

public sealed record LogoutCommand(string RefreshToken) : ICommand<Result>;
