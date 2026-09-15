using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Common.Projections.Identity;

namespace TemplateApp.Application.Features.Users.ListUsers;

public sealed record ListUsersQuery : IQuery<Result<IReadOnlyList<UserSummaryProjection>>>;
