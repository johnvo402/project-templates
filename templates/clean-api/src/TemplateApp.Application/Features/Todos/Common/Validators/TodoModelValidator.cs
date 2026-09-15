using FluentValidation;
using TemplateApp.Application.Features.Todos.Common.Models;
using TemplateApp.Domain.Todos;

namespace TemplateApp.Application.Features.Todos.Common.Validators;

public sealed class TodoModelValidator : AbstractValidator<TodoModel>
{
    public TodoModelValidator()
    {
        RuleFor(model => model.Title)
            .NotEmpty()
            .MaximumLength(TodoTitle.MaxLength);
    }
}
