using FluentValidation;

namespace TemplateApp.Application.Features.Todos.GetTodos;

public sealed class GetTodosQueryValidator : AbstractValidator<GetTodosQuery>
{
    public GetTodosQueryValidator()
    {
        RuleFor(query => query.Query.Page).GreaterThan(0);
        RuleFor(query => query.Query.PageSize).InclusiveBetween(1, 100);
        RuleFor(query => query.Query)
            .Must(query => string.IsNullOrWhiteSpace(query.Before) || string.IsNullOrWhiteSpace(query.After))
            .WithMessage("Use either before or after cursor, not both.");
    }
}
