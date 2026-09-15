using FluentValidation;

namespace TemplateApp.Application.Features.AI.GenerateText;

public sealed class GenerateAiTextCommandValidator : AbstractValidator<GenerateAiTextCommand>
{
    public GenerateAiTextCommandValidator()
    {
        RuleFor(command => command.Model.Prompt).NotEmpty().MaximumLength(12_000);
    }
}
