using Mediator;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.AI.GenerateText;

public sealed record GenerateAiTextCommand(AiPromptModel Model)
    : ICommand<Result<GenerateAiTextProjection>>;

public sealed record GenerateAiTextProjection(string Text);
