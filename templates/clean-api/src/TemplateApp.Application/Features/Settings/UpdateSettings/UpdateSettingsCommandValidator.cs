using FluentValidation;
using TemplateApp.Application.Features.Settings.Common.Models;

namespace TemplateApp.Application.Features.Settings.UpdateSettings;

public sealed class UpdateSettingsCommandValidator : AbstractValidator<UpdateSettingsCommand>
{
    public UpdateSettingsCommandValidator(IValidator<StoreSettingsModel> modelValidator)
    {
        RuleFor(x => x.Model).NotNull();
        RuleFor(x => x.Model).SetValidator(modelValidator);
    }
}
