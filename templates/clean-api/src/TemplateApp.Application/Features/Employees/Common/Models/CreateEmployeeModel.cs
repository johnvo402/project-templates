namespace TemplateApp.Application.Features.Employees.Common.Models;

public sealed record CreateEmployeeModel(
    string Email,
    string Password,
    string DisplayName,
    string Role);
