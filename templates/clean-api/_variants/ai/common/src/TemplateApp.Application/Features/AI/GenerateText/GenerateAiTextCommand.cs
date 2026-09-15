using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.AI.Common.Models;

namespace TemplateApp.Application.Features.AI.GenerateText;

public sealed record GenerateAiTextCommand(AiPromptModel Model)
    : ICommand<Result<GenerateAiTextResponse>>;
