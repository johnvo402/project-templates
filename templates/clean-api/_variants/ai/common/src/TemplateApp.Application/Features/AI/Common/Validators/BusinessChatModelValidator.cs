using FluentValidation;
using TemplateApp.Application.Features.AI.Common.Models;

namespace TemplateApp.Application.Features.AI.Common.Validators;

public sealed class BusinessChatModelValidator : AbstractValidator<BusinessChatModel>
{
    public BusinessChatModelValidator()
    {
        RuleFor(model => model.Question)
            .NotEmpty()
            .MaximumLength(1_000);

        RuleFor(model => model.History)
            .Must(history => history is null || history.Count <= 12)
            .WithMessage("Conversation history cannot contain more than 12 messages.");

        RuleForEach(model => model.History)
            .ChildRules(message =>
            {
                message.RuleFor(item => item.Role)
                    .NotEmpty()
                    .Must(role => string.Equals(role, "user", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(role, "assistant", StringComparison.OrdinalIgnoreCase))
                    .WithMessage("History role must be 'user' or 'assistant'.");
                message.RuleFor(item => item.Content)
                    .NotEmpty()
                    .MaximumLength(2_000);
            });
    }
}
