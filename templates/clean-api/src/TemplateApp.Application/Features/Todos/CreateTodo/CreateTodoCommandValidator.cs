using FluentValidation;
using TemplateApp.Application.Features.Todos.Common.Models;

namespace TemplateApp.Application.Features.Todos.CreateTodo;

public sealed class CreateTodoCommandValidator : AbstractValidator<CreateTodoCommand>
{
    public CreateTodoCommandValidator(IValidator<TodoModel> modelValidator)
    {
        RuleFor(command => command.Model).NotNull();
        RuleFor(command => command.Model).SetValidator(modelValidator);
    }
}
