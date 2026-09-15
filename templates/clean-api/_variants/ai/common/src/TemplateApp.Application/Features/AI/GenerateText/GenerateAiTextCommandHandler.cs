using Mediator;
using TemplateApp.Application.Abstractions.AI;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.AI.GenerateText;

public sealed class GenerateAiTextCommandHandler(IAiService aiService)
    : ICommandHandler<GenerateAiTextCommand, Result<GenerateAiTextResponse>>
{
    public async ValueTask<Result<GenerateAiTextResponse>> Handle(
        GenerateAiTextCommand command,
        CancellationToken cancellationToken)
    {
        var text = await aiService.GenerateTextAsync(command.Model.Prompt, cancellationToken);
        return Result<GenerateAiTextResponse>.Success(new GenerateAiTextResponse(text));
    }
}
