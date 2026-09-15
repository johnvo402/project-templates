using Mediator;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Users.ListUsers;

public sealed record ListUsersQuery : IQuery<Result<IReadOnlyList<ListUsersResponse>>>;
