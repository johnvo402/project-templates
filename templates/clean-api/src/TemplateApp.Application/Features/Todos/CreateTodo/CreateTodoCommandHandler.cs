using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Common;
using TemplateApp.Domain.Todos;

namespace TemplateApp.Application.Features.Todos.CreateTodo;

public sealed class CreateTodoCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<CreateTodoCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(
        CreateTodoCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var todo = TodoItem.Create(request.Model.Title);

            await unitOfWork
                .Repository<TodoItem>()
                .AddAsync(todo, cancellationToken);

            await unitOfWork.SaveAsync(cancellationToken);

            return Result<Guid>.Success(todo.Id.Value);
        }
        catch (DomainException exception)
        {
            return Result<Guid>.Failure(new Error(exception.Code, exception.Message, ErrorType.Validation));
        }
    }
}
