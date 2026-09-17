using System.Linq.Expressions;
using TemplateApp.Application.Features.Settings.Common.Projections;
using TemplateApp.Domain.Settings;

namespace TemplateApp.Application.Features.Settings.GetSettings;

public static class GetSettingsMapping
{
    public static Expression<Func<StoreSettings, StoreSettingsProjection>> Selector()
        => settings => new StoreSettingsProjection(
            settings.StoreName,
            settings.StoreEmail,
            settings.StorePhone,
            settings.Currency,
            settings.Timezone,
            settings.LowStockThreshold,
            settings.UpdatedAt);

    public static StoreSettingsProjection Default()
        => new("Template Store", null, null, "VND", "Asia/Ho_Chi_Minh", 5, DateTimeOffset.UtcNow);
}
