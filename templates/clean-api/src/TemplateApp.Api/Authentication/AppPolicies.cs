using TemplateApp.Application.Authorization;

namespace TemplateApp.Api.Authentication;

public static class AppPolicies
{
    public const string TodosRead = AppPermissions.TodosRead;
    public const string TodosWrite = AppPermissions.TodosWrite;
    public const string UsersRead = AppPermissions.UsersRead;
    public const string UsersManage = AppPermissions.UsersManage;
    public const string AiGenerate = AppPermissions.AiGenerate;
}
