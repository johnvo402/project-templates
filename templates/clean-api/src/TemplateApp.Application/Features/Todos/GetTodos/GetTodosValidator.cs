using FluentValidation;

namespace TemplateApp.Application.Features.Todos.GetTodos;

public sealed class GetTodosValidator : AbstractValidator<GetTodosQuery>
{
    public GetTodosValidator()
    {
        RuleFor(query => query.Page).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, 100);
    }
}
