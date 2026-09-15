using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Dashboard.Common.Projections;

namespace TemplateApp.Application.Features.Dashboard.GetDashboard;

public sealed record GetDashboardQuery : IQuery<Result<DashboardProjection>>;
