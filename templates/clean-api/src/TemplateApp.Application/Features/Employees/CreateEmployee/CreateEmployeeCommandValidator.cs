using FluentValidation;
using TemplateApp.Application.Features.Employees.Common.Models;

namespace TemplateApp.Application.Features.Employees.CreateEmployee;

public sealed class CreateEmployeeCommandValidator : AbstractValidator<CreateEmployeeCommand>
{
    public CreateEmployeeCommandValidator(IValidator<CreateEmployeeModel> modelValidator)
    {
        RuleFor(x => x.Model).NotNull();
        RuleFor(x => x.Model).SetValidator(modelValidator);
    }
}
