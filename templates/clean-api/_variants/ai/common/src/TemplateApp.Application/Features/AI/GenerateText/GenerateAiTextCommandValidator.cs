using FluentValidation;
using TemplateApp.Application.Features.AI.Common.Models;

namespace TemplateApp.Application.Features.AI.GenerateText;

public sealed class GenerateAiTextCommandValidator : AbstractValidator<GenerateAiTextCommand>
{
    public GenerateAiTextCommandValidator(IValidator<AiPromptModel> modelValidator)
    {
        RuleFor(command => command.Model).NotNull();
        RuleFor(command => command.Model).SetValidator(modelValidator);
    }
}
