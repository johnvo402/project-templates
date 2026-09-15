using Mediator;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Todos.CompleteTodo;

public sealed record CompleteTodoCommand(Guid TodoId) : ICommand<Result>;
