using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Todos;
using TemplateApp.Domain.Todos.Specifications;

namespace TemplateApp.Application.Features.Todos.CompleteTodo;

public sealed class CompleteTodoCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<CompleteTodoCommand, Result>
{
    public async ValueTask<Result> Handle(
        CompleteTodoCommand request,
        CancellationToken cancellationToken)
    {
        var specification = new TodoByIdSpecification(new TodoId(request.TodoId));

        var todo = await unitOfWork
            .Repository<TodoItem>()
            .FirstOrDefaultAsync(specification, cancellationToken);

        if (todo is null)
            return Result.Failure(new Error("Todos.NotFound", "Todo was not found.", ErrorType.NotFound));

        todo.Complete();

        await unitOfWork.SaveAsync(cancellationToken);

        return Result.Success();
    }
}
