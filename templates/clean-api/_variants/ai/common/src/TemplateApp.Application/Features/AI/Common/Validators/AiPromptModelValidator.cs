using FluentValidation;
using TemplateApp.Application.Features.AI.Common.Models;

namespace TemplateApp.Application.Features.AI.Common.Validators;

public sealed class AiPromptModelValidator : AbstractValidator<AiPromptModel>
{
    public AiPromptModelValidator()
    {
        RuleFor(model => model.Prompt).NotEmpty().MaximumLength(12_000);
    }
}
