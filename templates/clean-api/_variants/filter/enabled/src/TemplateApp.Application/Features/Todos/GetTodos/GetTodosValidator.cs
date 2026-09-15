using FluentValidation;

namespace TemplateApp.Application.Features.Todos.GetTodos;

public sealed class GetTodosValidator : AbstractValidator<GetTodosQuery>
{
    public GetTodosValidator()
    {
        RuleFor(query => query.Query.NormalizedPage).GreaterThan(0);
        RuleFor(query => query.Query.NormalizedPageSize).InclusiveBetween(1, 100);
    }
}
