using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Todos.Common;

namespace TemplateApp.Application.Features.Todos.CreateTodo;

public sealed record CreateTodoCommand(TodoModel Model) : ICommand<Result<Guid>>;
