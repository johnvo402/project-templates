namespace TemplateApp.Domain.Settings;

public readonly record struct StoreSettingsId(Guid Value)
{
    public static StoreSettingsId Default => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}
