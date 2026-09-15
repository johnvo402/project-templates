using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Reports.Common.Projections;

namespace TemplateApp.Application.Features.Reports.GetRevenue;

public sealed record GetRevenueReportQuery(DateOnly From, DateOnly To)
    : IQuery<Result<IReadOnlyList<RevenuePointProjection>>>;
