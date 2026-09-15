using FluentValidation;

namespace TemplateApp.Application.Features.Profile.Avatar;

public sealed class GetAvatarQueryValidator : AbstractValidator<GetAvatarQuery>
{
    public GetAvatarQueryValidator() => RuleFor(query => query.UserId).NotEmpty();
}
