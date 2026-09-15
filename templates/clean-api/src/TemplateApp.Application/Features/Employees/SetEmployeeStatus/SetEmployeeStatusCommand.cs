using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Employees.Common.Models;

namespace TemplateApp.Application.Features.Employees.SetEmployeeStatus;

public sealed record SetEmployeeStatusCommand(Guid Id, EmployeeStatusModel Model) : ICommand<Result>;
