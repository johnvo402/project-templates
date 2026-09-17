using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Employees.Common.Models;

namespace TemplateApp.Application.Features.Employees.CreateEmployee;

public sealed record CreateEmployeeCommand(CreateEmployeeModel Model) : ICommand<Result<Guid>>;
