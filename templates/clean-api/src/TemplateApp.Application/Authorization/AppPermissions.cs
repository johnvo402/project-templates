namespace TemplateApp.Application.Authorization;

public static class AppPermissions
{
    public const string TodosRead = "todos.read";
    public const string TodosWrite = "todos.write";
    public const string UsersRead = "users.read";
    public const string UsersManage = "users.manage";
    public const string AiGenerate = "ai.generate";
}

public static class RolePermissionCatalog
{
    private static readonly IReadOnlyDictionary<string, string[]> PermissionsByRole =
        new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
        {
            [AppRoles.Admin] =
            [
                AppPermissions.TodosRead,
                AppPermissions.TodosWrite,
                AppPermissions.UsersRead,
                AppPermissions.UsersManage,
                AppPermissions.AiGenerate
            ],
            [AppRoles.User] =
            [
                AppPermissions.TodosRead,
                AppPermissions.TodosWrite,
                AppPermissions.AiGenerate
            ]
        };

    public static IReadOnlyCollection<string> ForRole(string role)
        => PermissionsByRole.TryGetValue(role, out var permissions) ? permissions : [];
}
