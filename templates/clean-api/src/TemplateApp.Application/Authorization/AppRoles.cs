namespace TemplateApp.Application.Authorization;

public static class AppRoles
{
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string Staff = "Staff";

    public static bool IsValid(string role)
        => role is Admin or Manager or Staff;
}
