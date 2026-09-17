namespace TemplateApp.Domain.Products;

public sealed partial class Product
{
    public string? ImageObjectName { get; private set; }

    public void SetImage(string objectName)
    {
        ImageObjectName = string.IsNullOrWhiteSpace(objectName) ? null : objectName.Trim();
        Touch();
    }
}
