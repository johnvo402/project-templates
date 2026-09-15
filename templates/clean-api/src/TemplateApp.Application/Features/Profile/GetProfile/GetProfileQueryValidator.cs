using FluentValidation;

namespace TemplateApp.Application.Features.Profile.GetProfile;

public sealed class GetProfileQueryValidator : AbstractValidator<GetProfileQuery>
{
    public GetProfileQueryValidator() => RuleFor(query => query.UserId).NotEmpty();
}
