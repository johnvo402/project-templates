using FluentValidation;
using TemplateApp.Application.Features.AI.Common.Models;

namespace TemplateApp.Application.Features.AI.BusinessChat;

public sealed class AskBusinessQuestionCommandValidator : AbstractValidator<AskBusinessQuestionCommand>
{
    public AskBusinessQuestionCommandValidator(IValidator<BusinessChatModel> modelValidator)
    {
        RuleFor(command => command.Model).NotNull();
        RuleFor(command => command.Model).SetValidator(modelValidator);
    }
}
