using FluentValidation;

namespace TemplateApp.Application.Features.Todos.CompleteTodo;

public sealed class CompleteTodoCommandValidator : AbstractValidator<CompleteTodoCommand>
{
    public CompleteTodoCommandValidator() => RuleFor(command => command.TodoId).NotEmpty();
}
