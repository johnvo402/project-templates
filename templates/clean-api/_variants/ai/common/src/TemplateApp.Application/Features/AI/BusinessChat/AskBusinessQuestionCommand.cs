using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.AI.Common.Models;

namespace TemplateApp.Application.Features.AI.BusinessChat;

public sealed record AskBusinessQuestionCommand(BusinessChatModel Model)
    : ICommand<Result<AskBusinessQuestionResponse>>;
