using FluentValidation;
using TemplateApp.Application.Features.Settings.Common.Models;

namespace TemplateApp.Application.Features.Settings.Common.Validators;

public sealed class StoreSettingsModelValidator : AbstractValidator<StoreSettingsModel>
{
    public StoreSettingsModelValidator()
    {
        RuleFor(x => x.StoreName).NotEmpty().MaximumLength(160);
        RuleFor(x => x.StoreEmail).EmailAddress().MaximumLength(320).When(x => !string.IsNullOrWhiteSpace(x.StoreEmail));
        RuleFor(x => x.StorePhone).MaximumLength(32);
        RuleFor(x => x.Currency).NotEmpty().MaximumLength(8);
        RuleFor(x => x.Timezone).NotEmpty().MaximumLength(80);
        RuleFor(x => x.LowStockThreshold).GreaterThanOrEqualTo(0);
    }
}
