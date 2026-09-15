using FluentValidation;

namespace TemplateApp.Application.Features.Todos.CreateTodo;

public sealed class CreateTodoCommandValidator : AbstractValidator<CreateTodoCommand>
{
    public CreateTodoCommandValidator()
    {
        RuleFor(command => command.Model).NotNull();
        RuleFor(command => command.Model.Title).NotEmpty().MaximumLength(300);
    }
}
