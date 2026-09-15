using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Settings.Specifications;

public sealed class StoreSettingsSpecification : Specification<StoreSettings>
{
    public StoreSettingsSpecification(bool asNoTracking = false)
    {
        Query.Where(settings => settings.Id == StoreSettingsId.Default);
        if (asNoTracking) Query.AsNoTracking();
    }
}
