using TemplateApp.Domain.Identity;

namespace TemplateApp.UnitTests;

public sealed class AppUserTests
{
    [Fact]
    public void UpdateProfile_ShouldNormalizeDisplayNameAndEmptyBio()
    {
        var user = AppUser.Create(
            "admin@example.com",
            "ADMIN@EXAMPLE.COM",
            "hash",
            "Admin",
            "Admin");

        user.UpdateProfile(" John Doe ", "   ");

        Assert.Equal("John Doe", user.DisplayName);
        Assert.Null(user.Bio);
    }
}
