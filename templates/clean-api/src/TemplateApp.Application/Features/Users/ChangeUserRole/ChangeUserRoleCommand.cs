using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Users.Common.Models;

namespace TemplateApp.Application.Features.Users.ChangeUserRole;

public sealed record ChangeUserRoleCommand(Guid UserId, ChangeUserRoleModel Model) : ICommand<Result>;
