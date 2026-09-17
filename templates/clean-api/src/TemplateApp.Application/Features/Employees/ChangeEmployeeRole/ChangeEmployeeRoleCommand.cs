using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Employees.Common.Models;

namespace TemplateApp.Application.Features.Employees.ChangeEmployeeRole;

public sealed record ChangeEmployeeRoleCommand(Guid Id, ChangeEmployeeRoleModel Model) : ICommand<Result>;
