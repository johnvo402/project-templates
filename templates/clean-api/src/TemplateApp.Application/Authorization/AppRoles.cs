namespace TemplateApp.Application.Authorization;

public static class AppRoles
{
    public const string Admin = "Admin";
    public const string User = "User";

    public static bool IsValid(string role)
        => role is Admin or User;
}
