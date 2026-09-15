using TemplateApp.Application.Authorization;

namespace TemplateApp.Api.Authentication;

public static class AppPolicies
{
    public const string DashboardView = AppPermissions.DashboardView;

    public const string ProductsView = AppPermissions.ProductsView;
    public const string ProductsCreate = AppPermissions.ProductsCreate;
    public const string ProductsUpdate = AppPermissions.ProductsUpdate;
    public const string ProductsDelete = AppPermissions.ProductsDelete;

    public const string OrdersView = AppPermissions.OrdersView;
    public const string OrdersCreate = AppPermissions.OrdersCreate;
    public const string OrdersUpdateStatus = AppPermissions.OrdersUpdateStatus;
    public const string OrdersCancel = AppPermissions.OrdersCancel;

    public const string EmployeesView = AppPermissions.EmployeesView;
    public const string EmployeesCreate = AppPermissions.EmployeesCreate;
    public const string EmployeesUpdate = AppPermissions.EmployeesUpdate;
    public const string EmployeesChangeRole = AppPermissions.EmployeesChangeRole;

    public const string ReportsView = AppPermissions.ReportsView;
    public const string SettingsView = AppPermissions.SettingsView;
    public const string SettingsUpdate = AppPermissions.SettingsUpdate;
    public const string AiGenerate = AppPermissions.AiGenerate;
}
