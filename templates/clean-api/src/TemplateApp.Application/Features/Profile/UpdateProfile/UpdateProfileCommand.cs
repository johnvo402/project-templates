using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Profile.Common.Models;

namespace TemplateApp.Application.Features.Profile.UpdateProfile;

public sealed record UpdateProfileCommand(Guid UserId, UserProfileModel Model) : ICommand<Result>;
