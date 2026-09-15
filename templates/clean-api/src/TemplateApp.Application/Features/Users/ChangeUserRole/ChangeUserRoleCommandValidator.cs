using FluentValidation;
using TemplateApp.Application.Features.Users.Common.Models;

namespace TemplateApp.Application.Features.Users.ChangeUserRole;

public sealed class ChangeUserRoleCommandValidator : AbstractValidator<ChangeUserRoleCommand>
{
    public ChangeUserRoleCommandValidator(IValidator<ChangeUserRoleModel> modelValidator)
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.Model).NotNull();
        RuleFor(command => command.Model).SetValidator(modelValidator);
    }
}
