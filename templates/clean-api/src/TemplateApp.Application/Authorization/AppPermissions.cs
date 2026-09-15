namespace TemplateApp.Application.Authorization;

public static class AppPermissions
{
    public const string DashboardView = "dashboard.view";

    public const string ProductsView = "products.view";
    public const string ProductsCreate = "products.create";
    public const string ProductsUpdate = "products.update";
    public const string ProductsDelete = "products.delete";

    public const string OrdersView = "orders.view";
    public const string OrdersCreate = "orders.create";
    public const string OrdersUpdateStatus = "orders.update-status";
    public const string OrdersCancel = "orders.cancel";

    public const string EmployeesView = "employees.view";
    public const string EmployeesCreate = "employees.create";
    public const string EmployeesUpdate = "employees.update";
    public const string EmployeesChangeRole = "employees.change-role";

    public const string ReportsView = "reports.view";
    public const string SettingsView = "settings.view";
    public const string SettingsUpdate = "settings.update";
    public const string AiGenerate = "ai.generate";

    public static readonly string[] All =
    [
        DashboardView,
        ProductsView,
        ProductsCreate,
        ProductsUpdate,
        ProductsDelete,
        OrdersView,
        OrdersCreate,
        OrdersUpdateStatus,
        OrdersCancel,
        EmployeesView,
        EmployeesCreate,
        EmployeesUpdate,
        EmployeesChangeRole,
        ReportsView,
        SettingsView,
        SettingsUpdate,
        AiGenerate
    ];
}

public static class RolePermissionCatalog
{
    private static readonly IReadOnlyDictionary<string, string[]> PermissionsByRole =
        new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        {
            [AppRoles.Admin] = AppPermissions.All,
            [AppRoles.Manager] =
            [
                AppPermissions.DashboardView,
                AppPermissions.ProductsView,
                AppPermissions.ProductsCreate,
                AppPermissions.ProductsUpdate,
                AppPermissions.OrdersView,
                AppPermissions.OrdersCreate,
                AppPermissions.OrdersUpdateStatus,
                AppPermissions.OrdersCancel,
                AppPermissions.EmployeesView,
                AppPermissions.ReportsView,
                AppPermissions.SettingsView,
                AppPermissions.AiGenerate
            ],
            [AppRoles.Staff] =
            [
                AppPermissions.DashboardView,
                AppPermissions.ProductsView,
                AppPermissions.OrdersView,
                AppPermissions.OrdersCreate,
                AppPermissions.OrdersUpdateStatus,
                AppPermissions.AiGenerate
            ]
        };

    public static IReadOnlyCollection<string> ForRole(string role)
        => PermissionsByRole.TryGetValue(role, out var permissions) ? permissions : [];
}
